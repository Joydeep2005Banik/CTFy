# Participant Guide for CTFy 🚩

Welcome to **CTFy**! This guide walks you through everything you need to know as a participant: how to register, how to enter a competition using an event PIN, how to submit flags, and how to track your live rank on the scoreboard.

---

## Table of Contents
1. [Getting Started (Account Setup)](#1-getting-started-account-setup)
2. [Joining an Event with a PIN Code](#2-joining-an-event-with-a-pin-code)
3. [Playing in the Challenge Arena](#3-playing-in-the-challenge-arena)
   - [Reading Challenges & External Assets](#reading-challenges--external-assets)
   - [Submitting Flags](#submitting-flags)
   - [Solved Status](#solved-status)
4. [Live Scoreboard & Leaderboard](#4-live-scoreboard--leaderboard)
5. [Returning to Your Events (Dashboard)](#5-returning-to-your-events-dashboard)
6. [Participant FAQs & Pro Tips](#6-participant-faqs--pro-tips)

---

## 1. Getting Started (Account Setup)

1. Open the platform: [https://ctfy-blush.vercel.app/](https://ctfy-blush.vercel.app/)
2. In the top navigation bar:
   - If you already have an account, click **"Sign In"**.
   - If you are new, click **"Register"** (or click the **"Get Started"** button on the home page).
3. Enter your username, email, and password, then complete registration.

---

## 2. Joining an Event with a PIN Code

Every competition on CTFy is protected by a unique **6-character PIN code** (for example: `8K2F9A`) provided by your event organizer.

To enter the event:
1. Go to [https://ctfy-blush.vercel.app/](https://ctfy-blush.vercel.app/)
2. Click the **"Join via PIN"** button (located in the top navigation bar and on the main home page banner).
3. Type the 6-character event PIN into the code input box.
4. Click the **"Unlock & Enter Arena"** button.

The platform will verify your code, unlock the competition for your account, and take you straight into the challenge arena.

---

## 3. Playing in the Challenge Arena

Once inside the arena, you will see the list of challenges prepared by the host.

### Reading Challenges & External Assets
- Each card shows the challenge prompt, point value, and question number.
- If a challenge requires analyzing a file, packet capture (`.pcap`), image, or binary, the card will display an **"Open Attached Challenge Asset"** link. Click this button to inspect or download the file.

### Submitting Flags
1. Once you have solved the puzzle and discovered the secret flag, type or paste it into the **"Enter flag..."** input bar.
2. Click the **"Submit Flag"** button.
3. The platform verifies your answer on the server instantly:
   - **Correct Flag:** You will see a green success message with your points awarded, and confetti will celebrate your solve!
   - **Incorrect Flag:** You will see an alert letting you know the flag is incorrect so you can adjust and try again.

### Solved Status
- Once you successfully capture a flag, the challenge card is marked as **FLAG CAPTURED** with a green checkmark.
- Your points are permanently credited to your account and added to your total score in the header.

---

## 4. Live Scoreboard & Leaderboard

You can view the real-time leaderboard at any time during the event:
1. In the challenge arena header, click the **"Scoreboard"** button.
2. You will see:
   - **The Live Podium:** Top 3 competitors with Gold, Silver, and Bronze badges.
   - **The Standings Table:** All competitors ranked by total points and solve count.
3. The scoreboard updates in real time automatically as participants crack challenges—no need to manually refresh the page.

---

## 5. Returning to Your Events (Dashboard)

If you need to step away or take a break:
1. Click **"Dashboard"** in the top navigation bar.
2. Click the **"Joined Competitions"** tab.
3. You will see all events you have entered. Click the **"Play"** button on any active card to jump right back into the arena, or click **"Scoreboard"** to check the current standings.

---

## 6. Participant FAQs & Pro Tips

- **What format should my flag be?**
  - Most flags follow the standard format: `CTFy{secret_text_here}`. Check the challenge prompt for any specific formatting instructions.
- **Is flag submission case-sensitive?**
  - Yes, flag checking is exact. Make sure letters match upper/lower case as discovered.
- **Accidental Spaces:**
  - Double check that you did not accidentally include a leading or trailing space when copying and pasting your flag.
- **Will I lose my progress if I close the tab or log out?**
  - No. All solves and scores are saved in the database. When you log back in and return to the event, all captured flags remain solved.

Good luck, and happy flag hunting! 🚩
