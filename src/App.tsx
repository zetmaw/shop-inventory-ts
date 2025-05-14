import React, { useState, useRef, useEffect } from 'react';
import { supabase } from './lib/supabase';
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

const App: React.FC = () => {
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

        console.log("⏬ Importing records:", records);

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
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>🛠️ Workshop Inventory</h1>

      {errorLog && (
        <div style={{ color: 'red', marginBottom: '1rem', fontWeight: 'bold' }}>{errorLog}</div>
      )}

      <form style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {[{ label: 'Name', val: name, set: setName }, { label: 'Category', val: category, set: setCategory },
          { label: 'Subcategory', val: subcategory, set: setSubcategory }, { label: 'Brand', val: brand, set: setBrand },
          { label: 'Model', val: model, set: setModel }, { label: 'Quantity', val: quantity.toString(), set: (v: string) => setQuantity(parseInt(v) || 0) },
          { label: 'Unit', val: unit, set: setUnit }, { label: 'Location', val: location, set: setLocation },
          { label: 'Condition', val: condition, set: setCondition }, { label: 'Notes', val: notes, set: setNotes }]
          .map(({ label, val, set }, i) => (
            <label key={i} style={{ display: 'flex', flexDirection: 'column', fontWeight: 'bold' }}>{label}
              <input value={val} onChange={e => set(e.target.value)} style={{ padding: '0.5rem', backgroundColor: 'white', color: 'black' }} />
            </label>
          ))}

        <label style={{ fontWeight: 'bold' }}>Upload Photo:
          <input type="file" ref={fileInputRef} onChange={e => setFile(e.target.files?.[0] || null)} />
        </label>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '1rem' }}>
          <button type="button" onClick={addItem} style={{ backgroundColor: '#3b82f6', color: 'white', padding: '0.5rem 1rem', border: 'none' }}>➕ Add Item</button>
          <button type="button" onClick={() => exportCSVAndImages(items)} style={{ backgroundColor: '#10b981', color: 'white', padding: '0.5rem 1rem', border: 'none' }}>📤 Export CSV & Images</button>
          <button type="button" onClick={() => csvInputRef.current?.click()} style={{ backgroundColor: '#f59e0b', color: 'white', padding: '0.5rem 1rem', border: 'none' }}>📥 Import CSV</button>
          <input ref={csvInputRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={importCSV} />
        </div>
      </form>

      <ul style={{ marginTop: '2rem' }}>
        {items.map((item, index) => (
          <li key={index} style={{ padding: '0.5rem 0', borderBottom: '1px solid #ccc' }}>
            <strong>{item.name}</strong> — {item.category} — {item.location}<br />
            {item.photo_ref && <img src={getPublicUrl(item.photo_ref)} alt={item.name} style={{ maxHeight: '100px', marginTop: '0.5rem' }} />}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default App;
