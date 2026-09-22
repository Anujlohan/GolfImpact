import { describe, it, expect } from 'vitest';
import { directDonationSchema } from '@/lib/validations/charity';
import { CharityService } from '@/lib/services/charity.service';

describe('Direct Contribution Validation & Workflow (PRD Section 08.1)', () => {
  const testCharityId = 'c1111111-1111-1111-1111-111111111111';

  it('rejects donation when amount is 0 or negative', () => {
    const resZero = directDonationSchema.safeParse({
      charityId: testCharityId,
      amount: 0,
    });
    expect(resZero.success).toBe(false);

    const resNeg = directDonationSchema.safeParse({
      charityId: testCharityId,
      amount: -25,
    });
    expect(resNeg.success).toBe(false);
  });

  it('rejects donation when amount is less than minimum $1.00', () => {
    const res = directDonationSchema.safeParse({
      charityId: testCharityId,
      amount: 0.5,
    });
    expect(res.success).toBe(false);
  });

  it('accepts valid donation amount with no email (email is optional)', () => {
    const res = directDonationSchema.safeParse({
      charityId: testCharityId,
      amount: 50,
    });
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.amount).toBe(50);
      expect(res.data.email).toBeUndefined();
    }
  });

  it('accepts valid donation amount with empty string email', () => {
    const res = directDonationSchema.safeParse({
      charityId: testCharityId,
      amount: 100,
      email: '',
    });
    expect(res.success).toBe(true);
  });

  it('rejects invalid email format when provided', () => {
    const res = directDonationSchema.safeParse({
      charityId: testCharityId,
      amount: 50,
      email: 'not-an-email',
    });
    expect(res.success).toBe(false);
  });

  it('accepts valid email format when provided', () => {
    const res = directDonationSchema.safeParse({
      charityId: testCharityId,
      amount: 75,
      email: 'donor@example.com',
    });
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.email).toBe('donor@example.com');
    }
  });

  it('processes direct donation through CharityService and increments charity total_raised', async () => {
    const { charity: initialCharity } = await CharityService.getCharityById(testCharityId);
    const initialRaised = initialCharity.total_raised || 0;

    const donation = await CharityService.processDirectDonation(
      'test-donor-id',
      testCharityId,
      5000, // $50.00 in cents
      'donor@example.com'
    );

    expect(donation.amount).toBe(5000);
    expect(donation.currency).toBe('usd');

    const { charity: updatedCharity } = await CharityService.getCharityById(testCharityId);
    expect(updatedCharity.total_raised).toBe(initialRaised + 5000);
  });
});
