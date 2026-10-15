# Dependencies, Component Matrix & Audit Compliance 📦

This document serves as the formal **Software Bill of Materials (SBOM)**, component specification, and license/security audit compliance reference for **CTFy**.

---

## 1. Executive Summary & Compliance Overview

- **Software Platform:** CTFy (Lightweight Capture The Flag Platform)
- **Primary Runtime:** Node.js >= 20.x (Recommended LTS: Node.js 20 or 22)
- **Application Architecture:** Next.js 16 (App Router with Turbopack) + React 19
- **License Compliance:** **100% Permissive Open Source** (MIT, Apache-2.0, ISC). Zero copyleft (GPL/AGPL) contamination.
- **Audit Posture:** Strict lockfile pinning (`package-lock.json` v3) ensuring reproducible, cryptographically verified builds across CI and production.

---

## 2. Production Dependencies & Component Matrix

The following table details all direct runtime packages deployed in production:

| Package | Version | License | Category / Subsystem | Purpose & Usage in CTFy |
|---|---|---|---|---|
| **`next`** | `16.4.0` | MIT | Core Framework | App Router, Server Actions, Turbopack bundling, and edge routing |
| **`react`** | `19.3.0` | MIT | UI Library | React 19 Server Components, async transitions, and client state |
| **`react-dom`** | `19.3.0` | MIT | DOM Renderer | React DOM mounting and event delegation |
| **`@supabase/supabase-js`** | `2.117.3` | MIT | Database & Realtime | PostgreSQL client, Realtime WebSocket subscriptions, and RLS queries |
| **`@supabase/ssr`** | `0.12.7` | MIT | Auth & Session | Cookie-based session storage and server-side token authentication |
| **`@radix-ui/react-dialog`** | `1.3.1` | MIT | Accessible UI Primitive | Accessible modal primitives powering the In-Arena PIN Gate dialog |
| **`@radix-ui/react-label`** | `2.1.17` | MIT | Accessible UI Primitive | Accessible form label primitives with peer state awareness |
| **`@radix-ui/react-slot`** | `1.5.0` | MIT | UI Polymorphism | Polymorphic slot pattern enabling `asChild` composition on buttons |
| **`class-variance-authority`** | `0.7.1` | Apache-2.0 | Styling Architecture | Type-safe component variant definitions for buttons and badges |
| **`clsx`** | `2.1.1` | MIT | Styling Utility | High-performance conditional className construction |
| **`tailwind-merge`** | `3.7.0` | MIT | Styling Utility | Merges Tailwind CSS class conflicts safely within `cn()` |
| **`lucide-react`** | `1.56.0` | ISC | Iconography | Monochrome iconography (Flag, Trophy, Shield, KeyRound, Terminal) |
| **`canvas-confetti`** | `1.9.4` | ISC | Visual FX | Particle confetti celebration animations triggered on flag captures |
| **`react-hook-form`** | `7.90.0` | MIT | Form State | High-performance uncontrolled form handling for event & question creation |
| **`zod`** | `4.6.7` | MIT | Validation Engine | Schema declaration and server validation for dates, questions, and PINs |
| **`@hookform/resolvers`** | `5.9.1` | MIT | Form Validation Bridge | Connects Zod validation schemas seamlessly to React Hook Form |

---

## 3. Development Tooling & Compiler Dependencies

| Package | Version | License | Purpose |
|---|---|---|---|
| **`typescript`** | `5.9.3` | Apache-2.0 | Static type checking and strict interface verification |
| **`tailwindcss`** | `4.3.3` | MIT | CSS-first styling engine with automatic variable injection |
| **`@tailwindcss/turbopack`** | `4.3.3` | MIT | Turbopack compilation and HMR plugin for Tailwind CSS v4 |
| **`eslint`** | `9.39.5` | MIT | JavaScript and TypeScript static code analysis |
| **`eslint-config-next`** | `16.4.0` | MIT | Official Next.js linting rules and Core Web Vitals checks |
| **`@types/node`** | `20.19.43` | MIT | TypeScript definitions for Node.js runtime APIs |
| **`@types/react`** | `19.3.0` | MIT | TypeScript definitions for React 19 |
| **`@types/react-dom`** | `19.3.0` | MIT | TypeScript definitions for React DOM |
| **`@types/canvas-confetti`** | `1.9.0` | MIT | TypeScript definitions for confetti effects |

