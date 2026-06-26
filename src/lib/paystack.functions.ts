import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Paystack credentials live in the `paystack_settings` table with NO
 * anon/authenticated grants. Only service_role can read/write the actual
 * key values; admins manage them through the gated server functions below.
 * Saved keys are never returned to the client — only a "configured" flag
 * and a masked preview of the public key.
 */

// Admin-only: get config status (booleans + masked previews). Never returns secrets.
export const getPaystackStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Forbidden");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("paystack_settings")
      .select("public_key, secret_key, mode, updated_at")
      .eq("id", 1)
      .maybeSingle();
    if (error) throw new Error(error.message);

    const mask = (k: string | null | undefined) =>
      !k ? null : k.length <= 10 ? "•••••" : `${k.slice(0, 7)}••••${k.slice(-4)}`;

    return {
      mode: data?.mode ?? "test",
      hasSecretKey: !!data?.secret_key,
      hasPublicKey: !!data?.public_key,
      publicKeyPreview: mask(data?.public_key ?? null),
      secretKeyPreview: mask(data?.secret_key ?? null),
      updatedAt: data?.updated_at ?? null,
    };
  });

const updateInput = z.object({
  public_key: z.string().trim().optional().nullable(),
  secret_key: z.string().trim().optional().nullable(),
  mode: z.enum(["test", "live"]).optional(),
});

export const updatePaystackSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => updateInput.parse(data))
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Forbidden");

    const update: Record<string, unknown> = { updated_by: context.userId };
    if (typeof data.mode === "string") update.mode = data.mode;
    // Empty string = no change; only update when a non-empty value is provided.
    if (data.public_key && data.public_key.length > 10) update.public_key = data.public_key;
    if (data.secret_key && data.secret_key.length > 10) update.secret_key = data.secret_key;

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("paystack_settings")
      .update(update)
      .eq("id", 1);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const clearPaystackKeys = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Forbidden");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("paystack_settings")
      .update({ secret_key: null, public_key: null, updated_by: context.userId })
      .eq("id", 1);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// Public: gives the browser the public key (only) needed to open the Paystack popup.
export const getPaystackPublicConfig = createServerFn({ method: "GET" })
  .handler(async () => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("paystack_settings")
      .select("public_key, mode")
      .eq("id", 1)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return {
      publicKey: data?.public_key ?? null,
      mode: data?.mode ?? "test",
    };
  });

// Public: verify a Paystack reference after the popup closes, then mark the booking paid.
export const verifyPaystackPayment = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z.object({
      reference: z.string().min(3),
      paystack_reference: z.string().min(3),
    }).parse(data),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: settings } = await supabaseAdmin
      .from("paystack_settings")
      .select("secret_key")
      .eq("id", 1)
      .maybeSingle();
    const secretKey = settings?.secret_key;
    if (!secretKey) throw new Error("Payments are not configured yet. Please contact the hotel.");

    const res = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(data.paystack_reference)}`,
      { headers: { Authorization: `Bearer ${secretKey}` } },
    );
    if (!res.ok) throw new Error("Could not verify payment with Paystack.");
    const payload = await res.json();
    const status: string = payload?.data?.status;
    const amountKobo: number = payload?.data?.amount ?? 0;
    if (status !== "success") throw new Error(`Payment ${status ?? "failed"}.`);

    const { data: booking, error: bErr } = await supabaseAdmin
      .from("bookings")
      .select("id, total, payment_option")
      .eq("reference", data.reference)
      .maybeSingle();
    if (bErr) throw new Error(bErr.message);
    if (!booking) throw new Error("Booking not found");

    const amountPaid = Math.round(amountKobo / 100);
    const total = Number(booking.total);
    const status_pay = amountPaid >= total ? "paid" : "partial";

    const { error: upErr } = await supabaseAdmin
      .from("bookings")
      .update({
        amount_paid: amountPaid,
        payment_status: status_pay,
        paystack_reference: data.paystack_reference,
        status: "confirmed",
      })
      .eq("id", booking.id);
    if (upErr) throw new Error(upErr.message);

    return { ok: true, paymentStatus: status_pay, amountPaid };
  });
