
import React, { useState, useRef } from 'react';
import { ShoppingItem, Category } from '../types';
import Button from './Button';

interface ShoppingListProps {
  items: ShoppingItem[];
  familyName: string;
  onAdd: (name: string, category: string, isUrgent: boolean) => void;
  onImport: (items: Omit<ShoppingItem, 'id' | 'familyId'>[]) => void;
  onRemove: (id: string) => void;
  onConvertToPurchase: (item: ShoppingItem) => void;
  onAiSuggest: () => void;
  isAiLoading: boolean;
}

const ShoppingList: React.FC<ShoppingListProps> = ({ 
  items, 
  familyName,
  onAdd, 
  onImport, 
  onRemove, 
  onConvertToPurchase,
  onAiSuggest,
  isAiLoading
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState(Category.Other);
  const [isUrgent, setIsUrgent] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onAdd(name.trim(), category, isUrgent);
      setName('');
      setIsUrgent(false);
      setIsAdding(false);
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] shadow-sm border-2 border-slate-100 overflow-hidden flex flex-col h-full">
      <div className="p-8 border-b-2 border-slate-50 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-amber-100 p-3 rounded-2xl">
              <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-950 leading-tight">Courses</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">À prévoir prochainement</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={onAiSuggest} 
              disabled={isAiLoading}
              className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all disabled:opacity-50 group border border-indigo-100"
              title="Suggestions IA"
            >
              <svg className={`w-5 h-5 ${isAiLoading ? 'animate-spin' : 'group-hover:scale-110'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </button>
            <Button size="sm" onClick={() => setIsAdding(!isAdding)} variant={isAdding ? 'secondary' : 'primary'} className="rounded-2xl px-5">
              {isAdding ? 'Fermer' : 'Nouveau'}
            </Button>
          </div>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={() => {
              const exportData = { items: items.map(({ name, category, isUrgent }) => ({ name, category, isUrgent })) };
              const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `liste-courses-${familyName.toLowerCase()}.json`;
              link.click();
            }}
            disabled={items.length === 0}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 text-[10px] font-black uppercase tracking-widest text-slate-600 bg-slate-50 hover:bg-white hover:border-slate-200 border-2 border-transparent rounded-2xl transition-all disabled:opacity-30"
          >
            Exporter
          </button>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 text-[10px] font-black uppercase tracking-widest text-slate-600 bg-slate-50 hover:bg-white hover:border-slate-200 border-2 border-transparent rounded-2xl transition-all"
          >
            Importer
          </button>
          <input type="file" ref={fileInputRef} onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (event) => {
              try {
                const json = JSON.parse(event.target?.result as string);
                const toImport = Array.isArray(json) ? json : json.items || [];
                onImport(toImport);
              } catch (err) { alert("Format invalide"); }
            };
            reader.readAsText(file);
          }} accept=".json" className="hidden" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 bg-slate-50/30 custom-scrollbar">
        {isAdding && (
          <form onSubmit={handleSubmit} className="mb-8 p-6 bg-white rounded-3xl border-2 border-indigo-100 shadow-xl shadow-indigo-100/20 space-y-5 animate-in slide-in-from-top-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Produit</label>
              <input
                type="text"
                required
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Café Arabica"
                className="w-full px-5 py-3.5 rounded-2xl border-2 border-slate-100 focus:border-indigo-600 outline-none text-base font-black text-slate-950 placeholder:text-slate-300 transition-all"
              />
            </div>
            <div className="flex items-center justify-between px-1">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={isUrgent}
                  onChange={(e) => setIsUrgent(e.target.checked)}
                  className="w-6 h-6 rounded-xl border-2 border-slate-200 text-indigo-600 focus:ring-4 focus:ring-indigo-50 transition-all"
                />
                <span className="text-sm font-black text-slate-600 group-hover:text-red-500 transition-colors">Urgent</span>
              </label>
              <Button type="submit" size="sm" className="rounded-xl px-8">Ajouter</Button>
            </div>
          </form>
        )}

        <div className="space-y-4">
          {items.length > 0 ? (
            items.map(item => (
              <div key={item.id} className="flex items-center justify-between p-5 rounded-3xl bg-white border-2 border-transparent hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-50/50 transition-all group animate-in zoom-in-95">
                <div className="flex items-center gap-5">
                  <div className={`w-3 h-12 rounded-full shadow-sm ${item.isUrgent ? 'bg-red-500 shadow-red-100 animate-pulse' : 'bg-slate-100'}`} />
                  <div>
                    <h4 className="font-black text-slate-950 text-base group-hover:text-indigo-600 transition-colors">{item.name}</h4>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.category}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                  <button 
                    onClick={() => onConvertToPurchase(item)}
                    className="p-2.5 text-indigo-600 bg-indigo-50 hover:bg-indigo-600 hover:text-white rounded-xl transition-all shadow-sm"
                    title="Valider l'achat"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                  <button 
                    onClick={() => onRemove(item.id)}
                    className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="py-20 text-center space-y-4">
              <div className="bg-white w-20 h-20 rounded-[2rem] shadow-sm border-2 border-slate-50 flex items-center justify-center mx-auto transition-transform hover:scale-105">
                <svg className="w-10 h-10 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <p className="text-slate-400 font-black uppercase text-xs tracking-widest">Liste vide</p>
              {isAiLoading && <p className="text-indigo-600 font-bold text-sm animate-pulse">L'IA prépare des suggestions...</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShoppingList;
