import { describe, it, expect, vi, beforeEach } from 'vitest';
import { signupSchema, loginSchema } from '@/lib/validations/auth';

describe('Auth Validation & Schema Unit Tests', () => {
  it('validates a correct signup payload', () => {
    const validData = {
      fullName: 'aman',
      email: 'aman@gmail.com',
      password: 'password123',
      phone: '+91 123456789',
    };

    const parsed = signupSchema.safeParse(validData);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.fullName).toBe('aman');
      expect(parsed.data.email).toBe('aman@gmail.com');
    }
  });

  it('rejects short passwords in signup', () => {
    const invalidData = {
      fullName: 'aman',
      email: 'aman@gmail.com',
      password: '123',
    };

    const parsed = signupSchema.safeParse(invalidData);
    expect(parsed.success).toBe(false);
  });

  it('validates login payload', () => {
    const loginData = {
      email: 'aman@gmail.com',
      password: 'password123',
    };

    const parsed = loginSchema.safeParse(loginData);
    expect(parsed.success).toBe(true);
  });
});
