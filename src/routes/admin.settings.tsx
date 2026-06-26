import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { updateSettingsAdmin } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin/settings")({
  component: SettingsPage,
});

type Settings = {
  hotel_name: string; tagline: string; address: string; city: string; country: string;
  phone: string; email: string; whatsapp: string; google_maps_url: string;
  currency: string; currency_symbol: string; deposit_percent: number;
};

function SettingsPage() {
  const qc = useQueryClient();
  const update = useServerFn(updateSettingsAdmin);
  const [form, setForm] = useState<Settings | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [pwMsg, setPwMsg] = useState<string | null>(null);
  const [pwErr, setPwErr] = useState<string | null>(null);
  const [newPw, setNewPw] = useState("");
  const [newEmail, setNewEmail] = useState("");

  const q = useQuery({
    queryKey: ["app_settings"],
    queryFn: async () => {
      const { data } = await supabase.from("app_settings").select("*").eq("id", 1).maybeSingle();
      return data;
    },
  });

  useEffect(() => {
    if (q.data && !form) {
      setForm({
        hotel_name: q.data.hotel_name ?? "",
        tagline: q.data.tagline ?? "",
        address: q.data.address ?? "",
        city: q.data.city ?? "",
        country: q.data.country ?? "",
        phone: q.data.phone ?? "",
        email: q.data.email ?? "",
        whatsapp: q.data.whatsapp ?? "",
        google_maps_url: q.data.google_maps_url ?? "",
        currency: q.data.currency ?? "NGN",
        currency_symbol: q.data.currency_symbol ?? "₦",
        deposit_percent: q.data.deposit_percent ?? 30,
      });
    }
  }, [q.data, form]);

  const save = useMutation({
    mutationFn: (v: Settings) => update({ data: v }),
    onSuccess: () => { setMsg("Settings saved."); qc.invalidateQueries({ queryKey: ["app_settings"] }); },
  });

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwErr(null); setPwMsg(null);
    const updates: { password?: string; email?: string } = {};
    if (newPw) updates.password = newPw;
    if (newEmail) updates.email = newEmail;
    if (!updates.password && !updates.email) return;
    const { error } = await supabase.auth.updateUser(updates);
    if (error) setPwErr(error.message);
    else { setPwMsg("Account updated."); setNewPw(""); setNewEmail(""); }
  }

  if (!form) return <p className="text-muted-foreground">Loading…</p>;

  const set = <K extends keyof Settings>(k: K, v: Settings[K]) => setForm((p) => p ? { ...p, [k]: v } : p);

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-3xl font-display">Hotel settings</h1>
        <p className="text-sm text-muted-foreground">Brand details shown across the public site.</p>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); setMsg(null); save.mutate(form); }}
        className="bg-card rounded-2xl shadow-soft p-6 grid sm:grid-cols-2 gap-3 text-sm">
        <F label="Hotel name"><input className="input" value={form.hotel_name} onChange={(e) => set("hotel_name", e.target.value)} /></F>
        <F label="Tagline"><input className="input" value={form.tagline} onChange={(e) => set("tagline", e.target.value)} /></F>
        <F label="Address" className="sm:col-span-2"><input className="input" value={form.address} onChange={(e) => set("address", e.target.value)} /></F>
        <F label="City"><input className="input" value={form.city} onChange={(e) => set("city", e.target.value)} /></F>
        <F label="Country"><input className="input" value={form.country} onChange={(e) => set("country", e.target.value)} /></F>
        <F label="Phone"><input className="input" value={form.phone} onChange={(e) => set("phone", e.target.value)} /></F>
        <F label="Email"><input className="input" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} /></F>
        <F label="WhatsApp"><input className="input" value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} /></F>
        <F label="Google Maps URL"><input className="input" value={form.google_maps_url} onChange={(e) => set("google_maps_url", e.target.value)} /></F>
        <F label="Currency code"><input className="input" value={form.currency} onChange={(e) => set("currency", e.target.value.toUpperCase())} /></F>
        <F label="Currency symbol"><input className="input" value={form.currency_symbol} onChange={(e) => set("currency_symbol", e.target.value)} /></F>
        <F label="Deposit percent (%)"><input className="input" type="number" min={0} max={100} value={form.deposit_percent} onChange={(e) => set("deposit_percent", +e.target.value)} /></F>
        {msg && <div className="sm:col-span-2 text-sm text-success bg-success/10 rounded-md p-3">{msg}</div>}
        {save.error && <div className="sm:col-span-2 text-sm text-destructive bg-destructive/10 rounded-md p-3">{save.error.message}</div>}
        <div className="sm:col-span-2 flex justify-end">
          <button type="submit" disabled={save.isPending} className="h-10 px-5 rounded-md bg-primary text-primary-foreground disabled:opacity-50">
            {save.isPending ? "Saving…" : "Save settings"}
          </button>
        </div>
        <style>{`.input{height:2.5rem;width:100%;border:1px solid var(--color-input);background:var(--color-background);border-radius:.375rem;padding:0 .75rem;font-size:.875rem}`}</style>
      </form>

      <form onSubmit={changePassword} className="bg-card rounded-2xl shadow-soft p-6 space-y-3 text-sm">
        <h2 className="text-xl font-display">Your account</h2>
        <p className="text-xs text-muted-foreground">Update your sign-in email or password.</p>
        <label className="block">
          <div className="text-muted-foreground mb-1">New email</div>
          <input className="h-10 w-full rounded-md border border-input bg-background px-3" type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
        </label>
        <label className="block">
          <div className="text-muted-foreground mb-1">New password</div>
          <input className="h-10 w-full rounded-md border border-input bg-background px-3" type="password" minLength={6} value={newPw} onChange={(e) => setNewPw(e.target.value)} />
        </label>
        {pwMsg && <div className="text-sm text-success bg-success/10 rounded-md p-3">{pwMsg}</div>}
        {pwErr && <div className="text-sm text-destructive bg-destructive/10 rounded-md p-3">{pwErr}</div>}
        <div className="flex justify-end">
          <button type="submit" className="h-10 px-5 rounded-md bg-primary text-primary-foreground">Update account</button>
        </div>
      </form>
    </div>
  );
}

function F({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return <label className={`block ${className}`}><div className="text-xs text-muted-foreground mb-1">{label}</div>{children}</label>;
}
