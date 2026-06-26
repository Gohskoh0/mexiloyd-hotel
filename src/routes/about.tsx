import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, useSettings } from "@/components/site-layout";
import heroImg from "@/assets/hero.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — LakeWood Hotel" },
      { name: "description", content: "Our story, our setting, and what makes LakeWood Hotel a calm lakeside escape." },
      { property: "og:title", content: "About — LakeWood Hotel" },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  const { data: settings } = useSettings();
  return (
    <SiteLayout>
      <section className="container-page pt-12 pb-20 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <span className="eyebrow">Our story</span>
          <h1 className="mt-3 text-5xl">A quiet hotel at the water's edge</h1>
          <p className="mt-5 text-muted-foreground leading-relaxed">
            {settings?.hotel_name ?? "LakeWood Hotel"} was built around a simple idea: that the best stays
            feel less like a hotel and more like a long exhale. Mornings begin with mist over the lake,
            afternoons drift between the terrace and the pool, and evenings end slowly over warm food and
            quiet conversation.
          </p>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Every room is finished with warm wood, soft sand-tone linens, and brass detail. Our team is small
            and our service is personal — we'd rather know your name than your room number.
          </p>
        </div>
        <img src={heroImg} alt="Hotel at dusk" width={1920} height={1280} loading="lazy"
          className="aspect-[4/5] w-full object-cover rounded-2xl shadow-soft" />
      </section>

      <section className="bg-sand py-20">
        <div className="container-page grid md:grid-cols-3 gap-8 text-center">
          {[
            ["Warm hospitality", "A small, attentive team that remembers your preferences."],
            ["Lakeside setting", "Direct views and easy access to the water from every wing."],
            ["Honest comfort", "Quiet rooms, good beds, real food — nothing extra, nothing missing."],
          ].map(([t, d]) => (
            <div key={t}>
              <h3 className="text-2xl">{t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
