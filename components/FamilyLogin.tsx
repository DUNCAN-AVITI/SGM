
import React, { useState } from 'react';
import Button from './Button';

interface FamilyLoginProps {
  onJoin: (familyId: string) => void;
  existingFamilies: Record<string, string>; // ID -> Name
  onRegister: (familyId: string, familyName: string) => void;
}

const FamilyLogin: React.FC<FamilyLoginProps> = ({ onJoin, existingFamilies, onRegister }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedId = id.trim().toLowerCase();
    if (existingFamilies[normalizedId]) {
      onJoin(normalizedId);
    } else {
      setError("Cet identifiant de famille n'existe pas.");
    }
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedId = id.trim().toLowerCase();
    const normalizedName = name.trim();

    if (!normalizedId || !normalizedName) {
      setError("Tous les champs sont obligatoires.");
      return;
    }

    if (existingFamilies[normalizedId]) {
      setError("Cet identifiant est déjà utilisé par une autre famille.");
    } else {
      onRegister(normalizedId, normalizedName);
      onJoin(normalizedId);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="bg-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Smart Grocery</h2>
          <p className="text-gray-500 text-sm mt-1">Gérez vos courses en famille</p>
        </div>

        {/* Mode Toggle */}
        <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
          <button
            onClick={() => { setMode('login'); setError(''); }}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${mode === 'login' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Se connecter
          </button>
          <button
            onClick={() => { setMode('signup'); setError(''); }}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${mode === 'signup' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            S'inscrire
          </button>
        </div>

        <form onSubmit={mode === 'login' ? handleLogin : handleSignup} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 text-xs p-3 rounded-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
              <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Identifiant Unique</label>
            <input
              type="text"
              required
              value={id}
              onChange={(e) => { setId(e.target.value); setError(''); }}
              placeholder="Ex: famille-dupon"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm"
            />
          </div>

          {mode === 'signup' && (
            <div className="animate-in fade-in slide-in-from-top-2">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Nom de la famille</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => { setName(e.target.value); setError(''); }}
                placeholder="Ex: Les Dupont"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm"
              />
            </div>
          )}

          <Button type="submit" className="w-full py-3 text-base mt-2">
            {mode === 'login' ? 'Rejoindre ma famille' : 'Créer ma famille'}
          </Button>
        </form>

        <p className="mt-8 text-center text-xs text-gray-400 leading-relaxed px-4">
          {mode === 'login' 
            ? "L'identifiant unique est partagé entre tous les membres de votre famille."
            : "Choisissez un identifiant simple dont vous vous souviendrez."}
        </p>
      </div>
    </div>
  );
};

export default FamilyLogin;
