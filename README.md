# LeadOS SaaS

LeadOS SaaS is the full-stack version of your standalone outreach CRM. This scaffold upgrades the single HTML file into a multi-dashboard web app with backend-ready structure for:

- user auth
- multiple dashboards/workspaces
- shared leads across devices
- instant form ingestion
- AI-powered script generation
- pipeline, scripts, and analytics surfaces

## Stack

- Next.js App Router
- TypeScript
- Supabase for auth/database/storage
- OpenAI for AI helpers

## What is included

- SaaS landing page
- authenticated app shell
- dashboards overview
- per-dashboard CRM workspace
- webhook-ready instant forms endpoint
- AI script generation endpoint
- Supabase schema file
- mock fallback data so the UI can be developed before wiring real services

## Setup

1. Copy `.env.example` to `.env.local`
2. Create a Supabase project
3. Run the SQL in `supabase/schema.sql`
4. Fill in Supabase keys
5. Add your OpenAI API key if you want AI features
6. Install dependencies:

```powershell
npm install
```

7. Start the app:

```powershell
npm run dev
```

## SaaS roadmap already shaped into this scaffold

- `app/app/dashboards`
  Multiple dashboards/workspaces for different campaigns or lead sources.
- `app/api/forms/[dashboardId]/route.ts`
  Webhook target for Meta instant forms or any custom form bridge.
- `app/api/ai/generate-script/route.ts`
  AI endpoint for personalized outreach or follow-up generation.
- `supabase/schema.sql`
  Teams, dashboards, leads, scripts, and instant form events.

## Notes

- The current UI uses mock data if Supabase is not configured yet.
- Instant forms usually require a webhook bridge from Meta. This scaffold gives you the app-side endpoint and data model.
- AI is real once an `OPENAI_API_KEY` is configured.
