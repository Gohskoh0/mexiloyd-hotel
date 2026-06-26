import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listBookingsAdmin, meIsAdmin } from "@/lib/admin.functions";
import { getPaystackStatus } from "@/lib/paystack.functions";
import { formatMoney, formatDate } from "@/lib/format";

export const Route = createFileRoute("/admin/")({
  component: AdminOverview,
});

function AdminOverview() {
  const list = useServerFn(listBookingsAdmin);
  const me = useServerFn(meIsAdmin);
  const ps = useServerFn(getPaystackStatus);

  const meQ = useQuery({ queryKey: ["me"], queryFn: () => me() });
  const bookingsQ = useQuery({ queryKey: ["admin-bookings"], queryFn: () => list(), enabled: !!meQ.data?.isAdmin });
  const psQ = useQuery({ queryKey: ["paystack-status"], queryFn: () => ps(), enabled: !!meQ.data?.isAdmin });

  if (meQ.isLoading) return <p className="text-muted-foreground">Loading…</p>;
  if (meQ.data && !meQ.data.isAdmin) {
    return (
      <div className="max-w-md">
        <h1 className="text-2xl font-display">Awaiting admin approval</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your account isn't an admin yet. Ask the hotel's primary admin to grant you access.
        </p>
      </div>
    );
  }

  const bookings = bookingsQ.data ?? [];
  const upcoming = bookings.filter((b) => new Date(b.check_in) >= new Date()).length;
  const pendingPay = bookings.filter((b) => b.payment_status !== "paid" && b.payment_option !== "at_hotel").length;
  const revenue = bookings.reduce((s, b) => s + Number(b.amount_paid || 0), 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display">Overview</h1>
        <p className="text-sm text-muted-foreground">Manage your hotel from one place.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Total bookings" value={bookings.length} />
        <Stat label="Upcoming stays" value={upcoming} />
        <Stat label="Payments pending" value={pendingPay} />
        <Stat label="Revenue collected" value={formatMoney(revenue)} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card rounded-2xl shadow-soft p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-display">Recent bookings</h2>
            <Link to="/admin/bookings" className="text-sm text-primary hover:underline">View all →</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-muted-foreground border-b border-border">
                <tr><th className="py-2 pr-3">Ref</th><th className="py-2 pr-3">Guest</th><th className="py-2 pr-3">Dates</th><th className="py-2 pr-3">Status</th><th className="py-2 pr-3 text-right">Total</th></tr>
              </thead>
              <tbody>
                {bookings.slice(0, 8).map((b) => (
                  <tr key={b.id} className="border-b border-border/60">
                    <td className="py-2 pr-3 font-mono text-xs">{b.reference}</td>
                    <td className="py-2 pr-3">{b.guest_name}</td>
                    <td className="py-2 pr-3 text-muted-foreground">{formatDate(b.check_in)} → {formatDate(b.check_out)}</td>
                    <td className="py-2 pr-3 capitalize">{b.status}</td>
                    <td className="py-2 pr-3 text-right">{formatMoney(b.total)}</td>
                  </tr>
                ))}
                {bookings.length === 0 && (
                  <tr><td colSpan={5} className="py-8 text-center text-muted-foreground">No bookings yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-card rounded-2xl shadow-soft p-6">
          <h2 className="text-xl font-display">Paystack</h2>
          <p className="mt-1 text-sm text-muted-foreground">Online payment status</p>
          <div className="mt-4 space-y-2 text-sm">
            <Row label="Mode" value={psQ.data?.mode ?? "—"} />
            <Row label="Public key" value={psQ.data?.hasPublicKey ? psQ.data.publicKeyPreview ?? "set" : "not set"} ok={psQ.data?.hasPublicKey} />
            <Row label="Secret key" value={psQ.data?.hasSecretKey ? "•••••• (write-only)" : "not set"} ok={psQ.data?.hasSecretKey} />
          </div>
          <Link to="/admin/payments" className="mt-5 inline-flex h-9 items-center rounded-md bg-primary px-4 text-xs font-medium text-primary-foreground hover:bg-primary/90">
            Manage keys
          </Link>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="bg-card rounded-2xl shadow-soft p-5">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-2 font-display text-3xl">{value}</div>
    </div>
  );
}

function Row({ label, value, ok }: { label: string; value: React.ReactNode; ok?: boolean }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-muted-foreground">{label}</span>
      <span className={ok ? "text-success" : "text-foreground"}>{value}</span>
    </div>
  );
}
