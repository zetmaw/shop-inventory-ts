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
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState('');
  const [itemLocation, setItemLocation] = useState('');
  const [condition, setCondition] = useState('');
  const [notes, setNotes] = useState('');
  const [photoRef, setPhotoRef] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [errorLog, setErrorLog] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchItems = async () => {
      const { data, error } = await supabase.from('items').select('*');
      if (error) {
        console.error('Fetch error:', error);
      } else {
        setItems(data as Item[]);
      }
    };
    fetchItems();
  }, []);

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
      name,
      category,
      subcategory,
      brand,
      model,
      quantity,
      unit,
      location: itemLocation,
      condition,
      notes,
      photo_ref: uploadedPath,
    };

    const { error } = await supabase.from('items').insert([newItem]);
    if (error) {
      console.error('Insert error:', error);
      setErrorLog(`Insert error: ${error.message}`);
    } else {
      setItems((prev) => [...prev, newItem]);
      resetForm();
      setShowForm(false);
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
        const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());

        const records = lines.slice(1).map((line) => {
          const values = line.split(',').map((v) => v.trim());
          const obj: Record<string, string | number> = {};
          headers.forEach((key, i) => {
            obj[key] = key === 'quantity' ? parseInt(values[i]) || 0 : values[i] || '';
          });
          return obj;
        });

        const { error } = await supabase.from('items').insert(records);
        if (error) {
          console.error('Supabase insert error:', error);
          setErrorLog(`Supabase insert error: ${error.message}`);
          alert('Failed to import CSV');
          return;
        }

        alert('CSV data imported successfully!');
        setItems((prev) => [...prev, ...(records as Item[])]);
      } catch (err: any) {
        console.error('Unexpected CSV import failure:', err);
        setErrorLog(`Unexpected error: ${err.message}`);
      }
    };

    reader.readAsText(file);
    e.target.value = '';
  };

  const exportCSVAndImages = async (items: Item[]) => {
    const headers = ['name', 'category', 'subcategory', 'brand', 'model', 'quantity', 'unit', 'location', 'condition', 'notes', 'photo_url'];
    const rows = await Promise.all(
      items.map(async (item) => {
        const photoUrl = item.photo_ref ? getPublicUrl(item.photo_ref) : '';
        return [
          item.name,
          item.category,
          item.subcategory,
          item.brand,
          item.model,
          item.quantity.toString(),
          item.unit,
          item.location,
          item.condition,
          item.notes,
          photoUrl,
        ];
      })
    );
    const csvContent = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'inventory.csv');
    const zip = new JSZip();
    await Promise.all(
      items.map(async (item, i) => {
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
      })
    );
    zip.generateAsync({ type: 'blob' }).then((zipBlob: Blob) => {
      saveAs(zipBlob, 'images.zip');
    });
  };

  const resetForm = () => {
    setName('');
    setCategory('');
    setSubcategory('');
    setBrand('');
    setModel('');
    setQuantity(1);
    setUnit('');
    setItemLocation('');
    setCondition('');
    setNotes('');
    setPhotoRef('');
    setFile(null);
  };

  return (
    <div className="max-w-5xl mx-auto p-4 font-sans">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">🔧 Workshop Inventory</h1>
        <button
          onClick={async () => {
            await supabase.auth.signOut();
            window.location.assign('/login');
          }}
          className="text-sm text-red-600 border border-red-600 rounded px-3 py-1 hover:bg-red-600 hover:text-white"
        >
          Log out
        </button>
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {showForm ? 'Cancel' : '➕ Add New Item'}
        </button>
        <button
          onClick={() => exportCSVAndImages(items)}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          📤 Export CSV
        </button>
        <>
          <input
            ref={csvInputRef}
            type="file"
            accept=".csv"
            style={{ display: 'none' }}
            onChange={importCSV}
          />
          <button
            onClick={() => csvInputRef.current?.click()}
            className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
          >
            📥 Import CSV
          </button>
        </>
      </div>

      {showForm && (
        <form className="bg-white p-4 rounded shadow mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {[{ label: 'Name', val: name, set: setName },
            { label: 'Category', val: category, set: setCategory },
            { label: 'Subcategory', val: subcategory, set: setSubcategory },
            { label: 'Brand', val: brand, set: setBrand },
            { label: 'Model', val: model, set: setModel },
            {
              label: 'Quantity',
              val: quantity.toString(),
              set: (v: string) => setQuantity(parseInt(v) || 0),
            },
            { label: 'Unit', val: unit, set: setUnit },
            { label: 'Location', val: itemLocation, set: setItemLocation },
            { label: 'Condition', val: condition, set: setCondition },
            { label: 'Notes', val: notes, set: setNotes },
          ].map(({ label, val, set }, i) => (
            <label key={i} className="block text-sm">
              {label}
              <input
                value={val}
                onChange={(e) => set(e.target.value)}
                className="w-full mt-1 p-2 border border-gray-300 rounded"
              />
            </label>
          ))}

          <label className="block text-sm col-span-full">
            Upload Photo:
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </label>

          <div className="col-span-full">
            <button
              type="button"
              onClick={addItem}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Save Item
            </button>
          </div>
        </form>
      )}

      <ul className="space-y-2">
        {items.map((item, index) => (
          <li
            key={index}
            className="p-3 border border-gray-200 rounded bg-white"
          >
            <div className="font-bold">{item.name}</div>
            <div className="text-sm text-gray-600">
              {item.category} — {item.location}
            </div>
            {item.photo_ref && (
              <img
                src={getPublicUrl(item.photo_ref)}
                alt={item.name}
                className="mt-2 max-h-24"
              />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default InventoryPage;
