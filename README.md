# CTFy — Lightweight Capture The Flag Platform

<p align="center">
  <img src="public/icon.svg" width="72" height="72" alt="CTFy Flag" />
</p>

<p align="center">
  <strong>Fast, minimal, and container-free CTF platform for cybersecurity clubs, hackathons, and quiz competitions.</strong>
</p>

<p align="center">
  <a href="https://ctfy-blush.vercel.app/"><img src="https://img.shields.io/badge/Live%20Demo-ctfy--blush.vercel.app-white?style=for-the-badge&logo=vercel&logoColor=black" alt="Live Demo" /></a>
  <a href="https://github.com/Joydeep2005Banik/CTFy/actions"><img src="https://github.com/Joydeep2005Banik/CTFy/actions/workflows/ci.yml/badge.svg" alt="CI Status" /></a>
  <img src="https://img.shields.io/badge/Next.js-16.4-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js 16" />
  <img src="https://img.shields.io/badge/React-19.3-blue?style=for-the-badge&logo=react&logoColor=white" alt="React 19" />
  <img src="https://img.shields.io/badge/Supabase-Database%20%26%20Realtime-emerald?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/Tailwind-CSS%20v4-38bdf8?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS v4" />
  <img src="https://img.shields.io/badge/License-MIT-zinc?style=for-the-badge" alt="License" />
</p>

---

## ⚡ Why CTFy?

Traditional CTF platforms often require deploying heavy Docker containers, configuring nested virtual networks, and debugging flaky SSH jump-hosts just to run a quiz or security round.

**CTFy changes that.** It is built for organizers who want to host fast, responsive flag-capture events in minutes without infrastructure headaches. You provide the prompts, hints, external assets, and flags—CTFy handles real-time submissions, server-side verification, and live scoreboards.

> 📖 **Helpful Guides:**
> - [**Hosting Guide (HOSTING_GUIDE.md)**](HOSTING_GUIDE.md): Challenge design, PIN distribution, and live event management for organizers.
> - [**Participant Guide (PARTICIPANT_GUIDE.md)**](PARTICIPANT_GUIDE.md): Step-by-step instructions for competitors on joining via PIN, solving challenges, and submitting flags.

---

## ✨ Features

- 🎯 **Instant Event Creation:** Build multi-question CTFs with markdown prompts, external file/image links, point weights, and secret flags.
- 🔑 **PIN-Gated Competition Arenas:** Events are guarded by unique 6-character access codes. Competitors cannot view or submit flags without unlocking the event.
- 🛡️ **Zero-Leak Server Architecture:** Flags are verified strictly on the server via Next.js Server Actions. Secret answers are **never** delivered to client bundles or browser dev tools.
- ⚡ **Realtime Live Scoreboard:** Watch ranks shift instantaneously. Driven by Supabase Realtime PostgreSQL listeners with instant point calculations and victory confetti.
- 👤 **Isolated Participant Dashboards:** Clean distinction between "Hosted by You" and "Joined Competitions". Brand-new participants see a pristine zero-state with no leaked competitor events.
- 🔒 **Cross-User Session Protection:** Strict client-state resets, user-scoped input keys, and autofill suppression prevent answer leakage between users on shared devices.
- 🎨 **Minimalist Monochrome Cyber UI:** Ultra-fast, accessible dark-mode aesthetic built with Tailwind CSS v4 and shadcn/ui.

---

## 🛠️ Tech Stack

