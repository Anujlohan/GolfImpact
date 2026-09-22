import { z } from 'zod';

export const charitySelectionSchema = z.object({
  charityId: z.string().min(1, 'Please select a valid charity'),
  contributionPercentage: z
    .number({ invalid_type_error: 'Percentage must be a number' })
    .int('Percentage must be an integer')
    .min(10, 'Minimum charity contribution is 10%')
    .max(100, 'Maximum contribution is 100%'),
});

export const directDonationSchema = z.object({
  charityId: z.string().min(1, 'Please select a valid charity'),
  amount: z
    .number({ invalid_type_error: 'Donation amount is required' })
    .positive('Donation amount must be greater than $0')
    .min(1, 'Minimum donation amount is $1.00')
    .max(100000, 'Maximum single donation amount is $100,000.00'),
  email: z
    .string()
    .trim()
    .email('Please enter a valid email address')
    .optional()
    .or(z.literal('')),
});

export const charityAdminSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  slug: z.string().min(2, 'Slug must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  imageUrl: z.string().url('Please enter a valid image URL'),
  websiteUrl: z.string().url('Please enter a valid website URL').optional().or(z.literal('')),
  category: z.string().default('Community'),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export type CharitySelectionFormData = z.infer<typeof charitySelectionSchema>;
export type DirectDonationFormData = z.infer<typeof directDonationSchema>;
export type CharityAdminFormData = z.infer<typeof charityAdminSchema>;
