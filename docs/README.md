# CTFy Documentation Hub 📚

Welcome to the central documentation hub for **CTFy** — the fast, minimal, and container-free Capture The Flag platform.

Documentation is organized into dedicated categories:

---

## 🚩 Competition & Event Guides (`docs/guides/`)

Guides for organizers running events, challenge authors designing problems, and competitors solving flags:

| Document | Audience | Description |
|---|---|---|
| [**`HOSTING_GUIDE.md`**](guides/HOSTING_GUIDE.md) | Organizers | Comprehensive manual for designing competitions, scheduling time windows, distributing PIN codes, and operating the live Host Deck. |
| [**`PARTICIPANT_GUIDE.md`**](guides/PARTICIPANT_GUIDE.md) | Competitors | Step-by-step player guide covering account setup, PIN-based arena access, flag submission hygiene, and reading the live scoreboard. |
| [**`CHALLENGE_AUTHORING.md`**](guides/CHALLENGE_AUTHORING.md) | Authors & Educators | Complete blueprints for designing rich Crypto, Forensics, Reverse Engineering, and Web challenges without requiring Docker containers. |
| [**`EVENT_OPERATIONS.md`**](guides/EVENT_OPERATIONS.md) | Hosts & Directors | Minute-by-minute event day runbook, anti-cheat detection methods, live errata handling, and tie-breaking protocols. |

---

## 🏛️ Architecture & System Engineering (`docs/architecture/`)

In-depth technical architecture, concurrency models, dependency audits, and codebase structure:

| Document | Focus | Description |
|---|---|---|
| [**`ARCHITECTURE.md`**](architecture/ARCHITECTURE.md) | Core Engineering | High-level system topology, Mermaid sequence diagrams, database entity relationships (ERD), and the zero-leak server-side evaluation model. |
| [**`SYSTEM_DESIGN.md`**](architecture/SYSTEM_DESIGN.md) | Performance & Scale | High-concurrency throughput (1,000+ competitors), Supavisor connection pooling (port 6543), Realtime Change Data Capture (CDC), and failure recovery. |
| [**`PROJECT_STRUCTURE.md`**](architecture/PROJECT_STRUCTURE.md) | Codebase Map | File-by-file annotated reference, visual ASCII directory tree, component responsibilities, and end-to-end data flow tracing. |
| [**`DEPENDENCIES.md`**](architecture/DEPENDENCIES.md) | SBOM & Compliance | Exhaustive package version matrix, shadcn/ui component registry, and 100% permissive open-source license compliance audit. |

---

## 🚀 Operations, Deployment & Runbooks (`docs/operations/`)

DevOps deployment procedures, production configurations, and support troubleshooting:

| Document | Focus | Description |
|---|---|---|
| [**`DEPLOYMENT.md`**](operations/DEPLOYMENT.md) | DevOps & Self-Hosting | Production deployment guides for Vercel (recommended), Docker multi-stage containers, and Linux VPS (Ubuntu/Debian) with PM2, Nginx, and Certbot SSL. |
| [**`TROUBLESHOOTING.md`**](operations/TROUBLESHOOTING.md) | Support Runbook | Tactical troubleshooting solutions for Supabase email rate limits, PIN code edge cases, case sensitivity, and WebSocket realtime replication. |

---

## 🗺️ Product Roadmap & Project Standards

High-level project roadmap and standard open-source community policies:
- 🗺️ [**Product Roadmap**](../ROADMAP.md): Strategic vision and milestone specs (Team Mode, countdown timers, dynamic decay scoring).
- 🛠️ [**Contributing Guide**](../CONTRIBUTING.md): Workflow guidelines, branch standards, and PR instructions.
- 📜 [**Code of Conduct**](../CODE_OF_CONDUCT.md): Contributor Covenant v2.1 community commitment.
- 🔒 [**Security Policy**](../SECURITY.md): Responsible vulnerability disclosure guidelines.
- 📜 [**Changelog**](../CHANGELOG.md): Platform feature history and version release notes.
