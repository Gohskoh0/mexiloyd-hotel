import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export function useSettings() {
  return useQuery({
    queryKey: ["app_settings"],
    queryFn: async () => {
      const { data } = await supabase.from("app_settings").select("*").eq("id", 1).maybeSingle();
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function Header() {
  const { data: settings } = useSettings();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const nav = [
    { to: "/", label: "Home" },
    { to: "/rooms", label: "Rooms" },
    { to: "/gallery", label: "Gallery" },
    { to: "/about", label: "About" },
    { to: "/contact", label: "Contact" },
  ] as const;

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-background/90 backdrop-blur border-b border-border" : "bg-transparent"
      }`}
    >
      <div className="container-page flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="size-8 grid place-items-center rounded-full bg-primary text-primary-foreground font-display text-lg">
            L
          </span>
          <span className="font-display text-xl tracking-tight">
            {settings?.hotel_name ?? "LakeWood Hotel"}
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-7 text-sm">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="text-foreground/80 hover:text-foreground transition"
              activeProps={{ className: "text-primary font-medium" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            to="/rooms"
            className="hidden sm:inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition"
          >
            Book a stay
          </Link>
          <button
            className="md:hidden h-10 w-10 grid place-items-center rounded-md border border-border"
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            <span className="i-block">{open ? "✕" : "☰"}</span>
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="container-page py-4 flex flex-col gap-3">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="py-2 text-foreground/80"
                activeProps={{ className: "text-primary font-medium" }}
              >
                {n.label}
              </Link>
            ))}
            <Link
              to="/rooms"
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
            >
              Book a stay
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

export function Footer() {
  const { data: settings } = useSettings();
  return (
    <footer className="mt-24 border-t border-border bg-sand">
      <div className="container-page py-14 grid gap-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="font-display text-2xl">{settings?.hotel_name ?? "LakeWood Hotel"}</div>
          <p className="mt-3 text-sm text-muted-foreground max-w-sm">
            {settings?.tagline ?? "Where the water meets warm hospitality."}
          </p>
        </div>
        <div>
          <div className="eyebrow mb-3">Visit</div>
          <p className="text-sm text-muted-foreground whitespace-pre-line">
            {settings?.address || "Address to be added"}
            {settings?.city ? `\n${settings.city}` : ""}
            {settings?.country ? `, ${settings.country}` : ""}
          </p>
        </div>
        <div>
          <div className="eyebrow mb-3">Contact</div>
          <p className="text-sm text-muted-foreground">
            {settings?.phone || "Phone to be added"}
            <br />
            {settings?.email || "reservations@lakewoodhotel.com"}
          </p>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="container-page py-5 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} {settings?.hotel_name ?? "LakeWood Hotel"}. All rights reserved.</span>
          <Link to="/auth" className="hover:text-foreground">Staff sign in</Link>
        </div>
      </div>
    </footer>
  );
}

export function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-16">{children}</main>
      <Footer />
    </div>
  );
}
