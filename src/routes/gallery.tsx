import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import hero from "@/assets/hero.jpg";
import pool from "@/assets/amenity-pool.jpg";
import dining from "@/assets/amenity-dining.jpg";
import standard from "@/assets/room-standard.jpg";
import deluxe from "@/assets/room-deluxe.jpg";
import executive from "@/assets/room-executive.jpg";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Gallery — LakeWood Hotel" },
      { name: "description", content: "Photos of LakeWood Hotel — rooms, pool, restaurant, and lakeside views." },
      { property: "og:title", content: "Gallery — LakeWood Hotel" },
    ],
  }),
  component: GalleryPage,
});

function GalleryPage() {
  const images = [
    { src: hero, alt: "Hotel exterior at dusk", h: "row-span-2" },
    { src: deluxe, alt: "Deluxe lakeside room" },
    { src: pool, alt: "Infinity pool" },
    { src: executive, alt: "Executive suite lounge", h: "row-span-2" },
    { src: dining, alt: "Restaurant interior" },
    { src: standard, alt: "Standard twin room" },
  ];
  return (
    <SiteLayout>
      <section className="container-page pt-12 pb-6">
        <span className="eyebrow">Gallery</span>
        <h1 className="mt-3 text-5xl md:text-6xl">Around the hotel</h1>
      </section>
      <section className="container-page pb-24">
        <div className="grid grid-cols-2 md:grid-cols-3 auto-rows-[220px] md:auto-rows-[260px] gap-4">
          {images.map((i, idx) => (
            <div key={idx} className={`overflow-hidden rounded-2xl shadow-soft ${i.h ?? ""}`}>
              <img src={i.src} alt={i.alt} loading="lazy"
                className="h-full w-full object-cover hover:scale-105 transition duration-700" />
            </div>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
