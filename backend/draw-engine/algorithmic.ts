/**
 * Deterministic Frequency-Weighted Algorithmic Draw Engine
 * Fully documented in docs/DRAW_ALGORITHM.md
 */

// Simple deterministic pseudo-random number generator (Mulberry32)
function createSeededPRNG(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Simple string hash to integer seed
export function hashStringToSeed(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash) || 123456789;
}

export interface AlgorithmicDrawOptions {
  participantSnapshots: number[][]; // e.g. [[3, 14, 22, 35, 41], ...]
  seedString: string; // e.g. "draw_2026_09_pool_50000"
  count?: number;
  min?: number;
  max?: number;
}

export function generateAlgorithmicDrawNumbers(options: AlgorithmicDrawOptions): number[] {
  const { participantSnapshots, seedString, count = 5, min = 1, max = 45 } = options;
  const prng = createSeededPRNG(hashStringToSeed(seedString));

  // 1. Calculate frequency distribution
  const frequencies = new Map<number, number>();
  for (let i = min; i <= max; i++) {
    frequencies.set(i, 0);
  }

  for (const snapshot of participantSnapshots) {
    for (const num of snapshot) {
      if (num >= min && num <= max) {
        frequencies.set(num, (frequencies.get(num) || 0) + 1);
      }
    }
  }

  // 2. Laplace smoothed weights: w(n) = f(n) + 1
  const weights = new Map<number, number>();
  for (let i = min; i <= max; i++) {
    weights.set(i, (frequencies.get(i) || 0) + 1);
  }

  // 3. Weighted sampling without replacement
  const selected: number[] = [];
  const remainingNumbers: number[] = [];
  for (let i = min; i <= max; i++) {
    remainingNumbers.push(i);
  }

  for (let step = 0; step < count; step++) {
    // Sum weights of remaining candidates
    let totalWeight = 0;
    for (const num of remainingNumbers) {
      totalWeight += weights.get(num) || 1;
    }

    // Pick random target in [0, totalWeight)
    const target = prng() * totalWeight;
    let accumulated = 0;
    let pickedIndex = 0;

    for (let i = 0; i < remainingNumbers.length; i++) {
      const num = remainingNumbers[i];
      accumulated += weights.get(num) || 1;
      if (accumulated >= target) {
        pickedIndex = i;
        break;
      }
    }

    const pickedNumber = remainingNumbers[pickedIndex];
    selected.push(pickedNumber);
    remainingNumbers.splice(pickedIndex, 1);
  }

  return selected.sort((a, b) => a - b);
}
