# Troubleshooting Guide & Runbook 🔍

This guide provides actionable solutions for common issues encountered by organizers, competitors, and developers on the **CTFy** platform.

---

## Table of Contents
1. [Authentication & Account Issues](#1-authentication--account-issues)
2. [Event Creation & PIN Code Issues](#2-event-creation--pin-code-issues)
3. [In-Arena Flag Submission Issues](#3-in-arena-flag-submission-issues)
4. [Live Scoreboard & Realtime Issues](#4-live-scoreboard--realtime-issues)
5. [Developer & Build Issues](#5-developer--build-issues)

---

## 1. Authentication & Account Issues

### Issue: "I registered, but I didn't receive a confirmation email."
- **Root Cause:** By default, Supabase's built-in mailer has a strict rate limit of 3 emails per hour for free projects.
- **Solutions:**
  1. **Check Spam/Junk Folder:** Automated auth emails can occasionally be flagged by mail providers.
  2. **Disable Email Confirmation for Hackathons (Recommended for Organizers):**
     - Go to **[Supabase Dashboard](https://supabase.com/dashboard)** $\rightarrow$ Your Project.
     - Navigate to **Authentication** $\rightarrow$ **Providers** $\rightarrow$ **Email**.
     - Toggle **OFF** *"Confirm email"*.
     - *Result:* Competitors can register and sign in immediately with zero email waiting time!
  3. **Custom SMTP:** For large public competitions, configure custom SMTP (e.g., SendGrid, Resend, or AWS SES) in Supabase under **Authentication** $\rightarrow$ **Email Templates** $\rightarrow$ **SMTP Settings**.

### Issue: Confirmation email link redirects to `localhost:3000` instead of production.
- **Root Cause:** Supabase default Site URL is set to `http://localhost:3000`.
- **Solution:**
  1. Go to **Supabase Dashboard** $\rightarrow$ **Authentication** $\rightarrow$ **URL Configuration**.
  2. Set **Site URL** to your live production domain:
     ```text
     https://ctfy-blush.vercel.app/
     ```
  3. Under **Redirect URLs**, add:
     ```text
     https://ctfy-blush.vercel.app/**
     ```
  4. Click **Save**.

---

## 2. Event Creation & PIN Code Issues

### Issue: "Invalid PIN Code" when unlocking an arena.
- **Root Cause:** Typo, incorrect casing, or accidental leading/trailing spaces.
- **Solutions:**
  1. Event PINs are **6 alphanumeric characters** (e.g. `8K2F9A`).
  2. Verify that there are no accidental spaces when copying and pasting.
  3. If you are the event host, check the exact PIN under the **"Hosted by You"** tab on your **Dashboard** or in the **Host Control Deck**.

### Issue: In-arena PIN gate modal pops up again after previously entering the PIN.
- **Root Cause:** The browser session or local storage cache was cleared, or the competitor opened a private/incognito window.
- **Solution:**
  - Simply re-enter the 6-character PIN. The system will verify the code and immediately unlock your progress. Any previously submitted flags and points are safely stored in the database and will not be lost.

### Issue: "This event is scheduled for the future" or "This event has ended".
- **Root Cause:** The current time falls outside the event's `start_time` and `end_time` window.
- **Solution:**
  - Submissions are only accepted while the event status is **Active**. 
  - Hosts can verify the scheduled start and end times in the Host Deck. CTFy automatically converts dates to UTC, so client clock discrepancies will not allow submissions outside the host's specified window.

---

## 3. In-Arena Flag Submission Issues

### Issue: "Incorrect flag. Check formatting and try again."
- **Root Cause:** The submitted answer does not match the secret answer stored on the server.
- **Checklist:**
  - **Case Sensitivity:** Flags are checked with exact case matching (e.g. `CTFy{mY_FlAg}` is different from `CTFy{my_flag}`).
  - **Wrapper Format:** Verify whether the prompt requires standard wrapper syntax (e.g. `CTFy{...}`).
  - **Trailing Spaces:** Ensure you didn't accidentally copy a space at the beginning or end of the string.

### Issue: "You have already captured this flag!"
- **Root Cause:** The user has already solved this question.
- **Explanation:** CTFy awards points only once per challenge per participant. Once a challenge card shows **FLAG CAPTURED**, no additional points can be gained from it.

---

## 4. Live Scoreboard & Realtime Issues

### Issue: Scoreboard does not update automatically when someone captures a flag.
- **Root Cause:** Supabase Realtime replication is not enabled on the `submissions` table.
- **Solution:**
  1. Open your **[Supabase Dashboard](https://supabase.com/dashboard)** $\rightarrow$ **SQL Editor**.
  2. Execute the following SQL statement:
     ```sql
     alter publication supabase_realtime add table public.submissions;
     ```
  3. Verify that your browser allows WebSocket connections (`wss://`) and is not blocked by a restrictive corporate firewall.

---

## 5. Developer & Build Issues

### Issue: `npm run build` fails with missing environment variables.
- **Root Cause:** Next.js requires environment variables during static page generation.
- **Solution:**
  - Ensure you have a `.env.local` file in the project root:
    ```bash
    cp .env.example .env.local
    ```
  - Populate with your actual Supabase keys or valid placeholder formats.

### Issue: Git says "Your branch and origin/master have diverged".
- **Root Cause:** Commits were made on GitHub directly while local commits were created on your computer.
- **Solution:**
  - Pull and rebase cleanly:
    ```bash
    git pull --rebase origin master
    git push origin master
    ```
