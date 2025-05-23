import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface GuitarSpec {
  id: string;
  name: string;
  description?: string;
  tags?: string[];
  created_at?: string;
}

export function GuitarSpecManager(): JSX.Element {
  const [specs, setSpecs] = useState<GuitarSpec[]>([]);

  useEffect(() => {
    loadSpecs();
  }, []);

  async function loadSpecs(): Promise<void> {
    const { data, error } = await supabase.from('guitar_specs').select('*');
    if (!error && data) {
      const filtered = data.filter((spec) => spec.name?.trim());
      setSpecs(filtered);
    }
  }

  return (
    <div className="p-4 border rounded-xl mb-6">
      <h2 className="text-xl font-bold mb-4">🎸 Guitar Spec Manager</h2>

      {specs.length === 0 ? (
        <p className="text-gray-500 italic">No guitar specs available.</p>
      ) : (
        <ul className="space-y-2">
          {specs.map((spec) => (
            <li key={spec.id} className="border p-3 rounded bg-white shadow-sm">
              <div className="font-semibold text-lg">{spec.name}</div>
              {spec.description && (
                <div className="text-sm text-gray-600 mb-1">{spec.description}</div>
              )}
              {spec.tags && spec.tags.length > 0 && (
                <div className="text-sm text-gray-500 italic">
                  Tags: {spec.tags.join(', ')}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}