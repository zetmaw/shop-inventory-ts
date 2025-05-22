// api/reset-password.ts
import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const { email } = req.body;
  const { error } = await supabase.auth.admin.resetPasswordForEmail(email);
  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json({ message: 'Password reset email sent' });
}
