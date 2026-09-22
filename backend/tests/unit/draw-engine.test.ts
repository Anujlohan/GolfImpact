import { describe, it, expect } from 'vitest';
import { generateRandomDrawNumbers } from '@/lib/draw-engine/random';
import { generateAlgorithmicDrawNumbers, hashStringToSeed } from '@/lib/draw-engine/algorithmic';

describe('Draw Engine Generators', () => {
  describe('Random Draw Engine', () => {
    it('should generate exactly 5 numbers', () => {
      const numbers = generateRandomDrawNumbers();
      expect(numbers).toHaveLength(5);
    });

    it('should generate unique numbers in range 1 to 45', () => {
      const numbers = generateRandomDrawNumbers();
      const uniqueSet = new Set(numbers);
      expect(uniqueSet.size).toBe(5);

      for (const num of numbers) {
        expect(num).toBeGreaterThanOrEqual(1);
        expect(num).toBeLessThanOrEqual(45);
      }
    });

    it('should return numbers sorted ascending', () => {
      const numbers = generateRandomDrawNumbers();
      const sorted = [...numbers].sort((a, b) => a - b);
      expect(numbers).toEqual(sorted);
    });
  });

  describe('Algorithmic Frequency-Weighted Draw Engine', () => {
    it('should generate 5 unique numbers within 1 to 45', () => {
      const snapshots = [
        [5, 12, 23, 34, 45],
        [5, 18, 23, 30, 42],
        [1, 5, 23, 39, 44],
      ];

      const numbers = generateAlgorithmicDrawNumbers({
        participantSnapshots: snapshots,
        seedString: 'test_seed_2026',
      });

      expect(numbers).toHaveLength(5);
      expect(new Set(numbers).size).toBe(5);
      for (const num of numbers) {
        expect(num).toBeGreaterThanOrEqual(1);
        expect(num).toBeLessThanOrEqual(45);
      }
    });

    it('should be 100% deterministic given the same seed and snapshot input', () => {
      const snapshots = [
        [3, 14, 22, 35, 41],
        [7, 14, 21, 28, 35],
      ];

      const run1 = generateAlgorithmicDrawNumbers({
        participantSnapshots: snapshots,
        seedString: 'fixed_seed_abc',
      });

      const run2 = generateAlgorithmicDrawNumbers({
        participantSnapshots: snapshots,
        seedString: 'fixed_seed_abc',
      });

      expect(run1).toEqual(run2);
    });
  });
});
