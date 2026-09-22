/**
 * Generates 5 unique random numbers between min and max (inclusive).
 * Uses unbiased array shuffling / sampling.
 */
export function generateRandomDrawNumbers(count = 5, min = 1, max = 45): number[] {
  if (count > (max - min + 1)) {
    throw new Error('Count exceeds available range of unique numbers');
  }

  const pool: number[] = [];
  for (let i = min; i <= max; i++) {
    pool.push(i);
  }

  // Fisher-Yates shuffle
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  return pool.slice(0, count).sort((a, b) => a - b);
}
