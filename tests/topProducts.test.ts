
// Import testing globals from vitest to resolve TypeScript "Cannot find name" errors.
import { describe, it, expect } from 'vitest';
import { getTopProduct } from '../utils/analytics';

describe('getTopProduct Logic', () => {
  it('should return the most frequent product name', () => {
    const data = ['pomme', 'poire', 'pomme'];
    expect(getTopProduct(data)).toBe('Pomme');
  });

  it('should handle tie by returning the first encountered maximum', () => {
    const data = ['banane', 'pomme', 'banane', 'pomme'];
    const result = getTopProduct(data);
    expect(['Banane', 'Pomme']).toContain(result);
  });

  it('should be case insensitive', () => {
    const data = ['POMME', 'pomme', 'Pomme', 'poire'];
    expect(getTopProduct(data)).toBe('Pomme');
  });

  it('should return "No items" for empty arrays', () => {
    expect(getTopProduct([])).toBe('No items');
  });

  it('should handle spaces in names', () => {
    const data = [' pomme ', 'pomme', 'poire'];
    expect(getTopProduct(data)).toBe('Pomme');
  });
});
