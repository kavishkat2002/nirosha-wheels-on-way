-- 1. Add passenger_phone column to bookings table
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS passenger_phone TEXT;

-- 2. Add update policy for profiles if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND policyname = 'Users update own profile'
    ) THEN
        CREATE POLICY "Users update own profile" ON public.profiles 
        FOR UPDATE USING (auth.uid() = user_id);
    END IF;
END $$;

-- 3. Update the handle_new_user trigger to be more robust
-- (Sometimes the profile creation might fail if user_id and id logic is inconsistent)
-- But the main issue was the missing phone column and RLS.

-- Force Schema Refresh
NOTIFY pgrst, 'reload schema';
