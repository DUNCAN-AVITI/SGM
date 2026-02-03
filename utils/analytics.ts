
import { Purchase } from '../types';

/**
 * Calculates the most frequent product in an array of product names.
 * Requirement 3: getTopProduct(achats: string[]) => string
 */
export const getTopProduct = (achats: string[]): string => {
  if (achats.length === 0) return 'No items';
  
  const frequencyMap: Record<string, number> = {};
  let maxFreq = 0;
  let topProduct = achats[0];

  for (const item of achats) {
    const normalized = item.toLowerCase().trim();
    frequencyMap[normalized] = (frequencyMap[normalized] || 0) + 1;
    
    if (frequencyMap[normalized] > maxFreq) {
      maxFreq = frequencyMap[normalized];
      topProduct = normalized;
    }
  }

  // Capitalize for display
  return topProduct.charAt(0).toUpperCase() + topProduct.slice(1);
};

export const calculateTotalExpenses = (purchases: Purchase[]): number => {
  return purchases.reduce((sum, p) => sum + (p.price * p.quantity), 0);
};

export const getExpensesByCategory = (purchases: Purchase[]) => {
  const categories: Record<string, number> = {};
  purchases.forEach(p => {
    categories[p.category] = (categories[p.category] || 0) + (p.price * p.quantity);
  });
  return Object.entries(categories).map(([name, value]) => ({ name, value }));
};
