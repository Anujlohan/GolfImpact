import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { createClient } from '@/lib/supabase/server';
import { getLocalSession } from '@/lib/auth/session';
import { Profile, Subscription } from '@/types/database';

export const metadata: Metadata = {
  title: 'Digital Heroes | Play-to-Impact Fair Lottery Platform',
  description:
    'Turn your gaming high scores into life-changing lottery prizes and verified charity contributions with 100% transparency.',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let user: Profile | null = null;
  let subscription: Subscription | null = null;

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (supabaseUrl && !supabaseUrl.includes('mock.supabase.co')) {
      const supabase = await createClient();
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (authUser) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .maybeSingle();

        const { data: sub } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', authUser.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        user = profile || {
          id: authUser.id,
          full_name: authUser.user_metadata?.full_name || 'Hero',
          avatar_url: authUser.user_metadata?.avatar_url || null,
          phone: authUser.user_metadata?.phone || null,
          role: authUser.user_metadata?.role || 'USER',
          created_at: authUser.created_at,
          updated_at: authUser.created_at,
        };
        subscription = sub;
      }
    }
  } catch {
    // Graceful fallback for offline / mock Supabase
  }

  if (!user) {
    const localUser = await getLocalSession();
    if (localUser) {
      user = {
        id: localUser.id,
        full_name: localUser.full_name,
        avatar_url: null,
        phone: localUser.phone || null,
        role: localUser.role,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      subscription = {
        id: `sub_${localUser.id}`,
        user_id: localUser.id,
        plan_id: 'plan_monthly',
        status: 'ACTIVE',
        stripe_customer_id: `cus_${localUser.id}`,
        stripe_subscription_id: `sub_stripe_${localUser.id}`,
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        cancel_at_period_end: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }
  }

  return (
    <html lang="en" className="dark">
      <body className="flex min-h-screen flex-col bg-slate-950 text-slate-100 antialiased selection:bg-emerald-500/30 selection:text-white">
        <Navbar user={user} subscription={subscription} />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
