import { createClient } from '@supabase/supabase-js';
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const supabase = createClient(supabaseUrl, supabaseKey);
console.log("🔍 VITE_SUPABASE_URL =", import.meta.env.VITE_SUPABASE_URL);
console.log("🔍 VITE_SUPABASE_ANON_KEY =", import.meta.env.VITE_SUPABASE_ANON_KEY);
