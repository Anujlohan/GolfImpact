import { createClient as createSupabaseAdminClient } from '@supabase/supabase-js';

export function createAdminClient() {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mock.supabase.co';
  const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    'mock-service-key';

  if (process.env.NODE_ENV === 'production' && !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.warn(
      '[SECURITY WARNING] SUPABASE_SERVICE_ROLE_KEY is not configured in backend environment. Admin operations requiring elevated privileges may fail.'
    );
  }

  return createSupabaseAdminClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