| Layer | Technology & Version | Purpose |
|---|---|---|
| **Framework** | [Next.js 16.4.0 (Turbopack, App Router)](https://nextjs.org) | Full-stack serverless rendering & Server Actions |
| **Frontend** | [React 19.3.0](https://react.dev), [TypeScript 5](https://www.typescriptlang.org) | Server components, async state, and static typing |
| **Styling & UI** | [Tailwind CSS v4](https://tailwindcss.com), [shadcn/ui](https://ui.shadcn.com) | CSS-first dark theme & accessible Radix UI primitives |
| **Backend & DB** | [Supabase](https://supabase.com) (`@supabase/supabase-js` v2.117, `@supabase/ssr` v0.12) | PostgreSQL, Row Level Security, Auth & Realtime CDC |
| **Validation** | [React Hook Form 7.90](https://react-hook-form.com), [Zod 4.6](https://zod.dev) | High-performance client & server schema validation |
| **Deployment** | [Vercel](https://vercel.com) | Global edge deployment and SSL automation |

> 🧩 **Detailed Component Specs:** For the complete dependency matrix, Radix UI primitive breakdown, and UI component API reference, see [**`COMPONENTS.md`**](COMPONENTS.md).

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- [Node.js](https://nodejs.org) >= 20.x
- [npm](https://www.npmjs.com) or [pnpm](https://pnpm.io)
- A free [Supabase](https://supabase.com) project

### 2. Clone Repository
```bash
git clone https://github.com/Joydeep2005Banik/CTFy.git
cd CTFy
npm install
```

### 3. Setup Supabase Database
1. Go to your **[Supabase Dashboard](https://supabase.com/dashboard)** $\rightarrow$ **SQL Editor**.
2. Open [`supabase/schema.sql`](./supabase/schema.sql) in this repository.
3. Paste and run the entire script. This provisions:
   - `profiles`, `events`, `questions`, and `submissions` tables
   - Row Level Security (RLS) policies
   - Automatic user profile sync triggers on signup
   - Realtime publication on the `submissions` table

### 4. Configure Environment Variables
Create a `.env.local` file in the root directory (or copy from `.env.example`):

```bash
cp .env.example .env.local
```

Fill in your project credentials from your Supabase Dashboard (**Project Settings** $\rightarrow$ **API**):

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 5. Run Development Server
```bash
npm run dev
```

Visit [`http://localhost:3000`](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```text
CTFy/
├── public/                 # Static assets & browser icons
├── src/
│   ├── app/                # Next.js App Router routes
│   │   ├── dashboard/      # Participant & host dashboard
│   │   ├── events/[id]/
│   │   │   ├── host/       # Host event control deck
│   │   │   ├── play/       # Competitor challenge arena (PIN-gated)
│   │   │   └── scoreboard/ # Public/live realtime leaderboard
│   │   ├── host/create/    # Event creation form
│   │   ├── join/           # PIN-code quick event entrance
│   │   ├── login/          # User authentication (Supabase Auth)
│   │   ├── register/       # User registration
│   │   ├── layout.tsx      # Root layout with brand metadata
│   │   └── page.tsx        # Hero landing page
│   ├── components/         # Reusable UI & navbar components
│   │   ├── ui/             # shadcn/ui primitive components
│   │   └── navbar.tsx      # Responsive navigation header
│   └── lib/                # Core utilities, actions, and validations
│       ├── actions.ts      # Server Actions (secure flag submissions & queries)
│       ├── validations.ts  # Zod schema definitions
│       ├── utils.ts        # Helper functions & localStorage caching
│       └── supabase/       # Client & Server Supabase connectors
└── supabase/
    └── schema.sql          # Complete PostgreSQL schema, RLS, and triggers
```

---

## 🔐 Security Architecture

- **Server-Side Flag Evaluation:** Correct answers (`correct_answer`) in the `questions` table are hidden behind Row Level Security (RLS). The client is never granted direct select permissions on `correct_answer`.
- **Zero-Secret Bundles:** Flag comparisons happen strictly inside `submitFlagAction` in [`src/lib/actions.ts`](./src/lib/actions.ts) using the privileged Supabase Service Role client.
- **PIN Verification:** Access to challenge prompts is restricted to users who verify the 6-character PIN or are the verified creator of the event.
- **Input Sanitization:** Flag inputs disable browser autofill, spellcheck, and credential-manager caching to prevent cross-account answer leaks on shared computers.
- 🏛️ **Full Technical Breakdown:** See [**`ARCHITECTURE.md`**](ARCHITECTURE.md) for Mermaid sequence diagrams, database ERD, and real-time state synchronization flows.

---

## 🤝 Contributing & Community

We welcome contributions from the community!
- 🏛️ [**Architecture & System Design**](ARCHITECTURE.md): Technical deep-dive, sequence diagrams, and security architecture.
- 🧩 [**Component Reference**](COMPONENTS.md): Complete dependency matrix, Radix UI primitives, and UI component inventory.
- 📖 [**Hosting Guide**](HOSTING_GUIDE.md): Master the art of designing and hosting CTF events.
- 🎯 [**Participant Guide**](PARTICIPANT_GUIDE.md): How to join with a PIN code, submit flags, and track live standings.
- 🛠️ [**Contributing Guide**](CONTRIBUTING.md): Workflow guidelines, branch standards, and PR instructions.
- 📜 [**Code of Conduct**](CODE_OF_CONDUCT.md): Our community commitment to an inclusive environment.
- 🔒 [**Security Policy**](SECURITY.md): Responsible vulnerability disclosure guidelines.
- 🐛 [**Issue Templates**](.github/ISSUE_TEMPLATE/): Report bugs or submit feature proposals.
- 📜 [**Changelog**](CHANGELOG.md): Complete history of platform features and bug fixes.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE) — see the [LICENSE](LICENSE) file for details.