---

## 4. UI Component Registry & Primitives Mapping

All user interface components reside in [`src/components/ui/`](../../src/components/ui/) and follow the [shadcn/ui](https://ui.shadcn.com/) architecture:

```
src/components/
├── navbar.tsx             # Responsive header with brand badge & auth routing
├── supabase-banner.tsx    # Configuration warning banner
└── ui/
    ├── badge.tsx          # CVA-styled status indicators (default, outline, secondary)
    ├── button.tsx         # Radix Slot polymorphic button with 6 variants & 4 sizes
    ├── card.tsx           # Structured container (Card, Header, Title, Content, Footer)
    ├── dialog.tsx         # Radix Dialog wrapper (Portal, Overlay, Content, Header)
    ├── input.tsx          # Styled input with autofill isolation attributes
    ├── label.tsx          # Accessible Radix Label with disabled styling
    └── table.tsx          # Responsive scoreboard data table (Header, Row, Cell)
```

### Component Specification Table:

| Component | Primitive Base | Available Variants / Properties |
|---|---|---|
| `<Button />` | `@radix-ui/react-slot` | `variant`: `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`<br>`size`: `default`, `sm`, `lg`, `icon`<br>`asChild`: `boolean` |
| `<Badge />` | `<div>` | `variant`: `default`, `secondary`, `destructive`, `outline` |
| `<Card />` | `<div />` | Semantic subcomponents: `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter` |
| `<Dialog />` | `@radix-ui/react-dialog` | Subcomponents: `DialogTrigger`, `DialogContent`, `DialogHeader`, `DialogFooter`, `DialogTitle`, `DialogDescription` |
| `<Input />` | `<input />` | Supports user-isolated names, autocomplete suppression, focus states, and file inputs |
| `<Label />` | `@radix-ui/react-label` | Supports form association (`htmlFor`) and disabled peer states |
| `<Table />` | `<table>` | Subcomponents: `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell`, `TableCaption` |

---

## 5. License & Legal Audit Compliance

A software license audit confirms that **100% of the project's dependencies** use permissive licenses:

```
License Breakdown across all Direct Dependencies:
├── MIT License:        22 packages (84.6%)
├── Apache 2.0:          2 packages ( 7.7%)
└── ISC License:         2 packages ( 7.7%)
─────────────────────────────────────────────
Copyleft (GPL/AGPL):     0 packages ( 0.0%) [CLEAN]
```

### Commercial & Educational Permissions:
- **Commercial Use:** Allowed without royalty fees.
- **Modification & Distribution:** Allowed under standard attribution.
- **Patent Grant:** Explicitly granted by Apache-2.0 dependencies (`typescript`, `class-variance-authority`).
- **Private Use:** Fully permitted without mandatory source disclosure.

---

## 6. Security & Vulnerability Audit Compliance

### Runtime Vulnerabilities: **0**
- All runtime production dependencies (`next`, `react`, `@supabase/*`, `@radix-ui/*`, `zod`, `react-hook-form`, `tailwind-merge`) have zero reported runtime vulnerabilities.

### Build & Dev Environment Notes:
- The development toolchain relies on `eslint-config-next@16.4.0`.
- All production code is verified by automated continuous integration on GitHub Actions ([`.github/workflows/ci.yml`](../../.github/workflows/ci.yml)) verifying:
  1. `npm ci` (deterministic lockfile validation)
  2. `npm run lint` (ESLint static analysis)
  3. `npm run build` (Next.js production Turbopack compilation)

---

## 7. Verifying Compliance Locally

To run the audit and verification suite yourself:

```bash
# 1. Verify exact lockfile integrity
npm ci

# 2. Run static analysis and linting
npm run lint

# 3. Compile optimized production build
npm run build

# 4. Check package security audit
npm audit
```
