import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { Reveal, BrandPanel } from "@/components/reveal";
import hotelAsset from "@/assets/mexiloyd-hotel.jpg.asset.json";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Gallery — Mexiloyd Hotel" },
      { name: "description", content: "A look around Mexiloyd Hotel, Port Harcourt." },
      { property: "og:title", content: "Gallery — Mexiloyd Hotel" },
      { property: "og:image", content: hotelAsset.url },
    ],
  }),
  component: GalleryPage,
});

const tiles = [
  { label: "Guest Rooms" },
  { label: "The Suite" },
  { label: "Dining" },
  { label: "Front Desk" },
  { label: "Bar & Lounge" },
];

function GalleryPage() {
  return (
    <SiteLayout>
      <section className="container-page pt-16 pb-8">
        <Reveal>
          <span className="eyebrow">Gallery</span>
          <h1 className="mt-3 text-5xl md:text-6xl">Around the hotel</h1>
          <p className="mt-4 max-w-xl text-muted-foreground">
            A quiet look at Mexiloyd — Port Harcourt. Fresh photography is being commissioned; in the
            meantime, our façade and a set of editorial cards set the tone.
          </p>
        </Reveal>
      </section>

      <section className="container-page pb-24">
        <Reveal className="rounded-2xl overflow-hidden shadow-soft mb-6">
          <img
            src={hotelAsset.url}
            alt="Mexiloyd Hotel façade"
            width={1920}
            height={1200}
            loading="lazy"
            className="w-full h-[60vh] object-cover"
          />
        </Reveal>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {tiles.map((t, idx) => (
            <Reveal key={t.label} delay={idx * 0.06} className="rounded-2xl overflow-hidden shadow-soft">
              <BrandPanel label={t.label} className="aspect-[4/3] w-full" />
            </Reveal>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
