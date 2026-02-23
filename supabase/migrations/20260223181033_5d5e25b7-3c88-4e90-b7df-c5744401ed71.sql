
-- Create bookings table
CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  arena_id TEXT NOT NULL,
  date DATE NOT NULL,
  time TEXT NOT NULL,
  client_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'booked' CHECK (status IN ('booked', 'fixed')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(arena_id, date, time)
);

-- Enable RLS
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view bookings
CREATE POLICY "Authenticated users can view bookings"
ON public.bookings FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Admins can insert bookings
CREATE POLICY "Admins can insert bookings"
ON public.bookings FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Admins can update bookings
CREATE POLICY "Admins can update bookings"
ON public.bookings FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can delete bookings
CREATE POLICY "Admins can delete bookings"
ON public.bookings FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_bookings_updated_at
BEFORE UPDATE ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;
