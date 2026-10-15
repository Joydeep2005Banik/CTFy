# CTFy Architecture & Technical System Design 🏛️

This document details the architectural design, security boundaries, database relationships, and real-time data flows powering **CTFy**.

---

## 1. High-Level Architecture Overview

CTFy is designed to eliminate the infrastructure overhead, flaky SSH tunnels, and container crashes common to traditional CTF platforms. It operates as a full-stack, serverless application with strict separation between public event metadata and privileged flag validation.

```mermaid
graph TD
    subgraph Client["Client Browser (React 19)"]
        UI["Monochrome UI / shadcn/ui"]
        PlayArena["Challenge Arena (/play)"]
        Scoreboard["Live Scoreboard (/scoreboard)"]
        HostDeck["Host Deck (/host)"]
    end

    subgraph NextServer["Next.js 16 Server (App Router)"]
        AuthMiddleware["Session & Auth Verifier"]
        ServerActions["Server Actions (src/lib/actions.ts)"]
        SubmitFlag["submitFlagAction()"]
        PinAction["findEventByPinAction()"]
    end

    subgraph SupabaseCloud["Supabase Backend (PostgreSQL)"]
        SupabaseAuth["Supabase Auth (auth.users)"]
        DB[("PostgreSQL Database")]
        RLS["Row Level Security (RLS) Engine"]
        RealtimeEngine["Supabase Realtime (CDC / WebSockets)"]
    end

    %% Client to Server Actions
    PlayArena -->|Submits Flag| SubmitFlag
    PlayArena -->|Verifies PIN| PinAction
    
    %% Server to Database
    SubmitFlag --> AuthMiddleware
    AuthMiddleware -->|Service Role Client| DB
    PinAction -->|Select by PIN| DB

    %% Database Security
    DB --- RLS

    %% Realtime Pub/Sub
    DB -->|New Submission Inserted| RealtimeEngine
    RealtimeEngine -.->|WebSocket Broadcast| Scoreboard
    RealtimeEngine -.->|WebSocket Broadcast| HostDeck
```

---

## 2. Core Security Model: Zero-Leak Flag Architecture

In standard client-rendered applications, naive implementations often leak challenge solutions to the browser via JSON API responses or client-side evaluation. 

**CTFy enforces a strict Zero-Leak Guarantee:**

1. **Row Level Security (RLS):** 
   - The `correct_answer` column in the `questions` table is locked down. Standard authenticated participants and anonymous visitors have zero `SELECT` privileges on the `correct_answer` column.
2. **Server-Side Evaluation:**
   - Flag validation runs exclusively inside `submitFlagAction` on the Next.js server.
   - The server verifies the participant's authenticated session, fetches the question's secret answer using the privileged Supabase Service Role client, compares the strings on the server, and records the score.
3. **Information Hiding:**
   - The client only receives a boolean status (`isCorrect: true/false`), awarded points, and an error message. The secret answer never touches the client bundle, DOM, or browser memory.

### Flag Submission Sequence Diagram

```mermaid
sequenceDiagram
    autonumber
    actor Player as Participant Browser
    participant Server as Next.js Server Action
    participant DB as Supabase PostgreSQL
    actor Host as Host Deck / Scoreboard

    Player->>Server: submitFlagAction(eventId, questionId, flag)
    Server->>DB: Verify authenticated session
    Server->>DB: Query question details (Service Role)
    Note over Server: Server compares submitted flag with correct answer
    
    alt Flag is Correct
        Server->>DB: INSERT into submissions (is_correct=true, points=X)
        DB-->>Host: Supabase Realtime Broadcast (New Solve)
        Server-->>Player: { success: true, points_awarded: X }
        Note over Player: Trigger Confetti & Lock Card
    else Flag is Incorrect
        Server->>DB: INSERT into submissions (is_correct=false, points=0)
        DB-->>Host: Supabase Realtime Broadcast (Failed Attempt)
        Server-->>Player: { success: false, message: "Incorrect flag" }
    end
```

---

## 3. Database Schema & Entity Relationship Diagram (ERD)

