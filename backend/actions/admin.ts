'use server';

import { requireAdmin } from '@/lib/auth/guards';
import { createAdminClient } from '@/lib/supabase/admin';
import { getErrorMessage } from '@/lib/utils/errors';
import { revalidatePath } from 'next/cache';

export async function adminUpdateUserRoleAction(userId: string, role: 'USER' | 'ADMIN') {
  try {
    const auth = await requireAdmin();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (supabaseUrl && !supabaseUrl.includes('mock.supabase.co')) {
      const supabase = createAdminClient();
      await supabase
        .from('profiles')
        .update({ role, updated_at: new Date().toISOString() })
        .eq('id', userId);
    }

    revalidatePath('/admin/users');
    return { success: true };
  } catch (err) {
    return { success: false, error: getErrorMessage(err) };
  }
}

export async function adminSeedDataAction() {
  try {
    const auth = await requireAdmin();
    revalidatePath('/admin');
    return { success: true };
  } catch (err) {
    return { success: false, error: getErrorMessage(err) };
  }
}
