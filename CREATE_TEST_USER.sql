DO $$
DECLARE new_user_id UUID := gen_random_uuid();
BEGIN -- 1. Create the user in Supabase Auth (or update if exists)
IF NOT EXISTS (
    SELECT 1
    FROM auth.users
    WHERE email = 'Test1@gmail.com'
) THEN
INSERT INTO auth.users (
        id,
        instance_id,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at,
        role,
        aud
    )
VALUES (
        new_user_id,
        '00000000-0000-0000-0000-000000000000',
        'Test1@gmail.com',
        extensions.crypt('Test123', extensions.gen_salt('bf')),
        now(),
        '{"provider":"email","providers":["email"]}',
        '{"full_name":"Test One"}',
        now(),
        now(),
        'authenticated',
        'authenticated'
    );
RAISE NOTICE 'Created new user Test1@gmail.com';
ELSE
SELECT id INTO new_user_id
FROM auth.users
WHERE email = 'Test1@gmail.com';
UPDATE auth.users
SET encrypted_password = extensions.crypt('Test123', extensions.gen_salt('bf')),
    email_confirmed_at = now(),
    updated_at = now()
WHERE id = new_user_id;
RAISE NOTICE 'Updated existing user Test1@gmail.com';
END IF;
-- 2. Ensure Profile exists
INSERT INTO public.profiles (id, email, full_name)
VALUES (new_user_id, 'Test1@gmail.com', 'Test One') ON CONFLICT (id) DO NOTHING;
END $$;