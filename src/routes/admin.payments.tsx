import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { getPaystackStatus, updatePaystackSettings, clearPaystackKeys } from "@/lib/paystack.functions";

export const Route = createFileRoute("/admin/payments")({
  component: PaymentsPage,
});

function PaymentsPage() {
  const qc = useQueryClient();
  const status = useServerFn(getPaystackStatus);
  const update = useServerFn(updatePaystackSettings);
  const clear = useServerFn(clearPaystackKeys);

  const q = useQuery({ queryKey: ["paystack-status"], queryFn: () => status() });

  const [publicKey, setPublicKey] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [mode, setMode] = useState<"test" | "live">("test");
  const [msg, setMsg] = useState<string | null>(null);

  const save = useMutation({
    mutationFn: () => update({ data: { public_key: publicKey || undefined, secret_key: secretKey || undefined, mode } }),
    onSuccess: () => {
      setMsg("Saved. Secret keys are write-only and cannot be retrieved.");
      setPublicKey(""); setSecretKey("");
      qc.invalidateQueries({ queryKey: ["paystack-status"] });
      qc.invalidateQueries({ queryKey: ["paystack-cfg"] });
    },
  });

  const clearMut = useMutation({
    mutationFn: () => clear(),
    onSuccess: () => { setMsg("Keys cleared."); qc.invalidateQueries({ queryKey: ["paystack-status"] }); qc.invalidateQueries({ queryKey: ["paystack-cfg"] }); },
  });

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-display">Paystack keys</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Paste your Paystack public &amp; secret keys to enable online payments. For security, saved keys are
          <strong> never displayed in the dashboard</strong> — only a status indicator and (for the public key)
          a masked preview.
        </p>
      </div>

      <div className="bg-card rounded-2xl shadow-soft p-6 space-y-2 text-sm">
        <Row label="Mode" value={q.data?.mode ?? "—"} />
        <Row label="Public key" value={q.data?.hasPublicKey ? q.data.publicKeyPreview ?? "set" : "not set"} ok={q.data?.hasPublicKey} />
        <Row label="Secret key" value={q.data?.hasSecretKey ? "•••••• (write-only)" : "not set"} ok={q.data?.hasSecretKey} />
        <Row label="Last updated" value={q.data?.updatedAt ? new Date(q.data.updatedAt).toLocaleString() : "—"} />
      </div>

      <form className="bg-card rounded-2xl shadow-soft p-6 space-y-4"
        onSubmit={(e) => { e.preventDefault(); setMsg(null); save.mutate(); }}>
        <h2 className="text-xl font-display">Update keys</h2>
        <p className="text-xs text-muted-foreground">Leave a field blank to keep the existing value.</p>

        <label className="block text-sm">
          <div className="text-muted-foreground mb-1">Mode</div>
          <select value={mode} onChange={(e) => setMode(e.target.value as "test" | "live")}
            className="h-10 w-full rounded-md border border-input bg-background px-3">
            <option value="test">Test</option><option value="live">Live</option>
          </select>
        </label>

        <label className="block text-sm">
          <div className="text-muted-foreground mb-1">Public key</div>
          <input type="password" autoComplete="off" placeholder="pk_…" value={publicKey} onChange={(e) => setPublicKey(e.target.value)}
            className="h-10 w-full rounded-md border border-input bg-background px-3 font-mono" />
        </label>

        <label className="block text-sm">
          <div className="text-muted-foreground mb-1">Secret key</div>
          <input type="password" autoComplete="off" placeholder="sk_…" value={secretKey} onChange={(e) => setSecretKey(e.target.value)}
            className="h-10 w-full rounded-md border border-input bg-background px-3 font-mono" />
          <div className="text-xs text-muted-foreground mt-1">
            This secret is stored server-side and is never returned by the API. Once saved, you can only replace it — not view it.
          </div>
        </label>

        {save.error && <div className="text-sm text-destructive bg-destructive/10 rounded-md p-3">{save.error.message}</div>}
        {msg && <div className="text-sm text-success bg-success/10 rounded-md p-3">{msg}</div>}

        <div className="flex justify-between">
          <button type="button" onClick={() => { if (confirm("Remove both Paystack keys? Online payments will be disabled.")) clearMut.mutate(); }}
            className="h-10 px-4 rounded-md border border-destructive/30 text-destructive text-sm hover:bg-destructive/10">
            Clear keys
          </button>
          <button type="submit" disabled={save.isPending} className="h-10 px-5 rounded-md bg-primary text-primary-foreground text-sm disabled:opacity-50">
            {save.isPending ? "Saving…" : "Save keys"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Row({ label, value, ok }: { label: string; value: React.ReactNode; ok?: boolean }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-muted-foreground">{label}</span>
      <span className={ok ? "text-success font-medium" : ""}>{value}</span>
    </div>
  );
}
