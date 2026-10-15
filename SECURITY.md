# Security Policy 🛡️

## Supported Versions

We actively provide security updates for the current deployment of **CTFy**:

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

---

## Security Architecture & Threat Model

CTFy is intentionally engineered with a zero-trust architecture regarding competition flags and user answers:

1. **Server-Side Secret Isolation:** 
   - Challenge solutions (`correct_answer`) in the `questions` table are strictly guarded by PostgreSQL Row Level Security (RLS) policies. Standard users, competitors, and anonymous visitors cannot select or query `correct_answer`.
2. **Execution Exclusivity:**
   - Flag validation happens exclusively on the server inside Next.js Server Actions using privileged server-side clients. Flags are never embedded in client JavaScript bundles, DOM trees, or network responses.
3. **PIN Gate Verification:**
   - Challenge questionnaires are protected by 6-character access codes. Only verified participants and event creators can unlock the competition arena.
4. **Session & Input Isolation:**
   - Competition input fields enforce browser autofill suppression, unique element names, and clean local storage wiping upon user transitions to prevent accidental leaks on shared devices.

---

## Reporting a Vulnerability

If you discover a security vulnerability or potential exploit in CTFy, please **do not** open a public issue.

Instead, please report it privately:
- **Email:** `joydeepbanik41@gmail.com`
- **GitHub Security Advisory:** You may submit a private report via the repository's **Security** tab on GitHub.

### When submitting a report, please include:
- A clear description of the vulnerability and its potential impact.
- Step-by-step instructions to reproduce the issue (or a proof-of-concept).
- Affected routes or components.
- Any suggested fixes or mitigations.

We will acknowledge your report within 48 hours and work with you to test and deploy a fix promptly.
