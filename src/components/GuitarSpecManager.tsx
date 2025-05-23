type Spec = { id: string; name: string; description: string; tags: string[]; [key: string]: any };
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export function GuitarSpecManager() {
  const [specs, setSpecs] = useState<Spec[]>([]);
  const [form, setForm] = useState({ name: '', description: '', tags: '' });

  useEffect(() => {
    loadSpecs();
  }, []);

  async function loadSpecs() {
    const { data, error } = await supabase.from('guitar_specs').select('*').order('created_at', { ascending: false });
    if (!error) setSpecs(data);
  }

  async function saveSpec() {
    const { name, description, tags } = form;
    const parsedTags = tags.split(',').map(tag => tag.trim());
    await supabase.from('guitar_specs').insert({ name, description, tags: parsedTags });
    setForm({ name: '', description: '', tags: '' });
    loadSpecs();
  }

  async function deleteSpec(id: string) {
    await supabase.from('guitar_specs').delete().eq('id', id);
    loadSpecs();
  }

  return (
    <div className="p-4 border rounded-xl">
      <h2 className="text-xl font-bold mb-2">🎸 Guitar Specs</h2>
      <div className="flex flex-col gap-2 mb-4">
        <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Name" className="border p-2" />
        <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Description" className="border p-2" />
        <input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} placeholder="Tags (comma separated)" className="border p-2" />
        <button onClick={saveSpec} className="bg-blue-600 text-white py-1 px-4 rounded">Save Spec</button>
      </div>
      <ul className="space-y-2">
        {specs.map((spec: any) => (
          <li key={spec.id} className="border p-2 rounded shadow">
            <div className="flex justify-between items-center">
              <div>
                <strong>{spec.name}</strong>
                <p className="text-sm text-gray-600">{spec.tags.join(', ')}</p>
              </div>
              <button onClick={() => deleteSpec(spec.id)} className="text-red-500">Delete</button>
            </div>
            <p>{spec.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}