# Challenge Authoring & Question Design Guide 🧩

This guide provides challenge creators, competition organizers, and educators with actionable blueprints for designing engaging, fair, and technically sound CTF challenges for **CTFy**.

Because CTFy is intentionally **container-free and lightweight**, you don't need to configure virtual networks, orchestrate Kubernetes pods, or patch vulnerable Linux VMs. Instead, challenges rely on downloadable artifacts, cryptographic puzzles, external serverless endpoints, packet captures, and client-side analysis.

---

## Table of Contents
1. [Core Principles of Great CTF Challenges](#1-core-principles-of-great-ctf-challenges)
2. [Flag Formatting & Hygiene Standards](#2-flag-formatting--hygiene-standards)
3. [Point Scoring & Difficulty Curves](#3-point-scoring--difficulty-curves)
4. [Category Blueprints (Container-Free)](#4-category-blueprints-container-free)
   - [Cryptography (Crypto)](#cryptography-crypto)
   - [Forensics & Steganography](#forensics--steganography)
   - [Reverse Engineering (Rev)](#reverse-engineering-rev)
   - [Web Exploitation](#web-exploitation)
   - [Open Source Intelligence (OSINT)](#open-source-intelligence-osint)
   - [Miscellaneous (Misc) & Security Concepts](#miscellaneous-misc--security-concepts)
5. [Hosting External Assets & Files](#5-hosting-external-assets--files)
6. [Step-by-Step: Creating Challenges in CTFy](#6-step-by-step-creating-challenges-in-ctfy)
7. [Ready-to-Use Challenge Templates](#7-ready-to-use-challenge-templates)

---

## 1. Core Principles of Great CTF Challenges

1. **Eliminate "Guessing" (Anti-Guessy Rule):**
   A good challenge tests logic, knowledge, and analytical skill—not the author's personal train of thought. If a competitor identifies the vulnerability or solves the puzzle, the flag extraction path must be deterministic and unequivocal.

2. **Single Unambiguous Solution:**
   Ensure only one exact string satisfies the flag check. Avoid questions where multiple valid variations exist (e.g., `"Flag: 42"` vs `"42"` vs `"forty-two"`). Always specify the required flag wrapper (e.g. `CTFy{...}`).

3. **Provide Integrity Hashes for Downloads:**
   If attaching downloadable files (PCAPs, images, compiled binaries), always provide a SHA-256 checksum in the challenge prompt so competitors can verify their file was not corrupted during download.

4. **Progressive Difficulty & Learning:**
   Every event should offer at least 1–2 introductory "Sanity Check" or "Warmup" challenges (e.g., base64 decoding, inspect element, or Caesar cipher) to allow every participant to score points early and build momentum.

---

## 2. Flag Formatting & Hygiene Standards

All challenges hosted on CTFy should conform to a strict flag standard:

```text
CTFy{alphanumeric_or_symbolic_secret_string}
```

### Hygiene Rules:
- **Consistent Wrapper:** Prefix every flag with `CTFy{` and close with `}`.
- **Avoid Ambiguous Characters:** Unless intentional in a forensic or cryptographic puzzle, avoid strings where `0` (zero) looks identical to `O` (capital o), or `1` (one) looks identical to `l` (lowercase L) in monospaced fonts.
- **Exact Casing:** CTFy's server-side verification evaluates flags with **exact case sensitivity**. If your flag is `CTFy{h4ck_th3_pl4n3t}`, submitting `CTFy{H4CK_TH3_PL4N3T}` will evaluate to false.
- **No Whitespace:** Never include accidental leading, trailing, or intermediate spaces in your secret answer.

---

## 3. Point Scoring & Difficulty Curves

Structure your event's point distribution so that total points reflect the required effort and skill:

| Tier | Point Value | Target Competitor | Typical Time to Solve | Description |
|---|---|---|---|---|
| **Warmup / Sanity** | 50 – 100 pts | Absolute Beginners | 2 – 5 minutes | Basic encoding (Base64, Hex), simple EXIF inspection, or finding a flag in plain sight. |
| **Easy** | 100 – 200 pts | Novice Players | 10 – 20 minutes | Classical ciphers (Vigenère), simple PCAP filtering in Wireshark, basic strings inspection on binaries. |
| **Medium** | 250 – 350 pts | Intermediate Competitors | 30 – 60 minutes | XOR keystream reuse, LSB steganography, Python bytecode disassembly, client-side JWT cracking. |
| **Hard** | 400 – 500 pts | Advanced Competitors | 1 – 2+ hours | Complex RSA factoring, stripped binary reverse engineering, multi-stage forensic file carving. |

---

## 4. Category Blueprints (Container-Free)

### Cryptography (Crypto)
* **What it tests:** Mathematical principles, encryption standards, modular arithmetic, and implementation vulnerabilities.
* **How to build without containers:**
  * Provide a ciphertext and the encryption script (e.g., Python snippet).
  * Common concepts: Small RSA public exponent ($e=3$ with small message), low prime modulus reuse, weak pseudo-random number generator (PRNG) seeds, custom XOR cipher with short repeating key.
* **Example Prompt:**
  ```markdown
  We intercepted an encrypted transmission and the Python script used by the sender. 
  Can you recover the plaintext message?
  
  - [Download challenge.py](https://assets.yourdomain.com/crypto/challenge.py)
  - [Download ciphertext.txt](https://assets.yourdomain.com/crypto/ciphertext.txt)
  ```

---

### Forensics & Steganography
* **What it tests:** File structure analysis, metadata inspection, hidden data recovery, and network traffic reconstruction.
* **How to build without containers:**
  * Distribute a static file (e.g., `.png`, `.jpg`, `.wav`, `.pcap`, or raw disk image).
  * Common concepts:
    * Corrupted magic bytes in file headers (requiring a hex editor to repair).
    * Least Significant Bit (LSB) image hiding (extractable with StegSolve or Python PIL).
    * Network packet capture (.pcap) containing unencrypted HTTP credentials or FTP file transfers.
    * Zip archives with password protection cracked via dictionary attack (RockYou).
* **Example Prompt:**
  ```markdown
  Our network detection system captured suspicious traffic on port 80.
  Analyze the packet capture to find the exfiltrated flag.
  
  - [Download capture.pcap](https://assets.yourdomain.com/forensics/capture.pcap)
  - **SHA-256:** `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`
  ```

---

### Reverse Engineering (Rev)
* **What it tests:** Program comprehension, binary decompilation, assembly tracing, and logic bypassing.
* **How to build without containers:**
  * Compile a small C, Go, Rust, or C++ program into an ELF binary (Linux) or PE file (Windows), or provide Python bytecode (`.pyc`).
  * Common concepts:
    * Program prompts for a password and compares it against an obfuscated string.
    * Binary checks math conditions or decrypts the flag in memory upon receiving a valid input.
    * Tools used by competitors: Ghidra, IDA Free, Radare2, GDB, or `strings`.
* **Example Prompt:**
  ```markdown
  Download the attached Linux x86-64 binary. Find the valid key that unlocks the secret flag.
  
  - [Download vault_binary](https://assets.yourdomain.com/rev/vault)
  - **SHA-256:** `9f83c24...`
  ```

---

### Web Exploitation
* **What it tests:** Understanding web protocols, browser security models, and client-side vulnerabilities.
* **How to build without containers:**
  * **Option A (Static Web Assets):** Distribute an HTML/JS bundle with client-side verification logic obfuscated via Webpack, Obfuscator.io, or WebAssembly (Wasm).
  * **Option B (Free Serverless APIs):** Host a tiny serverless function on Cloudflare Workers, Vercel, or AWS Lambda that inspects HTTP headers (e.g., requiring specific `User-Agent`, `Referer`, or cookie values) and returns the flag.
  * **Option C (JWT Cracking):** Provide an encoded JWT signed with a weak secret (e.g. `secret123`) that competitors must brute force offline to forge an admin token.

---

### Open Source Intelligence (OSINT)
* **What it tests:** Information gathering, digital footprint analysis, and public reconnaissance.
* **How to build without containers:**
  * Create a realistic, safe persona across public platforms (e.g., a dummy GitHub account with an older deleted commit containing a flag, or a public tweet with GPS coordinates in an image's EXIF data).
  * WayBack Machine archives of a mock blog.

---

### Miscellaneous (Misc) & Security Concepts
* **What it tests:** Esoteric programming languages (Brainfuck, Whitespace), regex golf, barcode/QR code recovery, or security history trivia.
* **Example:** A QR code torn into 4 pieces that competitors must assemble and scan.

---

## 5. Hosting External Assets & Files

When challenges require downloadable files, use reliable, high-bandwidth hosting:

| Service | Recommended For | Cost | Direct Download Support |
|---|---|---|---|
| **GitHub Releases** | Binaries, PCAPs, zip files | Free | Yes (raw asset links) |
| **Cloudflare R2 / AWS S3** | All challenge assets & media | Free tier / Cent-level | Yes (custom domain with SSL) |
| **Google Drive / Dropbox** | Large disk images, memory dumps | Free | Yes (use direct download link converters) |
| **GitHub Gist / Pastebin** | Code snippets, encrypted text | Free | Yes (raw view) |

> ⚠️ **Rule of Thumb:** Never link to temporary file-sharing services that expire after 24 hours or have download quota limits.

---

## 6. Step-by-Step: Creating Challenges in CTFy

1. **Access the Event Builder:**
   - Log in to your CTFy account.
   - Click **"Host Event"** or navigate to `/host/create`.

2. **Define Event Metadata:**
   - Set the **Event Name**, **Description**, **Start Time**, and **End Time**.
   - Note down the generated or assigned **6-character Event PIN** (e.g., `9B7K2X`).

3. **Add Questions:**
   - Click **"+ Add Question"**.
   - **Title:** Descriptive name (e.g., `Crypto 101: Ancient Caesar`).
   - **Description:** Provide the scenario and downloadable asset links in formatted Markdown.
   - **Points:** Assign points according to difficulty (e.g., `100`).
   - **Hints (Optional):** Add one or more helpful clues.
   - **Flag:** Enter the exact flag answer (e.g. `CTFy{brutus_was_h3r3}`).

4. **Verify Server-Side Secrecy:**
   - CTFy automatically hides `correct_answer` from client queries using PostgreSQL Row Level Security (RLS). Competitors cannot view flags using browser developer tools or network sniffers.

---

## 7. Ready-to-Use Challenge Templates

### Template 1: Forensics (Magic Byte Header Repair)
* **Category:** Forensics
* **Difficulty:** Easy (150 pts)
* **Concept:** A PNG file with its first 4 header bytes corrupted (`00 00 00 00` instead of `89 50 4E 47`).
* **Prompt:**
  ```markdown
  Our recovery analyst retrieved an important image, but our viewer says the file is corrupted.
  Repair the file header to reveal the flag.
  
  - [Download corrupted.png](https://your-storage.com/corrupted.png)
  ```
* **Solution:** Competitor opens file in Hex Editor, changes first 8 bytes to `89 50 4E 47 0D 0A 1A 0A`, and opens the repaired image to read the flag.
* **Flag:** `CTFy{m4g1c_byt3s_n3v3r_l13}`

---

### Template 2: Cryptography (XOR Repeating Key)
* **Category:** Crypto
* **Difficulty:** Medium (250 pts)
* **Concept:** Plaintext XORed with a short 3-byte key.
* **Prompt:**
  ```markdown
  We intercepted this hex-encoded ciphertext. The adversary used a simple repeating 3-byte XOR key.
  Can you break the cipher?
  
  `Hex: 0e17053a1a1b021307391b1d030018`
  ```
* **Solution:** Use CyberChef or a Python script with `xor` brute-forcing or frequency analysis.
* **Flag:** `CTFy{x0r_1s_symm3tr1c}`

---

### Template 3: Reverse Engineering (Basic C Binary)
* **Category:** Reverse Engineering
* **Difficulty:** Easy (150 pts)
* **Concept:** C code compiled with `gcc -O2 -s`. The binary compares input against an encoded string.
* **Prompt:**
  ```markdown
  We found this locked vault program running on an adversary workstation.
  Analyze the executable to discover the master passcode.
  
  - [Download vault](https://your-storage.com/vault)
  - **SHA-256:** `4d82...`
  ```
* **Solution:** Competitor runs `strings vault | grep CTFy` or loads binary into Ghidra to inspect the `strcmp` function.
* **Flag:** `CTFy{str1ngs_c4nn0t_h1d3}`
