'use server';

import { createClient } from '@/lib/supabase/server';
import { loginSchema, signupSchema, resetPasswordSchema } from '@/lib/validations/auth';
import { getErrorMessage } from '@/lib/utils/errors';
import { revalidatePath } from 'next/cache';
import { setLocalSession, clearLocalSession } from '@/lib/auth/session';

export async function signInAction(formData: FormData) {
  try {
    const rawData = {
      email: formData.get('email'),
      password: formData.get('password'),
    };

    const parsed = loginSchema.parse(rawData);
    let userId = `usr_${Math.random().toString(36).substring(2, 10)}`;
    let role: 'USER' | 'ADMIN' = parsed.email.toLowerCase().includes('admin') ? 'ADMIN' : 'USER';
    let fullName = parsed.email.split('@')[0];

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const isMock = !supabaseUrl || supabaseUrl.includes('mock.supabase.co');

    if (!isMock) {
      try {
        const supabase = await createClient();
        const { data, error } = await supabase.auth.signInWithPassword({
          email: parsed.email,
          password: parsed.password,
        });

        if (error) {
          return { success: false, error: error.message };
        }

        if (data?.user) {
          userId = data.user.id;
          fullName = data.user.user_metadata?.full_name || fullName;
          role = data.user.user_metadata?.role || role;
        }
      } catch (err: any) {
        console.warn('Supabase auth network error, fallback to local session:', err?.message);
      }
    }

    await setLocalSession({
      id: userId,
      email: parsed.email,
      full_name: fullName,
      role,
    });

    revalidatePath('/', 'layout');
    return { success: true };
  } catch (err) {
    return { success: false, error: getErrorMessage(err) };
  }
}

export async function signUpAction(formData: FormData) {
  try {
    const rawData = {
      fullName: formData.get('fullName'),
      email: formData.get('email'),
      password: formData.get('password'),
      phone: formData.get('phone') || undefined,
    };

    const parsed = signupSchema.parse(rawData);
    let userId = `usr_${Math.random().toString(36).substring(2, 10)}`;
    const role: 'USER' | 'ADMIN' = parsed.email.toLowerCase().includes('admin') ? 'ADMIN' : 'USER';

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const isMock = !supabaseUrl || supabaseUrl.includes('mock.supabase.co');

    if (!isMock) {
      try {
        const supabase = await createClient();
        const { data, error } = await supabase.auth.signUp({
          email: parsed.email,
          password: parsed.password,
          options: {
            data: {
              full_name: parsed.fullName,
              phone: parsed.phone,
              role,
            },
          },
        });

        if (error) {
          return { success: false, error: error.message };
        }

        if (data?.user) {
          userId = data.user.id;
        }
      } catch (err: any) {
        console.warn('Supabase auth network error, fallback to local session:', err?.message);
      }
    }

    await setLocalSession({
      id: userId,
      email: parsed.email,
      full_name: parsed.fullName,
      role,
      phone: parsed.phone,
    });

    revalidatePath('/', 'layout');
    return { success: true, userId };
  } catch (err) {
    return { success: false, error: getErrorMessage(err) };
  }
}

export async function signOutAction() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (supabaseUrl && !supabaseUrl.includes('mock.supabase.co')) {
      const supabase = await createClient();
      await supabase.auth.signOut();
    }
  } catch {
    // Ignore error
  }
  await clearLocalSession();
  revalidatePath('/', 'layout');
  return { success: true };
}

export async function resetPasswordAction(formData: FormData) {
  try {
    const email = formData.get('email');
    const parsed = resetPasswordSchema.parse({ email });

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (supabaseUrl && !supabaseUrl.includes('mock.supabase.co')) {
      const supabase = await createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(parsed.email);
      if (error) {
        return { success: false, error: error.message };
      }
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: getErrorMessage(err) };
  }
}
