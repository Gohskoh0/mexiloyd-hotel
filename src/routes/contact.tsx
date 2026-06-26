import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, useSettings } from "@/components/site-layout";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — LakeWood Hotel" },
      { name: "description", content: "Reach LakeWood Hotel reservations — address, phone, email, and directions." },
      { property: "og:title", content: "Contact — LakeWood Hotel" },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const { data: settings } = useSettings();
  return (
    <SiteLayout>
      <section className="container-page pt-12 pb-24 grid lg:grid-cols-2 gap-12">
        <div>
          <span className="eyebrow">Get in touch</span>
          <h1 className="mt-3 text-5xl">Contact us</h1>
          <p className="mt-5 text-muted-foreground">
            For reservations, group bookings, or events, reach out and our team will respond within a few hours.
          </p>
          <div className="mt-10 space-y-6">
            <div>
              <div className="eyebrow mb-1">Address</div>
              <p className="whitespace-pre-line">{settings?.address || "Address to be added"}
                {settings?.city ? `\n${settings.city}` : ""}
                {settings?.country ? `, ${settings.country}` : ""}
              </p>
            </div>
            <div>
              <div className="eyebrow mb-1">Phone</div>
              <a href={`tel:${settings?.phone}`} className="hover:underline">{settings?.phone || "—"}</a>
            </div>
            <div>
              <div className="eyebrow mb-1">Email</div>
              <a href={`mailto:${settings?.email}`} className="hover:underline">{settings?.email}</a>
            </div>
            {settings?.whatsapp && (
              <div>
                <div className="eyebrow mb-1">WhatsApp</div>
                <a href={`https://wa.me/${settings.whatsapp.replace(/\D/g, "")}`} className="hover:underline" target="_blank" rel="noreferrer">{settings.whatsapp}</a>
              </div>
            )}
          </div>
        </div>
        <div className="bg-sand rounded-2xl p-8">
          <h2 className="text-2xl">Find us</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {settings?.google_maps_url
              ? <>Open in <a className="text-primary hover:underline" target="_blank" rel="noreferrer" href={settings.google_maps_url}>Google Maps</a></>
              : "Map link will appear here once added in the admin dashboard."}
          </p>
          <div className="mt-6 aspect-square rounded-xl bg-card border border-border grid place-items-center text-muted-foreground text-sm">
            Map preview
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
