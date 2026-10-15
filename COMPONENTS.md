# Component Architecture & Version Reference 🧩

This document provides a comprehensive reference of all UI primitives, component versions, dependencies, and styling conventions utilized in **CTFy**.

---

## 1. Core Dependency & Version Matrix

| Category | Package | Version | Purpose / Documentation |
|---|---|---|---|
| **Runtime & Framework** | `next` | `16.4.0` | [Next.js App Router & Turbopack](https://nextjs.org) |
| | `react` | `19.3.0` | [React 19](https://react.dev) (Server Actions, `useActionState`, async transitions) |
| | `react-dom` | `19.3.0` | React DOM bindings for web |
| | `typescript` | `^5.0.0` | Static typing and interfaces |
| **Backend & Realtime** | `@supabase/supabase-js` | `^2.117.3` | [Supabase Client](https://supabase.com/docs/reference/javascript) (Database, RLS, Realtime) |
| | `@supabase/ssr` | `^0.12.7` | [Supabase SSR](https://supabase.com/docs/guides/auth/server-side) cookie-based session management |
| **UI Primitives & Styling** | `tailwindcss` | `^4.0.0` | [Tailwind CSS v4](https://tailwindcss.com) (CSS-first engine) |
| | `@tailwindcss/turbopack` | `^4.0.0` | Turbopack HMR & compilation integration |
| | `@radix-ui/react-dialog` | `^1.3.1` | Accessible modal primitives (used in PIN Gate & dialogs) |
| | `@radix-ui/react-label` | `^2.1.17` | Accessible form labels |
| | `@radix-ui/react-slot` | `^1.5.0` | Polymorphic component composition (`asChild` pattern) |
| | `class-variance-authority` | `^0.7.1` | [CVA](https://cva.style/docs) type-safe variant management |
| | `clsx` | `^2.1.1` | Conditional className concatenation |
| | `tailwind-merge` | `^3.7.0` | Conflict-free Tailwind class resolution via `cn()` |
| | `lucide-react` | `^1.56.0` | [Lucide Icons](https://lucide.dev) (Monochrome icon set) |
| | `canvas-confetti` | `^1.9.4` | Particle celebration animations on solved flags |
| **Form Handling & Validation** | `react-hook-form` | `^7.90.0` | High-performance uncontrolled form state |
| | `zod` | `^4.6.7` | Schema declaration and server validation |
| | `@hookform/resolvers` | `^5.9.1` | Bridge between Zod schemas and React Hook Form |

---

## 2. UI Component Registry (`src/components/ui/`)

CTFy adheres to the [shadcn/ui](https://ui.shadcn.com/) component model, built on unstyled, accessible Radix UI primitives and styled with a clean monochrome aesthetic.

### Component Inventory

| Component | File Path | Underlying Primitive | Key Variants & Props |
|---|---|---|---|
| **Button** | [`src/components/ui/button.tsx`](src/components/ui/button.tsx) | `@radix-ui/react-slot` | `variant`: `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`<br>`size`: `default`, `sm`, `lg`, `icon`<br>`asChild`: `boolean` |
| **Badge** | [`src/components/ui/badge.tsx`](src/components/ui/badge.tsx) | HTML `<div>` | `variant`: `default`, `secondary`, `destructive`, `outline` |
| **Card** | [`src/components/ui/card.tsx`](src/components/ui/card.tsx) | HTML `<div/h3/p>` | `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter` |
| **Dialog** | [`src/components/ui/dialog.tsx`](src/components/ui/dialog.tsx) | `@radix-ui/react-dialog` | `Dialog`, `DialogTrigger`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter` |
| **Input** | [`src/components/ui/input.tsx`](src/components/ui/input.tsx) | HTML `<input>` | Supports all HTML5 input attributes, focus rings, disabled states, and file inputs |
| **Label** | [`src/components/ui/label.tsx`](src/components/ui/label.tsx) | `@radix-ui/react-label` | Accessible label with disabled peer styling |
| **Table** | [`src/components/ui/table.tsx`](src/components/ui/table.tsx) | HTML `<table>` | `Table`, `TableHeader`, `TableBody`, `TableFooter`, `TableHead`, `TableRow`, `TableCell`, `TableCaption` |

---

### Global Platform Components (`src/components/`)

- [**`navbar.tsx`**](src/components/navbar.tsx):
  - Primary navigation header with the responsive CTFy brand badge.
  - Dynamically renders navigation links based on user authentication state (Sign In / Register vs Dashboard / Host a CTF / Logout).
  - Employs full-page redirection (`window.location.href`) on logout to eliminate cached React states.
- [**`supabase-banner.tsx`**](src/components/supabase-banner.tsx):
  - Warning banner displayed when placeholder credentials are detected in `.env.local`.

---

## 3. Styling & Token Architecture (Tailwind CSS v4)

CTFy utilizes **Tailwind CSS v4** with a dark-mode first, monochrome theme defined in [`src/app/globals.css`](src/app/globals.css):

### Color Tokens

```css
:root {
  --background: #09090b;       /* Pure zinc-950 deep dark */
  --foreground: #fafafa;       /* Crisp zinc-50 text */
  --card: #18181b;             /* Zinc-900 elevated surface */
  --card-foreground: #fafafa;
  --popover: #18181b;
  --popover-foreground: #fafafa;
  --primary: #fafafa;          /* White primary interactive */
  --primary-foreground: #18181b;
  --secondary: #27272a;        /* Zinc-800 secondary buttons */
  --secondary-foreground: #fafafa;
  --muted: #27272a;
  --muted-foreground: #a1a1aa;  /* Zinc-400 subtle labels */
  --accent: #27272a;
  --accent-foreground: #fafafa;
  --destructive: #ef4444;      /* Red-500 danger actions */
  --border: #27272a;           /* Zinc-800 borders */
  --input: #27272a;            /* Form field borders */
  --ring: #d4d4d8;             /* Focus ring outline */
}
```

### Class Merge Utility (`cn`)

All components utilize the standard class merge helper located in [`src/lib/utils.ts`](src/lib/utils.ts):

```typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

---

## 4. Next.js 16 & React 19 Compatibility Notes

- **Turbopack Compiler:** Builds are compiled using Next.js Turbopack (`@tailwindcss/turbopack`), achieving sub-2-second production builds.
- **Async Request APIs:** In Next.js 16, dynamic route parameters (`params` and `searchParams`) and headers/cookies are asynchronous promises. Components await these or pass them through Suspense boundaries.
- **Server Actions:** All data mutations (flag submissions, PIN lookups, event creations) are implemented as secure Next.js Server Actions with `'use server'` directives.
- **Zero Client Secret Leakage:** Server Actions run exclusively on the server, ensuring that database service keys and challenge answers are never bundled into client scripts.
