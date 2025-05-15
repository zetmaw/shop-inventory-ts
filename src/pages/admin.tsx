import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        navigate('/login');
      } else {
        setUser(data.session.user);
        setLoading(false);
      }
    });
  }, [navigate]);

  if (loading) {
    return <div className="p-4 text-gray-600">Loading...</div>;
  }

  return (
    <div className="max-w-xl mx-auto py-12 px-4">
      <h1 className="text-2xl font-bold mb-6">Admin Panel</h1>
      <p className="mb-4">Welcome, <strong>{user.email}</strong></p>
      <button
        className="bg-red-500 text-white px-4 py-2 rounded"
        onClick={async () => {
          await supabase.auth.signOut();
          navigate('/login');
        }}
      >
        Log out
      </button>
    </div>
  );
}