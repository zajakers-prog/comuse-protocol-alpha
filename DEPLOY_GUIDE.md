# CoMuse Deployment Guide (Vercel + Postgres)

This guide walks you through deploying CoMuse to Vercel with a PostgreSQL database and fixing Google OAuth.

## 1. Prerequisites
- A [Vercel](https://vercel.com) account.
- A [GitHub](https://github.com) account with this repository pushed.

## 2. Vercel Project Setup
1.  **Dashboard**: Go to your Vercel Dashboard and click **"Add New..."** -> **"Project"**.
2.  **Import**: Select your `comuse` (or `holographic-viking`) repository.
3.  **Configure Project**:
    - **Framework Preset**: Next.js (should be auto-detected).
    - **Root Directory**: `./` (default).
    - **Environment Variables**: You will add these in the next step.

## 3. Database (Vercel Postgres)
1.  Navigate to the **Storage** tab in your new Vercel project.
2.  Click **"Connect Store"** -> **"Create New"** -> **"Postgres"**.
3.  Accept the terms and create the database.
4.  Once created, Vercel will automatically add the following environment variables to your project:
    - `POSTGRES_PRISMA_URL`
    - `POSTGRES_URL_NON_POOLING`
    - And others (`POSTGRES_USER`, etc.) - you don't need to manually copy these if you linked the store.

## 4. Environment Variables
Go to **Settings** -> **Environment Variables** and add the following keys from your local `.env`. 

**Required Keys:**
- `AUTH_SECRET`: (Generate a new one with `openssl rand -base64 32` or copy your local one)
- `AUTH_GOOGLE_ID`: Your Google Client ID.
- `AUTH_GOOGLE_SECRET`: Your Google Client Secret.
- `NEXTAUTH_URL`: The URL of your Vercel deployment (e.g., `https://your-project.vercel.app`). *Note: Vercel automatically sets `VERCEL_URL`, but setting `NEXTAUTH_URL` is recommended for explicit configuration.*

## 5. Google OAuth Fix (Critical)
To make "Sign in with Google" work on production, you must update your Google Cloud Console.

1.  Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
2.  Select your Project and edit the **OAuth 2.0 Client ID** used for CoMuse.
3.  **Authorized JavaScript origins**:
    - Add: `https://your-project.vercel.app` (Replace with your actual Vercel domain)
4.  **Authorized redirect URIs**:
    - Add: `https://your-project.vercel.app/api/auth/callback/google`
5.  Save changes. **Note**: It may take 5-10 minutes to propagate.

## 6. Database Migration (The "Golden Sample")
Since we are switching to Postgres, the database starts empty. You need to push the schema and seed the data *after* deployment or during the build.

**Option A: Run locally (Easiest)**
1.  Pull the Vercel env vars to your local machine:
    ```bash
    npm i -g vercel
    vercel link
    vercel env pull .env.production.local
    ```
2.  Push the schema to the remote DB:
    ```bash
    npx prisma db push --schema=prisma/schema.prisma
    ```
    *Note: Ensure your `.env` is using the Postgres connection strings, or pass them explicitly.*

**Option B: Build Command (Automated)**
In Vercel **Settings** -> **General** -> **Build & Development Settings**:
- Change **Build Command** to:
  ```bash
  npx prisma generate && npx prisma db push && next build
  ```
  *(This forces a schema push on every build. Good for MVP, careful in real production).*

**Seeding Production Data (Golden Sample)**:
To get the "The Last Signal" story on production:
1.  Connect to your Vercel DB URI locally (update your `.env` to point to the production DB).
2.  Run the seed script:
    ```bash
    npx tsx prisma/seed.ts
    ```

## 7. Final Verification
1.  Visit your Vercel URL.
2.  **Check Landing Page**: You should see the "Hero" and "Trending" sections.
3.  **Login**: Try "Sign in with Google". It should redirect back successfully.
4.  **Check Data**: Click "Explore Trending" -> "The Last Signal". You should see the beautiful graph and equity view.

**Troubleshooting**:
- **500 Error on Login**: Check `AUTH_SECRET` and `AUTH_GOOGLE_ID/SECRET`. Check Vercel Logs.
- **Database Connection Error**: Ensure `POSTGRES_PRISMA_URL` is set correctly in Environment Variables.
