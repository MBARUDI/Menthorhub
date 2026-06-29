import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://godkhytkeqsnfpghtqhn.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvZGtoeXRrZXFzbmZwZ2h0cWhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2NjgzNjksImV4cCI6MjA4MDI0NDM2OX0.sk8SRcA2ZuTzFRpg9FP4PpFiVsHTZNamF-ruTnanyU8';

// Create a single supabase client for interacting with your database
export const supabase = (supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey) 
  : null;