The database schema is structured around four primary entities: `profiles`, `events`, `questions`, and `submissions`.

```mermaid
erDiagram
    auth_users ||--|| profiles : "syncs via trigger"
    profiles ||--o{ events : "hosts"
    profiles ||--o{ submissions : "submits"
    events ||--o{ questions : "contains"
    events ||--o{ submissions : "records"
    questions ||--o{ submissions : "receives"

    profiles {
        uuid id PK "references auth.users(id)"
        text username "unique"
        timestamptz created_at
    }

    events {
        uuid id PK
        text title
        text pin_code "unique 6-char access code"
        uuid host_id FK "references profiles(id)"
        timestamptz start_time
        timestamptz end_time
        timestamptz created_at
    }

    questions {
        uuid id PK
        uuid event_id FK "references events(id)"
        text prompt
        text media_url "optional external link"
        text correct_answer "hidden by RLS"
        integer points "default 10"
        integer order_index
    }

    submissions {
        uuid id PK
        uuid event_id FK "references events(id)"
        uuid question_id FK "references questions(id)"
        uuid user_id FK "references profiles(id)"
        text submitted_answer
        boolean is_correct
        integer points_awarded
        timestamptz created_at
    }
```

### Key Schema Optimizations:
- **B-Tree Indexes:** Dedicated indexes on `events(pin_code)`, `questions(event_id, order_index)`, and `submissions(event_id, created_at)` ensure sub-millisecond query performance during high-throughput competitions.
- **Cascade Deletions:** Deleting an event cleanly purges associated questions and submissions automatically via `ON DELETE CASCADE`.

---

## 4. Real-Time State Management

CTFy leverages **PostgreSQL Change Data Capture (CDC)** via Supabase Realtime to update leaderboards and organizer logs without client polling:

1. **Submissions Table Publication:**
   - The `submissions` table is added to `supabase_realtime`.
2. **WebSocket Channels:**
   - The live Scoreboard subscribes to channel `realtime:scoreboard-[eventId]`.
   - The Host Deck subscribes to channel `realtime:host-deck-[eventId]`.
3. **Instant Re-Ranking:**
   - When a valid solve occurs, an `INSERT` event fires over the WebSocket connection.
   - The scoreboard client recalculates scores and dynamically shifts the top-3 podium and table rows without a page refresh.

---

## 5. PIN Gate & Session Isolation Architecture

To prevent unauthorized access and shared-station cross-pollution:

```mermaid
graph LR
    A[User visits /events/id/play] --> B{Is User the Host?}
    B -- Yes --> D[Render Arena Unlocked]
    B -- No --> C{PIN Unlocked in Session?}
    C -- Yes --> D
    C -- No --> E{Prior Submissions in DB?}
    E -- Yes --> D
    E -- No --> F[Render Cyber PIN Gate Modal]
    F -->|Enters Valid PIN| D
```

- **Autofill Suppression:** Challenge inputs feature dynamic user-scoped name attributes (`ctfy_flag_${userId}_${questionId}`) and `autoComplete="off"`, `data-lpignore="true"` to prevent browser password managers or autofill from leaking prior players' answers on shared competition terminals.
- **Full DOM Transitions:** Session transitions (login and logout) use clean full-window reloads (`window.location.href`) to ensure all in-memory React states and cached closures are destroyed.

---

## 6. Technology Stack Summary

| Component | Choice | Rationale |
|---|---|---|
| **Framework** | Next.js 16 (App Router) | High-performance React 19 server-side rendering and Server Actions. |
| **Compiler** | Turbopack | Sub-second local builds and optimized production tree-shaking. |
| **Styling** | Tailwind CSS v4 + shadcn/ui | Minimalist, dark-mode first design with accessible Radix primitives. |
| **Database** | PostgreSQL (Supabase) | ACID compliance, Row Level Security, and automated user profile sync triggers. |
| **Realtime** | Supabase Realtime | WebSocket replication with zero Redis or Socket.io infrastructure to maintain. |
| **Validation** | Zod + React Hook Form | Type-safe form validation for event dates, questionnaires, and flag formats. |
