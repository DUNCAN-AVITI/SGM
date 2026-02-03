
import { Purchase } from '../types';

const initialPurchases: Purchase[] = [
  {
    "id": "1",
    // Added missing familyId property
    "familyId": "demo",
    "name": "Pomme",
    "quantity": 5,
    "price": 0.5,
    "date": "2023-10-01",
    "category": "Fruits & Vegetables"
  },
  {
    "id": "2",
    // Added missing familyId property
    "familyId": "demo",
    "name": "Lait",
    "quantity": 2,
    "price": 1.2,
    "date": "2023-10-02",
    "category": "Dairy & Eggs"
  },
  {
    "id": "3",
    // Added missing familyId property
    "familyId": "demo",
    "name": "Pain",
    "quantity": 1,
    "price": 2.5,
    "date": "2023-10-03",
    "category": "Bakery"
  },
  {
    "id": "4",
    // Added missing familyId property
    "familyId": "demo",
    "name": "Pomme",
    "quantity": 3,
    "price": 0.5,
    "date": "2023-10-04",
    "category": "Fruits & Vegetables"
  }
];

export default initialPurchases;
