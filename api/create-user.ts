// api/create-user.ts
import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const { email, password } = req.body;
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  });
  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json(data);
}