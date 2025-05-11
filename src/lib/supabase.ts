// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://orrfckfzavkodlapmcml.supabase.co';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ycmZja2Z6YXZrb2RsYXBtY21sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY4MDc2OTYsImV4cCI6MjA2MjM4MzY5Nn0.uWQzCGwYTRflVM3dCcpMjA8SN8aQLFNnI6jCtyJJBVw';

export const supabase = createClient(supabaseUrl, supabaseKey);