import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Package, ScanLine, Save } from "lucide-react";

/**
 * Inventory item shape
 */
interface Item {
  id: string;
  category: string;
  name: string;
  qty: number;
  color?: string;
  description?: string;
  location: string;
}

/**
 * Helper to generate a quick UUID
 */
const uid = () => Math.random().toString(36).slice(2, 10);

export default function App() {
  const [items, setItems] = useState<Item[]>([]);
  const [filter, setFilter] = useState<string>("");

  /** Load / persist to localStorage so the data survives reloads */
  useEffect(() => {
    const saved = localStorage.getItem("shop_items");
    if (saved) setItems(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("shop_items", JSON.stringify(items));
  }, [items]);

  /** Add a new blank row */
  const addItem = () => {
    setItems([
      ...items,
      {
        id: uid(),
        category: "",
        name: "",
        qty: 1,
        location: "WRK-BENCH-01",
      },
    ]);
  };

  /** Update any field */
  const patch = (id: string, changes: Partial<Item>) => {
    setItems(items.map((it) => (it.id === id ? { ...it, ...changes } : it)));
  };

  /** Simple XLSX export */
  const downloadCSV = () => {
    const header = [
      "Category",
      "Item_Name",
      "Quantity",
      "Color",
      "Description",
      "Location_Code",
    ];
    const rows = items.map((it) => [
      it.category,
      it.name,
      it.qty.toString(),
      it.color ?? "",
      it.description ?? "",
      it.location,
    ]);
    const csv = [header, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `inventory_${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  /** Filtered view */
  const visible = items.filter((it) =>
    `${it.name} ${it.category} ${it.location}`
      .toLowerCase()
      .includes(filter.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Package className="w-6 h-6" /> Shop Inventory
        </h1>
        <div className="flex gap-2">
          <Button onClick={addItem} className="gap-1">
            <Plus className="w-4 h-4" /> Add
          </Button>
          <Button variant="secondary" onClick={downloadCSV} className="gap-1">
            <Save className="w-4 h-4" /> Export CSV
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2">
        <Search className="w-5 h-5 text-gray-500" />
        <Input
          placeholder="Filter by name, category, or location…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="grid gap-4">
        {visible.map((it) => (
          <Card key={it.id} className="shadow-sm">
            <CardContent className="p-4 grid md:grid-cols-6 gap-2 text-sm">
              <input
                className="col-span-1 border rounded p-1"
                placeholder="Category"
                value={it.category}
                onChange={(e) => patch(it.id, { category: e.target.value })}
              />
              <input
                className="col-span-2 border rounded p-1"
                placeholder="Item name"
                value={it.name}
                onChange={(e) => patch(it.id, { name: e.target.value })}
              />
              <input
                type="number"
                className="col-span-1 border rounded p-1"
                value={it.qty}
                min={0}
                onChange={(e) => patch(it.id, { qty: Number(e.target.value) })}
              />
              <input
                className="col-span-1 border rounded p-1"
                placeholder="Location"
                value={it.location}
                onChange={(e) => patch(it.id, { location: e.target.value })}
              />
              <button
                className="col-span-1 flex items-center justify-center text-red-500"
                onClick={() => setItems(items.filter((x) => x.id !== it.id))}
              >
                ×
              </button>
              <textarea
                className="col-span-6 md:col-span-6 border rounded p-1"
                placeholder="Description / notes"
                value={it.description ?? ""}
                onChange={(e) => patch(it.id, { description: e.target.value })}
              />
            </CardContent>
          </Card>
        ))}
        {visible.length === 0 && (
          <p className="text-center text-gray-500">No items match your filter.</p>
        )}
      </div>

      {/* Footer / QR placeholder */}
      <div className="fixed bottom-4 right-4">
        <Button variant="outline" className="gap-1">
          <ScanLine className="w-4 h-4" /> Scan QR (coming soon)
        </Button>
      </div>
    </div>
  );
}
// force redeploy
