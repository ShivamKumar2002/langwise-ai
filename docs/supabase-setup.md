## Supabase Setup

This project uses **Supabase Postgres** for:

- User profiles and onboarding data
- Assessment transcripts and sessions
- Personalized learning plans and skill levels

The Supabase project itself is provisioned and wired up via the **Vercel × Supabase integration**, but you still need to:

- Run the database migration
- Ensure authentication is configured

### 1. Environment variables

These keys are required and are read in `lib/supabase/client.ts` and `lib/supabase/server.ts`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

On **Vercel**:

- The Supabase integration sets these automatically when you connect your project.

For **local development**:

1. Go to your Supabase project → **Settings → API**.
2. Copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - service_role key → `SUPABASE_SERVICE_ROLE_KEY` (never expose this to the browser).
3. Put them in your `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 2. Database schema and migration

The schema is defined in `supabase/migrations/001_initial_schema.sql`.  
It creates the core tables:

- `users`
- `transcripts`
- `skill_levels`
- `personalized_plans`
- `assessment_sessions`

To apply the migration:

1. Open Supabase dashboard → your project.
2. Go to **SQL Editor**.
3. Create a new query and paste the contents of `supabase/migrations/001_initial_schema.sql`.
4. Run the query.
5. Verify the tables exist in **Table Editor**.

If these tables are missing, code in `lib/utils-db.ts` will throw descriptive errors pointing you back to this migration file.

### 3. Authentication

The app uses **Supabase email/password auth**:

- `lib/auth-actions.ts` and `lib/auth-context.ts` are wired to Supabase sessions.
- The login page (`app/page.tsx`) uses email + password with Supabase.

To configure:

1. In Supabase dashboard go to **Authentication → Providers**.
2. Ensure the **Email** provider is enabled.
3. (Optional for local dev) In **Authentication → Settings**, you may disable “Confirm email” so signups are instant.
4. For production, configure email templates and SMTP as needed.

### 4. Row Level Security (RLS)

The migration enables RLS policies so that:

- Users can only access their own data.
- Application tables are protected by default.

Because the app always goes through Supabase with the authenticated user’s JWT, the policies are automatically enforced – no extra logic is needed in most API routes.

### 5. Admin access (service role)

Some server-side operations use the **service role key** for full access, via `createSupabaseAdminClient` in `lib/supabase/server.ts`.  
This is used only on the server and must never be exposed to the client:

- Keep `SUPABASE_SERVICE_ROLE_KEY` out of any `NEXT_PUBLIC_*` variable.
- Do not log its value.

### 6. Production checklist

Before going live:

- Verify the migration has been applied to the production Supabase project.
- Double-check that `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` are set in Vercel.
- Confirm Email auth works end-to-end in production.
- Review RLS policies and confirm the app behaves as expected when logged in as different users.

For a higher-level story about how this app moved from SQLite and custom auth to Supabase, see `migration-summary.md`.
