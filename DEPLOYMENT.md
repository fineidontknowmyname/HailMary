# Deployment Guide

This guide explains how to deploy the HailMary application, separating local development configuration from production deployment on Netlify (web) and Render (api).

## 1. Local Development

Before running the app locally, ensure you have set up your environment variables.

1.  Copy the example env files to actual `.env` files:
    *   In `apps/web/`: `cp .env.example .env`
    *   In `apps/api/`: `cp .env.example .env`
2.  Fill in the required values (like your Supabase keys and Database URLs).
3.  Run `pnpm dev` in the root directory to start both the frontend and backend.

*Note: `.env` files are ignored by git to protect your secrets.*

## 2. Production Deployment

### Frontend (Netlify)

Build settings are committed in `netlify.toml` at the repo root, so Netlify picks
them up automatically:

*   Base directory: repo root
*   Build command: `pnpm --filter @hailmary/web build`
*   Publish directory: `apps/web/dist`
*   Node 22 / pnpm 10 (pinned in `netlify.toml`)
*   SPA + `/:username` routing handled by the `/* -> /index.html` redirect

**Setup:**

1.  In Netlify: *Add new site -> Import from Git*, pick this repo. Leave the build
    settings as detected (they come from `netlify.toml`).
2.  *Site configuration -> Environment variables* — add:
    *   `VITE_API_BASE_URL`: the deployed backend URL (e.g. `https://hailmary.onrender.com`)
    *   `VITE_SUPABASE_URL`: your Supabase project URL
    *   `VITE_SUPABASE_ANON_KEY`: your Supabase anon (public) key
3.  Deploy. Note the site URL (e.g. `https://hailmary.netlify.app`).
4.  **On the Render backend**, set `FRONTEND_URL` to that Netlify URL and redeploy —
    the API's CORS allowlist only accepts `FRONTEND_URL` (and localhost in dev), so
    API calls fail until this matches.
5.  Add the Netlify URL to Supabase *Authentication -> URL Configuration* (Site URL
    and Redirect URLs) so email confirmation / password-reset links work.

The `apps/web/vercel.json` file is only used by Vercel; it can be deleted if you
are not also deploying there.

### Backend (Render)

When deploying `apps/api` to Render, add the following Environment Variables in the Render dashboard (Environment tab):

*   `PORT`: `4000` (Render will usually assign this automatically)
*   `API_URL`: The URL of your deployed backend (e.g., `https://hailmary.onrender.com`)
*   `FRONTEND_URL`: The URL of your deployed frontend on Netlify (e.g., `https://hailmary.netlify.app`) — must match exactly, no trailing slash
*   `SUPABASE_URL` / `SUPABASE_KEY`: Supabase project URL and **service-role** key
*   `DATABASE_URL`: Your production Postgres connection string (also used by `pnpm migrate`)
*   `GROQ_API_KEY`: Your Groq API key
*   `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`: Upstash Redis (AI response cache)

## 3. CI/CD

We use GitHub Actions to automate build verification. Every push or pull request to the `main` branch triggers the `.github/workflows/checks.yml` workflow, which runs:
- `pnpm install`
- `pnpm run lint`
- `pnpm run type-check`
- `pnpm run build`

Actual deployment is handled independently by Netlify (web) and Render (api) via their own GitHub integrations, not by this workflow.
