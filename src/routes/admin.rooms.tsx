import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { upsertRoomAdmin, deleteRoomAdmin } from "@/lib/admin.functions";
import { formatMoney } from "@/lib/format";
import { resolveRoomImage } from "@/lib/room-images";

export const Route = createFileRoute("/admin/rooms")({
  component: RoomsAdmin,
});

type Row = {
  id?: string;
  slug: string;
  name: string;
  short_description: string;
  description: string;
  base_price: number;
  max_occupancy: number;
  total_units: number;
  bed_type: string;
  size_sqm: number | null;
  images: string[];
  amenities: string[];
  is_active: boolean;
  sort_order: number;
};

const empty: Row = {
  slug: "", name: "", short_description: "", description: "",
  base_price: 0, max_occupancy: 2, total_units: 1, bed_type: "Queen",
  size_sqm: null, images: [], amenities: [], is_active: true, sort_order: 0,
};

function RoomsAdmin() {
  const qc = useQueryClient();
  const upsert = useServerFn(upsertRoomAdmin);
  const del = useServerFn(deleteRoomAdmin);
  const [editing, setEditing] = useState<Row | null>(null);

  const q = useQuery({
    queryKey: ["admin-rooms"],
    queryFn: async () => {
      const { data, error } = await supabase.from("room_types").select("*").order("sort_order");
      if (error) throw error;
      return (data ?? []) as Row[];
    },
  });

  const saveMut = useMutation({
    mutationFn: (r: Row) => upsert({ data: r }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-rooms"] }); setEditing(null); },
  });
  const delMut = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-rooms"] }),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-display">Rooms & inventory</h1>
          <p className="text-sm text-muted-foreground">Add room types, set pricing, and adjust available units.</p>
        </div>
        <button onClick={() => setEditing({ ...empty })}
          className="h-10 px-4 rounded-md bg-primary text-primary-foreground text-sm hover:bg-primary/90">
          + New room type
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {q.data?.map((r) => (
          <div key={r.id} className="bg-card rounded-2xl shadow-soft overflow-hidden">
            <div className="aspect-[4/3] overflow-hidden bg-muted">
              <img src={resolveRoomImage(r.images?.[0])} alt={r.name} className="h-full w-full object-cover" />
            </div>
            <div className="p-4">
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="text-lg font-display">{r.name}</h3>
                <span className="text-sm font-medium">{formatMoney(r.base_price)}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{r.bed_type} · sleeps {r.max_occupancy} · {r.total_units} units</p>
              <div className="mt-3 flex gap-2">
                <button onClick={() => setEditing(r)} className="h-8 px-3 rounded-md border border-border text-xs hover:bg-accent">Edit</button>
                <button onClick={() => { if (confirm(`Delete "${r.name}"?`) && r.id) delMut.mutate(r.id); }}
                  className="h-8 px-3 rounded-md border border-destructive/30 text-xs text-destructive hover:bg-destructive/10">Delete</button>
                <span className={`ml-auto text-xs px-2 py-1 rounded-full ${r.is_active ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>
                  {r.is_active ? "active" : "hidden"}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <RoomForm value={editing} onCancel={() => setEditing(null)} onSave={(v) => saveMut.mutate(v)} saving={saveMut.isPending} error={saveMut.error?.message} />
      )}
    </div>
  );
}

function RoomForm({ value, onCancel, onSave, saving, error }: {
  value: Row; onCancel: () => void; onSave: (v: Row) => void; saving: boolean; error?: string;
}) {
  const [v, setV] = useState<Row>(value);
  const set = <K extends keyof Row>(k: K, val: Row[K]) => setV((p) => ({ ...p, [k]: val }));

  return (
    <div className="fixed inset-0 bg-foreground/30 backdrop-blur-sm grid place-items-center p-4 z-50">
      <form onSubmit={(e) => { e.preventDefault(); onSave(v); }}
        className="bg-card rounded-2xl shadow-lift w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-display">{v.id ? "Edit room" : "New room type"}</h2>
          <button type="button" onClick={onCancel} className="text-muted-foreground hover:text-foreground">✕</button>
        </div>
        <div className="grid sm:grid-cols-2 gap-3 text-sm">
          <Field label="Name"><input required value={v.name} onChange={(e) => set("name", e.target.value)} className="input" /></Field>
          <Field label="Slug (URL)"><input required value={v.slug} onChange={(e) => set("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))} className="input" /></Field>
          <Field label="Short description"><input value={v.short_description} onChange={(e) => set("short_description", e.target.value)} className="input" /></Field>
          <Field label="Bed type"><input value={v.bed_type} onChange={(e) => set("bed_type", e.target.value)} className="input" /></Field>
          <Field label="Price per night (₦)"><input type="number" min={0} value={v.base_price} onChange={(e) => set("base_price", +e.target.value)} className="input" /></Field>
          <Field label="Size (m²)"><input type="number" min={0} value={v.size_sqm ?? ""} onChange={(e) => set("size_sqm", e.target.value ? +e.target.value : null)} className="input" /></Field>
          <Field label="Max occupancy"><input type="number" min={1} max={10} value={v.max_occupancy} onChange={(e) => set("max_occupancy", +e.target.value)} className="input" /></Field>
          <Field label="Total units in inventory"><input type="number" min={0} value={v.total_units} onChange={(e) => set("total_units", +e.target.value)} className="input" /></Field>
          <Field label="Sort order"><input type="number" value={v.sort_order} onChange={(e) => set("sort_order", +e.target.value)} className="input" /></Field>
          <Field label="Active">
            <select value={v.is_active ? "1" : "0"} onChange={(e) => set("is_active", e.target.value === "1")} className="input">
              <option value="1">Visible</option><option value="0">Hidden</option>
            </select>
          </Field>
        </div>
        <Field label="Description">
          <textarea rows={4} value={v.description} onChange={(e) => set("description", e.target.value)} className="input" />
        </Field>
        <Field label="Amenities (comma separated)">
          <input value={v.amenities.join(", ")} onChange={(e) => set("amenities", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))} className="input" />
        </Field>
        <Field label="Image URLs (comma separated). Use room-standard.jpg / room-deluxe.jpg / room-executive.jpg for built-in photos.">
          <input value={v.images.join(", ")} onChange={(e) => set("images", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))} className="input" />
        </Field>
        {error && <div className="text-sm text-destructive bg-destructive/10 rounded-md p-3">{error}</div>}
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onCancel} className="h-10 px-4 rounded-md border border-border">Cancel</button>
          <button type="submit" disabled={saving} className="h-10 px-5 rounded-md bg-primary text-primary-foreground disabled:opacity-50">
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
        <style>{`.input{height:2.5rem;width:100%;border:1px solid var(--color-input);background:var(--color-background);border-radius:.375rem;padding:0 .75rem;font-size:.875rem}textarea.input{height:auto;padding:.5rem .75rem}`}</style>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (<label className="block"><div className="text-xs text-muted-foreground mb-1">{label}</div>{children}</label>);
}
