import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { normalizeSupabaseUrl, getPublishableKey } from './client';

/**
 * Frontend Admin Client Stub
 * IMPORTANT: To prevent leaking privileged credentials in the deployed frontend,
 * this client NEVER uses or exposes SUPABASE_SECRET_KEY.
 * It uses the public Supabase Publishable Key and client-side access.
 */
export function createAdminClient() {
  const supabaseUrl = normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const publishableKey = getPublishableKey();

  return createSupabaseClient(supabaseUrl, publishableKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
