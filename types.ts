
export interface Purchase {
  id: string;
  familyId: string;
  name: string;
  quantity: number;
  price: number;
  date: string;
  category: string;
}

export interface ShoppingItem {
  id: string;
  familyId: string;
  name: string;
  category: string;
  isUrgent: boolean;
}

export interface NotificationPreference {
  id: string;
  threshold: number; // percentage (0-100+)
  type: 'info' | 'warning' | 'error' | 'success';
  enabled: boolean;
}

export interface FamilyAccount {
  email: string;
  familyName: string;
  password: string; // Plain text for local storage demo
  monthlyBudget: number;
  notificationPreferences: NotificationPreference[];
}

export type PurchaseFormData = Omit<Purchase, 'id' | 'familyId'>;

export enum Category {
  Fruits = 'Fruits & Vegetables',
  Dairy = 'Dairy & Eggs',
  Meat = 'Meat & Seafood',
  Pantry = 'Pantry',
  Bakery = 'Bakery',
  Beverages = 'Beverages',
  Household = 'Household',
  Other = 'Other'
}
