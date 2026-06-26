
-- Fix touch_updated_at search_path
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- Switch room_units_available to SECURITY INVOKER (bookings + room_types already allow public SELECT)
CREATE OR REPLACE FUNCTION public.room_units_available(
  _room_type_id UUID, _check_in DATE, _check_out DATE
) RETURNS INT
LANGUAGE sql STABLE SECURITY INVOKER SET search_path = public AS $$
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

-- Tighten booking insert: must include guest contact info
DROP POLICY "Anyone can create bookings" ON public.bookings;
CREATE POLICY "Anyone can create bookings" ON public.bookings
  FOR INSERT WITH CHECK (
    length(guest_name) > 0
    AND length(guest_email) > 3
    AND guest_email LIKE '%@%'
    AND length(guest_phone) > 3
    AND check_out > check_in
  );
