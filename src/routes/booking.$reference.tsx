import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { SiteLayout, useSettings } from "@/components/site-layout";
import { getBookingByReference } from "@/lib/bookings.functions";
import { getPaystackPublicConfig, verifyPaystackPayment } from "@/lib/paystack.functions";
import { formatMoney, formatDate } from "@/lib/format";
import { resolveRoomImage } from "@/lib/room-images";

declare global {
  interface Window {
    PaystackPop?: { setup: (opts: Record<string, unknown>) => { openIframe: () => void } };
  }
}

export const Route = createFileRoute("/booking/$reference")({
  head: ({ params }) => ({
    meta: [{ title: `Booking ${params.reference} — LakeWood Hotel` }],
  }),
  component: BookingPage,
});

function BookingPage() {
  const { reference } = Route.useParams();
  const { data: settings } = useSettings();
  const symbol = settings?.currency_symbol ?? "₦";
  const getBooking = useServerFn(getBookingByReference);
  const getCfg = useServerFn(getPaystackPublicConfig);
  const verify = useServerFn(verifyPaystackPayment);
  const [paying, setPaying] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const bookingQ = useQuery({
    queryKey: ["booking", reference],
    queryFn: () => getBooking({ data: { reference } }),
  });
  const cfgQ = useQuery({ queryKey: ["paystack-cfg"], queryFn: () => getCfg() });

  const booking = bookingQ.data;
  const room = booking?.room_types as { name?: string; images?: string[] } | null;

  const amountDue = booking
    ? booking.payment_option === "full"
      ? Number(booking.total) - Number(booking.amount_paid)
      : booking.payment_option === "deposit"
        ? Math.round((Number(booking.total) * (settings?.deposit_percent ?? 30)) / 100) - Number(booking.amount_paid)
        : 0
    : 0;

  const canPay = booking && booking.payment_option !== "at_hotel" && booking.payment_status !== "paid" && amountDue > 0;

  function payNow() {
    if (!booking || !window.PaystackPop) {
      setErr("Payments are not ready yet. Please try again in a moment.");
      return;
    }
    if (!cfgQ.data?.publicKey) {
      setErr("Online payment isn't configured yet. Please ask the hotel to add Paystack keys or choose 'Pay at hotel'.");
      return;
    }
    setErr(null);
    setPaying(true);
    const handler = window.PaystackPop.setup({
      key: cfgQ.data.publicKey,
      email: booking.guest_email,
      amount: amountDue * 100, // kobo
      currency: settings?.currency || "NGN",
      ref: `${booking.reference}-${Date.now()}`,
      metadata: { booking_reference: booking.reference },
      callback: (resp: { reference: string }) => {
        verify({ data: { reference: booking.reference, paystack_reference: resp.reference } })
          .then(() => { setMsg("Payment confirmed. We've reserved your room."); bookingQ.refetch(); })
          .catch((e: Error) => setErr(e.message))
          .finally(() => setPaying(false));
      },
      onClose: () => setPaying(false),
    });
    handler.openIframe();
  }

  useEffect(() => { setErr(null); setMsg(null); }, [reference]);

  if (bookingQ.isLoading) return <SiteLayout><div className="container-page py-24">Loading booking…</div></SiteLayout>;
  if (!booking) return <SiteLayout><div className="container-page py-24">Booking not found.</div></SiteLayout>;

  return (
    <SiteLayout>
      <section className="container-page py-12 max-w-3xl">
        <span className="eyebrow">Booking</span>
        <h1 className="mt-3 text-4xl md:text-5xl">Reservation {booking.reference}</h1>
        <p className="mt-2 text-muted-foreground">
          Status: <span className="capitalize">{booking.status}</span> • Payment: <span className="capitalize">{booking.payment_status}</span>
        </p>

        <div className="mt-8 bg-card rounded-2xl shadow-soft overflow-hidden">
          {room?.images?.[0] && (
            <img src={resolveRoomImage(room.images[0])} alt={room.name ?? ""} width={1280} height={500}
              className="w-full aspect-[16/6] object-cover" />
          )}
          <div className="p-6 space-y-4">
            <div>
              <h2 className="text-2xl">{room?.name}</h2>
              <p className="text-sm text-muted-foreground">
                {formatDate(booking.check_in)} → {formatDate(booking.check_out)} · {booking.nights} night{booking.nights !== 1 ? "s" : ""} · {booking.rooms_booked} room{booking.rooms_booked !== 1 ? "s" : ""}
              </p>
            </div>

            <div className="hairline" />

            <dl className="grid grid-cols-2 gap-y-2 text-sm">
              <dt className="text-muted-foreground">Guest</dt><dd>{booking.guest_name}</dd>
              <dt className="text-muted-foreground">Email</dt><dd>{booking.guest_email}</dd>
              <dt className="text-muted-foreground">Phone</dt><dd>{booking.guest_phone}</dd>
              <dt className="text-muted-foreground">Guests</dt><dd>{booking.guests}</dd>
            </dl>

            <div className="hairline" />

            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatMoney(booking.subtotal, symbol)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Paid</span><span>{formatMoney(booking.amount_paid, symbol)}</span></div>
              <div className="flex justify-between font-medium text-base">
                <span>{booking.payment_option === "at_hotel" ? "Pay at hotel" : "Due now"}</span>
                <span className="font-display text-xl text-primary">
                  {formatMoney(booking.payment_option === "at_hotel" ? booking.total : amountDue, symbol)}
                </span>
              </div>
            </div>

            {msg && <div className="text-sm rounded-md p-3 bg-success/10 text-success">{msg}</div>}
            {err && <div className="text-sm rounded-md p-3 bg-destructive/10 text-destructive">{err}</div>}

            {canPay ? (
              <button onClick={payNow} disabled={paying}
                className="w-full h-12 rounded-md bg-brass text-brass-foreground font-medium hover:bg-brass/90 disabled:opacity-50">
                {paying ? "Opening Paystack…" : `Pay ${formatMoney(amountDue, symbol)} with Paystack`}
              </button>
            ) : booking.payment_option === "at_hotel" ? (
              <div className="rounded-md p-4 bg-sand text-sm">
                Your room is reserved. Payment of <strong>{formatMoney(booking.total, symbol)}</strong> will be collected at check-in.
              </div>
            ) : booking.payment_status === "paid" ? (
              <div className="rounded-md p-4 bg-success/10 text-success text-sm">
                Payment received in full. We look forward to hosting you.
              </div>
            ) : null}

            <div className="text-xs text-muted-foreground pt-2">
              Keep this reference safe: <code className="font-mono">{booking.reference}</code>. We'll email a confirmation to {booking.guest_email}.
            </div>
            <Link to="/" className="text-sm text-primary hover:underline">← Back to home</Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
