import { cookies } from 'next/headers';

export interface LocalSessionUser {
  id: string;
  email: string;
  full_name: string;
  role: 'USER' | 'ADMIN';
  phone?: string;
}

const SESSION_COOKIE_NAME = 'dh_session';

export async function setLocalSession(user: LocalSessionUser) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, JSON.stringify(user), {
    path: '/',
    httpOnly: false, // Accessible to client & middleware
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function getLocalSession(): Promise<LocalSessionUser | null> {
  try {
    const cookieStore = await cookies();
    const cookie = cookieStore.get(SESSION_COOKIE_NAME);
    if (!cookie?.value) return null;
    return JSON.parse(cookie.value);
  } catch {
    return null;
  }
}

export async function clearLocalSession() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE_NAME);
  } catch {
    // Ignore error
  }
}
