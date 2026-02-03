
import React, { useState } from 'react';
import Button from './Button';
import { FamilyAccount } from '../types';

interface AuthViewProps {
  onLogin: (account: FamilyAccount) => void;
  accounts: Record<string, FamilyAccount>;
  onRegister: (account: FamilyAccount) => void;
  onUpdatePassword: (email: string, newPass: string) => void;
}

const AuthView: React.FC<AuthViewProps> = ({ onLogin, accounts, onRegister, onUpdatePassword }) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [familyName, setFamilyName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const normalizedEmail = email.toLowerCase().trim();

    if (mode === 'login') {
      const acc = accounts[normalizedEmail];
      if (acc && acc.password === password) {
        onLogin(acc);
      } else {
        setError("Email ou mot de passe incorrect.");
      }
    } else if (mode === 'signup') {
      if (accounts[normalizedEmail]) {
        setError("Cet email est déjà utilisé.");
      } else {
        const newAcc: FamilyAccount = { 
          email: normalizedEmail, 
          familyName: familyName.trim(), 
          password, 
          monthlyBudget: 500,
          notificationPreferences: [
            { id: '1', threshold: 80, type: 'info', enabled: true },
            { id: '2', threshold: 90, type: 'warning', enabled: true },
            { id: '3', threshold: 100, type: 'error', enabled: true }
          ] 
        };
        onRegister(newAcc);
        onLogin(newAcc);
      }
    } else if (mode === 'forgot') {
      if (accounts[normalizedEmail]) {
        onUpdatePassword(normalizedEmail, password);
        setSuccess("Votre mot de passe a été réinitialisé !");
        setTimeout(() => setMode('login'), 2000);
      } else {
        setError("Aucun compte trouvé pour cet email.");
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#f8fafc] p-4 overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-100 rounded-full blur-[120px] opacity-60" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-100 rounded-full blur-[120px] opacity-60" />
      
      <div className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100 p-8 md:p-12 max-w-md w-full relative z-10 transition-all">
        <div className="text-center mb-10">
          <div className="bg-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-200">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none">Smart Grocery</h2>
          <p className="text-slate-500 font-semibold mt-3">
            {mode === 'login' && 'Ravi de vous revoir !'}
            {mode === 'signup' && 'Créez votre espace famille'}
            {mode === 'forgot' && 'Réinitialisation du compte'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-700 text-sm p-4 rounded-2xl flex items-center gap-3 border border-red-100 animate-in fade-in slide-in-from-top-1">
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="font-bold">{error}</span>
            </div>
          )}
          
          {success && (
            <div className="bg-emerald-50 text-emerald-700 text-sm p-4 rounded-2xl flex items-center gap-3 border border-emerald-100 animate-in fade-in">
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-bold">{success}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Email professionnel ou perso</label>
            <div className="relative group">
              <span className="absolute left-4 top-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206" />
                </svg>
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nom@exemple.com"
                className="w-full pl-12 pr-5 py-4 rounded-2xl border border-slate-200 bg-slate-50/50 text-slate-900 font-bold placeholder:text-slate-300 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 outline-none transition-all"
              />
            </div>
          </div>

          {mode === 'signup' && (
            <div className="space-y-1.5 animate-in fade-in slide-in-from-left-2">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Nom de votre tribu</label>
              <div className="relative group">
                <span className="absolute left-4 top-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </span>
                <input
                  type="text"
                  required
                  value={familyName}
                  onChange={(e) => setFamilyName(e.target.value)}
                  placeholder="Les Aventuriers"
                  className="w-full pl-12 pr-5 py-4 rounded-2xl border border-slate-200 bg-slate-50/50 text-slate-900 font-bold placeholder:text-slate-300 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 outline-none transition-all"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <div className="flex justify-between items-center ml-1">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">
                {mode === 'forgot' ? 'Nouveau mot de passe' : 'Sécurité'}
              </label>
              {mode === 'login' && (
                <button 
                  type="button" 
                  onClick={() => setMode('forgot')} 
                  className="text-xs font-black text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  Oublié ?
                </button>
              )}
            </div>
            <div className="relative group">
              <span className="absolute left-4 top-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </span>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-12 pr-12 py-4 rounded-2xl border border-slate-200 bg-slate-50/50 text-slate-900 font-bold placeholder:text-slate-300 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 outline-none transition-all"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-4 text-slate-300 hover:text-slate-500 transition-colors"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.076m1.406-1.407A10.014 10.014 0 0112 5c3.724 0 6.941 2.103 8.577 5.423m-8.008 4.691L12 12m.01-.01H12m4.57 4.57l4.242 4.242M12 12L7.757 7.757" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <Button type="submit" className="w-full py-4 text-base font-black rounded-2xl shadow-xl shadow-indigo-100 transition-transform active:scale-[0.98]">
            {mode === 'login' ? 'Accéder à mon espace' : mode === 'signup' ? 'Lancer ma tribu' : 'Réinitialiser'}
          </Button>
        </form>

        <div className="mt-10 pt-8 border-t border-slate-100 text-center">
          <p className="text-sm text-slate-500 font-bold">
            {mode === 'login' ? "Nouveau ici ?" : "Déjà membre ?"}
            <button 
              onClick={() => {
                setMode(mode === 'login' ? 'signup' : 'login');
                setError('');
                setSuccess('');
              }}
              className="ml-2 text-indigo-600 font-black hover:text-indigo-800 transition-colors"
            >
              {mode === 'login' ? "Rejoindre l'aventure" : "Se connecter"}
            </button>
          </p>
          {mode === 'forgot' && (
            <button onClick={() => setMode('login')} className="mt-4 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors">
              Retour
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthView;
