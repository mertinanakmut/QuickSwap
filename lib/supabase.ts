import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ureyfnnqexslfabinwud.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyZXlmbm5xZXhzbGZhYmlud3VkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1MTAxODQsImV4cCI6MjA4MjA4NjE4NH0.X4YplgIU2DavGy4yrUHt2okGXj9PfncT4YwWAC6lPEE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);