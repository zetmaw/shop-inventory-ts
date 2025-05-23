import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { saveAs } from 'file-saver';

export default function InventoryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [formData, setFormData] = useState<any>({});
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const dropRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    loadInventory();
  }, []);

  async function loadInventory() {
    const { data, error } = await supabase.from('items').select('*').order('name');
    if (error) console.error('Failed to load inventory:', error);
    else setItems(data || []);
  }

  function handleSelect(item: any) {
    setSelectedItem(item);
    setFormData(item);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  }

  async function handleSave() {
    const payload = { ...formData };

    if ('quantity' in payload) {
      const parsed = parseInt(payload.quantity, 10);
      payload.quantity = isNaN(parsed) ? 0 : parsed;
    }

    let response;
    if (selectedItem?.id) {
      console.log('📝 Updating item:', selectedItem.id);
      delete payload.id;
      delete payload.created_at;

      response = await supabase
        .from('items')
        .update(payload)
        .eq('id', selectedItem.id)
        .select()
        .single();
    } else {
      console.log('🆕 Inserting new item');
      response = await supabase
        .from('items')
        .insert(payload)
        .select()
        .single();
    }

    const { data, error } = response;

    if (error) {
      console.error('❌ Save failed:', error);
      alert(`Save failed: ${error.message}`);
    } else {
      console.log('✅ Save successful:', data);
      await loadInventory();
      setSelectedItem(null);
      setFormData({});
    }
  }

  async function handleDelete() {
    if (!selectedItem) return;
    const confirmDelete = confirm(`Delete item "${selectedItem.name}"?`);
    if (!confirmDelete) return;

    const { error } = await supabase.from('items').delete().eq('id', selectedItem.id);
    if (error) {
      console.error('❌ Delete failed:', error);
      alert(`Delete failed: ${error.message}`);
    } else {
      console.log('🗑️ Delete successful');
      await loadInventory();
      setSelectedItem(null);
      setFormData({});
    }
  }

  async function handleExport() {
    const csvContent = [
      [
        'name', 'category', 'subcategory', 'brand', 'model',
        'quantity', 'unit', 'location', 'condition', 'notes', 'photo_ref'
      ],
      ...items.map(item => [
        item.name, item.category, item.subcategory, item.brand, item.model,
        item.quantity, item.unit, item.location, item.condition, item.notes, item.photo_ref
      ])
    ].map(e => e.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'inventory_export.csv');
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const lines = text.trim().split("\n");
    const headers = lines[0].split(',');
    const records = lines.slice(1).map(line => {
      const values = line.split(',');
      const obj: any = {};
      headers.forEach((h, i) => (obj[h.trim()] = values[i]?.trim() || ''));
      return obj;
    });
    for (const record of records) {
      await supabase.from('items').insert(record);
    }
    await loadInventory();
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function handlePhotoUpload(files: FileList) {
    if (!selectedItem) return;
    for (const file of Array.from(files)) {
      const filePath = `photos/${selectedItem.id}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage.from('inventory-photos').upload(filePath, file, {
        upsert: true
      });
      if (uploadError) {
        console.error('Upload failed:', uploadError);
        continue;
      }
    }
    await loadInventory();
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handlePhotoUpload(e.dataTransfer.files);
      e.dataTransfer.clearData();
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">🧰 Workshop Inventory</h1>

      <div className="flex gap-4 mb-4 items-center">
        <button onClick={() => { setFormData({}); setSelectedItem(null); }} className="bg-blue-600 text-white px-4 py-2 rounded">+ Add New Item</button>
        <button onClick={handleExport} className="bg-gray-700 text-white px-4 py-2 rounded">Export CSV</button>
        <label className="cursor-pointer bg-indigo-600 text-white px-4 py-2 rounded">
          Import CSV
          <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleImport} />
        </label>
      </div>

      <div className="bg-white p-4 rounded shadow mb-6">
        <div className="grid grid-cols-2 gap-4">
          <input name="name" placeholder="Name" value={formData.name || ''} onChange={handleChange} className="border p-2 rounded w-full" />
          <input name="category" placeholder="Category" value={formData.category || ''} onChange={handleChange} className="border p-2 rounded w-full" />
          <input name="subcategory" placeholder="Subcategory" value={formData.subcategory || ''} onChange={handleChange} className="border p-2 rounded w-full" />
          <input name="brand" placeholder="Brand" value={formData.brand || ''} onChange={handleChange} className="border p-2 rounded w-full" />
          <input name="model" placeholder="Model" value={formData.model || ''} onChange={handleChange} className="border p-2 rounded w-full" />
          <input name="quantity" placeholder="Quantity" value={formData.quantity || ''} onChange={handleChange} className="border p-2 rounded w-full" />
          <input name="unit" placeholder="Unit" value={formData.unit || ''} onChange={handleChange} className="border p-2 rounded w-full" />
          <input name="location" placeholder="Location" value={formData.location || ''} onChange={handleChange} className="border p-2 rounded w-full" />
          <input name="condition" placeholder="Condition" value={formData.condition || ''} onChange={handleChange} className="border p-2 rounded w-full" />
          <textarea name="notes" placeholder="Notes" value={formData.notes || ''} onChange={handleChange} className="border p-2 rounded w-full col-span-2" />
          <div
            ref={dropRef}
            onDragOver={e => e.preventDefault()}
            onDrop={handleDrop}
            className="col-span-2 p-4 border-2 border-dashed border-gray-300 rounded text-center text-gray-500"
          >
            Drag & drop images here to upload
          </div>
        </div>
        <div className="flex gap-4 mt-4">
          <button onClick={handleSave} className="bg-green-600 text-white px-4 py-2 rounded">
            {selectedItem?.id ? 'Update Item' : 'Save Item'}
          </button>
          {selectedItem?.id && (
            <button onClick={handleDelete} className="bg-red-600 text-white px-4 py-2 rounded">
              Delete Item
            </button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-white border rounded p-3 shadow cursor-pointer hover:bg-gray-100"
            onClick={() => handleSelect(item)}
          >
            <div className="font-semibold">{item.name}</div>
            <div className="text-sm text-gray-600">{item.category} — {item.subcategory}</div>
            {item.photo_ref && item.photo_ref.split(',').map((url: string, idx: number) => (
              <img key={idx} src={url} alt={item.name} className="mt-2 max-w-xs rounded" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}