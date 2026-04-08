-- ==========================================
-- USER & ADMIN MANAGEMENT SQL TOOLKIT (FIXED)
-- ==========================================
-- Paste these commands into your Supabase SQL Editor
--------------------------------------------
-- 0. SCHEMA FIX (RUN THIS ONCE)
--------------------------------------------
-- Run this if you get "foreign key constraint" errors when deleting users.
-- This makes sure that deleting a user also cleans up their support chats.
ALTER TABLE public.support_chats DROP CONSTRAINT IF EXISTS support_chats_user_id_fkey,
    ADD CONSTRAINT support_chats_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
--------------------------------------------
-- 1. VIEW ALL USERS & ROLES
--------------------------------------------
-- This query combines Auth data with your Profiles and Roles
SELECT u.id,
    u.email,
    p.full_name,
    p.phone,
    u.last_sign_in_at,
    u.email_confirmed_at,
    COALESCE(r.role, 'user') as current_role
FROM auth.users u
    LEFT JOIN public.profiles p ON u.id = p.id
    LEFT JOIN public.user_roles r ON u.id = r.user_id
ORDER BY u.created_at DESC;
--------------------------------------------
-- 2. MAKE A USER AN ADMIN
--------------------------------------------
-- Replace 'user-email@example.com' with the actual email
DO $$
DECLARE target_id UUID;
BEGIN
SELECT id INTO target_id
FROM auth.users
WHERE email = 'user-email@example.com';
IF target_id IS NOT NULL THEN -- Insert or update role in user_roles table
INSERT INTO public.user_roles (user_id, role)
VALUES (target_id, 'admin') ON CONFLICT (user_id, role) DO NOTHING;
RAISE NOTICE 'User % has been promoted to Admin',
'user-email@example.com';
ELSE RAISE NOTICE 'User % not found',
'user-email@example.com';
END IF;
END $$;
--------------------------------------------
-- 3. REMOVE ADMIN PRIVILEGES
--------------------------------------------
-- Replace 'user-email@example.com' with the actual email
DELETE FROM public.user_roles
WHERE user_id IN (
        SELECT id
        FROM auth.users
        WHERE email = 'user-email@example.com'
    )
    AND role = 'admin';
--------------------------------------------
-- 4. DELETE A USER ENTIRELY
--------------------------------------------
-- WARNING: This will remove the user from Auth and all related tables (Profiles, Bookings, Chats, etc.)
-- Replace 'user-email@example.com' with the actual email
DO $$
DECLARE target_id UUID;
BEGIN
SELECT id INTO target_id
FROM auth.users
WHERE email = 'user-email@example.com';
IF target_id IS NOT NULL THEN -- Cleanup support chats first (manual fallback)
DELETE FROM public.support_chats
WHERE user_id = target_id;
-- Delete the user (should now work!)
DELETE FROM auth.users
WHERE id = target_id;
RAISE NOTICE 'User % and all their data deleted',
'user-email@example.com';
ELSE RAISE NOTICE 'User % not found',
'user-email@example.com';
END IF;
END $$;
--------------------------------------------
-- 5. MANUALLY CONFIRM A USER'S EMAIL
--------------------------------------------
-- Useful if the user didn't get the verification code
-- Note: confirmed_at is a generated column, so we ONLY update email_confirmed_at
UPDATE auth.users
SET email_confirmed_at = NOW(),
    last_sign_in_at = NOW()
WHERE email = 'user-email@example.com';
--------------------------------------------
-- 6. RESET PASSWORD VIA SQL
--------------------------------------------
-- Use this if you are getting "Invalid login credentials"
-- Replace '@Kavishka2002' with your desired password
-- Replace 'user-email@example.com' with the actual email
UPDATE auth.users
SET encrypted_password = extensions.crypt('@Kavishka2002', extensions.gen_salt('bf')),
    updated_at = NOW()
WHERE email = 'user-email@example.com';