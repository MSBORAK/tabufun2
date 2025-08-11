import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hqimunrapgeqdyxfroda.supabase.co'; 
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhxaW11bnJhcGdlcWR5eGZyb2RhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyNTA5MjgsImV4cCI6MjA2ODgyNjkyOH0.F6jASVgl3xrpn2T-ssXmei17ED-gqrfh6L5c_ADvWbU'; // Public anon key
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
