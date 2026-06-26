import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/site-layout";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Staff sign in — LakeWood Hotel" }] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null); setMsg(null); setBusy(true);
    try {
      if (mode === "signup") {
        const redirectTo = `${window.location.origin}/admin`;
        const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: redirectTo } });
        if (error) throw error;
        const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
        if (signInErr) { setMsg("Account created. Please sign in."); setMode("signin"); return; }
        navigate({ to: "/admin" });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/admin" });
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Authentication failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <SiteLayout>
      <section className="container-page py-20 max-w-md">
        <span className="eyebrow">Staff area</span>
        <h1 className="mt-3 text-4xl">{mode === "signup" ? "Create admin account" : "Admin sign in"}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {mode === "signup"
            ? "The first account created becomes the hotel admin. Subsequent signups are standard staff accounts."
            : "Sign in to manage rooms, bookings, and payment settings."}
        </p>

        <form onSubmit={submit} className="mt-8 space-y-3 bg-card p-6 rounded-2xl shadow-soft">
          <label className="block text-sm">
            <div className="text-muted-foreground mb-1">Email</div>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full h-10 rounded-md border border-input bg-background px-3" />
          </label>
          <label className="block text-sm">
            <div className="text-muted-foreground mb-1">Password</div>
            <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full h-10 rounded-md border border-input bg-background px-3" />
          </label>
          {err && <div className="text-sm text-destructive bg-destructive/10 rounded-md p-3">{err}</div>}
          {msg && <div className="text-sm text-success bg-success/10 rounded-md p-3">{msg}</div>}
          <button type="submit" disabled={busy}
            className="w-full h-11 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
            {busy ? "Please wait…" : mode === "signup" ? "Create account" : "Sign in"}
          </button>
          <button type="button" onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="w-full text-xs text-muted-foreground hover:text-foreground">
            {mode === "signin" ? "Need an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </form>

        <p className="mt-6 text-xs text-muted-foreground">
          <Link to="/" className="hover:underline">← Back to site</Link>
        </p>
      </section>
    </SiteLayout>
  );
}
