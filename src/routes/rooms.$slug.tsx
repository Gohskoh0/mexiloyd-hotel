import { createFileRoute, useNavigate, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout, useSettings } from "@/components/site-layout";
import { resolveRoomImage } from "@/lib/room-images";
import { formatMoney, nightsBetween, todayISO, plusDays } from "@/lib/format";
import { createBooking, checkAvailability } from "@/lib/bookings.functions";

export const Route = createFileRoute("/rooms/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug.replace(/-/g, " ")} — Mexiloyd Hotel` },
      { name: "description", content: "Reserve your room at Mexiloyd Hotel, Port Harcourt." },
    ],
  }),
  component: RoomDetail,
});

function RoomDetail() {
  const { slug } = Route.useParams();
  const { data: settings } = useSettings();
  const symbol = settings?.currency_symbol ?? "₦";
  const depositPct = settings?.deposit_percent ?? 30;
  const navigate = useNavigate();

  const { data: room, isLoading } = useQuery({
    queryKey: ["room", slug],
    queryFn: async () => {
      const { data } = await supabase.from("room_types").select("*").eq("slug", slug).maybeSingle();
      if (!data) throw notFound();
      return data;
    },
  });

  const [checkIn, setCheckIn] = useState(todayISO());
  const [checkOut, setCheckOut] = useState(plusDays(todayISO(), 1));
  const [rooms, setRooms] = useState(1);
  const [guests, setGuests] = useState(2);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [requests, setRequests] = useState("");
  const [paymentOption, setPaymentOption] = useState<"full" | "deposit" | "at_hotel">("full");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const nights = useMemo(() => nightsBetween(checkIn, checkOut), [checkIn, checkOut]);
  const subtotal = (room?.base_price ?? 0) * nights * rooms;
  const dueNow =
    paymentOption === "full" ? subtotal
    : paymentOption === "deposit" ? Math.round((subtotal * depositPct) / 100)
    : 0;

  const checkAvail = useServerFn(checkAvailability);
  const create = useServerFn(createBooking);

  const { data: avail } = useQuery({
    queryKey: ["avail", room?.id, checkIn, checkOut],
    queryFn: async () => {
      if (!room) return null;
      return await checkAvail({ data: { room_type_id: room.id, check_in: checkIn, check_out: checkOut } });
    },
    enabled: !!room && !!checkIn && !!checkOut && checkOut > checkIn,
  });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!room) return;
    setError(null);
    setSubmitting(true);
    try {
      const result = await create({
        data: {
          room_type_id: room.id,
          guest_name: name, guest_email: email, guest_phone: phone,
          guests, rooms_booked: rooms,
          check_in: checkIn, check_out: checkOut,
          payment_option: paymentOption,
          special_requests: requests || null,
        },
      });
      navigate({ to: "/booking/$reference", params: { reference: result.reference } });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create booking.");
    } finally {
      setSubmitting(false);
    }
  }

  if (isLoading) return <SiteLayout><div className="container-page py-24">Loading…</div></SiteLayout>;
  if (!room) return <SiteLayout><div className="container-page py-24">Room not found.</div></SiteLayout>;

  return (
    <SiteLayout>
      <section className="container-page pt-10 pb-6 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <div className="aspect-[16/10] rounded-2xl overflow-hidden shadow-soft">
            <img src={resolveRoomImage(room.images?.[0], room.slug)} alt={room.name} width={1920} height={1200}
              className="h-full w-full object-cover" />
          </div>
          <div className="mt-8">
            <span className="eyebrow">Room</span>
            <h1 className="mt-3 text-4xl md:text-5xl">{room.name}</h1>
            <div className="mt-2 text-sm text-muted-foreground flex flex-wrap gap-x-4">
              <span>{room.bed_type}</span><span>Sleeps {room.max_occupancy}</span>
              {room.size_sqm ? <span>{room.size_sqm} m²</span> : null}
            </div>
            <p className="mt-5 text-muted-foreground leading-relaxed">{room.description}</p>
            <h3 className="mt-8 text-xl">In your room</h3>
            <ul className="mt-3 grid grid-cols-2 gap-y-2 text-sm">
              {room.amenities?.map((a) => (
                <li key={a} className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-brass" />{a}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Booking widget */}
        <aside className="lg:sticky lg:top-24 self-start bg-card rounded-2xl shadow-soft p-6">
          <div className="flex items-baseline justify-between">
            <div>
              <div className="font-display text-3xl text-primary">{formatMoney(room.base_price, symbol)}</div>
              <div className="text-xs text-muted-foreground">per night</div>
            </div>
            {avail && (
              <span className={`text-xs px-2.5 py-1 rounded-full ${avail.units > 0 ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
                {avail.units > 0 ? `${avail.units} unit(s) available` : "Sold out"}
              </span>
            )}
          </div>

          <form className="mt-5 space-y-4" onSubmit={onSubmit}>
            <div className="grid grid-cols-2 gap-3">
              <label className="text-sm">
                <div className="text-muted-foreground mb-1">Check-in</div>
                <input type="date" required value={checkIn} min={todayISO()} onChange={(e) => setCheckIn(e.target.value)}
                  className="w-full h-10 rounded-md border border-input bg-background px-3" />
              </label>
              <label className="text-sm">
                <div className="text-muted-foreground mb-1">Check-out</div>
                <input type="date" required value={checkOut} min={plusDays(checkIn, 1)} onChange={(e) => setCheckOut(e.target.value)}
                  className="w-full h-10 rounded-md border border-input bg-background px-3" />
              </label>
              <label className="text-sm">
                <div className="text-muted-foreground mb-1">Rooms</div>
                <input type="number" min={1} max={5} value={rooms} onChange={(e) => setRooms(Math.max(1, parseInt(e.target.value || "1")))}
                  className="w-full h-10 rounded-md border border-input bg-background px-3" />
              </label>
              <label className="text-sm">
                <div className="text-muted-foreground mb-1">Guests</div>
                <input type="number" min={1} max={room.max_occupancy * rooms} value={guests} onChange={(e) => setGuests(Math.max(1, parseInt(e.target.value || "1")))}
                  className="w-full h-10 rounded-md border border-input bg-background px-3" />
              </label>
            </div>

            <div className="hairline" />

            <div className="space-y-2">
              <input required placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} maxLength={100}
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" />
              <input required type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={255}
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" />
              <input required placeholder="Phone (with country code)" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={30}
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" />
              <textarea placeholder="Special requests (optional)" value={requests} onChange={(e) => setRequests(e.target.value)} maxLength={1000}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" rows={2} />
            </div>

            <div className="hairline" />

            <div>
              <div className="text-sm font-medium mb-2">Payment option</div>
              <div className="space-y-2">
                {([
                  { v: "full", label: `Pay full now`, sub: `${formatMoney(subtotal, symbol)} secured via Paystack` },
                  { v: "deposit", label: `Pay ${depositPct}% deposit`, sub: `${formatMoney(Math.round((subtotal * depositPct) / 100), symbol)} now, balance at hotel` },
                  { v: "at_hotel", label: `Reserve, pay at hotel`, sub: `No card needed today` },
                ] as const).map((o) => (
                  <label key={o.v} className={`flex items-start gap-3 rounded-md border p-3 cursor-pointer text-sm ${paymentOption === o.v ? "border-primary bg-primary/5" : "border-border"}`}>
                    <input type="radio" name="pay" className="mt-0.5" checked={paymentOption === o.v} onChange={() => setPaymentOption(o.v)} />
                    <div>
                      <div className="font-medium">{o.label}</div>
                      <div className="text-muted-foreground">{o.sub}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="hairline" />

            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{nights} night{nights !== 1 ? "s" : ""} × {rooms} room{rooms !== 1 ? "s" : ""}</span>
              <span>{formatMoney(subtotal, symbol)}</span>
            </div>
            <div className="flex justify-between font-medium">
              <span>Due now</span>
              <span className="font-display text-xl text-primary">{formatMoney(dueNow, symbol)}</span>
            </div>

            {error && <div className="text-sm text-destructive bg-destructive/10 rounded-md p-3">{error}</div>}

            <button type="submit" disabled={submitting || (avail?.units ?? 0) < rooms}
              className="w-full h-11 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed">
              {submitting ? "Reserving…" : "Continue to booking"}
            </button>
          </form>
        </aside>
      </section>
    </SiteLayout>
  );
}
