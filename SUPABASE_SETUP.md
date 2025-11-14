# Supabase Setup Guide

This project uses Supabase for database and authentication.

## Prerequisites

1. Create a Supabase account at https://supabase.com
2. Create a new project in your Supabase dashboard

## Configuration

1. **Get your Supabase credentials:**

   - Go to your project settings → API
   - Copy the **Project URL** (NEXT_PUBLIC_SUPABASE_URL)
   - Copy the **anon/public key** (NEXT_PUBLIC_SUPABASE_ANON_KEY)
   - Copy the **service_role key** (SUPABASE_SERVICE_ROLE_KEY) - Keep this secret!

2. **Set up environment variables:**
   Create a `.env.local` file in the root directory:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

## Database Setup

1. **Run the migration:**

   - Go to your Supabase dashboard → SQL Editor
   - Copy the contents of `supabase/migrations/001_initial_schema.sql`
   - Paste and run it in the SQL Editor

   Alternatively, if you have the Supabase CLI installed:

   ```bash
   supabase db push
   ```

2. **Verify tables are created:**
   - Go to Table Editor in your Supabase dashboard
   - You should see: `users`, `transcripts`, `skill_levels`, `personalized_plans`, `assessment_sessions`

## Authentication Setup

1. **Enable Email Authentication:**

   - Go to Authentication → Providers in your Supabase dashboard
   - Ensure "Email" provider is enabled
   - Configure email templates if needed

2. **Email Confirmation (Optional):**
   - In Authentication → Settings
   - You can disable "Enable email confirmations" for development
   - For production, keep it enabled and configure SMTP settings

## Row Level Security (RLS)

The migration includes RLS policies that ensure:

- Users can only access their own data
- All tables are protected by default
- Policies are automatically enforced by Supabase

## Testing

1. Start your development server:

   ```bash
   pnpm dev
   ```

2. Navigate to the login page
3. Sign up with a new email and password
4. Complete the onboarding flow
5. Test the full application flow

## Production Deployment

1. Add environment variables to your hosting platform (Vercel, etc.)
2. Ensure RLS policies are active
3. Configure email templates in Supabase dashboard
4. Set up proper CORS settings if needed
5. Monitor usage in Supabase dashboard

## Troubleshooting

- **"Missing Supabase environment variables"**: Check that all env vars are set correctly
- **Authentication errors**: Verify email provider is enabled in Supabase dashboard
- **Database errors**: Ensure migration has been run successfully
- **RLS errors**: Check that user is authenticated and policies are correct
