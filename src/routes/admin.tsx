import { createFileRoute, Link, Outlet, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — LakeWood Hotel" }] }),
  beforeLoad: async () => {
    if (typeof window === "undefined") return;
    const { data } = await supabase.auth.getSession();
    if (!data.session) throw redirect({ to: "/auth" });
  },
  component: AdminLayout,
});

function AdminLayout() {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  }

  const links = [
    { to: "/admin", label: "Overview", end: true },
    { to: "/admin/bookings", label: "Bookings" },
    { to: "/admin/rooms", label: "Rooms" },
    { to: "/admin/payments", label: "Payments" },
    { to: "/admin/settings", label: "Settings" },
  ] as const;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container-page h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="font-display text-lg">LakeWood · Admin</Link>
            <nav className="hidden md:flex items-center gap-5 text-sm">
              {links.map((l) => (
                <Link key={l.to} to={l.to} activeOptions={{ exact: !!l.end }}
                  className="text-foreground/70 hover:text-foreground"
                  activeProps={{ className: "text-primary font-medium" }}>
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-muted-foreground hidden sm:inline">{email}</span>
            <button onClick={signOut} className="h-9 px-3 rounded-md border border-border hover:bg-accent">Sign out</button>
          </div>
        </div>
      </header>
      <main className="container-page py-8">
        <Outlet />
      </main>
    </div>
  );
}
