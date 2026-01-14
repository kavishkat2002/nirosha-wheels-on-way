
-- Add pickup_location and dropoff_location to bookings table
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS pickup_location TEXT,
ADD COLUMN IF NOT EXISTS dropoff_location TEXT;
