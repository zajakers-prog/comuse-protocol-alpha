# Google OAuth Setup Guide

To enable "Sign in with Google", you must configure your Google Cloud Console and environment variables.

## 1. Google Cloud Console Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project or select an existing one.
3. Navigate to **APIs & Services > Credentials**.
4. Click **Create Credentials > OAuth client ID**.
5. Select **Web application**.
6. Set **Authorized redirect URIs** to:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
7. Click **Create** and copy your **Client ID** and **Client Secret**.

## 2. Environment Variables
Add the following to your `.env` file:

```env
AUTH_SECRET="<generated_secret>"
AUTH_GOOGLE_ID="여기에_Client_ID_붙여넣기"
AUTH_GOOGLE_SECRET="여기에_Client_Secret_붙여넣기"
```

### Generate AUTH_SECRET
Run this command in your terminal to generate a secure secret:
```bash
openssl rand -base64 33
```

## 3. Install Dependencies (If failed automatically)
If you see errors about missing modules, run:
```bash
npm install next-auth@beta @auth/prisma-adapter
```
