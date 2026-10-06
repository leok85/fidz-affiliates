import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY environment variables');
}

// Sem tipos gerados ainda: as tabelas do programa de afiliados não existem no schema (fidz-client-admin).
export const supabase = createClient(supabaseUrl, supabaseKey);
