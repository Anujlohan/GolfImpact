import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { normalizeSupabaseUrl, getPublishableKey } from './client';

/**
 * Frontend Server Supabase Client (for Server Components, Server Actions & Route Handlers)
 * Exclusively uses the public Supabase URL and Publishable Key with session cookies.
 * NEVER exposes or uses the backend secret key.
 */
export async function createClient() {
  const cookieStore = await cookies();
  const supabaseUrl = normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const publishableKey = getPublishableKey();

  return createServerClient(supabaseUrl, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing user sessions.
        }
      },
    },
  });
}
