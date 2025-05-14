// src/pages/admin.tsx
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import CsvUploader from '../components/CsvUploader';

export default function AdminPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) navigate('/login');
    };
    checkAuth();
  }, [navigate]);

  const handleImport = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(import.meta.env.VITE_IMPORT_ENDPOINT!, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setMessage(`✅ Imported ${data.imported} items successfully.`);
      } else {
        setMessage(`❌ Import failed: ${data.error}`);
      }
    } catch (err: any) {
      setMessage(`❌ Unexpected error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-12 px-4">
      <h1 className="text-2xl font-bold mb-6">Admin Inventory Controls</h1>
      <CsvUploader />
      <button
        onClick={handleImport}
        disabled={loading}
        className="mt-6 bg-black text-white px-4 py-2 rounded"
      >
        {loading ? 'Importing...' : 'Import Inventory from CSV'}
      </button>
      {message && <p className="mt-4 text-sm text-gray-700">{message}</p>}
    </div>
  );
}
