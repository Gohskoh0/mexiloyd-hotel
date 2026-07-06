import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout, useSettings } from "@/components/site-layout";
import { Reveal } from "@/components/reveal";
import { resolveRoomImage } from "@/lib/room-images";
import { formatMoney } from "@/lib/format";
import ext1 from "@/assets/ext-1.jpg.asset.json";
import ext2 from "@/assets/ext-2.jpg.asset.json";
import room3 from "@/assets/room-3.jpg.asset.json";

const hero = ext1.url;

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Mexiloyd — A quiet retreat in Port Harcourt" },
      { name: "description", content: "Mexiloyd Hotel, Port Harcourt. Comfortable rooms from ₦20,000. Book direct with secure Paystack checkout." },
      { property: "og:title", content: "Mexiloyd Hotel" },
      { property: "og:description", content: "A quiet retreat in the heart of Port Harcourt." },
      { property: "og:image", content: hero },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const { data: settings } = useSettings();
  const symbol = settings?.currency_symbol ?? "₦";
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.12]);

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
      <section ref={heroRef} className="relative -mt-16 h-[100svh] min-h-[640px] w-full overflow-hidden">
        <motion.img
          src={settings?.hero_image_url ?? hero}
          alt="Mexiloyd Hotel exterior"
          style={{ y: heroY, scale: heroScale }}
          className="absolute inset-0 h-[115%] w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/80" />
        <div className="relative z-10 container-page h-full flex flex-col justify-end pb-20 md:pb-28">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="eyebrow text-brass"
          >
            {settings?.city || "Port Harcourt"} · Rivers, Nigeria
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="mt-4 max-w-4xl font-display text-5xl md:text-7xl lg:text-8xl text-white leading-[1.02]"
          >
            {settings?.hotel_name ?? "Mexiloyd"}
            <span className="block text-brass italic font-normal text-3xl md:text-4xl lg:text-5xl mt-3">
              {settings?.tagline ?? "A quiet retreat in the heart of Port Harcourt."}
            </span>
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <Link to="/rooms" className="group relative inline-flex h-12 items-center overflow-hidden rounded-full bg-brass px-7 text-sm font-medium text-brass-foreground transition hover:shadow-lift">
              <span className="relative z-10">Reserve your stay</span>
              <span className="absolute inset-0 -translate-x-full bg-white/20 transition-transform duration-500 group-hover:translate-x-0" />
            </Link>
            <Link to="/about" className="inline-flex h-12 items-center rounded-full border border-white/40 px-7 text-sm font-medium text-white backdrop-blur-sm hover:bg-white/10 transition">
              Discover the hotel
            </Link>
          </motion.div>

          {/* Hero meta */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl text-white/90"
          >
            {[
              ["From", `${symbol}20,000`],
              ["Check-in", settings?.check_in_time ?? "14:00"],
              ["Check-out", settings?.check_out_time ?? "12:00"],
              ["Direct line", settings?.phone ?? "+234 803 716 5381"],
            ].map(([k, v]) => (
              <div key={k} className="border-l border-white/30 pl-4">
                <div className="text-[10px] uppercase tracking-[0.18em] text-white/60">{k}</div>
                <div className="mt-1 font-display text-lg">{v}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* scroll cue */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/70 text-xs tracking-widest"
        >
          SCROLL
        </motion.div>
      </section>

      {/* Intro */}
      <section className="container-page py-24 md:py-32 grid gap-14 md:grid-cols-2 items-center">
        <Reveal>
          <span className="eyebrow">Welcome</span>
          <h2 className="mt-3 text-4xl md:text-5xl">An unhurried stay, close to everything you need.</h2>
          <p className="mt-5 text-muted-foreground leading-relaxed">
            Mexiloyd sits on a quiet close near Golf Estate in Okuruama — minutes from the
            city's main routes, yet wrapped in calm. Our rooms balance warm wood, soft linens,
            and brass-finished detail, designed so you can sleep, work, and reset.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-6">
            {[
              ["17", "Rooms & suites"],
              ["24/7", "Front desk"],
              ["★ 4.8", "Guest rating"],
            ].map(([n, l]) => (
              <div key={l}>
                <div className="font-display text-4xl text-primary">{n}</div>
                <div className="text-xs text-muted-foreground mt-1 tracking-wide">{l}</div>
              </div>
            ))}
          </div>
        </Reveal>
        <Reveal delay={0.15} className="grid grid-cols-2 gap-4">
          <img src={ext2.url} alt="Mexiloyd hotel façade" loading="lazy" width={800} height={1000}
            className="aspect-[4/5] w-full object-cover rounded-2xl shadow-soft" />
          <img src={room3.url} alt="A Mexiloyd guest room" loading="lazy" width={800} height={1000}
            className="aspect-[4/5] w-full object-cover rounded-2xl shadow-soft mt-10" />
        </Reveal>
      </section>

      {/* Rooms */}
      <section className="bg-sand py-24 md:py-32">
        <div className="container-page">
          <div className="flex items-end justify-between flex-wrap gap-4 mb-14">
            <Reveal>
              <span className="eyebrow">Accommodations</span>
              <h2 className="mt-3 text-4xl md:text-5xl">Rooms & suites</h2>
              <p className="mt-3 text-muted-foreground max-w-md">
                From the cosy Standard to the spacious Executive Suite — every room is yours, fully.
              </p>
            </Reveal>
            <Link to="/rooms" className="story-link text-sm text-primary">View all rooms →</Link>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {rooms?.map((r, i) => (
              <Reveal key={r.id} delay={i * 0.08}>
                <Link to="/rooms/$slug" params={{ slug: r.slug }}
                  className="group block bg-card rounded-2xl overflow-hidden shadow-soft hover:shadow-lift transition-all duration-500 hover:-translate-y-1">
                  <div className="aspect-[4/3] overflow-hidden">
                    <img src={resolveRoomImage(r.images?.[0], r.slug)} alt={r.name} loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-[1.2s] group-hover:scale-110" />
                  </div>
                  <div className="p-6">
                    <div className="flex items-baseline justify-between gap-3">
                      <h3 className="text-2xl">{r.name}</h3>
                      <div className="text-right">
                        <div className="font-display text-xl text-primary">{formatMoney(r.base_price, symbol)}</div>
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">per night</div>
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{r.short_description}</p>
                    <div className="mt-4 text-xs text-muted-foreground flex gap-3">
                      <span>{r.bed_type}</span><span>•</span><span>Sleeps {r.max_occupancy}</span>
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Hours / contact band */}
      <section className="container-page py-24 md:py-28">
        <div className="rounded-3xl bg-primary text-primary-foreground p-10 md:p-16 grid md:grid-cols-3 gap-10 overflow-hidden relative">
          <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-brass/20 blur-3xl" />
          <Reveal className="relative">
            <div className="eyebrow text-brass">Arrival</div>
            <div className="mt-3 font-display text-5xl">{settings?.check_in_time ?? "14:00"}</div>
            <p className="mt-2 text-sm text-primary-foreground/70">Check-in from</p>
          </Reveal>
          <Reveal delay={0.1} className="relative">
            <div className="eyebrow text-brass">Departure</div>
            <div className="mt-3 font-display text-5xl">{settings?.check_out_time ?? "12:00"}</div>
            <p className="mt-2 text-sm text-primary-foreground/70">Check-out by</p>
          </Reveal>
          <Reveal delay={0.2} className="relative">
            <div className="eyebrow text-brass">Reservations</div>
            <a href={`tel:${settings?.phone ?? "+2348037165381"}`}
              className="mt-3 block font-display text-3xl hover:text-brass transition">
              {settings?.phone ?? "+234 803 716 5381"}
            </a>
            <p className="mt-2 text-sm text-primary-foreground/70">Speak with the front desk, anytime.</p>
          </Reveal>
        </div>
      </section>

      {/* CTA */}
      <section className="container-page pb-28 text-center">
        <Reveal>
          <span className="eyebrow">Reserve your stay</span>
          <h2 className="mt-3 text-4xl md:text-5xl max-w-2xl mx-auto">Ready when you are</h2>
          <p className="mt-5 max-w-xl mx-auto text-muted-foreground">
            Pay in full, leave a {settings?.deposit_percent ?? 30}% deposit, or reserve and pay at the hotel —
            your choice at checkout.
          </p>
          <Link to="/rooms" className="mt-8 inline-flex h-12 items-center rounded-full bg-primary px-8 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition">
            Check availability
          </Link>
        </Reveal>
      </section>
    </SiteLayout>
  );
}
