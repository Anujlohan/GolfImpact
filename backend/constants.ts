export const APP_CONFIG = {
  name: 'Digital Heroes',
  description: 'The Play-to-Impact lottery platform where every score helps fund world-changing charity causes.',
  url:
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'),
  maxScoresPerUser: 5,
  minScore: 1,
  maxScore: 45,
  minCharityPercentage: 10,
  prizeTierPercentages: {
    '5_MATCH': 40,
    '4_MATCH': 35,
    '3_MATCH': 25,
  } as const,
  charityCategories: [
    'All',
    'Education & Tech',
    'Environment',
    'Healthcare',
    'Community',
    'Wildlife & Nature',
  ],
};
