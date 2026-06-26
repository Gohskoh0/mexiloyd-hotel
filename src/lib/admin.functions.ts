import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertAdmin(context: { supabase: any; userId: string }) {
  const { data } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (!data) throw new Error("Forbidden");
}

export const listBookingsAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data, error } = await context.supabase
      .from("bookings")
      .select(`*, room_types ( name, slug )`)
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

const bookingUpdate = z.object({
  id: z.string().uuid(),
  status: z.enum(["pending", "confirmed", "checked_in", "checked_out", "cancelled"]).optional(),
  payment_status: z.enum(["unpaid", "partial", "paid", "refunded"]).optional(),
  amount_paid: z.number().min(0).optional(),
});

export const updateBookingAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => bookingUpdate.parse(data))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { id, ...patch } = data;
    const { error } = await context.supabase.from("bookings").update(patch).eq("id", id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const roomInput = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().trim().min(2).max(60).regex(/^[a-z0-9-]+$/),
  name: z.string().trim().min(2).max(100),
  short_description: z.string().max(200).default(""),
  description: z.string().max(2000).default(""),
  base_price: z.number().min(0),
  max_occupancy: z.number().int().min(1).max(10),
  total_units: z.number().int().min(0).max(500),
  bed_type: z.string().max(50).default("Queen"),
  size_sqm: z.number().int().min(0).max(2000).nullable().optional(),
  images: z.array(z.string()).default([]),
  amenities: z.array(z.string()).default([]),
  is_active: z.boolean().default(true),
  sort_order: z.number().int().default(0),
});

export const upsertRoomAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => roomInput.parse(data))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { id, ...row } = data;
    if (id) {
      const { error } = await context.supabase.from("room_types").update(row).eq("id", id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await context.supabase.from("room_types").insert(row);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const deleteRoomAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("room_types").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const settingsInput = z.object({
  hotel_name: z.string().trim().max(100).optional(),
  tagline: z.string().trim().max(200).optional(),
  address: z.string().trim().max(300).optional(),
  city: z.string().trim().max(100).optional(),
  country: z.string().trim().max(100).optional(),
  phone: z.string().trim().max(50).optional(),
  email: z.string().trim().email().max(255).optional(),
  whatsapp: z.string().trim().max(50).optional(),
  google_maps_url: z.string().trim().max(500).optional(),
  currency: z.string().trim().max(10).optional(),
  currency_symbol: z.string().trim().max(5).optional(),
  deposit_percent: z.number().int().min(0).max(100).optional(),
});

export const updateSettingsAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => settingsInput.parse(data))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("app_settings").update(data).eq("id", 1);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const meIsAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    return { isAdmin: !!data, userId: context.userId };
  });
