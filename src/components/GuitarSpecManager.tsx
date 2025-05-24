import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface GuitarSpec {
  id: string;
  name: string;
  description?: string;
  tags?: string[];
  created_at?: string;
}

export function GuitarSpecManager() {
  const [specs, setSpecs] = useState<GuitarSpec[]>([]);
  const [formData, setFormData] = useState<Partial<GuitarSpec>>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    loadSpecs();
  }, []);

  async function loadSpecs(): Promise<void> {
    const { data, error } = await supabase.from('guitar_specs').select('*');
    if (!error && data) {
      const filtered = data.filter((spec) => spec.name?.trim());
      setSpecs(filtered);
    } else {
      console.error('Error loading specs:', error);
    }
  }

  async function handleSave(): Promise<void> {
    const payload = {
      name: formData.name || '',
      description: formData.description || '',
      tags: formData.tags || [],
    };

    if (selectedId) {
      const { error } = await supabase.from('guitar_specs').update(payload).eq('id', selectedId);
      if (!error) {
        await loadSpecs();
        setFormData({});
        setSelectedId(null);
      } else {
        console.error('Update failed:', error);
      }
    } else {
      const { error } = await supabase.from('guitar_specs').insert(payload);
      if (!error) {
        await loadSpecs();
        setFormData({});
      } else {
        console.error('Insert failed:', error);
      }
    }
  }

  async function handleDelete(id: string): Promise<void> {
    const { error } = await supabase.from('guitar_specs').delete().eq('id', id);
    if (!error) {
      await loadSpecs();
      if (id === selectedId) {
        setSelectedId(null);
        setFormData({});
      }
    } else {
      console.error('Delete failed:', error);
    }
  }

  function handleSelect(spec: GuitarSpec): void {
    setSelectedId(spec.id);
    setFormData({
      name: spec.name,
      description: spec.description,
      tags: spec.tags,
    });
  }

  return (
    <div className="p-4 border rounded-xl mb-6">
      <h2 className="text-xl font-bold mb-4">🎸 Guitar Spec Manager</h2>

      <div className="grid grid-cols-3 gap-2 mb-4">
        <input
          className="border p-2 rounded"
          placeholder="Name"
          value={formData.name || ''}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
        <input
          className="border p-2 rounded"
          placeholder="Description"
          value={formData.description || ''}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
        <input
          className="border p-2 rounded"
          placeholder="Tags (comma separated)"
          value={formData.tags?.join(', ') || ''}
          onChange={(e) =>
            setFormData({
              ...formData,
              tags: e.target.value
                .split(',')
                .map((tag) => tag.trim())
                .filter((tag) => tag.length > 0),
            })
          }
        />
      </div>
      <button onClick={handleSave} className="bg-blue-600 text-white px-4 py-2 rounded mb-4">
        {selectedId ? 'Update Spec' : '+ Add Spec'}
      </button>

      {specs.length === 0 ? (
        <p className="text-gray-500 italic">No guitar specs available.</p>
      ) : (
        <ul className="space-y-2">
          {specs.map((spec) => (
            <li
              key={spec.id}
              className="border p-3 rounded bg-white shadow-sm flex justify-between items-start hover:bg-gray-50 cursor-pointer"
              onClick={() => handleSelect(spec)}
            >
              <div>
                <div className="font-semibold text-lg">{spec.name}</div>
                {spec.description && (
                  <div className="text-sm text-gray-600 mb-1">{spec.description}</div>
                )}
                {spec.tags && spec.tags.length > 0 && (
                  <div className="text-sm text-gray-500 italic">
                    Tags: {spec.tags.join(', ')}
                  </div>
                )}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(spec.id);
                }}
                className="bg-red-500 text-white text-xs px-3 py-1 rounded"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}