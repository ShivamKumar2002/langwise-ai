# Quick Start Guide

## ⚠️ IMPORTANT: Run Database Migration First!

Before you can use the application, you **must** run the database migration in Supabase.

### Step 1: Create Supabase Project

1. Go to https://supabase.com and sign up/login
2. Click "New Project"
3. Fill in your project details
4. Wait for the project to be created (takes ~2 minutes)

### Step 2: Get Your Credentials

1. Go to **Settings** → **API** in your Supabase dashboard
2. Copy these values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (keep this secret!)

### Step 3: Set Environment Variables

Create a `.env.local` file in the project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### Step 4: Run Database Migration ⚠️ CRITICAL

**This step is required!** Without it, you'll get errors like "Could not find the table 'public.users'".

1. Go to your Supabase dashboard
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**
4. Open the file `supabase/migrations/001_initial_schema.sql` in this project
5. Copy **ALL** the SQL code from that file
6. Paste it into the SQL Editor
7. Click **Run** (or press Ctrl+Enter)
8. You should see "Success. No rows returned"

### Step 5: Enable Email Authentication

1. Go to **Authentication** → **Providers** in Supabase dashboard
2. Make sure **Email** provider is enabled
3. (Optional) For development, you can disable "Confirm email" in **Authentication** → **Settings**

### Step 6: Start the Application

```bash
pnpm install
pnpm dev
```

### Step 7: Test It

1. Open http://localhost:3000
2. Click "Sign Up"
3. Enter your email and password
4. Complete the onboarding flow

## Troubleshooting

### Error: "Could not find the table 'public.users'"

- **Solution**: You haven't run the migration yet. Go back to Step 4 above.

### Error: "Missing Supabase environment variables"

- **Solution**: Make sure your `.env.local` file exists and has all three variables set.

### Error: "Invalid API key"

- **Solution**: Double-check that you copied the correct keys from Supabase dashboard.

### Authentication not working

- **Solution**: Make sure Email provider is enabled in Supabase dashboard (Step 5).

## Next Steps

Once everything is working:

- See `SUPABASE_SETUP.md` for detailed configuration
- See `MIGRATION_SUMMARY.md` for what changed in the migration
- See `AGORA_SETUP.md` for Agora voice assessment setup
