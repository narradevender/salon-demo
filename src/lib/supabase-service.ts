import { createClient } from "@supabase/supabase-js";
import { Database } from "@/lib/db";

const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase URL or key environment variables");
}

export const supabaseService = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
});
