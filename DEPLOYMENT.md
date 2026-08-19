# Deployment Guide

This guide explains how to deploy the HailMary application, separating local development configuration from production deployment on Vercel and Render.

## 1. Local Development

Before running the app locally, ensure you have set up your environment variables.

1.  Copy the example env files to actual `.env` files:
    *   In `apps/web/`: `cp .env.example .env`
    *   In `apps/api/`: `cp .env.example .env`
2.  Fill in the required values (like your Supabase keys and Database URLs).
3.  Run `pnpm dev` in the root directory to start both the frontend and backend.

*Note: `.env` files are ignored by git to protect your secrets.*

## 2. Production Deployment

### Frontend (Vercel)

When deploying `apps/web` to Vercel, you need to add the following Environment Variables in the Vercel dashboard (Project Settings > Environment Variables):

*   `VITE_API_BASE_URL`: The URL of your deployed backend (e.g., `https://hailmary.onrender.com`)
*   `VITE_APP_URL`: The URL of your deployed frontend (e.g., `https://hailmary.vercel.app`)
*   `VITE_SUPABASE_URL`: Your Supabase project URL
*   `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key

### Backend (Render)

When deploying `apps/api` to Render, add the following Environment Variables in the Render dashboard (Environment tab):

*   `PORT`: `4000` (Render will usually assign this automatically)
*   `API_URL`: The URL of your deployed backend (e.g., `https://hailmary.onrender.com`)
*   `FRONTEND_URL`: The URL of your deployed frontend on Vercel (e.g., `https://hailmary.vercel.app`)
*   `DATABASE_URL`: Your production Postgres connection string
*   `GROQ_API_KEY`: Your Groq API key (if applicable)

## 3. CI/CD

We use GitHub Actions to automate testing and build verification. Every push to the `main` branch triggers the `.github/workflows/deploy.yml` workflow, which runs:
- `pnpm install`
- `pnpm run lint`
- `pnpm run type-check`
- `pnpm run test`

If any of these steps fail, the deployment will be halted.
