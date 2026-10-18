# Server Actions & Data Contracts API Reference 🔌

This reference provides the formal specification for all backend **Next.js Server Actions** (`'use server'`) located in [`src/lib/actions.ts`](../../src/lib/actions.ts).

CTFy uses Server Actions instead of standard REST endpoints to eliminate client bundle secret leakage, ensure compile-time TypeScript type safety, and enforce strict server-side validation.

---

## Table of Contents
1. [Architecture & Security Boundary](#1-architecture--security-boundary)
2. [Event Management Actions](#2-event-management-actions)
   - [`createEventAction`](#createeventaction)
   - [`findEventByPinAction`](#findeventbypinaction)
   - [`checkEventHostAction`](#checkeventhostaction)
   - [`getEventMetricsAction`](#geteventmetricsaction)
3. [Competition Arena Actions](#3-competition-arena-actions)
   - [`getEventQuestionnaireAction`](#geteventquestionnaireaction)
   - [`submitFlagAction`](#submitflagaction)
4. [Standard Return Formats & Error Codes](#4-standard-return-formats--error-codes)
5. [Frontend Invocation Patterns](#5-frontend-invocation-patterns)

---

## 1. Architecture & Security Boundary

Server Actions execute exclusively in a privileged Node.js environment on the server:
- **Zod Schema Validation:** Every payload is validated against strict Zod schemas defined in [`src/lib/validations.ts`](../../src/lib/validations.ts).
- **Service Role Elevation:** Privileged operations (such as reading `correct_answer` or inserting submissions) use the Supabase Service Role client ([`src/lib/supabase/admin.ts`](../../src/lib/supabase/admin.ts)).
- **Dual-Mode Operation:** If Supabase environment variables are missing, all actions gracefully fall back to in-memory **Demo Mode** (`mock-data.ts`) with zero runtime crashes.

---

## 2. Event Management Actions

### `createEventAction`
Validates event parameters, converts local browser times to UTC, and creates an event with its associated question set.

#### Signature:
```typescript
async function createEventAction(formData: z.infer<typeof CreateEventSchema>): Promise<{
  success: boolean;
  eventId?: string;
  pinCode?: string;
  error?: string;
}>
```

#### Input Schema (`CreateEventSchema`):
```typescript
{
  title: string;              // 3-100 characters
  pin_code: string;           // Exactly 6 alphanumeric characters (auto-uppercased)
  start_time: string;         // ISO timestamp or datetime-local string
  end_time: string;           // Must be strictly after start_time
  timezone_offset?: number;   // Browser timezone offset in minutes (e.g. -330)
  questions: Array<{
    prompt: string;           // 3-2000 characters (Markdown supported)
    media_url?: string;       // Optional valid URL (HTTP/HTTPS)
    correct_answer: string;   // 1-255 characters (Secret flag)
    points: number;           // Integer between 1 and 10,000 (default: 10)
  }>;                         // Minimum 1 question required
}
```

#### Responses:
* **Success:**
  ```json
  {
    "success": true,
    "eventId": "a7b3c9e1-4567-489a-bcde-1234567890ab",
    "pinCode": "8K2F9A"
  }
  ```
* **Failure (Duplicate PIN or Validation Error):**
  ```json
  {
    "success": false,
    "error": "This PIN code is already in use. Please generate a new one."
  }
  ```

---

### `findEventByPinAction`
Resolves a 6-character access PIN to an event ID for arena unlocking.

#### Signature:
```typescript
async function findEventByPinAction(pinCode: string): Promise<{
  success: boolean;
  eventId?: string;
  title?: string;
  error?: string;
}>
```

#### Responses:
* **Success:**
  ```json
  {
    "success": true,
    "eventId": "a7b3c9e1-4567-489a-bcde-1234567890ab",
    "title": "CyberSpring Hackathon CTF"
  }
  ```
* **Failure:**
  ```json
  {
    "success": false,
    "error": "No event found with PIN '9X2K1L'. Please check the code."
  }
  ```

---

### `checkEventHostAction`
Verifies whether the currently authenticated user is the designated host/organizer of an event.

#### Signature:
```typescript
async function checkEventHostAction(eventId: string): Promise<{
  isHost: boolean;
  error?: string;
}>
```

---

### `getEventMetricsAction`
Fetches aggregate summary statistics for the Host Control Deck (`/events/[id]/host`).

#### Signature:
```typescript
async function getEventMetricsAction(eventId: string): Promise<{
  success: boolean;
  metrics?: {
    totalSubmissions: number;
    correctSolves: number;
    solveRate: number;
    participantCount: number;
  };
  error?: string;
}>
```

---

## 3. Competition Arena Actions

### `getEventQuestionnaireAction`
Fetches the sanitized challenge questionnaire for an event. **Guaranteed to never return `correct_answer`.**
Enforces backend PIN verification: if the caller is not the event host and has not supplied a matching `pinCode`, `isLocked: true` and an empty question set (`questions: []`) are returned.

#### Signature:
```typescript
async function getEventQuestionnaireAction(
  eventId: string,
  pinCode?: string
): Promise<{
  success: boolean;
  isLocked?: boolean;
  event?: Partial<CTFEvent>;
  questions?: PublicQuestion[];
  error?: string;
}>
```

#### Return Type (`PublicQuestion[]`):
```typescript
interface PublicQuestion {
  id: string;
  event_id: string;
  prompt: string;
  media_url: string | null;
  points: number;
  order_index: number;
  // NOTE: correct_answer is completely excluded from this interface
}
```

#### Verification Pipeline:
1. **Host Bypass:** If the authenticated session matches `event.host_id`, access is granted unconditionally and `event.pin_code` is returned for host reference.
2. **PIN Code Matching:** If not the host, the sanitized `pinCode` argument is matched server-side against `event_pins.pin_code` via privileged service role query.
3. **Locked Response:** If unverified, the action responds with `isLocked: true`, safe event metadata, and `questions: []`, preventing unauthorized scraping.
4. **Unlocked Response:** If verified, returns sanitized questions (`id, event_id, prompt, media_url, points, order_index`) without exposing `correct_answer` or `pin_code`.

---

### `submitFlagAction`
**Core Flag Verification Action.** Enforces competition time windows, checks for duplicate solves, evaluates answers using the privileged server client, records the submission, awards points, and saves audit trails.

#### Signature:
```typescript
async function submitFlagAction(params: {
  eventId: string;
  questionId: string;
  submittedAnswer: string;
  clientUserId?: string;
}): Promise<{
  success: boolean;
  is_correct?: boolean;
  points_awarded?: number;
  already_solved?: boolean;
  message?: string;
  error?: string;
}>
```

#### Evaluation Pipeline:
1. **Empty Input Check:** Rejects whitespace-only submissions immediately.
2. **Time-Gating Verification:** Compares the current server timestamp ($T_{\text{now}}$) against the event's `start_time` and `end_time`:
   * If $T_{\text{now}} < \text{start\_time}$: Returns `"This event is scheduled for the future."`
   * If $T_{\text{now}} > \text{end\_time}$: Returns `"Event has ended. Submissions are closed."`
3. **Duplicate Solve Check:** Queries `public.submissions` for any existing row matching `(user_id, question_id, is_correct = true)`:
   * If found: Returns `already_solved: true, points_awarded: 0`.
4. **Answer Comparison:** Retrieves `correct_answer` via the privileged Service Role client. Performs an exact string match after trimming leading and trailing whitespace:
   $$\text{is\_correct} = (\text{submittedAnswer.trim()} === \text{correct\_answer.trim()})$$
5. **Scoreboard Insertion (Zero-Leak):** Inserts into `public.submissions` without `submitted_answer` (null) to prevent flag leakage across Supabase Realtime broadcast channels.
6. **Audit Trail Logging:** Inserts private log into `public.submission_logs` protected by strict submitter/host-only RLS policies.

#### Responses:
* **Correct Capture:**
  ```json
  {
    "success": true,
    "is_correct": true,
    "already_solved": false,
    "points_awarded": 150,
    "message": "Flag captured! +150 points awarded."
  }
  ```
* **Incorrect Guess:**
  ```json
  {
    "success": true,
    "is_correct": false,
    "already_solved": false,
    "points_awarded": 0,
    "message": "Incorrect flag. Check formatting and try again."
  }
  ```
* **Already Solved:**
  ```json
  {
    "success": true,
    "is_correct": true,
    "already_solved": true,
    "points_awarded": 0,
    "message": "You have already captured this flag!"
  }
  ```

---

## 4. Standard Return Formats & Error Codes

All Server Actions return a consistent discriminated union pattern:

```typescript
type ServerActionResponse<T = Record<string, unknown>> = 
  | ({ success: true } & T)
  | { success: false; error: string };
```

### Common Error Messages:
| Error Message | HTTP Equivalent | Cause |
|---|---|---|
| `"Authentication required to submit."` | `401 Unauthorized` | User session cookie is missing or expired. |
| `"Validation failed: ..."` | `400 Bad Request` | Zod schema rejection (e.g. invalid date or empty title). |
| `"Event not found."` | `404 Not Found` | The requested `eventId` does not exist. |
| `"This PIN code is already in use."` | `409 Conflict` | Unique constraint violation on `pin_code`. |
| `"Event has ended. Submissions are closed."` | `403 Forbidden` | Current time is past `event.end_time`. |

---

## 5. Frontend Invocation Patterns

In Client Components (`'use client'`), invoke Server Actions using React 19's `useTransition` for optimal loading state management:

```tsx
"use client";

import { useState, useTransition } from "react";
import { submitFlagAction } from "@/lib/actions";

export function FlagSubmitCard({ eventId, questionId }: { eventId: string; questionId: string }) {
  const [flagInput, setFlagInput] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await submitFlagAction({
        eventId,
        questionId,
        submittedAnswer: flagInput,
      });

      if (!res.success) {
        setStatusMessage(res.error || "Submission failed.");
      } else {
        setStatusMessage(res.message || "");
        if (res.is_correct && !res.already_solved) {
          setFlagInput(""); // Clear field on correct capture
        }
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        type="text"
        value={flagInput}
        onChange={(e) => setFlagInput(e.target.value)}
        placeholder="CTFy{...}"
        disabled={isPending}
        autoComplete="off"
        className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded"
      />
      <button type="submit" disabled={isPending} className="px-4 py-2 bg-white text-black font-semibold rounded">
        {isPending ? "Evaluating..." : "Submit Flag"}
      </button>
      {statusMessage && <p className="text-sm text-zinc-400">{statusMessage}</p>}
    </form>
  );
}
```
