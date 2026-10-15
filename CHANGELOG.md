# Changelog 📜

All notable changes to the **CTFy** platform will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Planned
- Team Mode: multi-user shared team scores and rosters.
- In-arena live countdown timer for active competitions.
- Export scoreboard standings and submission logs to CSV.
- Optional hints with customizable point deduction penalties.

---

## [0.1.0] - 2026-10-15

### Added
- **Core Platform:** Minimalist, container-free Capture The Flag platform built on Next.js 16 (App Router, Turbopack), React 19, and TypeScript.
- **Styling & Design:** Clean monochrome cyberpunk aesthetic using Tailwind CSS v4 and shadcn/ui primitives.
- **Supabase Integration:**
  - Complete PostgreSQL schema (`profiles`, `events`, `questions`, `submissions`) with Row Level Security (RLS) policies.
  - Supabase Auth for user registration and session management.
  - Supabase Realtime publication on submissions for live event tracking.
- **Event Creator (`/host/create`):**
  - Intuitive questionnaire builder for prompts, external media URLs, points, and secret flags.
  - Automatic 6-character PIN code generation for private event gating.
  - Automatic local browser time conversion to UTC for cross-timezone event scheduling.
- **Challenge Arena (`/events/[id]/play`):**
  - In-arena challenge questionnaire with prompt display and external asset links.
  - Instant server-side flag validation via Next.js Server Actions with zero secrets exposed to client bundles.
  - Interactive solved cards with "FLAG CAPTURED" status and victory confetti animations.
- **Live Scoreboard (`/events/[id]/scoreboard`):**
  - Real-time leaderboard re-ranking dynamically via Supabase Realtime PostgreSQL replication.
  - Cyber top-3 podium highlighting Gold, Silver, and Bronze competitors.
- **Host Control Deck (`/events/[id]/host`):**
  - Live metric cards tracking active solvers, total submission counts, and completion rates.
  - Real-time submission stream displaying incoming attempts as they happen.
  - Authorized host-only access guard.
- **Branded Site Icons:**
  - Multi-tier site icon system featuring the CTFy flag badge.
  - Adaptive vector SVG (`icon.svg`) with `@media (prefers-color-scheme)` supporting both dark and light browser tab bars.
  - Multi-resolution `.ico` (16×16, 32×32, 48×48) and Apple Touch icon (`apple-icon.png`).
- **Open Source Documentation & Tooling Suite:**
  - Product-grade `README.md` with live demo badge, architecture overview, and quickstart instructions.
  - Comprehensive `HOSTING_GUIDE.md` for event organizers (challenge design, PIN distribution, and live operations).
  - Detailed `PARTICIPANT_GUIDE.md` for competitors (joining via PIN, submitting flags, and tracking standings).
  - `ARCHITECTURE.md` technical system design with Mermaid sequence diagrams, ERD, and zero-leak security model.
  - `DEPENDENCIES.md` Software Bill of Materials (SBOM), component registry, and 100% permissive license audit compliance.
  - `SECURITY.md` establishing the threat model and responsible disclosure guidelines.
  - `CONTRIBUTING.md` contributor onboarding and Conventional Commit guidelines.
  - `CODE_OF_CONDUCT.md` adhering to Contributor Covenant v2.1.
  - Automated GitHub Actions CI workflow (`.github/workflows/ci.yml`) for continuous build and lint verification.
  - Cross-platform formatting standards (`.editorconfig`) and recommended workspace extensions (`.vscode/`).
  - GitHub issue templates for bug reports and feature requests, plus a pull request template.
  - MIT `LICENSE`.

### Fixed
- **In-Arena PIN Gate:** Enforced strict in-arena PIN verification so competitors cannot bypass PIN entry simply by logging in.
- **Dashboard Separation:** Eliminated global event leaks on user dashboards by separating views into "Hosted by You" and "Joined Competitions" tabs.
- **Cross-User Session Protection:** Resolved answer pollution on shared browsers by adding unique scoped input keys, disabling browser autofill/autocomplete, and cleanly resetting in-memory states on login/logout.
- **Timezone Scheduling:** Fixed event schedule offsets by converting `datetime-local` inputs directly to ISO UTC timestamps on creation and rendering them in the user's local timezone.
- **Environment Template Tracking:** Adjusted `.gitignore` to allow `.env.example` for developer onboarding while keeping `.env.local` strictly protected.
