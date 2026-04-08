-- ==============================================================================
-- 🚨 EMERGENCY PERMISSION & SCHEMA REPAIR 🚨
-- Run this entire script in your Supabase SQL Editor to fix "Database error querying schema"
-- ==============================================================================
-- 1. Reset Schema Permissions (Public)
GRANT USAGE ON SCHEMA public TO postgres,
    anon,
    authenticated,
    service_role;
-- 2. Grant Access to All Tables (Current & Future)
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres,
    anon,
    authenticated,
    service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT ALL ON TABLES TO postgres,
    anon,
    authenticated,
    service_role;
-- 3. Grant Access to All Sequences (Fixes ID generation errors)
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres,
    anon,
    authenticated,
    service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT ALL ON SEQUENCES TO postgres,
    anon,
    authenticated,
    service_role;
-- 4. Grant Access to All Functions (Fixes RPC errors)
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres,
    anon,
    authenticated,
    service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT ALL ON FUNCTIONS TO postgres,
    anon,
    authenticated,
    service_role;
-- 5. Re-create the is_admin Security Function (Robust Version)
CREATE OR REPLACE FUNCTION public.is_admin() RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public -- Critical for security & schema visibility
    AS $$ BEGIN -- Check if the user is in the 'admin' role OR has a specific email
    RETURN EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = auth.uid()
            AND role = 'admin'
    )
    OR (
        auth.jwt()->>'email' IN (
            'kavishkathilakarathna0@gmail.com',
            'tkavishka101@gmail.com',
            'admin@nirosha.lk',
            'creativexlab@tech.com'
        )
    );
END;
$$;
-- 6. Grant execute permission on the function specifically
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon,
    authenticated,
    service_role;
-- 7. Force Schema Cache Reload
NOTIFY pgrst,
'reload schema';