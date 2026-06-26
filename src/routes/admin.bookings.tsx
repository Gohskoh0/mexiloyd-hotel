import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { listBookingsAdmin, updateBookingAdmin } from "@/lib/admin.functions";
import { formatMoney, formatDate } from "@/lib/format";

export const Route = createFileRoute("/admin/bookings")({
  component: BookingsPage,
});

function BookingsPage() {
  const list = useServerFn(listBookingsAdmin);
  const update = useServerFn(updateBookingAdmin);
  const qc = useQueryClient();
  const [filter, setFilter] = useState<"all" | "upcoming" | "pending_pay">("all");

  const q = useQuery({ queryKey: ["admin-bookings"], queryFn: () => list() });

  const mut = useMutation({
    mutationFn: (vars: Parameters<typeof update>[0]["data"]) => update({ data: vars }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-bookings"] }),
  });

  const items = (q.data ?? []).filter((b) => {
    if (filter === "upcoming") return new Date(b.check_in) >= new Date();
    if (filter === "pending_pay") return b.payment_status !== "paid" && b.payment_option !== "at_hotel";
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-display">Bookings</h1>
          <p className="text-sm text-muted-foreground">Review and update guest reservations.</p>
        </div>
        <div className="flex gap-2 text-sm">
          {(["all", "upcoming", "pending_pay"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`h-9 px-3 rounded-md border ${filter === f ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-accent"}`}>
              {f === "all" ? "All" : f === "upcoming" ? "Upcoming" : "Payment pending"}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-card rounded-2xl shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-muted-foreground border-b border-border">
              <tr>
                <th className="py-3 px-4">Reference</th>
                <th className="py-3 px-4">Guest</th>
                <th className="py-3 px-4">Room</th>
                <th className="py-3 px-4">Dates</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4 text-right">Total / Paid</th>
              </tr>
            </thead>
            <tbody>
              {items.map((b) => (
                <tr key={b.id} className="border-b border-border/60 align-top">
                  <td className="py-3 px-4 font-mono text-xs">{b.reference}</td>
                  <td className="py-3 px-4">
                    <div>{b.guest_name}</div>
                    <div className="text-xs text-muted-foreground">{b.guest_email}</div>
                    <div className="text-xs text-muted-foreground">{b.guest_phone}</div>
                  </td>
                  <td className="py-3 px-4">
                    {b.room_types?.name}
                    <div className="text-xs text-muted-foreground">{b.rooms_booked} × {b.guests} guest(s)</div>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">
                    {formatDate(b.check_in)} → {formatDate(b.check_out)}
                    <div className="text-xs">{b.nights} night(s)</div>
                  </td>
                  <td className="py-3 px-4">
                    <select defaultValue={b.status}
                      onChange={(e) => mut.mutate({ id: b.id, status: e.target.value as never })}
                      className="h-8 rounded-md border border-input bg-background px-2 text-xs">
                      {["pending", "confirmed", "checked_in", "checked_out", "cancelled"].map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td className="py-3 px-4">
                    <select defaultValue={b.payment_status}
                      onChange={(e) => mut.mutate({ id: b.id, payment_status: e.target.value as never })}
                      className="h-8 rounded-md border border-input bg-background px-2 text-xs">
                      {["unpaid", "partial", "paid", "refunded"].map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    <div className="text-xs text-muted-foreground mt-1 capitalize">{b.payment_option.replace("_", " ")}</div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div>{formatMoney(b.total)}</div>
                    <div className="text-xs text-muted-foreground">paid {formatMoney(b.amount_paid)}</div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={7} className="py-12 text-center text-muted-foreground">No bookings here.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
