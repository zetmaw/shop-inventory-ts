// /api/create-user.ts (Vercel Edge Function or Serverless Function)
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!  // make sure this is secured in Vercel
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Missing email or password' });
  }

  try {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ user: data.user });
  } catch (err) {
    console.error('Unhandled error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}