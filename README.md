# Speak Mode

MVP foundation for the Speak Mode conversational English platform.

## Stack

- Next.js 16 App Router
- React 19
- Supabase Auth + Postgres + Storage
- Vercel deployment target

## Current routes

- `/` product entry
- `/login` authentication screen with demo fallback
- `/dashboard` student dashboard
- `/train` Speak Loop training architecture
- `/speak` AI conversation placeholder
- `/phrases` Power Phrases library
- `/live` live-coach unlock area
- `/profile` student profile

## Environment

Copy `.env.example` to `.env.local` and add the dedicated Speak Mode Supabase values:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

## Database

`supabase/schema.sql` contains the initial RLS-protected schema for student profiles and training progress.


## Deployment

- Hosting: Vercel
- Production branch: `main`
- Database/Auth: Supabase
- Supabase region: `us-west-2`

<!-- deploy-sync: 2026-09-26 -->


## Private beta

This release candidate includes Daily Speak, real streak tracking, spaced Power Phrase review, beta feedback, and admin tester analytics. Voice Conversation remains in standby until the production speech-to-text provider is connected.
