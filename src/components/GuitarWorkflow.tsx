import { supabase } from '../lib/supabase';
import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

interface Build {
  id: string;
  name: string;
  wood_type: string;
  neck_wood: string;
  pickup_type: string;
  bridge_type: string;
  tuners_type: string;
  tuners_quantity: number;
  pots_type: string;
  pots_quantity: number;
  switch_type: string;
}

export default function GuitarWorkflow() {
  const [builds, setBuilds] = useState<Build[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '',
    wood_type: '',
    neck_wood: '',
    pickup_type: '',
    bridge_type: '',
    tuners_type: '',
    tuners_quantity: 0,
    pots_type: '',
    pots_quantity: 0,
    switch_type: '',
  });

  const [summary, setSummary] = useState('');

  useEffect(() => {
    fetchBuilds();
  }, []);

  async function fetchBuilds() {
    const { data, error } = await supabase.from('guitar_builds').select('*').order('created_at', { ascending: false });
    if (error) console.error('Error loading builds:', error.message);
    else setBuilds(data as Build[]);
  }

  async function handleDeleteBuild(id: string) {
    if (!confirm('Delete this build?')) return;
    const { error } = await supabase.from('guitar_builds').delete().eq('id', id);
    if (error) console.error('Delete failed:', error.message);
    else fetchBuilds();
  }

  async function handleEditBuild(b: Build) {
    setForm({ ...b });
    setEditingId(b.id);
  }

  async function handleSave() {
    const payload = { ...form };

    const result = `Name: ${form.name}, Body: ${form.wood_type}, Neck: ${form.neck_wood}, Pickups: ${form.pickup_type}, Bridge: ${form.bridge_type}, Tuners: ${form.tuners_type} (${form.tuners_quantity}), Pots: ${form.pots_type} (${form.pots_quantity}), Switch: ${form.switch_type}`;
    setSummary(result);

    let error;
    if (editingId) {
      ({ error } = await supabase.from('guitar_builds').update(payload).eq('id', editingId));
      setEditingId(null);
    } else {
      ({ error } = await supabase.from('guitar_builds').insert(payload));
    }

    if (error) console.error('Error saving build:', error.message);
    else {
      fetchBuilds();
      setForm({
        name: '', wood_type: '', neck_wood: '', pickup_type: '', bridge_type: '',
        tuners_type: '', tuners_quantity: 0,
        pots_type: '', pots_quantity: 0,
        switch_type: ''
      });
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold mb-4">🎸 Guitar Build Workflow</h1>
   <Card className="p-4">
  <CardContent className="space-y-4">
    <h2 className="text-xl font-semibold mb-2">🎸 Guitar Build Workflow</h2>

    <Input placeholder="Guitar Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
    <Input placeholder="Body Wood" value={form.wood_type} onChange={(e) => setForm({ ...form, wood_type: e.target.value })} />
    <Input placeholder="Neck Wood" value={form.neck_wood} onChange={(e) => setForm({ ...form, neck_wood: e.target.value })} />
    <Input placeholder="Pickup Type" value={form.pickup_type} onChange={(e) => setForm({ ...form, pickup_type: e.target.value })} />
    <Input placeholder="Bridge Type" value={form.bridge_type} onChange={(e) => setForm({ ...form, bridge_type: e.target.value })} />

    <div className="flex gap-4">
      <Input
        className="w-2/3"
        placeholder="Tuners Type"
        value={form.tuners_type}
        onChange={(e) => setForm({ ...form, tuners_type: e.target.value })}
      />
      <Input
        className="w-1/3"
        type="number"
        placeholder="Qty"
        value={form.tuners_quantity || ''}
        onChange={(e) => setForm({ ...form, tuners_quantity: Number(e.target.value) })}
      />
    </div>

    <div className="flex gap-4">
      <Input
        className="w-2/3"
        placeholder="Pots Type"
        value={form.pots_type}
        onChange={(e) => setForm({ ...form, pots_type: e.target.value })}
      />
      <Input
        className="w-1/3"
        type="number"
        placeholder="Qty"
        value={form.pots_quantity || ''}
        onChange={(e) => setForm({ ...form, pots_quantity: Number(e.target.value) })}
      />
    </div>

    <Input
      placeholder="Switch Type"
      value={form.switch_type}
      onChange={(e) => setForm({ ...form, switch_type: e.target.value })}
    />

    <Button onClick={handleSave}>Save Build</Button>

    {summary && (
      <div className="mt-4 p-3 border rounded bg-green-50">
        <p className="font-semibold">✅ Build saved:</p>
        <p>{summary}</p>
      </div>
    )}
  </CardContent>
</Card>

      {builds.length > 0 && (
        <Card className="p-4">
          <CardContent>
            <h2 className="text-xl font-semibold mb-4">📋 Past Builds</h2>
            <ul className="space-y-4">
              {builds.map((b) => (
                <li key={b.id} className="border p-3 rounded shadow-sm">
                  <div className="font-medium">{b.name}</div>
                  <div className="text-sm text-gray-700">Body: {b.wood_type}</div>
                  <div className="text-sm text-gray-700">Neck: {b.neck_wood}</div>
                  <div className="text-sm text-gray-700">Pickups: {b.pickup_type}</div>
                  <div className="text-sm text-gray-700">Bridge: {b.bridge_type}</div>
                  <div className="text-sm text-gray-700">Tuners: {b.tuners_type} ({b.tuners_quantity})</div>
                  <div className="text-sm text-gray-700">Pots: {b.pots_type} ({b.pots_quantity})</div>
                  <div className="text-sm text-gray-700">Switch: {b.switch_type}</div>
                  <div className="flex gap-2 mt-2">
                    <Button onClick={() => handleEditBuild(b)} className="bg-blue-600 text-white text-xs px-3 py-1 rounded">Edit</Button>
                    <Button onClick={() => handleDeleteBuild(b.id)} className="bg-red-600 text-white text-xs px-3 py-1 rounded">
                      <Trash2 size={14} className="inline-block mr-1" /> Delete
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}