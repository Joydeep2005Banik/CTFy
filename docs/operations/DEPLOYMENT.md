# Deployment & Self-Hosting Guide 🚀

This document provides complete instructions for deploying and self-hosting **CTFy** across various production environments: **Vercel** (recommended), **Docker**, and **Linux VPS** with Nginx and PM2.

---

## Table of Contents
1. [Prerequisites & Supabase Database Setup](#1-prerequisites--supabase-database-setup)
2. [Option A: Deploy to Vercel (Recommended)](#2-option-a-deploy-to-vercel-recommended)
3. [Option B: Self-Hosting with Docker](#3-option-b-self-hosting-with-docker)
4. [Option C: Self-Hosting on a Linux VPS (Ubuntu / Debian)](#4-option-c-self-hosting-on-a-linux-vps-ubuntu--debian)
5. [Configuring Supabase for Production](#5-configuring-supabase-for-production)
6. [Post-Deployment Verification Checklist](#6-post-deployment-verification-checklist)

---

## 1. Prerequisites & Supabase Database Setup

Before deploying the frontend application, provision your Supabase backend:

1. Create a free project at **[supabase.com](https://supabase.com)**.
2. In your Supabase Dashboard, open the **SQL Editor**.
3. Open [`supabase/schema.sql`](../../supabase/schema.sql) from this repository, paste the entire script, and click **Run**.
4. Retrieve your API credentials from **Project Settings** $\rightarrow$ **API**:
   - **Project URL:** `https://your-project.supabase.co`
   - **Anon Public Key:** `eyJhbGciOi...`
   - **Service Role Secret Key:** `your-service-role-key`

---

## 2. Option A: Deploy to Vercel (Recommended)

Vercel provides native edge optimization, automated SSL, and instant Git continuous deployment for Next.js:

### Step 1: Import Repository
1. Log in to your **[Vercel Dashboard](https://vercel.com/dashboard)**.
2. Click **"Add New..."** $\rightarrow$ **"Project"**.
3. Select your GitHub repository (`CTFy`) and click **Import**.

### Step 2: Configure Environment Variables
In the **Environment Variables** section, add the following three keys:

| Key | Example Value | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xyzcompany.supabase.co` | Your Supabase project endpoint |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsIn...` | Public anonymous API key |
| `SUPABASE_SERVICE_ROLE_KEY` | `your-secret-service-role-key` | Privileged secret key for flag validation |

### Step 3: Deploy
1. Click **Deploy**. Vercel will compile the Next.js App Router bundle using Turbopack in ~1–2 minutes.
2. Once complete, your project will be assigned a live URL (e.g. `https://ctfy.vercel.app/`).

---

## 3. Option B: Self-Hosting with Docker

For containerized self-hosting on your own infrastructure or Kubernetes:

### 1. Multi-Stage `Dockerfile`
Create a `Dockerfile` in the root directory:

```dockerfile
# 1. Base Image
FROM node:20-alpine AS base
WORKDIR /app

# 2. Dependencies
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# 3. Builder
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# 4. Production Runner
FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

### 2. Build and Run Container
```bash
# Build Docker image
docker build -t ctfy:latest .

# Run container with environment variables
docker run -d \
  --name ctfy-app \
  -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co" \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key" \
  -e SUPABASE_SERVICE_ROLE_KEY="your-service-role-key" \
  ctfy:latest
```

---

## 4. Option C: Self-Hosting on a Linux VPS (Ubuntu / Debian)

### Step 1: Install Node.js 20 & PM2
```bash
# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs git nginx

# Install PM2 process manager
sudo npm install -g pm2
```

### Step 2: Clone and Build CTFy
```bash
cd /var/www
sudo git clone https://github.com/Joydeep2005Banik/CTFy.git
cd CTFy
sudo chown -R $USER:$USER .

# Install dependencies and create environment file
npm ci
cp .env.example .env.local
nano .env.local # Fill in your Supabase credentials

# Build production bundle
npm run build
```

### Step 3: Start Application with PM2
```bash
# Start background Next.js process
pm2 start npm --name "ctfy" -- start

# Configure PM2 to start on server reboot
pm2 startup
pm2 save
```

### Step 4: Configure Nginx Reverse Proxy & SSL
Edit `/etc/nginx/sites-available/ctfy`:

```nginx
server {
    listen 80;
    server_name ctf.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable site and install free SSL certificate:
```bash
sudo ln -s /etc/nginx/sites-available/ctfy /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# Install Let's Encrypt SSL
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d ctf.yourdomain.com
```

---

## 5. Configuring Supabase for Production

To ensure seamless authentication redirects and real-time updates:

1. **Set Site URL:**
   - In Supabase Dashboard $\rightarrow$ **Authentication** $\rightarrow$ **URL Configuration**.
   - Set **Site URL** to: `https://your-domain.com/`
   - Set **Redirect URLs** to: `https://your-domain.com/**`
2. **Enable Realtime on Submissions:**
   - Ensure the `submissions` table is published to Supabase Realtime:
     ```sql
     alter publication supabase_realtime add table public.submissions;
     ```

---

## 6. Post-Deployment Verification Checklist

- [ ] Visit home page (`/`) and verify styles and icons load cleanly.
- [ ] Create a new participant account (`/register`) and log in (`/login`).
- [ ] Go to `/host/create` and create a test CTF competition.
- [ ] In an incognito window, visit `/join`, enter the PIN, and verify that the arena unlocks.
- [ ] Submit a correct and incorrect flag; verify instantaneous points calculation and confetti animation.
- [ ] Open `/events/[id]/scoreboard` and confirm that live leaderboard updates without page reloads.
