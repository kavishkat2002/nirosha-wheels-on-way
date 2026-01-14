-- Create profiles table for user information
CREATE TABLE public.profiles (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    email TEXT,
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role app_role NOT NULL DEFAULT 'user',
    UNIQUE (user_id, role)
);

-- Create buses table
CREATE TABLE public.buses (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    number TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL CHECK (type IN ('AC', 'Non-AC')),
    total_seats INTEGER NOT NULL DEFAULT 40,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create routes table
CREATE TABLE public.routes (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    source TEXT NOT NULL,
    destination TEXT NOT NULL,
    duration TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create schedules table
CREATE TABLE public.schedules (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    bus_id UUID NOT NULL REFERENCES public.buses(id) ON DELETE CASCADE,
    route_id UUID NOT NULL REFERENCES public.routes(id) ON DELETE CASCADE,
    departure_time TIME NOT NULL,
    arrival_time TIME NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bookings table
CREATE TABLE public.bookings (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    schedule_id UUID NOT NULL REFERENCES public.schedules(id) ON DELETE CASCADE,
    seat_number INTEGER NOT NULL,
    passenger_name TEXT NOT NULL,
    passenger_email TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (schedule_id, seat_number)
);


-- ==========================================
-- SECURITY & ACCESS CONTROL (OPTION 2: SIMPLE EMAIL CHECK)
-- ==========================================

-- 1. Aggressive Cleanup: Drop everything to start fresh
DROP FUNCTION IF EXISTS public.is_admin() CASCADE;
DROP FUNCTION IF EXISTS public.is_admin_check() CASCADE;
DROP FUNCTION IF EXISTS public.has_role() CASCADE;

-- 1.5. Simple is_admin helper for the frontend RPC
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT (auth.jwt()->>'email' = 'kavishkathilakarathna0@gmail.com');
$$;

DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.' || r.tablename;
    END LOOP;
END $$;

-- 2. Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- 3. DIRECT DATABASE ACCESS (NO RPC) - Simple & Reliable
-- This approach uses RLS policies directly instead of RPC functions
-- Eliminates all schema cache and function discovery issues

-- 4. Bulletproof RLS Policies (Direct Email-Based Access)
-- BUSES
CREATE POLICY "Public read buses" ON public.buses FOR SELECT USING (true);
CREATE POLICY "Admin manage buses" ON public.buses FOR ALL USING (auth.jwt()->>'email' = 'kavishkathilakarathna0@gmail.com');

-- ROUTES
CREATE POLICY "Public read routes" ON public.routes FOR SELECT USING (true);
CREATE POLICY "Admin manage routes" ON public.routes FOR ALL USING (auth.jwt()->>'email' = 'kavishkathilakarathna0@gmail.com');

-- SCHEDULES
CREATE POLICY "Public read schedules" ON public.schedules FOR SELECT USING (true);
CREATE POLICY "Admin manage schedules" ON public.schedules FOR ALL USING (auth.jwt()->>'email' = 'kavishkathilakarathna0@gmail.com');

-- BOOKINGS
CREATE POLICY "Public read bookings" ON public.bookings FOR SELECT USING (true);
CREATE POLICY "Admin manage all bookings" ON public.bookings FOR ALL USING (auth.jwt()->>'email' = 'kavishkathilakarathna0@gmail.com');
CREATE POLICY "Users manage own bookings" ON public.bookings FOR ALL USING (auth.uid() = user_id);

-- USER ROLES & PROFILES
CREATE POLICY "View own profile/role" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admin manage all profiles" ON public.profiles FOR ALL USING (auth.jwt()->>'email' = 'kavishkathilakarathna0@gmail.com');

CREATE POLICY "View own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admin manage all roles" ON public.user_roles FOR ALL USING (auth.jwt()->>'email' = 'kavishkathilakarathna0@gmail.com');

-- 4. Final Permissions Lockdown for 'authenticated' role
GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- ==========================================
-- AUTOMATION & REPAIR
-- ==========================================

-- Function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (user_id, email, full_name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
    
    INSERT INTO public.user_roles (user_id, role)
    VALUES (
        NEW.id, 
        CASE 
            WHEN NEW.email = 'kavishkathilakarathna0@gmail.com' THEN 'admin'::public.app_role 
            ELSE 'user'::public.app_role 
        END
    );
    
    RETURN NEW;
END;
$$;

-- Trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- Trigger for profile updates
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Manual repair block to ensure admin user has the role
DO $$
DECLARE
    v_user_id UUID;
BEGIN
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'kavishkathilakarathna0@gmail.com';
    IF v_user_id IS NOT NULL THEN
        INSERT INTO public.user_roles (user_id, role)
        VALUES (v_user_id, 'admin')
        ON CONFLICT (user_id, role) DO NOTHING;
        
        INSERT INTO public.profiles (user_id, email)
        VALUES (v_user_id, 'kavishkathilakarathna0@gmail.com')
        ON CONFLICT (user_id) DO NOTHING;
    END IF;
END $$;