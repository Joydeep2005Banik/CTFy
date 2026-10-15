# Project Tree & File Structure Reference 🌲

This document provides an exhaustive, file-by-file reference of the **CTFy** codebase. It outlines the responsibility of every directory, component, server action, and configuration file.

---

## 1. Visual Project Tree

```text
CTFy/
├── .github/                                # GitHub automation & templates
│   ├── workflows/
│   │   └── ci.yml                          # Continuous Integration (Lint & Build check)
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md                   # Bug report issue template
│   │   └── feature_request.md              # Feature request issue template
│   └── pull_request_template.md            # Pull request review checklist
│
├── .vscode/                                # VS Code & Cursor IDE settings
│   ├── extensions.json                     # Recommended workspace extensions
│   └── settings.json                       # Formatter & Tailwind CSS settings
│
├── public/                                 # Static public assets
│   ├── apple-icon.png                      # Apple Touch icon (180x180 PNG)
│   ├── favicon.ico                         # Multi-size Windows icon resource
│   └── icon.svg                            # Theme-adaptive SVG site icon
│
├── src/                                    # Application source code
│   ├── app/                                # Next.js 16 App Router (Routes & Layouts)
│   │   ├── layout.tsx                      # Root HTML layout, Geist font, Navbar & banner
│   │   ├── page.tsx                        # Public landing page (Hero, features, CTA)
│   │   ├── globals.css                     # Global Tailwind CSS v4 design tokens
│   │   ├── favicon.ico                     # Next.js route favicon
│   │   ├── icon.svg                        # Next.js route SVG icon
│   │   ├── apple-icon.png                  # Next.js route Apple touch icon
│   │   │
│   │   ├── dashboard/                      # User dashboard
│   │   │   └── page.tsx                    # Separated Hosted Events & Joined Competitions
│   │   │
│   │   ├── events/[id]/                    # Dynamic competition routes
│   │   │   ├── host/page.tsx               # Host Control Deck (Live feed, metrics)
│   │   │   ├── play/page.tsx               # In-Arena challenge player (PIN-gated)
│   │   │   └── scoreboard/page.tsx         # Realtime live leaderboard & podium
│   │   │
│   │   ├── host/create/                    # Event creation portal
│   │   │   └── page.tsx                    # Questionnaire builder & time synchronizer
│   │   │
│   │   ├── join/                           # Quick event entry
│   │   │   └── page.tsx                    # 6-character PIN code entry form
│   │   │
│   │   ├── login/                          # Authentication
│   │   │   └── page.tsx                    # Supabase Auth login form
│   │   │
│   │   └── register/                       # Registration
│   │       └── page.tsx                    # User signup form
│   │
│   ├── components/                         # Reusable React components
│   │   ├── navbar.tsx                      # Global navigation bar with session handling
│   │   ├── supabase-banner.tsx             # Setup warning banner for missing keys
│   │   │
│   │   └── ui/                             # shadcn/ui accessible primitives (Radix UI)
│   │       ├── badge.tsx                   # Status indicators (outline, secondary)
│   │       ├── button.tsx                  # Polymorphic buttons (6 variants, 4 sizes)
│   │       ├── card.tsx                    # Content containers (Header, Content, Footer)
│   │       ├── dialog.tsx                  # Modal dialogs (In-arena PIN gate modal)
│   │       ├── input.tsx                   # Form inputs with autofill suppression
│   │       ├── label.tsx                   # Form field labels
│   │       └── table.tsx                   # Responsive scoreboard table
│   │
│   └── lib/                                # Core logic, actions, types, and clients
│       ├── actions.ts                      # Next.js Server Actions (SECURE FLAG VALIDATION)
│       ├── mock-data.ts                    # Offline mock data for previewing without DB
│       ├── types.ts                        # TypeScript interfaces & types
│       ├── utils.ts                        # Tailwind class merger & PIN localStorage helpers
│       ├── validations.ts                  # Zod validation schemas for forms & flags
│       │
│       └── supabase/                       # Supabase client instances
│           ├── admin.ts                    # Service Role client (Secret server operations)
│           ├── client.ts                   # Browser Supabase client (Anon Key)
│           └── server.ts                   # Server-side Supabase client (Cookie-based auth)
│
├── supabase/
│   └── schema.sql                          # Complete PostgreSQL DDL, RLS, indexes & triggers
│
├── .editorconfig                           # Universal editor formatting standards
├── .env.example                            # Safe environment variable template
├── .gitignore                              # Git exclusion rules
├── ARCHITECTURE.md                         # Technical system design & security model
├── CHALLENGE_AUTHORING.md                  # Container-free challenge design & authoring blueprints
├── CHANGELOG.md                            # Version history & release notes
├── CODE_OF_CONDUCT.md                      # Contributor Covenant v2.1
├── CONTRIBUTING.md                         # Contributor onboarding & codebase guide
├── DEPENDENCIES.md                         # Dependency matrix, UI registry & license audit
├── DEPLOYMENT.md                           # Production deployment guide (Vercel, Docker, VPS)
├── EVENT_OPERATIONS.md                     # Live competition timeline, anti-cheat & operator runbook
├── HOSTING_GUIDE.md                        # Organizer guide for hosting & challenge design
├── LICENSE                                 # MIT License
├── PARTICIPANT_GUIDE.md                    # Competitor guide for playing & flag submissions
├── PROJECT_STRUCTURE.md                    # Exhaustive codebase reference & responsibility map
├── README.md                               # Project landing document & documentation index
├── ROADMAP.md                              # Future vision, milestones & feature pipeline
├── SECURITY.md                             # Responsible vulnerability disclosure policy
├── SYSTEM_DESIGN.md                        # High-throughput scaling, concurrency & resilience
├── TROUBLESHOOTING.md                      # Runbook for auth, PINs, scoring & realtime issues
├── package.json                            # Package manifests & scripts
├── package-lock.json                       # Cryptographic dependency lockfile
└── tsconfig.json                           # TypeScript compiler configuration
```

