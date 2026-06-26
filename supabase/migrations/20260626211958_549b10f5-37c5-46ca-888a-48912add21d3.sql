
-- ENUMS
CREATE TYPE public.app_role AS ENUM ('admin', 'user');
CREATE TYPE public.payment_option AS ENUM ('full', 'deposit', 'at_hotel');
CREATE TYPE public.payment_status AS ENUM ('unpaid', 'partial', 'paid', 'refunded');
CREATE TYPE public.booking_status AS ENUM ('pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled');

-- ROOM TYPES
CREATE TABLE public.room_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  short_description TEXT NOT NULL DEFAULT '',
  base_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  max_occupancy INT NOT NULL DEFAULT 2,
  total_units INT NOT NULL DEFAULT 1,
  bed_type TEXT NOT NULL DEFAULT 'Queen',
  size_sqm INT,
  images TEXT[] NOT NULL DEFAULT '{}',
  amenities TEXT[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.room_types TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.room_types TO authenticated;
GRANT ALL ON public.room_types TO service_role;
ALTER TABLE public.room_types ENABLE ROW LEVEL SECURITY;

-- USER ROLES (declare early so policies can use it)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Anyone can read active rooms" ON public.room_types
  FOR SELECT USING (is_active = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage rooms" ON public.room_types
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users see own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- BOOKINGS
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference TEXT NOT NULL UNIQUE,
  room_type_id UUID NOT NULL REFERENCES public.room_types(id) ON DELETE RESTRICT,
  guest_name TEXT NOT NULL,
  guest_email TEXT NOT NULL,
  guest_phone TEXT NOT NULL,
  guests INT NOT NULL DEFAULT 1,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  nights INT NOT NULL,
  rooms_booked INT NOT NULL DEFAULT 1,
  subtotal NUMERIC(10,2) NOT NULL,
  total NUMERIC(10,2) NOT NULL,
  amount_paid NUMERIC(10,2) NOT NULL DEFAULT 0,
  payment_option public.payment_option NOT NULL,
  payment_status public.payment_status NOT NULL DEFAULT 'unpaid',
  paystack_reference TEXT,
  status public.booking_status NOT NULL DEFAULT 'pending',
  special_requests TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (check_out > check_in)
);
GRANT SELECT, INSERT ON public.bookings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bookings TO authenticated;
GRANT ALL ON public.bookings TO service_role;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Allow public to read a booking by its reference (used for confirmation page).
CREATE POLICY "Anyone can read bookings" ON public.bookings
  FOR SELECT USING (true);
CREATE POLICY "Anyone can create bookings" ON public.bookings
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins manage bookings" ON public.bookings
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete bookings" ON public.bookings
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- APP SETTINGS (single row)
CREATE TABLE public.app_settings (
  id INT PRIMARY KEY DEFAULT 1,
  hotel_name TEXT NOT NULL DEFAULT 'LakeWood Hotel',
  tagline TEXT NOT NULL DEFAULT 'Where the water meets warm hospitality.',
  address TEXT NOT NULL DEFAULT '',
  city TEXT NOT NULL DEFAULT '',
  country TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT 'reservations@lakewoodhotel.com',
  whatsapp TEXT NOT NULL DEFAULT '',
  google_maps_url TEXT NOT NULL DEFAULT '',
  currency TEXT NOT NULL DEFAULT 'NGN',
  currency_symbol TEXT NOT NULL DEFAULT '₦',
  deposit_percent INT NOT NULL DEFAULT 30,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (id = 1)
);
GRANT SELECT ON public.app_settings TO anon, authenticated;
GRANT ALL ON public.app_settings TO service_role;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read settings" ON public.app_settings FOR SELECT USING (true);
CREATE POLICY "Admins update settings" ON public.app_settings
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.app_settings (id) VALUES (1);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER trg_room_types_touch BEFORE UPDATE ON public.room_types
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER trg_bookings_touch BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER trg_settings_touch BEFORE UPDATE ON public.app_settings
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Availability function: returns units available for a room during date range
CREATE OR REPLACE FUNCTION public.room_units_available(
  _room_type_id UUID, _check_in DATE, _check_out DATE
) RETURNS INT
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT GREATEST(
    (SELECT total_units FROM public.room_types WHERE id = _room_type_id) -
    COALESCE((
      SELECT SUM(rooms_booked) FROM public.bookings
      WHERE room_type_id = _room_type_id
        AND status NOT IN ('cancelled', 'checked_out')
        AND check_in < _check_out
        AND check_out > _check_in
    ), 0),
    0
  )::INT;
$$;
GRANT EXECUTE ON FUNCTION public.room_units_available(UUID, DATE, DATE) TO anon, authenticated, service_role;
