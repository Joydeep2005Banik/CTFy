# CTF Event Day Operations & Anti-Cheat Playbook 📋

This playbook is the definitive guide for organizers, club officers, and hackathon directors running live competitions on **CTFy**. It provides minute-by-minute operating procedures, anti-cheat detection methods, live emergency runbooks, and podium verification protocols.

---

## Table of Contents
1. [Competition Timeline & Master Checklist](#1-competition-timeline--master-checklist)
2. [Using the Host Control Deck](#2-using-the-host-control-deck)
3. [Anti-Cheat & Integrity Protocols](#3-anti-cheat--integrity-protocols)
4. [Live Incident & Errata Runbook](#4-live-incident--errata-runbook)
5. [Tie-Breaking & Winner Verification](#5-tie-breaking--winner-verification)
6. [Post-Event Wrap-up & Retrospective](#6-post-event-wrap-up--retrospective)

---

## 1. Competition Timeline & Master Checklist

### 🕒 T-24 Hours (Preparation & Dry Run)
- [ ] **Verify Flag Logic:** Solve every challenge from an unprivileged test participant account in an incognito window.
- [ ] **Check External Asset Links:** Ensure all download URLs (PCAPs, images, binaries) are publicly accessible without authentication or quota blocks.
- [ ] **Verify UTC Timestamps:** Confirm that event `start_time` and `end_time` are accurately set. CTFy converts all local times to UTC upon event creation.
- [ ] **Confirm PIN:** Note the 6-character Event PIN code from your **Dashboard** (`/dashboard`) under the **"Hosted by You"** tab.

### 🕒 T-1 Hour (Competitor Onboarding)
- [ ] **Direct Competitors to Register:** Instruct participants to visit the platform and click **"Register"** (`/register`) to set up their accounts.
- [ ] **Disable Email Confirmation (Optional for Private Events):** If running on free-tier Supabase, disable email verification in Supabase Auth to eliminate inbox delays for participants.
- [ ] **Prepare the PIN Display:** Have the 6-character Event PIN ready to project on screen or announce in your competition channel at kickoff.

### 🕒 T-0 (Kickoff & Arena Launch)
- [ ] **Distribute the PIN:** Share the PIN code. Competitors visit **"Join Event"** (`/join`) or enter the PIN inside the In-Arena gate modal.
- [ ] **Open Host Control Deck:** Open `/events/[id]/host` in an organizer browser tab to monitor live telemetry.
- [ ] **Open Scoreboard:** Open `/events/[id]/scoreboard` on a projector or secondary display to broadcast live rank shifts.

### 🕒 Mid-Competition (Monitoring & Hints)
- [ ] **Monitor Solve Velocity:** Track which challenges have high solve counts and which have zero solves.
- [ ] **Scheduled Hint Drops:** If an important challenge has zero solves at the midpoint (e.g., halfway through the event), consider releasing hints to keep engagement high.
- [ ] **Address Support Queries:** Answer competitor questions regarding prompt clarity (never provide hints privately; any clarification must be announced to all participants).

### 🕒 T+0 (Competition Close)
- [ ] **Submissions Lock:** CTFy automatically rejects flag submissions once the clock passes the event's `end_time`.
- [ ] **Audit Top 3 Finishers:** Inspect submission logs for the podium winners before making official announcements.
- [ ] **Broadcast Final Standings:** Celebrate winners with the animated confetti podium on `/events/[id]/scoreboard`.

---

## 2. Using the Host Control Deck

The **Host Control Deck** (`/events/[id]/host`) is your real-time command center:

```
┌─────────────────────────────────────────────────────────────┐
│  CTFy Host Control Deck: CyberSpring CTF 2026               │
│  PIN: 8K2F9A  •  Status: ACTIVE  •  Participants: 142       │
├─────────────────────────────────────────────────────────────┤
│  [ Total Solves: 418 ]   [ Total Attempts: 1,842 ]          │
│  [ Solve Rate: 22.7% ]   [ First Blood: Alice (Crypto 101) ]│
├─────────────────────────────────────────────────────────────┤
│  Live Ingestion Stream:                                     │
│  • 14:02:11 - Bob captured "Forensics 1" (+150 pts)        │
│  • 14:02:08 - Charlie failed "Rev 2" (Incorrect flag)      │
│  • 14:01:54 - Alice captured "Web 3" (+300 pts)            │
└─────────────────────────────────────────────────────────────┘
```

### Key Metrics to Monitor:
1. **Solve Rate:** Normal CTFs average a 15% – 35% correct submission rate. A solve rate below 5% usually indicates ambiguous prompts or broken download links.
2. **Submission Ingestion Feed:** Displays every attempt instantaneously. Use this to celebrate "First Bloods" (the first participant to solve each specific question).
3. **Participant Engagement Count:** Confirms that competitors successfully navigated the PIN gate.

---

## 3. Anti-Cheat & Integrity Protocols

Fair play is the foundation of competitive CTFs. Watch for these red flags during the event:

### 1. Automated Flag Brute-Forcing
* **Symptom:** A single user generating dozens of incorrect submissions per minute on a single challenge card.
* **CTFy Protection:** CTFy uses Server Actions and rate limiting. However, organizers can monitor the Host Deck feed. If a user is spamming random strings or automated dictionary attacks, warn the participant or disqualify them.

### 2. Flag Sharing & Collusion
* **Symptom:** Two or more participants submitting the identical flag within seconds of each other on a difficult, multi-stage challenge.
* **Detection:** Check submission timestamps in the database or host stream. If timestamps consistently align across multiple challenges, interview the competitors regarding their methodology.

### 3. Account Sharing / Multi-Accounting
* **Symptom:** Simultaneous flag submissions from opposite ends of a large challenge category by the same user account.
* **Policy:** State clearly in your event rules that each participant may only log in from one active browser session.

---

## 4. Live Incident & Errata Runbook

### Scenario A: A Challenge Prompt Has a Typo or Broken External Link
1. **Action:** Go to your Event Management interface and update the challenge description with the corrected link.
2. **Announcement:** Post an organizer announcement immediately:
   > *"Notice: Challenge 'Forensics 1' prompt link updated. Please refresh your arena page."*
3. **Integrity Rule:** Never change the flag string itself unless completely unavoidable. If the flag must be changed, any participant who already solved the original flag should retain their points.

### Scenario B: A Question Has 0 Solves with 30 Minutes Remaining
1. **Action:** Assess whether the problem is too difficult or missing context.
2. **Drop a Public Hint:** Provide a progressive hint publicly to all players via the projector or announcement channel:
   > *"Hint for Rev 2: Look closely at the function comparing strings around offset 0x1040."*

### Scenario C: A Competitor Claims "My Flag Was Rejected, But It's Correct!"
1. **Verification Steps:**
   - Ask the competitor to confirm their exact submission string privately.
   - Check against the secret flag in your host questionnaire:
     * Did they include the required wrapper (`CTFy{...}`)?
     * Is there an accidental space at the start or end?
     * Did they use incorrect letter casing (e.g., `CTFY{...}` vs `CTFy{...}`)?
2. **Resolution:** If the competitor had a minor casing or wrapper error, instruct them on the proper format. Submissions are free and do not deduct points.

---

## 5. Tie-Breaking & Winner Verification

### Tie-Breaking Mechanics
In competitive CTFs, ties in total points are inevitable. CTFy handles tie-breaking deterministically:

$$\text{Rank Criteria} = \text{Total Points (Descending)} \rightarrow \text{Timestamp of Last Solve (Ascending)}$$

* If Participant A and Participant B both reach 1,200 points:
  * Participant A reached 1,200 points at **15:42:10 UTC**.
  * Participant B reached 1,200 points at **15:48:30 UTC**.
  * **Participant A wins the tie-break** because they achieved the score first.

### Winner Verification Checklist:
Before awarding prizes or announcing the top 3 podium:
1. [ ] Confirm the winning users are eligible according to your event guidelines.
2. [ ] Review the winner's solve progression in the Host Deck to ensure no impossible solve leaps (e.g. solving three 500pt challenges within 60 seconds).
3. [ ] Have the winners present a brief 60-second explanation or solve writeup for their hardest challenge.

---

## 6. Post-Event Wrap-up & Retrospective

1. **Leave the Scoreboard Accessible:** Keep the live scoreboard link (`/events/[id]/scoreboard`) active so participants can screenshot their final ranking and podium placements.
2. **Publish Official Writeups:** Release official solution writeups for the challenges. This turns your CTF into a permanent learning resource for your community.
3. **Gather Feedback:** Ask participants which challenge was their favorite and which was the most frustrating to calibrate difficulty for your next CTFy competition!
