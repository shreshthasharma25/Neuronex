import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const isSupabaseEnabled =
  Boolean(supabaseUrl) && Boolean(supabasePublishableKey);

export const supabase = createClient(
  supabaseUrl,
  supabasePublishableKey
);