-- ==============================================================================
-- 🚨 ULTIMATE SUPABASE GO-TRUE & SCHEMA REPAIR 🚨
-- Run this entire script in your Supabase SQL Editor.
-- This explicitly fixes the exact "Database error querying schema" during login!
-- ==============================================================================

-- 1. Grant Supabase's internal Auth Admin role access to the public schema
-- (Without this, Supabase's login system crashes when checking related profiles!)
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO supabase_auth_admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO supabase_auth_admin;
GRANT ALL PRIVILEGES ON ALL ROUTINES IN SCHEMA public TO supabase_auth_admin;

-- 2. Ensure PostgREST roles have appropriate access
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;

-- 3. Drop any potentially corrupted or failing triggers on auth.users
-- (This prevents the "Database error finding user" during signups)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;

-- 4. Reload PostgREST Cache aggressively
NOTIFY pgrst, 'reload schema';

-- Done!
