import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, useSettings } from "@/components/site-layout";
import { Reveal } from "@/components/reveal";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Mexiloyd Hotel" },
      { name: "description", content: "Reach Mexiloyd Hotel reservations — call +234 803 716 5381 or visit us at 10 Happyland Close, Okuruama, Port Harcourt." },
      { property: "og:title", content: "Contact — Mexiloyd Hotel" },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const { data: settings } = useSettings();
  const phone = settings?.phone ?? "+2348037165381";
  const mapsQuery = encodeURIComponent(
    `${settings?.address ?? "10 Happyland Close, Okuruama"}, ${settings?.city ?? "Port Harcourt"}`
  );
  return (
    <SiteLayout>
      <section className="container-page pt-16 pb-24 grid lg:grid-cols-2 gap-14">
        <Reveal>
          <span className="eyebrow">Get in touch</span>
          <h1 className="mt-3 text-5xl md:text-6xl">Contact us</h1>
          <p className="mt-5 text-muted-foreground leading-relaxed max-w-md">
            For reservations, group bookings, or directions — call us directly. Our front desk is staffed 24/7.
          </p>
          <div className="mt-12 space-y-8">
            <div>
              <div className="eyebrow mb-2">Address</div>
              <p className="text-lg leading-relaxed">
                {settings?.address || "10 Happyland Close, near Golf Estate, Okuruama"}
                <br />
                {settings?.city ?? "Port Harcourt"}, {settings?.country ?? "Rivers, Nigeria"}
              </p>
            </div>
            <div>
              <div className="eyebrow mb-2">Phone</div>
              <a href={`tel:${phone}`} className="font-display text-3xl hover:text-primary transition">
                {phone}
              </a>
            </div>
            {settings?.whatsapp && (
              <div>
                <div className="eyebrow mb-2">WhatsApp</div>
                <a href={`https://wa.me/${settings.whatsapp.replace(/\D/g, "")}`} className="hover:text-primary transition" target="_blank" rel="noreferrer">
                  Message us on WhatsApp →
                </a>
              </div>
            )}
            <div className="flex gap-8 pt-4 border-t border-border">
              <div>
                <div className="eyebrow mb-1">Check-in</div>
                <div className="font-display text-2xl">{settings?.check_in_time ?? "14:00"}</div>
              </div>
              <div>
                <div className="eyebrow mb-1">Check-out</div>
                <div className="font-display text-2xl">{settings?.check_out_time ?? "12:00"}</div>
              </div>
            </div>
          </div>
        </Reveal>
        <Reveal delay={0.15}>
          <div className="rounded-2xl overflow-hidden shadow-lift aspect-square">
            <iframe
              title="Mexiloyd Hotel location"
              src={`https://www.google.com/maps?q=${mapsQuery}&output=embed`}
              className="w-full h-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${mapsQuery}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-11 items-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition"
            >
              Get directions →
            </a>
            <a
              href={settings?.google_maps_url ?? `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-11 items-center rounded-full border border-border px-6 text-sm hover:bg-secondary transition"
            >
              Open in Google Maps
            </a>
          </div>
        </Reveal>
      </section>
    </SiteLayout>
  );
}
