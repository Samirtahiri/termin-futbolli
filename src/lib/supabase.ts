import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { AppState } from "./types";

let client: SupabaseClient | null = null;

export function isSupabaseEnabled(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseEnabled()) return null;
  if (!client) {
    client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: true, autoRefreshToken: true } },
    );
  }
  return client;
}

export function supabaseNote(state: AppState): string | null {
  if (isSupabaseEnabled()) return null;
  if (!state.organizer) return null;
  return "Pa Supabase, In i telefonave të tjerë nuk syncon. Ky telefon e ruan listën.";
}
