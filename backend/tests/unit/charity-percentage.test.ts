import { describe, it, expect } from 'vitest';
import { charitySelectionSchema } from '@/lib/validations/charity';

describe('Charity Selection Constraint (>= 10%)', () => {
  const validUuid = '11111111-1111-1111-1111-111111111111';

  it('should accept 10% minimum contribution', () => {
    const res = charitySelectionSchema.safeParse({
      charityId: validUuid,
      contributionPercentage: 10,
    });
    expect(res.success).toBe(true);
  });

  it('should accept 50% and 100% contributions', () => {
    expect(
      charitySelectionSchema.safeParse({ charityId: validUuid, contributionPercentage: 50 }).success
    ).toBe(true);
    expect(
      charitySelectionSchema.safeParse({ charityId: validUuid, contributionPercentage: 100 }).success
    ).toBe(true);
  });

  it('should reject contribution less than 10%', () => {
    const res = charitySelectionSchema.safeParse({
      charityId: validUuid,
      contributionPercentage: 9,
    });
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.issues[0].message).toContain('Minimum charity contribution is 10%');
    }
  });

  it('should reject contribution greater than 100%', () => {
    const res = charitySelectionSchema.safeParse({
      charityId: validUuid,
      contributionPercentage: 105,
    });
    expect(res.success).toBe(false);
  });
});
