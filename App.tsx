import { useState, useEffect, useMemo, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Purchase, PurchaseFormData, FamilyAccount, ShoppingItem, NotificationPreference, Category } from './types';
import initialPurchases from './data/achats';
import PurchaseForm from './components/PurchaseForm';
import SummaryDashboard from './components/SummaryDashboard';
import ShoppingList from './components/ShoppingList';
import Button from './components/Button';
import Modal from './components/Modal';
import AuthView from './components/AuthView';
import NotificationToast, { Notification } from './components/NotificationToast';
import SettingsModal from './components/SettingsModal';
import { calculateTotalExpenses } from './utils/analytics';

const STORAGE_KEY = 'smart_grocery_purchases_v2';
const ACCOUNT_KEY = 'smart_grocery_active_user_v2';
const REGISTRY_KEY = 'smart_grocery_accounts_registry';
const SHOPPING_KEY = 'smart_grocery_shopping_v2';

const App = () => {
  // --- DATABASE INITIALIZATION (Hybrid JSON + LocalStorage) ---
  const [allPurchases, setAllPurchases] = useState<Purchase[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : initialPurchases;
  });
  
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>(() => {
    const saved = localStorage.getItem(SHOPPING_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const [accountsRegistry, setAccountsRegistry] = useState<Record<string, FamilyAccount>>(() => {
    const saved = localStorage.getItem(REGISTRY_KEY);
    return saved ? JSON.parse(saved) : {};
  });

  const [activeAccount, setActiveAccount] = useState<FamilyAccount | null>(() => {
    const saved = localStorage.getItem(ACCOUNT_KEY);
    return saved ? JSON.parse(saved) : null;
  });

  // --- UI STATE ---
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [editingPurchase, setEditingPurchase] = useState<Purchase | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showForm, setShowForm] = useState<boolean>(false);
  const [idToDelete, setIdToDelete] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const historyFileInputRef = useRef<HTMLInputElement>(null);

  // --- PERSISTENCE SYNC ---
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allPurchases));
    localStorage.setItem(REGISTRY_KEY, JSON.stringify(accountsRegistry));
    localStorage.setItem(SHOPPING_KEY, JSON.stringify(shoppingList));
    if (activeAccount) {
      localStorage.setItem(ACCOUNT_KEY, JSON.stringify(activeAccount));
    } else {
      localStorage.removeItem(ACCOUNT_KEY);
    }
  }, [allPurchases, accountsRegistry, activeAccount, shoppingList]);

  const addNotification = (type: Notification['type'], message: string) => {
    setNotifications(prev => [...prev, { id: crypto.randomUUID(), type, message }]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // --- AI LOGIC (Gemini) ---
  const getAiSuggestions = async () => {
    if (!activeAccount) return;
    setIsAiLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const history = allPurchases.filter(p => p.familyId === activeAccount.email).map(p => p.name).join(', ');
      
      const prompt = `Based on this grocery purchase history: [${history}], suggest 3 essential items that might be missing soon. Return ONLY a JSON array of strings, like ["Item1", "Item2", "Item3"]. Use French for item names.`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      const text = response.text || "[]";
      const cleanJson = text.replace(/```json|```/g, "").trim();
      const suggestions: string[] = JSON.parse(cleanJson);

      const newItems = suggestions.map(name => ({
        id: crypto.randomUUID(),
        familyId: activeAccount.email,
        name: name,
        category: Category.Other,
        isUrgent: false
      }));

      setShoppingList([...shoppingList, ...newItems]);
      addNotification('success', "L'IA a suggéré 3 articles !");
    } catch (error) {
      console.error(error);
      addNotification('error', "Impossible d'obtenir des suggestions IA.");
    } finally {
      setIsAiLoading(false);
    }
  };

  // --- HANDLERS ---
  const handleUpdateAccount = (updatedAccount: FamilyAccount) => {
    setActiveAccount(updatedAccount);
    setAccountsRegistry(prev => ({ ...prev, [updatedAccount.email]: updatedAccount }));
    addNotification('info', 'Paramètres mis à jour.');
  };

  const handleLogout = () => {
    setActiveAccount(null);
    addNotification('info', 'Déconnexion réussie. À bientôt !');
  };

  const handleResetData = () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(SHOPPING_KEY);
    setAllPurchases(initialPurchases);
    setShoppingList([]);
    setIsSettingsOpen(false);
    addNotification('warning', 'Base de données réinitialisée.');
  };

  const addPurchase = (data: PurchaseFormData) => {
    if (!activeAccount) return;
    const newPurchase: Purchase = { ...data, familyId: activeAccount.email, id: crypto.randomUUID() };
    setAllPurchases([newPurchase, ...allPurchases]);
    setShowForm(false);
    addNotification('success', `${data.name} ajouté à l'historique.`);
  };

  const familyPurchases = useMemo(() => allPurchases.filter(p => p.familyId === activeAccount?.email), [allPurchases, activeAccount]);
  const familyShopping = useMemo(() => shoppingList.filter(i => i.familyId === activeAccount?.email), [shoppingList, activeAccount]);
  const filteredPurchases = useMemo(() => familyPurchases.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) && (startDate ? p.date >= startDate : true) && (endDate ? p.date <= endDate : true)), [familyPurchases, searchTerm, startDate, endDate]);

  if (!activeAccount) {
    return <AuthView 
      onLogin={setActiveAccount} 
      accounts={accountsRegistry} 
      onRegister={(acc: FamilyAccount) => setAccountsRegistry(prev => ({ ...prev, [acc.email]: acc }))} 
      onUpdatePassword={(em: string, ps: string) => setAccountsRegistry(prev => ({ ...prev, [em]: { ...prev[em], password: ps }}))} 
    />;
  }

  return (
    <div className="min-h-screen pb-20 bg-[#f8fafc] text-slate-950 selection:bg-indigo-100">
      <NotificationToast notifications={notifications} onClose={removeNotification} />
      
      <header className="bg-white/95 backdrop-blur-xl border-b-2 border-slate-100 sticky top-0 z-30 transition-all duration-300">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-indigo-600 p-3 rounded-2xl shadow-xl shadow-indigo-100 hover:rotate-6 transition-transform">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-950 tracking-tight leading-none">Smart Grocery</h1>
              <span className="text-[11px] font-black uppercase text-indigo-600 tracking-widest mt-1 block">Famille {activeAccount.familyName}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5 md:gap-3">
             <button 
                onClick={handleLogout} 
                className="p-3 text-slate-400 hover:bg-red-50 hover:text-red-600 rounded-2xl transition-all group" 
                title="Déconnexion"
             >
                <svg className="w-6 h-6 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
             </button>
             <button 
                onClick={() => setIsSettingsOpen(true)} 
                className="p-3 text-slate-500 hover:bg-slate-100 hover:text-indigo-600 rounded-2xl transition-all" 
                title="Paramètres"
                aria-label="Paramètres"
             >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
             </button>
             <Button onClick={() => setShowForm(!showForm)} className="rounded-2xl px-5 py-3 font-black shadow-lg shadow-indigo-100 hover:shadow-indigo-200 ml-2">
                {showForm ? 'Annuler' : 'Ajouter'}
             </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 mt-8 space-y-8 animate-in fade-in duration-500">
        <SummaryDashboard 
          purchases={familyPurchases} 
          budget={activeAccount.monthlyBudget} 
          startDate={startDate} 
          endDate={endDate} 
          onStartDateChange={setStartDate} 
          onEndDateChange={setEndDate} 
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5">
            <ShoppingList 
              items={familyShopping} 
              familyName={activeAccount.familyName} 
              onAdd={(n: string, c: Category, u: boolean) => setShoppingList([...shoppingList, { id: crypto.randomUUID(), familyId: activeAccount.email, name: n, category: c, isUrgent: u }])} 
              onImport={(is: ShoppingItem[]) => setShoppingList([...shoppingList, ...is.map(i => ({...i, id: crypto.randomUUID(), familyId: activeAccount.email}))])} 
              onRemove={(id: string) => setShoppingList(shoppingList.filter(s => s.id !== id))} 
              onConvertToPurchase={(it: ShoppingItem) => { setEditingPurchase({ ...it, price: 0, quantity: 1, date: new Date().toISOString().split('T')[0] } as Purchase); setShowForm(true); setShoppingList(shoppingList.filter(s => s.id !== it.id)); }} 
              onAiSuggest={getAiSuggestions}
              isAiLoading={isAiLoading}
            />
          </div>

          <div className="lg:col-span-7 space-y-6">
            {showForm && (
              <div className="animate-in slide-in-from-right-4 duration-300">
                <PurchaseForm 
                  onSubmit={editingPurchase?.id ? (d: PurchaseFormData) => { setAllPurchases(allPurchases.map(p => p.id === editingPurchase.id ? {...d, familyId: activeAccount.email, id: p.id} : p)); setEditingPurchase(null); setShowForm(false); addNotification('success', 'Mis à jour !'); } : addPurchase} 
                  editingPurchase={editingPurchase} 
                  onCancel={() => { setShowForm(false); setEditingPurchase(null); }} 
                />
              </div>
            )}

            <div className="bg-white rounded-[2.5rem] shadow-sm border-2 border-slate-100 overflow-hidden">
              <div className="p-8 border-b-2 border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h2 className="text-xl font-black text-slate-950">Historique local</h2>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Données persistantes</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                   <div className="relative flex-1 min-w-[200px]">
                      <span className="absolute left-4 top-3 text-slate-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                      </span>
                      <input type="text" placeholder="Rechercher..." aria-label="Rechercher des articles" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-transparent focus:border-indigo-600 focus:bg-white rounded-2xl text-sm font-black text-slate-950 outline-none transition-all" />
                   </div>
                   <button onClick={() => historyFileInputRef.current?.click()} className="p-3 bg-slate-50 rounded-2xl hover:bg-indigo-50 hover:text-indigo-600 transition-all border-2 border-transparent" title="Importer" aria-label="Importer un historique">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
                   </button>
                   <input type="file" ref={historyFileInputRef} onChange={e => {
                     if (!activeAccount || !e.target.files?.[0]) return;
                     const reader = new FileReader();
                     reader.onload = (event) => {
                       try {
                         const json = JSON.parse(event.target?.result as string);
                         const imported = Array.isArray(json) ? json : json.purchases || [];
                         const processed = imported.map((p: any) => ({ ...p, familyId: activeAccount.email, id: p.id || crypto.randomUUID() }));
                         setAllPurchases(prev => [...processed, ...prev]);
                         addNotification('success', `${processed.length} achats importés.`);
                       } catch (err) { addNotification('error', "Format JSON invalide."); }
                     };
                     reader.readAsText(e.target.files[0]);
                   }} accept=".json" className="hidden" aria-label="Importer un fichier JSON" />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50/80 text-[10px] uppercase font-black text-slate-500 tracking-widest border-b-2 border-slate-100">
                    <tr><th className="px-8 py-5">Article</th><th className="px-8 py-5">Catégorie</th><th className="px-8 py-5 text-right">Total</th><th className="px-8 py-5"></th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredPurchases.length > 0 ? filteredPurchases.map(p => (
                      <tr key={p.id} className="hover:bg-indigo-50/20 transition-all group">
                        <td className="px-8 py-5">
                          <span className="font-black text-slate-950 block text-base">{p.name}</span>
                          <span className="text-[10px] text-slate-500 uppercase font-black tracking-tight">{p.date} • {p.quantity} unité(s)</span>
                        </td>
                        <td className="px-8 py-5">
                          <span className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-xl text-[10px] font-black uppercase border border-indigo-100">{p.category}</span>
                        </td>
                        <td className="px-8 py-5 text-right font-black text-slate-950 text-lg">{(p.price * p.quantity).toFixed(2)}€</td>
                        <td className="px-8 py-5 text-right">
                          <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => { setEditingPurchase(p); setShowForm(true); }} className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-xl shadow-sm transition-all" aria-label="Modifier">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                            </button>
                            <button onClick={() => setIdToDelete(p.id)} className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-white rounded-xl shadow-sm transition-all" aria-label="Supprimer">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    )) : (
                      <tr><td colSpan={4} className="px-8 py-32 text-center">
                        <div className="flex flex-col items-center opacity-30 grayscale">
                          <div className="bg-slate-100 p-6 rounded-full mb-6">
                            <svg className="w-16 h-16 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                          </div>
                          <p className="font-black uppercase text-base tracking-widest text-slate-600">Aucun achat enregistré</p>
                          <p className="text-sm font-bold mt-2">Commencez par enregistrer vos dépenses</p>
                        </div>
                      </td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        account={activeAccount} 
        onSave={handleUpdateAccount} 
        onResetData={handleResetData}
      />
      
      <Modal isOpen={!!idToDelete} onClose={() => setIdToDelete(null)} title="Confirmation">
        <div className="space-y-6">
          <p className="text-slate-950 font-bold text-lg">Retirer cet article ?</p>
          <p className="text-slate-500 font-semibold leading-relaxed">Cette action supprimera définitivement l'article de votre historique de consommation local.</p>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setIdToDelete(null)} className="rounded-2xl px-6 border-2">Annuler</Button>
            <Button variant="danger" onClick={() => { setAllPurchases(allPurchases.filter(p => p.id !== idToDelete)); setIdToDelete(null); addNotification('warning', 'Supprimé.'); }} className="rounded-2xl px-10 shadow-lg shadow-red-100 font-black">Confirmer</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default App;