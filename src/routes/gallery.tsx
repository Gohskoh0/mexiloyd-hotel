import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { Reveal } from "@/components/reveal";
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

function GalleryPage() {
  const images = [
    { src: hotelAsset.url, alt: "Mexiloyd Hotel exterior", h: "row-span-2" },
    { src: "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1200&q=80", alt: "Deluxe room" },
    { src: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=1200&q=80", alt: "Lobby seating" },
    { src: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&q=80", alt: "Executive suite", h: "row-span-2" },
    { src: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=80", alt: "Restaurant" },
    { src: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80", alt: "Standard room" },
  ];
  return (
    <SiteLayout>
      <section className="container-page pt-16 pb-8">
        <Reveal>
          <span className="eyebrow">Gallery</span>
          <h1 className="mt-3 text-5xl md:text-6xl">Around the hotel</h1>
        </Reveal>
      </section>
      <section className="container-page pb-24">
        <div className="grid grid-cols-2 md:grid-cols-3 auto-rows-[220px] md:auto-rows-[280px] gap-4">
          {images.map((i, idx) => (
            <Reveal key={idx} delay={idx * 0.06} className={`overflow-hidden rounded-2xl shadow-soft ${i.h ?? ""}`}>
              <img src={i.src} alt={i.alt} loading="lazy"
                className="h-full w-full object-cover hover:scale-110 transition duration-[1.2s]" />
            </Reveal>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
