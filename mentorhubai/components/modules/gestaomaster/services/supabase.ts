import { createClient } from '@supabase/supabase-js';

const PROJECT_ID = 'godkhytkeqsnfpghtqhn';
const SUPABASE_URL = `https://${PROJECT_ID}.supabase.co`;
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvZGtoeXRrZXFzbmZwZ2h0cWhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2NjgzNjksImV4cCI6MjA4MDI0NDM2OX0.sk8SRcA2ZuTzFRpg9FP4PpFiVsHTZNamF-ruTnanyU8';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
