import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Check if Supabase is configured
const isSupabaseConfigured = supabaseUrl && supabaseServiceKey;

if (!isSupabaseConfigured) {
  console.warn('Supabase not configured. Using fallback mode. To enable Supabase, set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.');
}

// Create Supabase client with service role key for server-side operations (with fallback)
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

// Helper to check if Supabase is available
export const isSupabaseAvailable = () => isSupabaseConfigured;

// Database schema types
export interface DatabaseUser {
  id: string;
  full_name: string;
  email: string;
  password_hash: string;
  created_at: string;
  updated_at: string;
}
