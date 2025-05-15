import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function Redirector() {
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        navigate('/inventory');
      } else {
        navigate('/login');
      }
    };

    checkSession();
  }, [navigate]);

  return <div className="p-4 text-gray-500">🔄 Redirecting...</div>;
}