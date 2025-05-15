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
      name, category, subcategory, brand, model, quantity, unit, location: itemLocation,
      condition, notes, photo_ref: uploadedPath
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

  const resetForm = () => {
    setName(''); setCategory(''); setSubcategory(''); setBrand(''); setModel('');
    setQuantity(1); setUnit(''); setItemLocation(''); setCondition(''); setNotes(''); setPhotoRef(''); setFile(null);
  };

  return (
    <div className="max-w-5xl mx-auto p-4 font-sans">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">🔧 Workshop Inventory</h1>
        <button
          onClick={async () => {
            await supabase.auth.signOut();
            window.location.href = '/login';
          }}
          className="text-sm text-red-600 border border-red-600 rounded px-3 py-1 hover:bg-red-600 hover:text-white"
        >
          Log out
        </button>
      </div>

      <div className="mb-4">
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {showForm ? 'Cancel' : '➕ Add New Item'}
        </button>
      </div>

      {showForm && (
        <form className="bg-white p-4 rounded shadow mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {[{ label: 'Name', val: name, set: setName }, { label: 'Category', val: category, set: setCategory },
            { label: 'Subcategory', val: subcategory, set: setSubcategory }, { label: 'Brand', val: brand, set: setBrand },
            { label: 'Model', val: model, set: setModel }, { label: 'Quantity', val: quantity.toString(), set: (v: string) => setQuantity(parseInt(v) || 0) },
            { label: 'Unit', val: unit, set: setUnit }, { label: 'Location', val: itemLocation, set: setItemLocation },
            { label: 'Condition', val: condition, set: setCondition }, { label: 'Notes', val: notes, set: setNotes }]
            .map(({ label, val, set }, i) => (
              <label key={i} className="block text-sm">
                {label}
                <input
                  value={val}
                  onChange={e => set(e.target.value)}
                  className="w-full mt-1 p-2 border border-gray-300 rounded"
                />
              </label>
            ))}

          <label className="block text-sm col-span-full">
            Upload Photo:
            <input type="file" ref={fileInputRef} onChange={e => setFile(e.target.files?.[0] || null)} />
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
          <li key={index} className="p-3 border border-gray-200 rounded bg-white">
            <div className="font-bold">{item.name}</div>
            <div className="text-sm text-gray-600">{item.category} — {item.location}</div>
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
