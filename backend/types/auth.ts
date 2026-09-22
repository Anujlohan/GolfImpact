import { Profile, UserRole } from './database';

export interface AuthUser {
  id: string;
  email: string;
  profile: Profile;
}

export interface SessionContext {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isSubscriber: boolean;
  isAdmin: boolean;
}

export interface AuthResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}
