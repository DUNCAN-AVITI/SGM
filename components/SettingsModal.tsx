
import React, { useState } from 'react';
import { FamilyAccount, NotificationPreference } from '../types';
import Modal from './Modal';
import Button from './Button';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: FamilyAccount;
  onSave: (updatedAccount: FamilyAccount) => void;
  onResetData?: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, account, onSave, onResetData }) => {
  const [budget, setBudget] = useState(account.monthlyBudget);
  const [prefs, setPrefs] = useState<NotificationPreference[]>(account.notificationPreferences || []);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleAddThreshold = () => {
    const newPref: NotificationPreference = {
      id: crypto.randomUUID(),
      threshold: 50,
      type: 'info',
      enabled: true
    };
    setPrefs([...prefs, newPref]);
  };

  const handleUpdatePref = (id: string, field: keyof NotificationPreference, value: any) => {
    setPrefs(prefs.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const handleRemovePref = (id: string) => {
    setPrefs(prefs.filter(p => p.id !== id));
  };

  const handleSave = () => {
    onSave({
      ...account,
      monthlyBudget: budget,
      notificationPreferences: prefs
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Paramètres Smart Grocery">
      <div className="space-y-8 max-h-[75vh] overflow-y-auto px-1 pr-4 custom-scrollbar">
        
        {/* Section 1: Profil & Budget */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-indigo-100 p-2 rounded-xl text-indigo-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">Budget de la famille</h4>
          </div>
          
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Limite mensuelle (€)</label>
            <div className="relative">
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full px-5 py-4 rounded-xl bg-white border-2 border-slate-200 focus:border-indigo-600 outline-none transition-all font-black text-2xl text-slate-950"
              />
              <span className="absolute right-5 top-4 text-slate-400 font-black text-xl">€</span>
            </div>
          </div>
        </section>

        {/* Section 2: Notifications */}
        <section className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="bg-amber-100 p-2 rounded-xl text-amber-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
              </div>
              <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">Alertes de seuils</h4>
            </div>
            <button onClick={handleAddThreshold} className="px-3 py-1.5 bg-indigo-600 text-white text-[10px] font-black uppercase rounded-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100">Ajouter</button>
          </div>

          <div className="space-y-3">
            {prefs.map((pref) => (
              <div key={pref.id} className="p-4 bg-white rounded-2xl border-2 border-slate-100 flex flex-col gap-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 flex items-center gap-3">
                    <input
                      type="number"
                      value={pref.threshold}
                      onChange={(e) => handleUpdatePref(pref.id, 'threshold', Number(e.target.value))}
                      className="w-20 px-3 py-2 rounded-xl bg-slate-50 border-2 border-transparent focus:border-indigo-500 text-base font-black text-slate-950 text-center outline-none transition-all"
                    />
                    <span className="text-xs font-bold text-slate-500 uppercase">%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={pref.type}
                      onChange={(e) => handleUpdatePref(pref.id, 'type', e.target.value)}
                      className={`text-[10px] font-black uppercase tracking-wider px-3 py-2 rounded-xl outline-none border-2 border-transparent focus:border-indigo-500 ${
                        pref.type === 'info' ? 'bg-blue-50 text-blue-700' : 
                        pref.type === 'warning' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'
                      }`}
                    >
                      <option value="info">Info</option>
                      <option value="warning">Alerte</option>
                      <option value="error">Urgent</option>
                    </select>
                    <button onClick={() => handleRemovePref(pref.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between px-2">
                  <span className="text-xs font-bold text-slate-500">Statut de la notification</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={pref.enabled} onChange={(e) => handleUpdatePref(pref.id, 'enabled', e.target.checked)} className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 3: Maintenance */}
        <section className="pt-6 border-t border-slate-100">
           {!showResetConfirm ? (
             <button 
               onClick={() => setShowResetConfirm(true)}
               className="w-full py-4 text-xs font-black text-red-500 uppercase tracking-widest border-2 border-dashed border-red-100 rounded-2xl hover:bg-red-50 transition-all"
             >
               Maintenance : Réinitialiser les données
             </button>
           ) : (
             <div className="p-4 bg-red-50 rounded-2xl border border-red-100 animate-in zoom-in-95">
               <p className="text-xs font-black text-red-700 uppercase text-center mb-4">Êtes-vous certain ? Cette action est irréversible.</p>
               <div className="flex gap-2">
                 <button onClick={() => setShowResetConfirm(false)} className="flex-1 py-2 bg-white text-slate-600 rounded-xl text-xs font-black uppercase">Annuler</button>
                 <button onClick={onResetData} className="flex-1 py-2 bg-red-600 text-white rounded-xl text-xs font-black uppercase shadow-lg shadow-red-200">Confirmer</button>
               </div>
             </div>
           )}
        </section>

        <div className="flex gap-4 pt-4 sticky bottom-0 bg-white/95 backdrop-blur-sm pb-1 z-10">
          <Button variant="secondary" onClick={onClose} className="flex-1 rounded-2xl py-4">Annuler</Button>
          <Button onClick={handleSave} className="flex-1 rounded-2xl py-4 shadow-xl shadow-indigo-100">Sauvegarder</Button>
        </div>
      </div>
    </Modal>
  );
};

export default SettingsModal;
