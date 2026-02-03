
import React, { useState, useEffect, useRef } from 'react';
import { Purchase, PurchaseFormData, Category } from '../types';
import Button from './Button';

interface PurchaseFormProps {
  onSubmit: (data: PurchaseFormData) => void;
  editingPurchase?: Purchase | null;
  onCancel?: () => void;
}

const categoryIcons: Record<string, React.ReactNode> = {
  [Category.Fruits]: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3c2.761 0 5 2.239 5 5 0 2.761-2.239 5-5 5s-5-2.239-5-5c0-2.761 2.239-5 5-5zM12 13v8M9 21h6" />
    </svg>
  ),
  [Category.Dairy]: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2zM9 7h6M9 11h6M9 15h6" />
    </svg>
  ),
  [Category.Meat]: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 8c0-2.21-1.79-4-4-4s-4 1.79-4 4c0 2.21 1.79 4 4 4s4-1.79 4-4zM10 8c0-2.21-1.79-4-4-4S2 5.79 2 8c0 2.21 1.79 4 4 4s4-1.79 4-4zM21 16c0-2.21-1.79-4-4-4s-4 1.79-4 4c0 2.21 1.79 4 4 4s4-1.79 4-4zM10 16c0-2.21-1.79-4-4-4S2 13.79 2 16c0 2.21 1.79 4 4 4s4-1.79 4-4z" />
    </svg>
  ),
  [Category.Pantry]: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
  [Category.Bakery]: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15.5a3.5 3.5 0 01-7 0V13h7v2.5zM10 13h7v2.5a3.5 3.5 0 01-7 0V13zM3 15.5a3.5 3.5 0 017 0V13H3v2.5z" />
    </svg>
  ),
  [Category.Beverages]: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  [Category.Household]: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-7.714 2.143L11 21l-2.286-6.857L1 12l7.714-2.143L11 3z" />
    </svg>
  ),
  [Category.Other]: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
};

const PurchaseForm: React.FC<PurchaseFormProps> = ({ onSubmit, editingPurchase, onCancel }) => {
  const [formData, setFormData] = useState<PurchaseFormData>({
    name: '',
    quantity: 1,
    price: 0,
    date: new Date().toISOString().split('T')[0],
    category: Category.Other
  });

  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editingPurchase) {
      setFormData({
        name: editingPurchase.name,
        quantity: editingPurchase.quantity,
        price: editingPurchase.price,
        date: editingPurchase.date,
        category: editingPurchase.category as Category
      });
    }
  }, [editingPurchase]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCategoryOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    if (!editingPurchase) {
      setFormData({
        name: '',
        quantity: 1,
        price: 0,
        date: new Date().toISOString().split('T')[0],
        category: Category.Other
      });
    }
  };

  const selectCategory = (cat: Category) => {
    setFormData({ ...formData, category: cat });
    setIsCategoryOpen(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl shadow-xl border border-indigo-100 space-y-6 animate-in fade-in slide-in-from-top-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-black text-slate-900">
            {editingPurchase ? 'Modifier l\'entrée' : 'Enregistrer un achat'}
          </h3>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">Données de la base locale</p>
        </div>
        {onCancel && (
          <button type="button" onClick={onCancel} className="text-slate-400 hover:text-slate-600 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1.5">
          <label className="block text-xs font-black text-slate-500 uppercase tracking-wider ml-1">Nom du produit</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Ex: Lait d'avoine"
            className="w-full px-5 py-4 rounded-2xl bg-white border-2 border-slate-100 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 outline-none transition-all font-black text-slate-950 placeholder:text-slate-300"
          />
        </div>
        
        <div className="space-y-1.5" ref={dropdownRef}>
          <label className="block text-xs font-black text-slate-500 uppercase tracking-wider ml-1">Catégorie</label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsCategoryOpen(!isCategoryOpen)}
              className="w-full px-5 py-4 rounded-2xl bg-white border-2 border-slate-100 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 outline-none transition-all font-black text-slate-950 text-left flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <span className="text-indigo-600">{categoryIcons[formData.category]}</span>
                <span>{formData.category}</span>
              </div>
              <svg className={`w-5 h-5 text-slate-400 transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isCategoryOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-64 overflow-y-auto custom-scrollbar">
                {Object.values(Category).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => selectCategory(cat)}
                    className={`w-full px-5 py-3.5 flex items-center gap-3 text-sm font-bold transition-colors ${
                      formData.category === cat 
                        ? 'bg-indigo-50 text-indigo-700' 
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className={formData.category === cat ? 'text-indigo-600' : 'text-slate-400'}>
                      {categoryIcons[cat]}
                    </span>
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="block text-xs font-black text-slate-500 uppercase tracking-wider ml-1">Qté</label>
            <input
              type="number"
              min="0.1"
              step="0.1"
              required
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) })}
              className="w-full px-5 py-4 rounded-2xl bg-white border-2 border-slate-100 focus:border-indigo-600 outline-none transition-all font-black text-slate-950"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-black text-slate-500 uppercase tracking-wider ml-1">Prix (€)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              required
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
              className="w-full px-5 py-4 rounded-2xl bg-white border-2 border-slate-100 focus:border-indigo-600 outline-none transition-all font-black text-slate-950"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-black text-slate-500 uppercase tracking-wider ml-1">Date d'achat</label>
          <input
            type="date"
            required
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="w-full px-5 py-4 rounded-2xl bg-white border-2 border-slate-100 focus:border-indigo-600 outline-none transition-all font-black text-slate-950"
          />
        </div>
      </div>

      <div className="flex gap-3 justify-end pt-4 border-t border-slate-50">
        <Button type="submit" className="w-full md:w-auto px-12 py-4 text-base shadow-xl shadow-indigo-100">
          {editingPurchase ? 'Mettre à jour' : 'Sauvegarder dans la DB'}
        </Button>
      </div>
    </form>
  );
};

export default PurchaseForm;
