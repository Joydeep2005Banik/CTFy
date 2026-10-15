# Contributing to CTFy 🚩

Thank you for your interest in contributing to **CTFy**! 

Whether you are fixing a bug, improving documentation, designing new challenge features, or optimizing performance, your contributions help make CTFy the best lightweight, zero-overhead CTF platform.

---

## 📜 Code of Conduct

By participating in this project, you agree to treat all community members with respect, kindness, and professionalism. Please report any inappropriate or harassing behavior to `joydeepbanik41@gmail.com`.

---

## 🛠️ Local Development Setup

### 1. Fork & Clone
1. Fork the repository on GitHub: [https://github.com/Joydeep2005Banik/CTFy](https://github.com/Joydeep2005Banik/CTFy)
2. Clone your fork locally:
   ```bash
   git clone https://github.com/<your-username>/CTFy.git
   cd CTFy
   ```
3. Add the upstream repository:
   ```bash
   git remote add upstream https://github.com/Joydeep2005Banik/CTFy.git
   ```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Supabase
1. Create a free project at [Supabase](https://supabase.com).
2. Go to the **SQL Editor** in Supabase and run the provided script in [`supabase/schema.sql`](supabase/schema.sql).
3. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
4. Fill in your project keys in `.env.local`:
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

## 🌿 Branching Strategy

Always create a new branch from the latest `master` branch:

```bash
git checkout master
git pull upstream master
git checkout -b <type>/<short-description>
```

### Branch Naming Conventions:
- `feat/export-scoreboard-csv` (New feature)
- `fix/autofill-prevention` (Bug fix)
- `docs/update-guide` (Documentation changes)
- `style/improve-card-contrast` (UI or styling tweaks)
- `refactor/optimize-realtime` (Code refactoring)

---

## 📝 Commit Conventions

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat: add timer countdown to play arena`
- `fix: resolve duplicate submission error on slow networks`
- `docs: update participant guide with PIN entry steps`
- `style: refine question card spacing on mobile`
- `refactor: extract scoreboard podium into reusable component`

---

## 🧪 Testing Your Changes

Before submitting your Pull Request, verify that your changes build cleanly without TypeScript or linting errors:

```bash
# Run ESLint
npm run lint

# Run Next.js production build check
npm run build
```

---

## 🚀 Submitting a Pull Request (PR)

1. Push your branch to your fork:
   ```bash
   git push origin <your-branch-name>
   ```
2. Open a Pull Request against `master` on the main repository.
3. Provide a clear description of:
   - What the PR does and why it is needed.
   - Any testing steps or screenshots of UI changes.
4. Maintainers will review your PR and provide feedback.

---

## 💡 Contribution Ideas

Looking for ways to contribute? Here are some community ideas:
- 👥 **Team Mode:** Enable multiple participants to register under a shared team name.
- ⏱️ **Live Countdown Timer:** Display a visible countdown clock in the arena header while events are active.
- 📊 **CSV Export:** Allow hosts to download final scoreboard standings and submission logs as a `.csv` file.
- 🏷️ **Category Badges:** Tag challenges by domain (*Web*, *Crypto*, *Forensics*, *OSINT*, *Binary*).
- 💡 **Hint System:** Optional hint reveals with configurable point deduction penalties.

Thank you for building with us! 🚀
