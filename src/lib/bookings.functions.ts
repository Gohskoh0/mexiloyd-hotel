import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

function publicClient() {
  return createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
  );
}

const bookingInput = z.object({
  room_type_id: z.string().uuid(),
  guest_name: z.string().trim().min(2).max(100),
  guest_email: z.string().trim().email().max(255),
  guest_phone: z.string().trim().min(5).max(30),
  guests: z.number().int().min(1).max(10),
  rooms_booked: z.number().int().min(1).max(5),
  check_in: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  check_out: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  payment_option: z.enum(["full", "deposit", "at_hotel"]),
  special_requests: z.string().max(1000).optional().nullable(),
});

function genRef() {
  const t = Date.now().toString(36).toUpperCase();
  const r = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `LW-${t}-${r}`;
}

export const createBooking = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => bookingInput.parse(data))
  .handler(async ({ data }) => {
    const supabase = publicClient();

    const { data: room, error: roomErr } = await supabase
      .from("room_types")
      .select("id, name, base_price, max_occupancy")
      .eq("id", data.room_type_id)
      .eq("is_active", true)
      .maybeSingle();
    if (roomErr) throw new Error(roomErr.message);
    if (!room) throw new Error("Room not found");

    const checkIn = new Date(data.check_in);
    const checkOut = new Date(data.check_out);
    const nights = Math.max(1, Math.round((checkOut.getTime() - checkIn.getTime()) / 86400000));
    if (checkOut <= checkIn) throw new Error("Check-out must be after check-in");

    if (data.guests > room.max_occupancy * data.rooms_booked) {
      throw new Error(`This room sleeps up to ${room.max_occupancy} per unit.`);
    }

    const { data: avail, error: availErr } = await supabase.rpc("room_units_available", {
      _room_type_id: data.room_type_id,
      _check_in: data.check_in,
      _check_out: data.check_out,
    });
    if (availErr) throw new Error(availErr.message);
    if ((avail ?? 0) < data.rooms_booked) {
      throw new Error(`Only ${avail ?? 0} unit(s) available for those dates.`);
    }

    const subtotal = Number(room.base_price) * nights * data.rooms_booked;
    const total = subtotal;

    const { data: settings } = await supabase
      .from("app_settings")
      .select("deposit_percent")
      .eq("id", 1)
      .maybeSingle();
    const depositPct = settings?.deposit_percent ?? 30;

    const amountDue =
      data.payment_option === "full" ? total
      : data.payment_option === "deposit" ? Math.round((total * depositPct) / 100)
      : 0;

    const reference = genRef();
    const { data: created, error: insertErr } = await supabase
      .from("bookings")
      .insert({
        reference,
        room_type_id: data.room_type_id,
        guest_name: data.guest_name,
        guest_email: data.guest_email,
        guest_phone: data.guest_phone,
        guests: data.guests,
        rooms_booked: data.rooms_booked,
        check_in: data.check_in,
        check_out: data.check_out,
        nights,
        subtotal,
        total,
        payment_option: data.payment_option,
        special_requests: data.special_requests ?? null,
        status: data.payment_option === "at_hotel" ? "confirmed" : "pending",
      })
      .select("id, reference")
      .single();
    if (insertErr) throw new Error(insertErr.message);

    return { reference: created.reference, id: created.id, amountDue, total, nights };
  });

export const getBookingByReference = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => z.object({ reference: z.string().min(3) }).parse(data))
  .handler(async ({ data }) => {
    const supabase = publicClient();
    const { data: booking, error } = await supabase
      .from("bookings")
      .select(`*, room_types ( name, slug, images, bed_type, max_occupancy )`)
      .eq("reference", data.reference)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!booking) throw new Error("Booking not found");
    return booking;
  });

export const checkAvailability = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z.object({
      room_type_id: z.string().uuid(),
      check_in: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      check_out: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    }).parse(data),
  )
  .handler(async ({ data }) => {
    const supabase = publicClient();
    const { data: avail, error } = await supabase.rpc("room_units_available", {
      _room_type_id: data.room_type_id,
      _check_in: data.check_in,
      _check_out: data.check_out,
    });
    if (error) throw new Error(error.message);
    return { units: avail ?? 0 };
  });
