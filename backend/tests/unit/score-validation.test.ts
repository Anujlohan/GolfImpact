import { describe, it, expect } from 'vitest';
import { scoreInputSchema } from '@/lib/validations/scores';

describe('Score Validation Rules', () => {
  it('should accept valid score in range 1 to 45', () => {
    const valid = {
      score: 25,
      scoreDate: '2026-09-21',
    };
    const result = scoreInputSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it('should accept boundary values 1 and 45', () => {
    expect(scoreInputSchema.safeParse({ score: 1, scoreDate: '2026-09-21' }).success).toBe(true);
    expect(scoreInputSchema.safeParse({ score: 45, scoreDate: '2026-09-21' }).success).toBe(true);
  });

  it('should reject score less than 1', () => {
    const result = scoreInputSchema.safeParse({ score: 0, scoreDate: '2026-09-21' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('between 1 and 45');
    }
  });

  it('should reject score greater than 45', () => {
    const result = scoreInputSchema.safeParse({ score: 46, scoreDate: '2026-09-21' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('between 1 and 45');
    }
  });

  it('should reject invalid date format', () => {
    const result = scoreInputSchema.safeParse({ score: 20, scoreDate: 'invalid-date' });
    expect(result.success).toBe(false);
  });
});
