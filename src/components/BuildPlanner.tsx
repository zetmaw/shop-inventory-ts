import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface GuitarSpec {
  id: string;
  name: string;
  description?: string;
  tags?: string[];
  created_at?: string;
}

export function BuildPlanner() {
  const [specs, setSpecs] = useState<GuitarSpec[]>([]);
  const [formData, setFormData] = useState<Partial<GuitarSpec>>({});
  const [selectedSpec, setSelectedSpec] = useState<GuitarSpec | null>(null);

  useEffect(() => {
    loadSpecs();
  }, []);

  async function loadSpecs(): Promise<void> {
    const { data, error } = await supabase.from('guitar_specs').select('*');
    if (!error && data) {
      const filtered = (data as GuitarSpec[]).filter((spec) => spec.name?.trim());
      setSpecs(filtered);
    } else {
      console.error('Error loading specs:', error);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSave() {
    const payload = {
      ...formData,
      tags: formData.tags || [],
    };

    if (selectedSpec?.id) {
      const { error } = await supabase
        .from('guitar_specs')
        .update(payload)
        .eq('id', selectedSpec.id);
      if (error) return console.error('Update failed:', error);
    } else {
      const { error } = await supabase.from('guitar_specs').insert(payload);
      if (error) return console.error('Insert failed:', error);
    }

    setFormData({});
    setSelectedSpec(null);
    await loadSpecs();
  }

  async function handleDelete(id: string) {
    const { error } = await supabase.from('guitar_specs').delete().eq('id', id);
    if (error) console.error('Delete failed:', error);
    else await loadSpecs();
  }

  function handleSelect(spec: GuitarSpec) {
    setSelectedSpec(spec);
    setFormData(spec);
  }

  return (
    <div className="p-4 border rounded-xl mb-6">
      <h2 className="text-xl font-bold mb-4">🎸 Guitar Spec Manager</h2>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <input
          name="name"
          placeholder="Name"
          value={formData.name || ''}
          onChange={handleChange}
          className="border p-2 rounded w-full"
        />
        <textarea
          name="description"
          placeholder="Description"
          value={formData.description || ''}
          onChange={handleChange}
          className="border p-2 rounded w-full"
        />
      </div>

      <button
        onClick={handleSave}
        className="mb-6 bg-green-600 text-white px-4 py-2 rounded"
      >
        {selectedSpec ? 'Update Spec' : 'Add Spec'}
      </button>

      {specs.length === 0 ? (
        <p className="text-gray-500 italic">No specs available.</p>
      ) : (
        <ul className="space-y-2">
          {specs.map((spec) => (
            <li
              key={spec.id}
              className="border p-3 rounded bg-white shadow-sm hover:bg-gray-50 cursor-pointer"
              onClick={() => handleSelect(spec)}
            >
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-semibold text-lg">{spec.name}</div>
                  {spec.description && (
                    <div className="text-sm text-gray-600">{spec.description}</div>
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(spec.id);
                  }}
                  className="bg-red-500 text-white px-2 py-1 rounded"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}