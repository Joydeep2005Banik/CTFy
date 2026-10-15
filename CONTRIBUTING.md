# Contributing to CTFy 🚩

Thank you for your interest in contributing to **CTFy**! 

Whether you are fixing a bug, expanding documentation, proposing new challenge types, or building new platform features, your contributions help make CTFy the premier lightweight Capture The Flag platform.

---

## Table of Contents
1. [Ways You Can Contribute](#1-ways-you-can-contribute)
2. [Repository Map & Codebase Anatomy](#2-repository-map--codebase-anatomy)
3. [Local Development Setup](#3-local-development-setup)
4. [Branching Model & Git Workflow](#4-branching-model--git-workflow)
5. [Coding Standards & Security Principles](#5-coding-standards--security-principles)
6. [Testing & Quality Verification](#6-testing--quality-verification)
7. [Submitting a Pull Request (PR)](#7-submitting-a-pull-request-pr)
8. [Feature Wishlist & Good First Issues](#8-feature-wishlist--good-first-issues)

---

## 1. Ways You Can Contribute

You don't need to be a full-stack expert to contribute to CTFy. We welcome contributions across all areas:

- 🐛 **Report Bugs:** Find unexpected behavior, timezone edge cases, or UI glitches? Submit a clear report via our [Bug Report Template](.github/ISSUE_TEMPLATE/bug_report.md).
- 💡 **Propose Features:** Have an idea for a new scoring mechanic, team mode, or challenge format? Open a [Feature Request](.github/ISSUE_TEMPLATE/feature_request.md).
- 💻 **Write Code:** Pick up an open issue, fix a bug, or implement an enhancement from our [Feature Wishlist](#8-feature-wishlist--good-first-issues).
- 📝 **Improve Documentation:** Expand our guides, fix typos, improve code comments, or write example CTF challenge walkthroughs.
- 🎨 **UI/UX & Accessibility:** Enhance keyboard navigation, ARIA attributes, mobile responsiveness, and dark-mode contrast.
- 🧪 **Testing:** Write end-to-end tests or test edge cases in Supabase Realtime synchronization.

---

## 2. Repository Map & Codebase Anatomy

Before modifying code, use this map to understand how the project is organized and where specific logic lives:

```text
CTFy/
├── public/                         # Static assets (favicons, site SVG, Apple touch icons)
├── src/
│   ├── app/                        # Next.js 16 App Router (Routes & Pages)
│   │   ├── layout.tsx              # Root HTML layout with Geist font, Supabase banner & Navbar
│   │   ├── page.tsx                # Public landing page (Hero, features, CTA)
│   │   ├── globals.css             # Tailwind CSS v4 @theme tokens & color variables
│   │   ├── dashboard/              # User Dashboard (Hosted Events vs Joined Competitions)
│   │   │   └── page.tsx            # Zero-leak dashboard with isolated tabs
│   │   ├── host/
│   │   │   └── create/page.tsx     # Event & Questionnaire creation form (with local-to-UTC conversion)
│   │   ├── join/
│   │   │   └── page.tsx            # Quick PIN code entry page
│   │   ├── login/
│   │   │   └── page.tsx            # Supabase Auth sign-in page
│   │   ├── register/
│   │   │   └── page.tsx            # User registration page
│   │   └── events/[id]/            # Dynamic competition routes
│   │       ├── play/page.tsx       # Challenge Arena (In-arena PIN Gate, prompts, flag submission)
│   │       ├── scoreboard/page.tsx # Public Realtime Leaderboard (Podium, points, confetti)
│   │       └── host/page.tsx       # Host Control Deck (Live submission feed, metrics, organizer tools)
│   │
│   ├── components/                 # Reusable React components
│   │   ├── navbar.tsx              # Global navigation header with dynamic session state
│   │   ├── supabase-banner.tsx     # Setup warning banner when keys are missing
│   │   └── ui/                     # shadcn/ui accessible primitives (Radix UI + CVA)
│   │       ├── badge.tsx           # Status indicators
│   │       ├── button.tsx          # Polymorphic buttons with 6 variants & sizes
│   │       ├── card.tsx            # Challenge & metric card containers
│   │       ├── dialog.tsx          # Accessible modal dialogs (used in PIN Gate)
│   │       ├── input.tsx           # Form inputs with autofill suppression
│   │       ├── label.tsx           # Form field labels
│   │       └── table.tsx           # Scoreboard data table
│   │
│   └── lib/                        # Core backend actions, types, and utilities
│       ├── actions.ts              # Next.js Server Actions ('use server') - SECURE FLAG VALIDATION
│       ├── validations.ts          # Zod schemas (EventFormValues, QuestionSchema, PinSchema)
│       ├── types.ts                # TypeScript interfaces (Event, Question, Submission, Profile)
│       ├── utils.ts                # cn() class merger & localStorage PIN unlock helpers
│       └── supabase/
│           ├── client.ts           # Browser Supabase client (Anon Key)
│           ├── server.ts           # Server-side Supabase client (Cookie-based auth)
│           └── admin.ts            # Privileged Service Role client (Secret server evaluation only)
│
├── supabase/
│   └── schema.sql                  # PostgreSQL tables, RLS policies, indexes, and trigger functions
├── .github/
│   ├── workflows/ci.yml            # GitHub Actions CI build and lint verification
│   └── ISSUE_TEMPLATE/             # Structured Bug Report and Feature Request forms
├── docs/                           # Categorized documentation hub
│   ├── README.md                   # Documentation index & navigation portal
│   ├── architecture/               # System topology, concurrency models & dependency SBOM
│   │   ├── API_REFERENCE.md        # Server actions contract, Zod schemas & error catalog
│   │   ├── ARCHITECTURE.md         # System topology, sequence diagrams, and security architecture
│   │   ├── DATABASE.md             # Data dictionary, compound indexes & RLS matrix
│   │   ├── DEPENDENCIES.md         # Package version matrix, license review, and UI registry
│   │   ├── PROJECT_STRUCTURE.md    # File-by-file codebase reference & architecture map
│   │   └── SYSTEM_DESIGN.md        # High-throughput scaling, concurrency & resilience
│   ├── guides/                     # User, organizer & author guides
│   │   ├── CHALLENGE_AUTHORING.md  # Challenge design blueprints & container-free authoring guide
│   │   ├── COMPETITION_RULES_TEMPLATE.md # Turnkey ruleset & code of conduct template
│   │   ├── EVENT_OPERATIONS.md     # Event day runbook, anti-cheat protocol, and podium audits
│   │   ├── HOSTING_GUIDE.md        # Organizer guide for challenge design and PIN distribution
│   │   └── PARTICIPANT_GUIDE.md    # Competitor guide for playing and submitting flags
│   └── operations/                 # Production deployment & troubleshooting runbooks
│       ├── DEPLOYMENT.md           # Production deployment guide (Vercel, Docker, Linux VPS)
│       └── TROUBLESHOOTING.md      # Solutions for auth, PINs, scoring & realtime issues
├── CHANGELOG.md                    # Platform version history and release notes
├── CODE_OF_CONDUCT.md              # Contributor Covenant v2.1 code of conduct
├── CONTRIBUTING.md                 # Contributor onboarding, development workflow, and PR checklist
├── LICENSE                         # MIT open-source license
├── README.md                       # Project landing document
├── ROADMAP.md                      # Strategic roadmap, milestones, and upcoming features
└── SECURITY.md                     # Responsible disclosure and security reporting guidelines
```

### Where Should You Make Your Changes?
- **Backend / Flag Verification Logic:** Edit [`src/lib/actions.ts`](src/lib/actions.ts).
- **Form Schemas & Input Rules:** Edit [`src/lib/validations.ts`](src/lib/validations.ts).
- **Database Tables or Policies:** Edit [`supabase/schema.sql`](supabase/schema.sql).
- **In-Arena Player Experience:** Edit [`src/app/events/[id]/play/page.tsx`](src/app/events/[id]/play/page.tsx).
- **Leaderboard & Ranks:** Edit [`src/app/events/[id]/scoreboard/page.tsx`](src/app/events/[id]/scoreboard/page.tsx).
- **UI Components:** Edit or add files in [`src/components/ui/`](src/components/ui/).

---

## 3. Local Development Setup

### 1. Fork and Clone
```bash
# 1. Clone your fork from GitHub
git clone https://github.com/<your-username>/CTFy.git
cd CTFy

# 2. Add upstream to easily sync future changes
git remote add upstream https://github.com/Joydeep2005Banik/CTFy.git
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Supabase
1. Create a free project at [supabase.com](https://supabase.com).
2. Go to the **SQL Editor** in your Supabase dashboard.
3. Paste and run the entire script in [`supabase/schema.sql`](supabase/schema.sql).
4. Copy the environment template:
   ```bash
   cp .env.example .env.local
   ```
5. Fill in your project keys in `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

### 4. Run Development Server
```bash
npm run dev
```
Open [`http://localhost:3000`](http://localhost:3000) in your browser.

---

## 4. Branching Model & Git Workflow

We use a feature-branch workflow. Follow these conventions to keep the Git history clean and avoid merge conflicts:

### 1. The Default Branch
The primary development branch is **`master`**. All pull requests should be opened against `master`.

### 2. Always Start with the Latest Code
Before creating a new branch, pull the latest changes from the upstream repository:
```bash
git checkout master
git fetch upstream
git pull --rebase upstream master
```

### 3. Create a Descriptive Branch
Create a branch named after the type of work you are doing:

```bash
git checkout -b <type>/<short-description>
```

#### Branch Prefixes:
| Prefix | Purpose | Example |
|---|---|---|
| `feat/` | New feature or capability | `feat/export-scoreboard-csv` |
| `fix/` | Bug fix or error resolution | `fix/pin-gate-session-leak` |
| `docs/` | Documentation additions or edits | `docs/update-hosting-guide` |
| `style/` | CSS, UI layout, or theme tweaks | `style/mobile-podium-spacing` |
| `refactor/` | Code refactoring without behavior change | `refactor/extract-podium-card` |
| `chore/` | Tooling, dependencies, or config updates | `chore/update-tailwind-plugins` |

### 4. Keeping Your Branch Updated
If changes are merged into `master` while you are working, rebase your branch instead of creating merge commits:
```bash
git fetch upstream
git rebase upstream/master
```

### 5. Commit Message Conventions
We follow [Conventional Commits](https://www.conventionalcommits.org/):

```text
<type>: <short imperative summary>

[optional body explaining context or rationale]
```

**Good Examples:**
- `feat: add live timer countdown to challenge arena`
- `fix: prevent duplicate flag submissions on rapid clicks`
- `docs: clarify PIN distribution instructions in HOSTING_GUIDE.md`
- `refactor: extract flag input bar into standalone component`

---

## 5. Coding Standards & Security Principles

When contributing to CTFy, please uphold these core technical principles:

### 1. The Zero-Leak Rule (Critical)
- **Never expose challenge secrets:** The `correct_answer` column in the `questions` table must **never** be fetched by client components or public API routes.
- **Server Actions only:** Flag evaluations must execute on the server inside `submitFlagAction` using the Supabase Service Role client.

### 2. Monochrome Design System
- CTFy follows a strict, minimalist dark-mode cyberpunk aesthetic.
- Avoid introducing arbitrary vibrant colors (no bright blues, greens, or reds) except for semantic alerts:
  - **Success / Solved:** Emerald `#10b981`
  - **Error / Danger:** Red `#ef4444`
  - **Base Canvas:** Zinc `#09090b`, `#18181b`, `#27272a`, `#fafafa`
- Use Tailwind utility classes and merge them with `cn()` from `@/lib/utils`.

### 3. Accessibility & Forms
- Always use semantic HTML elements (`<button>`, `<main>`, `<nav>`, `<table>`).
- All forms should use **React Hook Form** paired with **Zod** validation schemas located in [`src/lib/validations.ts`](src/lib/validations.ts).

---

## 6. Testing & Quality Verification

Before committing your changes or opening a PR, always run the local verification suite:

```bash
# 1. Run ESLint static analysis
npm run lint

# 2. Run Next.js production build check
npm run build
```

Ensure both commands exit with **0 errors**.

---

## 7. Submitting a Pull Request (PR)

1. Push your branch to your GitHub fork:
   ```bash
   git push -u origin <type>/<short-description>
   ```
2. Navigate to your fork on GitHub and click **"Compare & pull request"**.
3. Fill out the [Pull Request Template](.github/pull_request_template.md):
   - Explain the motivation and summary of changes.
   - Link related issues (e.g. `Closes #14`).
   - Describe testing steps and attach screenshots for UI changes.
4. Maintainers will review your PR, run CI checks, and provide feedback!

---

## 8. Feature Wishlist & Good First Issues

Looking for inspiration on what to build next? Here are community-requested features:

- 👥 **Team Mode:** Allow participants to form teams and accumulate shared points.
- ⏱️ **Arena Countdown Timer:** A dynamic in-header countdown clock that tracks remaining competition time.
- 📊 **CSV / JSON Leaderboard Export:** Allow hosts to download the final leaderboard and solve logs.
- 🏷️ **Challenge Categories & Tags:** Tag questions by topic (*Web*, *Cryptography*, *Forensics*, *Reverse Engineering*, *OSINT*).
- 💡 **Hint System:** Optional hint reveals with configurable point deductions.
- 🔔 **Sound FX Toggle:** Optional retro 8-bit sound effects on flag capture.

---

Thank you for helping build CTFy! 🚀
