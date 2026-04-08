DO $$
DECLARE 
    v_admin_id UUID := gen_random_uuid();
    v_passenger_id UUID := gen_random_uuid();
    v_creativex_id UUID := gen_random_uuid();
    v_test_admin_id UUID := gen_random_uuid();
    v_info_id UUID := gen_random_uuid();
BEGIN 
    -- Ensure search path is safe
    SET search_path = public, extensions, auth;

---------------------------------------------------------
-- 1. Create ADMIN User (admin@nirosha.lk / admin123)
---------------------------------------------------------
IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@nirosha.lk') THEN
    INSERT INTO auth.users (
        id, instance_id, email, encrypted_password, email_confirmed_at,
        raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
    ) VALUES (
        v_admin_id, '00000000-0000-0000-0000-000000000000', 'admin@nirosha.lk',
        extensions.crypt('admin123', extensions.gen_salt('bf')), now(),
        '{"provider":"email","providers":["email"]}', '{"full_name":"Client Admin"}',
        now(), now(), 'authenticated', 'authenticated'
    );
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (v_admin_id, 'admin@nirosha.lk', 'Client Admin') ON CONFLICT (id) DO NOTHING;
ELSE
    SELECT id INTO v_admin_id FROM auth.users WHERE email = 'admin@nirosha.lk';
    UPDATE auth.users 
    SET encrypted_password = extensions.crypt('admin123', extensions.gen_salt('bf')), email_confirmed_at = now()
    WHERE id = v_admin_id;
END IF;

-- Add admin role
INSERT INTO public.user_roles (user_id, role)
VALUES (v_admin_id, 'admin'::public.app_role) ON CONFLICT (user_id, role) DO NOTHING;

---------------------------------------------------------
-- 2. Create PASSENGER User (passenger@nirosha.lk / passenger123)
---------------------------------------------------------
IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'passenger@nirosha.lk') THEN
    INSERT INTO auth.users (
        id, instance_id, email, encrypted_password, email_confirmed_at,
        raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
    ) VALUES (
        v_passenger_id, '00000000-0000-0000-0000-000000000000', 'passenger@nirosha.lk',
        extensions.crypt('passenger123', extensions.gen_salt('bf')), now(),
        '{"provider":"email","providers":["email"]}', '{"full_name":"Client Passenger"}',
        now(), now(), 'authenticated', 'authenticated'
    );
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (v_passenger_id, 'passenger@nirosha.lk', 'Client Passenger') ON CONFLICT (id) DO NOTHING;
ELSE
    SELECT id INTO v_passenger_id FROM auth.users WHERE email = 'passenger@nirosha.lk';
    UPDATE auth.users 
    SET encrypted_password = extensions.crypt('passenger123', extensions.gen_salt('bf')), email_confirmed_at = now()
    WHERE id = v_passenger_id;
END IF;

-- Ensure passenger role explicitly
INSERT INTO public.user_roles (user_id, role)
VALUES (v_passenger_id, 'user'::public.app_role) ON CONFLICT (user_id, role) DO NOTHING;

---------------------------------------------------------
-- 3. Create CREATIVEX LAB User (creativexlab@tech.com / temp01)
---------------------------------------------------------
IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'creativexlab@tech.com') THEN
    INSERT INTO auth.users (
        id, instance_id, email, encrypted_password, email_confirmed_at,
        raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
    ) VALUES (
        v_creativex_id, '00000000-0000-0000-0000-000000000000', 'creativexlab@tech.com',
        extensions.crypt('temp01', extensions.gen_salt('bf')), now(),
        '{"provider":"email","providers":["email"]}', '{"full_name":"CreativeX Lab"}',
        now(), now(), 'authenticated', 'authenticated'
    );
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (v_creativex_id, 'creativexlab@tech.com', 'CreativeX Lab') ON CONFLICT (id) DO NOTHING;
ELSE
    SELECT id INTO v_creativex_id FROM auth.users WHERE email = 'creativexlab@tech.com';
    UPDATE auth.users 
    SET encrypted_password = extensions.crypt('temp01', extensions.gen_salt('bf')), email_confirmed_at = now()
    WHERE id = v_creativex_id;
END IF;

-- Ensure Admin role for CreativexLab (Admin can access everything)
INSERT INTO public.user_roles (user_id, role)
VALUES (v_creativex_id, 'admin'::public.app_role) ON CONFLICT (user_id, role) DO NOTHING;

---------------------------------------------------------
-- 4. Create TEST ADMIN User (test@admin.lk / temp01)
---------------------------------------------------------
IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'test@admin.lk') THEN
    INSERT INTO auth.users (
        id, instance_id, email, encrypted_password, email_confirmed_at,
        raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
    ) VALUES (
        v_test_admin_id, '00000000-0000-0000-0000-000000000000', 'test@admin.lk',
        extensions.crypt('temp01', extensions.gen_salt('bf')), now(),
        '{"provider":"email","providers":["email"]}', '{"full_name":"Test Admin"}',
        now(), now(), 'authenticated', 'authenticated'
    );
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (v_test_admin_id, 'test@admin.lk', 'Test Admin') ON CONFLICT (id) DO NOTHING;
ELSE
    SELECT id INTO v_test_admin_id FROM auth.users WHERE email = 'test@admin.lk';
    UPDATE auth.users 
    SET encrypted_password = extensions.crypt('temp01', extensions.gen_salt('bf')), email_confirmed_at = now()
    WHERE id = v_test_admin_id;
END IF;

-- Ensure Admin role for Test Admin
INSERT INTO public.user_roles (user_id, role)
VALUES (v_test_admin_id, 'admin'::public.app_role) ON CONFLICT (user_id, role) DO NOTHING;

---------------------------------------------------------
-- 5. Create Info Admin User (info@creativexlab.online / admin123)
---------------------------------------------------------
IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'info@creativexlab.online') THEN
    INSERT INTO auth.users (
        id, instance_id, email, encrypted_password, email_confirmed_at,
        raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
    ) VALUES (
        v_info_id, '00000000-0000-0000-0000-000000000000', 'info@creativexlab.online',
        extensions.crypt('admin123', extensions.gen_salt('bf')), now(),
        '{"provider":"email","providers":["email"]}', '{"full_name":"Info Admin"}',
        now(), now(), 'authenticated', 'authenticated'
    );
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (v_info_id, 'info@creativexlab.online', 'Info Admin') ON CONFLICT (id) DO NOTHING;
ELSE
    SELECT id INTO v_info_id FROM auth.users WHERE email = 'info@creativexlab.online';
    UPDATE auth.users 
    SET encrypted_password = extensions.crypt('admin123', extensions.gen_salt('bf')), email_confirmed_at = now()
    WHERE id = v_info_id;
END IF;

-- Ensure Admin role for Info Admin
INSERT INTO public.user_roles (user_id, role)
VALUES (v_info_id, 'admin'::public.app_role) ON CONFLICT (user_id, role) DO NOTHING;

-- Force Schema Refresh
NOTIFY pgrst, 'reload schema';

END $$;
