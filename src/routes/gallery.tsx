import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { Reveal } from "@/components/reveal";
import ext1 from "@/assets/ext-1.jpg.asset.json";
import ext2 from "@/assets/ext-2.jpg.asset.json";
import ext3 from "@/assets/ext-3.jpg.asset.json";
import ext4 from "@/assets/ext-4.jpg.asset.json";
import room1 from "@/assets/room-1.jpg.asset.json";
import room2 from "@/assets/room-2.jpg.asset.json";
import room3 from "@/assets/room-3.jpg.asset.json";
import room4 from "@/assets/room-4.jpg.asset.json";
import room5 from "@/assets/room-5.jpg.asset.json";
import room6 from "@/assets/room-6.jpg.asset.json";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Gallery — Mexiloyd Hotel" },
      { name: "description", content: "A look around Mexiloyd Hotel, Port Harcourt." },
      { property: "og:title", content: "Gallery — Mexiloyd Hotel" },
      { property: "og:image", content: ext1.url },
    ],
  }),
  component: GalleryPage,
});

const photos = [
  { src: ext1.url, label: "The Exterior", tall: true },
  { src: room1.url, label: "Guest Room" },
  { src: room3.url, label: "Deluxe Room" },
  { src: ext2.url, label: "Frontage", tall: true },
  { src: room5.url, label: "Executive Suite" },
  { src: room2.url, label: "Guest Room" },
  { src: ext3.url, label: "Grounds" },
  { src: room4.url, label: "Interior" },
  { src: room6.url, label: "Interior" },
  { src: ext4.url, label: "Building" },
];

function GalleryPage() {
  return (
    <SiteLayout>
      <section className="container-page pt-16 pb-8">
        <Reveal>
          <span className="eyebrow">Gallery</span>
          <h1 className="mt-3 text-5xl md:text-6xl">Around the hotel</h1>
          <p className="mt-4 max-w-xl text-muted-foreground">
            A quiet look at Mexiloyd — Port Harcourt. Rooms, common spaces, and the frontage on
            Happyland Close.
          </p>
        </Reveal>
      </section>

      <section className="container-page pb-24">
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 [column-fill:_balance]">
          {photos.map((p, idx) => (
            <Reveal key={idx} delay={(idx % 6) * 0.05} className="mb-4 break-inside-avoid">
              <figure className="group relative overflow-hidden rounded-2xl shadow-soft">
                <img
                  src={p.src}
                  alt={p.label}
                  loading="lazy"
                  className={`w-full object-cover transition-transform duration-[1.2s] group-hover:scale-105 ${p.tall ? "aspect-[3/4]" : "aspect-[4/3]"}`}
                />
                <figcaption className="absolute inset-x-0 bottom-0 p-4 text-[10px] tracking-[0.24em] uppercase text-white/90 bg-gradient-to-t from-black/60 to-transparent">
                  {p.label}
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
