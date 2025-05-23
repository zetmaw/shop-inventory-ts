import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface Spec {
  id: string;
  name: string;
  description?: string;
  tags?: string[];
  [key: string]: any;
}

interface InventoryItem {
  id: number;
  name: string;
  category: string;
}

export function BuildPlanner() {
  const [specs, setSpecs] = useState<Spec[]>([]);
  const [selectedSpec, setSelectedSpec] = useState('');
  const [quantity, setQuantity] = useState<number>(1);
  const [notes, setNotes] = useState('');
  const [outputPrompt, setOutputPrompt] = useState('');

  useEffect(() => {
    loadSpecs();
  }, []);

  async function loadSpecs(): Promise<void> {
    const { data, error } = await supabase.from('guitar_specs').select('*');
    if (!error && data) setSpecs(data as Spec[]);
  }

  async function submitRequest(): Promise<void> {
    if (!selectedSpec || !quantity) return;
    const { error } = await supabase
      .from('build_requests')
      .insert({ spec_id: selectedSpec, quantity, notes });
    if (!error) generatePrompt();
  }

  async function generatePrompt(): Promise<void> {
    const spec = specs.find((s) => s.id === selectedSpec);
    const { data: inventory } = await supabase.from('items').select('*');
 console.log('🛠 Debug - generatePrompt:', { spec, inventory });

    if (!spec || !inventory) return;

    const prompt = `
Build Request:
- Guitar spec: ${spec.name}
- Description: ${spec.description ?? 'N/A'}
- Tags: ${(spec.tags ?? []).join(', ')}
- Quantity: ${quantity}

Inventory:
${inventory.map((i: InventoryItem) => `- ${i.name} (${i.category})`).join('\n')}

Task:
Provide a CNC production strategy using the tools and stock listed above to efficiently build ${quantity} guitars from this spec.
`;

    setOutputPrompt(prompt);
  }

  return (
    <div className="p-4 border rounded-xl mt-4">
      <h2 className="text-xl font-bold mb-2">📦 Build Planner</h2>

      <select
        value={selectedSpec}
        onChange={(e) => setSelectedSpec(e.target.value)}
        className="border p-2 w-full mb-2"
      >
        <option value="">Select a guitar spec</option>
        {specs.map((spec) => (
          <option key={spec.id} value={spec.id}>
            {spec.name}
          </option>
        ))}
      </select>

      <input
        type="number"
        value={quantity}
        onChange={(e) => setQuantity(parseInt(e.target.value))}
        className="border p-2 w-full mb-2"
        min={1}
      />

      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Additional notes (optional)"
        className="border p-2 w-full mb-2"
      />

      <button
        onClick={submitRequest}
        className="bg-green-600 text-white py-1 px-4 rounded"
      >
        Submit Build Request
      </button>

      {outputPrompt && (
        <div className="mt-4">
          <h3 className="font-semibold mb-1">Generated Prompt:</h3>
          <pre className="bg-gray-100 p-2 whitespace-pre-wrap text-sm border rounded">
            {outputPrompt}
          </pre>
        </div>
      )}
    </div>
  );
}