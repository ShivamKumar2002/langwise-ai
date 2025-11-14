# Supabase Migration Summary

This document summarizes the migration from SQLite + custom auth to Supabase.

## Changes Made

### 1. Database Migration

- **Removed**: SQLite database (`better-sqlite3`)
- **Added**: Supabase PostgreSQL database
- **Migration file**: `supabase/migrations/001_initial_schema.sql`
- **Tables migrated**:
  - `users` - User profiles (linked to `auth.users`)
  - `transcripts` - Conversation transcripts
  - `skill_levels` - User skill assessments
  - `personalized_plans` - Learning plans
  - `assessment_sessions` - Assessment session tracking

### 2. Authentication Migration

- **Removed**: Custom test accounts (`TEST_ACCOUNTS`)
- **Removed**: Custom auth code system
- **Added**: Supabase email+password authentication
- **New files**:
  - `lib/supabase/client.ts` - Browser Supabase client
  - `lib/supabase/server.ts` - Server Supabase client
- **Updated files**:
  - `lib/auth-actions.ts` - Now uses Supabase auth
  - `lib/auth-context.ts` - Updated to work with Supabase sessions
  - `app/page.tsx` - Login page now uses email+password
  - `components/auth-provider.tsx` - Syncs with Supabase auth state

### 3. Database Operations

- **Updated**: `lib/utils-db.ts` - All functions now use Supabase
- **Changes**: All database operations are now async
- **API routes updated**:
  - `app/api/auth/login/route.ts`
  - `app/api/get-plan/route.ts`
  - `app/api/analyze-transcript/route.ts`
  - `app/api/agora/start-agent/route.ts`
  - `app/api/agora/stop-agent/route.ts`

### 4. Removed Code

- Test accounts from `lib/constants.ts`
- SQLite initialization from `lib/db.ts` (file kept for reference but not used)
- Test account seeding logic

## Environment Variables Required

Add these to your `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Setup Steps

1. **Create Supabase project** at https://supabase.com
2. **Run database migration** (see `SUPABASE_SETUP.md`)
3. **Set environment variables**
4. **Enable Email auth** in Supabase dashboard
5. **Test the application**

## Breaking Changes

- **No more test accounts**: Users must sign up with email+password
- **Database schema changes**: Column names use snake_case (e.g., `user_id` instead of `userId`)
- **All DB operations are async**: Update any code that calls database functions

## Notes

- User profiles are automatically created on sign-up
- Row Level Security (RLS) is enabled on all tables
- Users can only access their own data
- The `user_id` field uses email as identifier for consistency with existing code

## Next Steps

1. Run the Supabase migration SQL
2. Test sign-up and sign-in flows
3. Verify all features work correctly
4. Remove old SQLite database files if desired (`voice_assessment.db*`)
