
ALTER TABLE public.app_settings ALTER COLUMN email DROP NOT NULL;

ALTER TABLE public.app_settings
  ADD COLUMN IF NOT EXISTS check_in_time text NOT NULL DEFAULT '14:00',
  ADD COLUMN IF NOT EXISTS check_out_time text NOT NULL DEFAULT '12:00',
  ADD COLUMN IF NOT EXISTS hero_image_url text;

UPDATE public.app_settings SET
  hotel_name = 'Mexiloyd',
  tagline = 'A quiet retreat in the heart of Port Harcourt.',
  address = '10 Happyland Close, near Golf Estate, Okuruama',
  city = 'Port Harcourt',
  country = 'Rivers, Nigeria',
  phone = '+2348037165381',
  email = NULL,
  whatsapp = '+2348037165381',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=10+Happyland+Close+Okuruama+Port+Harcourt',
  currency = 'NGN',
  currency_symbol = '₦',
  check_in_time = '14:00',
  check_out_time = '12:00',
  hero_image_url = '/__l5e/assets-v1/8f0e5eab-321c-476d-b4bb-fbdc840a0ffe/mexiloyd-hotel.jpg'
WHERE id = 1;

UPDATE public.room_types SET base_price = 20000,
  name = 'Standard Room',
  short_description = 'Cosy room with queen bed, en-suite bathroom, and quiet garden view.',
  images = ARRAY['https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1600&q=80']::text[]
WHERE slug = 'lakeside-standard';

UPDATE public.room_types SET base_price = 35000,
  name = 'Deluxe Room',
  short_description = 'Spacious deluxe room with king bed, work desk, and premium finishes.',
  images = ARRAY['https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1600&q=80']::text[]
WHERE slug = 'lakeside-deluxe';

UPDATE public.room_types SET base_price = 60000,
  name = 'Executive Suite',
  short_description = 'Two-room suite with lounge area, mini-bar, and full city outlook.',
  images = ARRAY['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1600&q=80']::text[]
WHERE slug = 'executive-lake-suite';
