import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Returns null if env vars are not configured yet (graceful degradation to localStorage)
export const supabase =
  supabaseUrl && supabaseAnonKey &&
  !supabaseUrl.includes("your_supabase") &&
  !supabaseAnonKey.includes("your_supabase")
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

export const isSupabaseEnabled = supabase !== null;
