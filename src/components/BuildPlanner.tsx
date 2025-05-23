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

export function BuildPlanner(): JSX.Element {
  const [specs, setSpecs] = useState<Spec[]>([]); // ✅ fix
  const [selectedSpec, setSelectedSpec] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [notes, setNotes] = useState<string>('');
  const [outputPrompt, setOutputPrompt] = useState<string>('');

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
      {/* ... UI remains unchanged ... */}
    </div>
  );
}