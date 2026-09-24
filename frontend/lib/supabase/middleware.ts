import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { normalizeSupabaseUrl, getPublishableKey, isSupabaseConfigured } from './client';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const pathname = request.nextUrl.pathname;
  const dhSessionCookie = request.cookies.get('dh_session');
  let localUser: { id: string; email: string; full_name: string; role: string } | null = null;
  if (dhSessionCookie?.value) {
    try {
      localUser = JSON.parse(dhSessionCookie.value);
    } catch {
      // Invalid cookie JSON
    }
  }

  const supabaseUrl = normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const publishableKey = getPublishableKey();
  let user = null;

  // Only attempt network auth if real Supabase credentials are configured
  if (isSupabaseConfigured()) {
    try {
      const supabase = createServerClient(supabaseUrl, publishableKey, {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
            supabaseResponse = NextResponse.next({
              request,
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            );
          },
        },
      });

      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      user = authUser;
    } catch {
      // Supabase network offline or session unavailable
    }
  }

  const isAuthenticated = !!user || !!localUser;
  const isAdmin = localUser?.role === 'ADMIN' || user?.user_metadata?.role === 'ADMIN';

  // Protected subscriber routes
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/onboarding')) {
    if (!isAuthenticated) {
      const url = request.nextUrl.clone();
      url.pathname = '/auth/login';
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }
  }

  // Admin routes
  if (pathname.startsWith('/admin')) {
    if (!isAuthenticated) {
      const url = request.nextUrl.clone();
      url.pathname = '/auth/login';
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }

    if (!isAdmin) {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
