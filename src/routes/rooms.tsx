import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout, useSettings } from "@/components/site-layout";
import { resolveRoomImage } from "@/lib/room-images";
import { formatMoney } from "@/lib/format";

export const Route = createFileRoute("/rooms")({
  head: () => ({
    meta: [
      { title: "Rooms & Suites — LakeWood Hotel" },
      { name: "description", content: "Browse Lakeside Standard, Deluxe, and Executive Suite rooms at LakeWood Hotel. Real-time availability and secure booking." },
      { property: "og:title", content: "Rooms & Suites — LakeWood Hotel" },
      { property: "og:description", content: "Choose your lakeside room and reserve in seconds." },
    ],
  }),
  component: RoomsPage,
});

function RoomsPage() {
  const { data: settings } = useSettings();
  const symbol = settings?.currency_symbol ?? "₦";
  const { data: rooms, isLoading } = useQuery({
    queryKey: ["rooms-all"],
    queryFn: async () => {
      const { data } = await supabase
        .from("room_types").select("*").eq("is_active", true).order("sort_order");
      return data ?? [];
    },
  });

  return (
    <SiteLayout>
      <section className="container-page pt-12 pb-8">
        <span className="eyebrow">Stay with us</span>
        <h1 className="mt-3 text-5xl md:text-6xl">Rooms & suites</h1>
        <p className="mt-4 max-w-xl text-muted-foreground">
          Each room is designed with rest in mind — quiet, warm, and arranged around the lake.
        </p>
      </section>

      <section className="container-page pb-24 space-y-10">
        {isLoading && <p className="text-muted-foreground">Loading rooms…</p>}
        {rooms?.map((r, i) => (
          <article key={r.id} className={`grid gap-8 md:grid-cols-2 items-center ${i % 2 ? "md:[direction:rtl]" : ""}`}>
            <div className="md:[direction:ltr] aspect-[4/3] rounded-2xl overflow-hidden shadow-soft">
              <img src={resolveRoomImage(r.images?.[0])} alt={r.name} width={1280} height={960} loading="lazy"
                className="h-full w-full object-cover" />
            </div>
            <div className="md:[direction:ltr]">
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="text-3xl md:text-4xl">{r.name}</h2>
                <div className="text-right shrink-0">
                  <div className="font-display text-2xl text-primary">{formatMoney(r.base_price, symbol)}</div>
                  <div className="text-xs text-muted-foreground">per night</div>
                </div>
              </div>
              <div className="mt-2 text-sm text-muted-foreground flex flex-wrap gap-x-4 gap-y-1">
                <span>{r.bed_type}</span>
                <span>Sleeps {r.max_occupancy}</span>
                {r.size_sqm ? <span>{r.size_sqm} m²</span> : null}
              </div>
              <p className="mt-4 text-muted-foreground leading-relaxed">{r.description}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {r.amenities?.slice(0, 6).map((a) => (
                  <span key={a} className="text-xs px-3 py-1 rounded-full bg-secondary text-secondary-foreground">{a}</span>
                ))}
              </div>
              <div className="mt-6">
                <Link to="/rooms/$slug" params={{ slug: r.slug }}
                  className="inline-flex h-11 items-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                  View & book
                </Link>
              </div>
            </div>
          </article>
        ))}
      </section>
    </SiteLayout>
  );
}