---

## 2. Detailed File-by-File Breakdown

### Application Routes (`src/app/`)

| File Path | Type | Responsibility |
|---|---|---|
| `layout.tsx` | Server Component | Root layout wrapping all pages. Injects Geist font, sets dark mode class, renders `Navbar`, and configures global metadata/icons. |
| `page.tsx` | Client Component | Hero landing page introducing CTFy, platform advantages, feature highlights, and call-to-action buttons. |
| `globals.css` | Stylesheet | Declares Tailwind CSS v4 theme tokens, color variables (`--background`, `--foreground`), and base dark-mode styling. |
| `dashboard/page.tsx` | Client Component | User control center. Segregates events into "Hosted by You" (showing PINs & Host Deck links) and "Joined Competitions" (showing Play & Scoreboard links). |
| `host/create/page.tsx` | Client Component | Form for organizers to schedule events and build questionnaires. Automatically converts local browser time to UTC timestamps. |
| `join/page.tsx` | Client Component | Quick PIN entry portal. Validates 6-character access codes and redirects players to unlocked arenas. |
| `login/page.tsx` | Client Component | Sign-in interface supporting Supabase Auth with hard window redirection on success to destroy in-memory cache. |
| `register/page.tsx` | Client Component | User registration form creating auth users and syncing public profiles. |
| `events/[id]/play/page.tsx` | Client Component | Competitor challenge arena. Enforces in-arena PIN gate modal, displays challenge prompts, renders attached asset links, and handles real-time flag submissions. |
| `events/[id]/scoreboard/page.tsx` | Client Component | Public live leaderboard. Subscribes to Supabase Realtime WebSocket changes to re-rank the top-3 podium and table instantaneously. |
| `events/[id]/host/page.tsx` | Client Component | Organizer command deck. Displays live solve metrics, authorized host checks, and a real-time incoming submission stream. |

---

### Core Business Logic & Security (`src/lib/`)

| File Path | Responsibility |
|---|---|
| `actions.ts` | **Critical Security Layer:** Contains all Next.js Server Actions (`'use server'`). Handles secret flag validation (`submitFlagAction`), event creation (`createEventAction`), and PIN queries (`findEventByPinAction`) using privileged server clients. |
| `validations.ts` | Type-safe form definitions using **Zod** (`EventFormValues`, `QuestionSchema`, `PinSchema`, `LoginSchema`). |
| `types.ts` | TypeScript interfaces for `Event`, `Question`, `Submission`, and `Profile`. |
| `utils.ts` | Exports the `cn()` class merge utility and `localStorage` helper functions (`markEventUnlocked`, `isEventUnlocked`, `getUnlockedEventIds`). |
| `supabase/client.ts` | Creates the browser-side Supabase client using `NEXT_PUBLIC_SUPABASE_ANON_KEY`. |
| `supabase/server.ts` | Creates the server-side Supabase client utilizing `@supabase/ssr` cookies. |
| `supabase/admin.ts` | Creates the privileged Supabase Service Role client for backend flag verification. |

---

### UI Components (`src/components/`)

| File Path | Responsibility |
|---|---|
| `navbar.tsx` | Sticky global header displaying the brand flag icon, responsive links, and session-aware login/dashboard controls. |
| `supabase-banner.tsx` | Unobtrusive top banner warning organizers when running on unconfigured placeholder Supabase keys. |
| `ui/button.tsx` | Accessible button with 6 variants (`default`, `destructive`, `outline`, `secondary`, `ghost`, `link`) and `asChild` composition. |
| `ui/dialog.tsx` | Accessible modal dialog built on `@radix-ui/react-dialog` used for the In-Arena PIN gate. |
| `ui/card.tsx` | Modular container for challenge cards, metric displays, and event summaries. |
| `ui/input.tsx` | Form input element with autofill suppression attributes (`data-lpignore`, `autoComplete="off"`). |
| `ui/table.tsx` | Semantic HTML table components powering the live scoreboard. |
| `ui/badge.tsx` | Micro-badges for points, solve status, and podium medals. |
| `ui/label.tsx` | Accessible form field labels built on `@radix-ui/react-label`. |

---

## 3. Data Flow Architecture

This diagram illustrates how data flows between files during a flag submission:

```
[src/app/events/[id]/play/page.tsx]
        │
        │ 1. User submits flag
        ▼
[src/lib/actions.ts: submitFlagAction()]
        │
        │ 2. Validates schema via [src/lib/validations.ts]
        │ 3. Uses [src/lib/supabase/admin.ts] to query question secret
        ▼
[Supabase PostgreSQL: public.submissions]
        │
        │ 4. Inserts record (is_correct, points_awarded)
        ▼
[Supabase Realtime Engine (WebSockets)]
        │
        ├───────────────────────────────────────────┐
        ▼                                           ▼
[src/app/events/[id]/scoreboard/page.tsx]   [src/app/events/[id]/host/page.tsx]
  - Live Podium updates                       - Real-time submission stream updates
  - Confetti triggers                         - Metric counters increment
```
