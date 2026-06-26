import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout, useSettings } from "@/components/site-layout";
import { resolveRoomImage } from "@/lib/room-images";
import { formatMoney } from "@/lib/format";
import heroImg from "@/assets/hero.jpg";
import poolImg from "@/assets/amenity-pool.jpg";
import diningImg from "@/assets/amenity-dining.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LakeWood Hotel — Lakeside stays, warm hospitality" },
      { name: "description", content: "Book a lakeside room at LakeWood Hotel. Choose from Standard, Deluxe, and Executive Lake Suites with secure Paystack checkout." },
      { property: "og:title", content: "LakeWood Hotel" },
      { property: "og:description", content: "Where the water meets warm hospitality." },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const { data: settings } = useSettings();
  const symbol = settings?.currency_symbol ?? "₦";
  const { data: rooms } = useQuery({
    queryKey: ["rooms-active"],
    queryFn: async () => {
      const { data } = await supabase
        .from("room_types").select("*").eq("is_active", true).order("sort_order");
      return data ?? [];
    },
  });

  return (
    <SiteLayout>
      {/* Hero */}
      <section className="relative -mt-16 h-[100svh] min-h-[640px] w-full overflow-hidden">
        <img src={heroImg} alt="LakeWood Hotel at dusk" width={1920} height={1280}
          className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/30 via-primary/20 to-primary/70" />
        <div className="relative z-10 container-page h-full flex flex-col justify-end pb-24">
          <span className="eyebrow text-brass">{settings?.city || "On the lake"}</span>
          <h1 className="mt-3 max-w-3xl font-display text-5xl md:text-7xl text-primary-foreground leading-[1.05]">
            {settings?.hotel_name ?? "LakeWood Hotel"}
          </h1>
          <p className="mt-5 max-w-xl text-lg text-primary-foreground/90">
            {settings?.tagline ?? "Where the water meets warm hospitality."}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/rooms" className="inline-flex h-12 items-center rounded-md bg-brass px-6 text-sm font-medium text-brass-foreground hover:bg-brass/90 transition">
              Book your stay
            </Link>
            <Link to="/about" className="inline-flex h-12 items-center rounded-md border border-primary-foreground/40 bg-transparent px-6 text-sm font-medium text-primary-foreground hover:bg-primary-foreground/10 transition">
              Discover the hotel
            </Link>
          </div>
        </div>
      </section>

      {/* Intro */}
      <section className="container-page py-20 md:py-28 grid gap-10 md:grid-cols-2 items-center">
        <div>
          <span className="eyebrow">Welcome</span>
          <h2 className="mt-3 text-4xl md:text-5xl">An unhurried lakeside escape</h2>
          <p className="mt-5 text-muted-foreground leading-relaxed">
            Set on the quiet edge of the lake, our rooms balance warm wood, soft linens, and brass-finished
            detail. Wake to mist over the water, take breakfast on the terrace, and let the day settle slowly.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-6 text-center">
            <div><div className="font-display text-3xl text-primary">17</div><div className="text-xs text-muted-foreground mt-1">Rooms & suites</div></div>
            <div><div className="font-display text-3xl text-primary">24/7</div><div className="text-xs text-muted-foreground mt-1">Concierge</div></div>
            <div><div className="font-display text-3xl text-primary">★ 4.8</div><div className="text-xs text-muted-foreground mt-1">Guest rating</div></div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <img src={poolImg} alt="Infinity pool at dusk" width={1280} height={960} loading="lazy"
            className="aspect-[4/5] w-full object-cover rounded-2xl shadow-soft" />
          <img src={diningImg} alt="Restaurant with lake view" width={1280} height={960} loading="lazy"
            className="aspect-[4/5] w-full object-cover rounded-2xl shadow-soft mt-10" />
        </div>
      </section>

      {/* Rooms preview */}
      <section className="bg-sand py-20 md:py-28">
        <div className="container-page">
          <div className="flex items-end justify-between flex-wrap gap-4 mb-12">
            <div>
              <span className="eyebrow">Accommodations</span>
              <h2 className="mt-3 text-4xl md:text-5xl">Rooms & suites</h2>
            </div>
            <Link to="/rooms" className="text-sm text-primary hover:underline">View all rooms →</Link>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {rooms?.map((r) => (
              <Link key={r.id} to="/rooms/$slug" params={{ slug: r.slug }}
                className="group bg-card rounded-2xl overflow-hidden shadow-soft hover:shadow-lift transition">
                <div className="aspect-[4/3] overflow-hidden">
                  <img src={resolveRoomImage(r.images?.[0])} alt={r.name} width={1280} height={960} loading="lazy"
                    className="h-full w-full object-cover group-hover:scale-105 transition duration-700" />
                </div>
                <div className="p-6">
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="text-2xl">{r.name}</h3>
                    <div className="text-right">
                      <div className="font-display text-xl text-primary">{formatMoney(r.base_price, symbol)}</div>
                      <div className="text-xs text-muted-foreground">/ night</div>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{r.short_description}</p>
                  <div className="mt-4 text-xs text-muted-foreground flex gap-4">
                    <span>{r.bed_type}</span><span>•</span><span>Sleeps {r.max_occupancy}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container-page py-20 md:py-28 text-center">
        <span className="eyebrow">Reserve your stay</span>
        <h2 className="mt-3 text-4xl md:text-5xl max-w-2xl mx-auto">Ready when you are</h2>
        <p className="mt-5 max-w-xl mx-auto text-muted-foreground">
          Pay in full, leave a {settings?.deposit_percent ?? 30}% deposit, or reserve and pay at the hotel —
          your choice at checkout.
        </p>
        <Link to="/rooms" className="mt-8 inline-flex h-12 items-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          Check availability
        </Link>
      </section>
    </SiteLayout>
  );
}
