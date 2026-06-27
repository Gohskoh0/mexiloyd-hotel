import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, useSettings } from "@/components/site-layout";
import { Reveal } from "@/components/reveal";
import hotelAsset from "@/assets/mexiloyd-hotel.jpg.asset.json";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Mexiloyd Hotel" },
      { name: "description", content: "The story behind Mexiloyd Hotel — a quiet, warm stay near Golf Estate, Port Harcourt." },
      { property: "og:title", content: "About — Mexiloyd Hotel" },
      { property: "og:image", content: hotelAsset.url },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  const { data: settings } = useSettings();
  return (
    <SiteLayout>
      <section className="container-page pt-16 pb-20 grid lg:grid-cols-2 gap-14 items-center">
        <Reveal>
          <span className="eyebrow">Our story</span>
          <h1 className="mt-3 text-5xl md:text-6xl">A quiet hotel, close to the heart of Port Harcourt.</h1>
          <p className="mt-6 text-muted-foreground leading-relaxed">
            {settings?.hotel_name ?? "Mexiloyd"} was built around a simple idea: that the best stays
            feel less like a hotel and more like a long exhale. Tucked away on Happyland Close near
            Golf Estate, we sit just minutes from the city's rhythm — but far enough to rest properly.
          </p>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Every room is finished with warm wood, soft linens, and brass detail. Our team is small
            and our service is personal — we'd rather know your name than your room number.
          </p>
        </Reveal>
        <Reveal delay={0.15}>
          <img src={hotelAsset.url} alt="Mexiloyd Hotel" loading="lazy"
            className="aspect-[4/5] w-full object-cover rounded-2xl shadow-lift" />
        </Reveal>
      </section>

      <section className="bg-sand py-24">
        <div className="container-page grid md:grid-cols-3 gap-10">
          {[
            ["Warm hospitality", "A small, attentive team that remembers your preferences."],
            ["Quiet setting", "Tucked into a residential close, away from the city noise."],
            ["Honest comfort", "Quiet rooms, good beds, real food — nothing extra, nothing missing."],
          ].map(([t, d], i) => (
            <Reveal key={t} delay={i * 0.1}>
              <h3 className="text-2xl">{t}</h3>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{d}</p>
            </Reveal>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
