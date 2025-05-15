import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

interface Item {
  id?: number;
  name: string;
  category: string;
  subcategory: string;
  brand: string;
  model: string;
  quantity: number;
  unit: string;
  location: string;
  condition: string;
  notes: string;
  photo_ref: string;
}

const getPublicUrl = (path: string) =>
  `https://orrfckfzavkodlapmcml.supabase.co/storage/v1/object/public/${path}`;

const InventoryPage: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState('');
  const [location, setLocation] = useState('');
  const [condition, setCondition] = useState('');
  const [notes, setNotes] = useState('');
  const [photoRef, setPhotoRef] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [errorLog, setErrorLog] = useState<string>('');

  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [filterCondition, setFilterCondition] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchItems = async () => {
      const { data, error } = await supabase.from('items').select('*');
      if (error) console.error('Fetch error:', error);
      else setItems(data as Item[]);
    };
    fetchItems();
  }, []);

  const filteredItems = items.filter((item) => {
    const matchesSearch = `${item.name} ${item.brand} ${item.model} ${item.notes}`.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = filterCategory ? item.category === filterCategory : true;
    const matchesLocation = filterLocation ? item.location === filterLocation : true;
    const matchesCondition = filterCondition ? item.condition === filterCondition : true;
    return matchesSearch && matchesCategory && matchesLocation && matchesCondition;
  });

  const uploadImage = async (file: File): Promise<string> => {
    const fileName = `${Date.now()}_${file.name}`;
    const { data, error } = await supabase.storage.from('images').upload(fileName, file);
    if (error) {
      console.error('Image upload error:', error);
      return '';
    }
    return data.path;
  };

  const addItem = async () => {
    let uploadedPath = photoRef;
    if (file) {
      uploadedPath = await uploadImage(file);
    }
    const newItem: Item = {
      name, category, subcategory, brand, model, quantity, unit, location,
      condition, notes, photo_ref: uploadedPath
    };
    const { error } = await supabase.from('items').insert([newItem]);
    if (error) {
      console.error('Insert error:', error);
      setErrorLog(`Insert error: ${error.message}`);
    } else {
      setItems((prev) => [...prev, newItem]);
      resetForm();
    }
  };

  const importCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.trim().split('\n');
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

        const records = lines.slice(1).map(line => {
          const values = line.split(',').map(v => v.trim());
          const obj: Record<string, string | number> = {};
          headers.forEach((key, i) => {
            obj[key] = key === 'quantity' ? parseInt(values[i]) || 0 : values[i] || '';
          });
          return obj;
        });

        const { data, error } = await supabase.from('items').insert(records);
        if (error) {
          console.error("🔥 Supabase insert error:", error);
          setErrorLog(`Supabase insert error: ${error.message}`);
          alert('Failed to import CSV');
          return;
        }

        alert('CSV data imported successfully!');
        setItems((prev) => [...prev, ...records as Item[]]);
      } catch (err: any) {
        console.error("🚨 Unexpected CSV import failure:", err);
        setErrorLog(`Unexpected error: ${err.message}`);
      }
    };

    reader.onerror = () => {
      console.error("📛 FileReader failed to load the file");
      setErrorLog("FileReader failed to load the file");
    };

    reader.readAsText(file);
    e.target.value = '';
  };

  const exportCSVAndImages = async (items: Item[]) => {
    const headers = ['name', 'category', 'subcategory', 'brand', 'model', 'quantity', 'unit', 'location', 'condition', 'notes', 'photo_url'];
    const rows = await Promise.all(items.map(async item => {
      const photoUrl = item.photo_ref ? getPublicUrl(item.photo_ref) : '';
      return [item.name, item.category, item.subcategory, item.brand, item.model, item.quantity.toString(), item.unit, item.location, item.condition, item.notes, photoUrl];
    }));
    const csvContent = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'inventory.csv');
    const zip = new JSZip();
    await Promise.all(items.map(async (item, i) => {
      if (item.photo_ref) {
        const url = getPublicUrl(item.photo_ref);
        try {
          const res = await fetch(url);
          const blob = await res.blob();
          zip.file(`image_${i + 1}.${item.photo_ref.split('.').pop()}`, blob);
        } catch (err) {
          console.error(`Failed to download ${url}:`, err);
        }
      }
    }));
    zip.generateAsync({ type: 'blob' }).then((zipFile: Blob) => {
      saveAs(zipFile, 'images.zip');
    });
  };

  const resetForm = () => {
    setName(''); setCategory(''); setSubcategory(''); setBrand(''); setModel('');
    setQuantity(1); setUnit(''); setLocation(''); setCondition(''); setNotes(''); setPhotoRef(''); setFile(null);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto text-sm">
      <h1 className="text-2xl font-bold mb-6">🛠️ Workshop Inventory</h1>

      {errorLog && (
        <div className="text-red-500 font-semibold mb-4">{errorLog}</div>
      )}

      {/* 🔍 Search & Filters */}
      <div className="mb-6 flex flex-wrap gap-4 items-center">
        <input
          type="text"
          placeholder="Search items..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-2 border rounded w-60"
        />
        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="p-2 border rounded">
          <option value="">All Categories</option>
          {[...new Set(items.map(i => i.category))].map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <select value={filterLocation} onChange={(e) => setFilterLocation(e.target.value)} className="p-2 border rounded">
          <option value="">All Locations</option>
          {[...new Set(items.map(i => i.location))].map(loc => (
            <option key={loc} value={loc}>{loc}</option>
          ))}
        </select>
        <select value={filterCondition} onChange={(e) => setFilterCondition(e.target.value)} className="p-2 border rounded">
          <option value="">All Conditions</option>
          {[...new Set(items.map(i => i.condition))].map(cond => (
            <option key={cond} value={cond}>{cond}</option>
          ))}
        </select>
      </div>

      {/* Item form remains unchanged... */}

      <ul className="mt-8">
        {filteredItems.map((item, index) => (
          <li key={index} className="py-2 border-b">
            <strong>{item.name}</strong> — {item.category} — {item.location}<br />
            {item.photo_ref && <img src={getPublicUrl(item.photo_ref)} alt={item.name} className="max-h-24 mt-2" />}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default InventoryPage;
