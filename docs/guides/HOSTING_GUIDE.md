# The Complete Guide to Hosting a CTF on CTFy 🚩

Welcome to the official hosting manual for **CTFy**! 

Whether you are running a collegiate hackathon, a university cybersecurity club round, a corporate security awareness workshop, or a friendly trivia challenge, this guide walks you through every phase: from conceptualizing challenge questions to managing live scoreboards and distributing event PIN codes using simple UI buttons.

> 💡 **Specialized Guides:**
> - For in-depth challenge templates across Crypto, Forensics, Web, and Rev, see [**`CHALLENGE_AUTHORING.md`**](CHALLENGE_AUTHORING.md).
> - For the minute-by-minute competition day runbook and anti-cheat protocols, see [**`EVENT_OPERATIONS.md`**](EVENT_OPERATIONS.md).
> - For a ready-to-use tournament handbook and fair-play ruleset, see [**`COMPETITION_RULES_TEMPLATE.md`**](COMPETITION_RULES_TEMPLATE.md).

---

## Table of Contents
1. [The CTFy Hosting Philosophy](#1-the-ctfy-hosting-philosophy)
2. [Designing Questions & Challenge Architecture](#2-designing-questions--challenge-architecture)
   - [Common Challenge Categories](#common-challenge-categories)
   - [Flag Formatting Best Practices](#flag-formatting-best-practices)
   - [Point Weighting & Difficulty Curves](#point-weighting--difficulty-curves)
   - [Hosting External Media & Challenge Files](#hosting-external-media--challenge-files)
3. [Step-by-Step: Creating an Event on CTFy](#3-step-by-step-creating-an-event-on-ctfy)
   - [Step 1: Sign in to Your Account](#step-1-sign-in-to-your-account)
   - [Step 2: Open the Event Creator via Buttons](#step-2-open-the-event-creator-via-buttons)
   - [Step 3: Event Details & Schedule](#step-3-event-details--schedule)
   - [Step 4: Adding Challenges in the Question Builder](#step-4-adding-challenges-in-the-question-builder)
   - [Step 5: Deploy the Event](#step-5-deploy-the-event)
4. [Distributing Event PINs to Participants](#4-distributing-event-pins-to-participants)
   - [Finding and Copying Your 6-Character PIN](#finding-and-copying-your-6-character-pin)
   - [How Participants Join (Button-Guided Flow)](#how-participants-join-button-guided-flow)
   - [Sharing the PIN](#sharing-the-pin)
5. [The Host Deck & Live Competition Management](#5-the-host-deck--live-competition-management)
   - [Accessing the Host Deck](#accessing-the-host-deck)
   - [Host Deck Features & Real-Time Feed](#host-deck-features--real-time-feed)
6. [Scoreboard & Audience Experience](#6-scoreboard--audience-experience)
7. [Host Checklist (Before, During, and After)](#7-host-checklist)

---

## 1. The CTFy Hosting Philosophy

Traditional CTF platforms (like CTFd or custom server setups) often force organizers to deploy heavy Docker daemons, configure isolated subnets, and troubleshoot flaky SSH jump-hosts when participants get stuck.

**CTFy takes a lightweight, flag-first approach:**
- **Zero Infrastructure Burden:** No containers or virtual machines to manage. You provide the prompts, downloadable files, and secrets; CTFy provides real-time validation and ranking.
- **Server-Side Zero-Leak Verification:** Challenge answers (`correct_answer`) never reach the competitor's browser bundle. Validation happens exclusively in server actions protected by Row Level Security (RLS).
- **Fast PIN Entry:** No tedious event registration or approval queues. A single 6-character PIN unlocks the challenge arena.

---

## 2. Designing Questions & Challenge Architecture

A memorable CTF is balanced, fair, and educational. Below is a framework for structuring your challenges.

### Common Challenge Categories

Even without terminal containers, you can host diverse challenges:

| Category | Example Concepts | How to Deliver on CTFy |
|---|---|---|
| **Cryptography** | Base64, Caesar, XOR, Vigenère, RSA, Hash cracking | Put encoded cipher in the prompt, or attach a `.txt` file via Media URL. |
| **Steganography & Forensics** | Hidden files in images, EXIF metadata, PCAP packet analysis, ZIP carving | Provide a download link (Google Drive / GitHub Raw / Imgur) in the Media URL field. |
| **Web Reconnaissance** | Inspect Element, robots.txt, HTTP headers, JWT decoding, client JS inspection | Provide a link to an external sandbox site or simple static challenge page. |
| **Reverse Engineering** | Simple compiled C binaries, Python bytecode (`.pyc`), obfuscated JavaScript | Host the binary on GitHub Releases or Google Drive, paste link in Media URL. |
| **Cybersecurity Trivia / OSINT** | RFC standards, CVE lookups, protocol analysis, geoguessr/OSINT clues | Write rich markdown prompts with clues guiding players toward research. |

---

### Flag Formatting Best Practices

Consistency in flag syntax prevents frustration and false-negative submissions:

1. **Use a Standard Flag Wrapper:**
   - Recommended: `CTFy{your_secret_flag_here}`
   - Example: `CTFy{b4s3_64_1s_n0t_3ncrypt10n}`
2. **Case Sensitivity:**
   - CTFy performs exact-match server checks. Explicitly state in your event description or prompt if flags are case-sensitive (e.g. `Format: CTFy{...}`).
3. **Avoid Ambiguous Characters:**
   - Avoid flags with easily confused characters (like capital `O` vs number `0`, or lowercase `l` vs uppercase `I`) unless deciphering them is part of the challenge.
4. **No Accidental Spaces:**
   - Ensure you do not accidentally copy leading or trailing whitespace when pasting the correct flag into the creation form.

---

### Point Weighting & Difficulty Curves

Structure point distributions to encourage beginners while rewarding complex solves:

- **Warmup / Sanity Check (10 Points):** A freebie (e.g., *“Join our Discord for the flag: `CTFy{welcome_hackers}`”*) to verify participants know how to submit.
- **Easy (20 – 30 Points):** Direct single-step challenges (e.g., decoding Base64 or inspecting image EXIF metadata).
- **Medium (40 – 60 Points):** Multi-step puzzles (e.g., extract a hidden zip from an image, crack the zip password using a clue, then decode a Vigenère cipher).
- **Hard (75 – 100 Points):** Deep analysis (e.g., Wireshark packet reconstruction, reverse engineering a binary algorithm).

---

### Hosting External Media & Challenge Files

In CTFy, each question has an optional **Media URL** field. You can link:
- **Images:** Direct image links (`.png`, `.jpg`, `.webp`) will render cleanly inside the challenge card.
- **Files & Archives:** Direct download links for `.zip`, `.pcap`, or binary files.

> [!TIP]
> **Recommended Hosting Options for Challenge Files:**
> 1. **GitHub Releases / Raw:** Create a public GitHub repository (e.g. `my-ctf-assets`) and upload files to a Release tag. Use the direct download URL.
> 2. **Google Drive:** Upload your file, click **Share $\rightarrow$ Anyone with link**, and paste the link.
> 3. **Imgur / Cloudinary:** Great for fast steganography image delivery.

---

## 3. Step-by-Step: Creating an Event on CTFy

### Step 1: Sign in to Your Account
1. Open the platform: [https://ctfy-blush.vercel.app/](https://ctfy-blush.vercel.app/)
2. Click the **"Sign In"** button in the top navigation bar.
3. If you do not have an account yet, click **"Register"** or click the **"Get Started"** button on the home page.

---

### Step 2: Open the Event Creator via Buttons
Once logged in, you can start hosting using either of these simple buttons:
- Click the **"Host a CTF"** button in the top navigation bar, or
- From your **Dashboard**, click the **"Host a CTF"** button.

---

### Step 3: Event Details & Schedule
1. **Event Title:** Give your competition a clear, recognizable name (e.g., *“CyberSecurity Club Fall CTF 2026”*).
2. **Start & End Time:**
   - Select your local date and time in the picker.
   - **Automatic Timezone Synchronization:** CTFy automatically converts your local browser time into UTC for database storage. Participants across different time zones will see the start and end times automatically converted to their own local time!
   - Submissions are accepted only while the event is active between start and end time.

---

### Step 4: Adding Challenges in the Question Builder
Click the **"Add Another Question"** button to build your questionnaire:
1. **Question Prompt:** Describe the objective, provide scenario context, or include code snippets.
2. **Media URL (Optional):** Paste links to external images, datasets, or downloadable archives.
3. **Points:** Specify the score weight (e.g., `10`, `25`, `50`).
4. **Correct Answer (Flag):** Enter the secret flag (e.g., `CTFy{c1ph3r_cr4ck3d}`). **This flag is encrypted/protected on the server and is never sent to competitors.**

---

### Step 5: Deploy the Event
Click the **"Create & Deploy CTF Event"** button at the bottom of the form. 

Upon creation, CTFy instantly generates a **unique 6-character PIN code** (e.g., `8K2F9A`) and automatically opens your **Host Control Deck**.

---

## 4. Distributing Event PINs to Participants

The 6-character PIN code acts as the security pass for your event. Competitors cannot view challenge prompts or submit flags without it.

### Finding and Copying Your 6-Character PIN
You can view and copy your event PIN at any time:
1. **On your Dashboard:** Under the **"Hosted by You"** tab, every competition card displays its PIN code with a **"Copy"** button.
2. **In the Host Deck:** The PIN is prominently displayed in the top header badge with a one-click copy button.

*(Note: Participants on their dashboard only see "Joined Competitions" and never see the host PIN).*

---

### How Participants Join (Button-Guided Flow)

Participants do **not** need to type complex URLs. Instruct them to follow this button-guided flow:

1. Go to the platform homepage: [https://ctfy-blush.vercel.app/](https://ctfy-blush.vercel.app/)
2. Click the **"Join via PIN"** button (found in the top navigation bar or on the main hero banner).
3. Type the 6-character event PIN (e.g. `8K2F9A`).
4. Click the **"Unlock & Enter Arena"** button.
5. The system validates the PIN, unlocks the competition, and seamlessly opens the competition arena where they can start solving challenges and submitting flags!

### Sharing the PIN
Simply share the 6-character PIN with your participants. That is all they need to enter the competition and submit flags.

---

## 5. The Host Deck & Live Competition Management

### Accessing the Host Deck
From your **Dashboard**, click the **"Host Deck"** button on any of your events under **"Hosted by You"**.

> [!NOTE]
> Only the organizer who created the event has authorization to access the Host Deck. Competitors attempting to access it are automatically blocked.

### Host Deck Features & Real-Time Feed:
- **Live Metric Cards:**
  - **Active Competitors:** Count of distinct participants actively submitting flags.
  - **Total Submissions:** All attempts recorded (both correct solves and failed attempts).
  - **Solved Rate:** Aggregate percentage of challenges cracked.
- **Real-Time Live Feed:**
  - Displays incoming submissions the instant they happen via Supabase Realtime PostgreSQL replication.
  - Shows participant username, challenge question, submitted answer, points awarded, and timestamp.
- **Questionnaire Reference:** Review all prompts, media URLs, point weights, and correct answers in one consolidated view.

---

## 6. Scoreboard & Audience Experience

Every event has a dedicated public Scoreboard accessible by clicking the **"Scoreboard"** button on the event card or from the Host Deck header.

### Highlights:
- **Realtime Podium:** The Top 3 competitors are displayed on a cyber podium with Gold, Silver, and Bronze badges.
- **Dynamic Re-ordering:** When a participant captures a flag, points are awarded on the server and the leaderboard re-ranks automatically without page refreshes.
- **Confetti Celebration:** Solvers receive celebratory confetti upon submitting winning flags.
- **Projector Friendly:** Clean monochrome dark aesthetic with high contrast, ideal for auditorium screens and livestreaming overlays.

---

## 7. Host Checklist

### 🕒 1 Day Before the Event
- [ ] Create a test event on CTFy with 1–2 dummy questions to test your flow.
- [ ] Upload challenge assets (images, zip files, PCAPs) and verify all download links open without requiring a login.
- [ ] Formulate your questions and double-check flag string accuracy.

### 🕒 1 Hour Before the Event
- [ ] Create the official event on CTFy with the final scheduled start and end times.
- [ ] Click the **"Copy"** button on your Dashboard or Host Deck to copy the 6-character PIN code.
- [ ] Click the **"Scoreboard"** button and put it in fullscreen on your auditorium projector or stream.
- [ ] Keep the **Host Deck** open on your laptop to monitor live incoming flags.

### 🕒 During the Event
- [ ] Share the 6-character PIN code with your participants.
- [ ] Watch the Host Deck's Realtime Feed to spot any challenges where players might be stuck or encountering formatting confusion.
- [ ] Announce time warnings (e.g. *“30 minutes remaining!”*).

### 🕒 After the Event
- [ ] Submissions close automatically when the event end time is reached.
- [ ] Celebrate the Top 3 winners shown on the live podium!
- [ ] Announce problem walkthroughs or write-ups for participants to learn from the challenges.

---

*Happy Hosting! Built with pride for the cybersecurity community.* 🚩
