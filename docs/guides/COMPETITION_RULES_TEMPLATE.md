# Official CTF Competition Rules & Code of Conduct Template 📜

*This document is a customizable template for organizers running competitions on **CTFy**. Copy and adapt this markdown document for your event's announcement page, competition handbook, or registration portal.*

---

# 🚩 [COMPETITION_NAME] — Official Rules & Guidelines

**Event Schedule:** [START_DATE_AND_TIME] — [END_DATE_AND_TIME] (UTC)  
**Platform:** [https://ctfy-blush.vercel.app/](https://ctfy-blush.vercel.app/)  
**Access PIN:** `[EVENT_PIN]`  
**Organizer Contact:** `[ORGANIZER_EMAIL_OR_SUPPORT_CONTACT]`  

---

## 1. Eligibility & Registration

1. **Account Registration:** All competitors must register an account on the CTFy platform before entering the competition arena.
2. **One Account Per Competitor:** Each participant may only register and compete from a single user account. Multi-accounting to hoard flags or manipulate scoreboards will result in immediate disqualification.
3. **PIN Requirement:** Competition challenges are gated by a unique 6-character Event PIN (`[EVENT_PIN]`). You will be prompted to enter this PIN upon clicking **"Join Event"** or accessing the arena.

---

## 2. Scope of Engagement & Authorized Targets

Understanding what is and is not an authorized target is critical to ethical security competitions:

### 🟢 IN-SCOPE (Permitted Targets):
- Challenge prompts and descriptions.
- Explicitly attached downloadable artifacts (PCAP packet captures, compiled binaries, images, audio files).
- External sandbox APIs or serverless endpoints explicitly linked in challenge descriptions.

### 🔴 OUT-OF-SCOPE (Strictly Prohibited):
- **Attacking the CTFy Platform:** Any denial of service (DoS/DDoS), fuzzing, or automated vulnerability scanning directed against the CTFy website, serverless actions, or Supabase backend infrastructure is strictly forbidden.
- **Attacking Other Participants:** Interfering with other competitors’ machines, network connections, or accounts is prohibited.
- **Automated Input Fuzzing:** Scripting automated brute-force attacks against flag submission fields is forbidden. Flags should be solved analytically, not guessed.

---

## 3. Fair Play, Flag Sharing & Anti-Collusion

1. **Zero Flag Sharing:** Sharing flags, solutions, hints, or intermediate decryption keys with other competitors before the competition officially concludes is strictly prohibited.
2. **No Public Writeups During Event:** Do not publish blog posts, videos, or social media solutions while the competition is active. Writeups may be freely shared once the event has closed.
3. **External Assistance:** Unless explicitly stated for a team-based event, all flag submissions must represent the sole work of the account holder.

---

## 4. Scoring & Tie-Breaking Rules

1. **Points Accumulation:** Each challenge card indicates its point value. Points are awarded upon the first successful capture of the flag.
2. **Single Capture Limit:** A participant may only capture a flag once. Repeated submissions on an already-solved challenge award 0 points.
3. **No Penalty for Incorrect Guesses:** There is no point deduction for incorrect flag attempts. Take time to check your casing, formatting, and trailing spaces.
4. **Deterministic Tie-Breaking:** If two or more competitors finish with identical total scores, ties are broken by the **timestamp of their final point-awarding solve**:
   $$\text{Rank Criteria} = \text{Total Points (Descending)} \rightarrow \text{Timestamp of Last Solve (Ascending)}$$
   *The player who achieved the score earliest wins the tie-break.*

---

## 5. Flag Format Standards

Unless explicitly noted otherwise in a challenge prompt, all flags follow the standard platform wrapper:

```text
CTFy{secret_flag_string_here}
```

- **Exact Case Sensitivity:** Flags are evaluated strictly with case sensitivity (`CTFy{fL4g}` $\neq$ `CTFy{fl4g}`).
- **Spacing:** Do not include leading, trailing, or accidental spaces.

---

## 6. Errata, Hint Drops & Disputes

1. **Reporting Broken Assets:** If you encounter a broken download link or suspect an error in a problem statement, contact the organizers immediately at `[ORGANIZER_EMAIL_OR_SUPPORT_CONTACT]`.
2. **Public Clarifications:** If a prompt requires clarification or an erratum is issued, the update will be published simultaneously to all participants. Organizers will never give private hints to individual competitors.
3. **Scheduled Hints:** Organizers may release public hints for difficult challenges as the competition progresses.
4. **Dispute Window:** Any scoring or integrity disputes must be raised within **[30/60] minutes** of the event closing. The organizers' rulings on disputes are final.

---

## 7. Code of Conduct & Sportsmanship

- Treat fellow competitors and event staff with courtesy and respect.
- Harassment, discriminatory language, or abusive behavior in event communications will result in instant disqualification and permanent platform ban.
- Have fun, learn new concepts, and share your knowledge after the closing ceremony!

---

*Template adapted from [CTFy](https://github.com/Joydeep2005Banik/CTFy) — The fast, minimal, and container-free CTF platform.*
