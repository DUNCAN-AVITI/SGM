
import React, { useMemo } from 'react';
import { Purchase } from '../types';
import { calculateTotalExpenses, getTopProduct, getExpensesByCategory } from '../utils/analytics';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface SummaryDashboardProps {
  purchases: Purchase[];
  budget: number;
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
}

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

const SummaryDashboard: React.FC<SummaryDashboardProps> = ({ 
  purchases, 
  budget, 
  startDate, 
  endDate, 
  onStartDateChange, 
  onEndDateChange 
}) => {
  const formatDate = (date: Date) => date.toISOString().split('T')[0];

  const setRange = (days: number | 'all') => {
    if (days === 'all') {
      onStartDateChange('');
      onEndDateChange('');
      return;
    }
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    onStartDateChange(formatDate(start));
    onEndDateChange(formatDate(end));
  };

  const filteredPurchases = useMemo(() => {
    return purchases.filter(p => {
      const isAfterStart = startDate ? p.date >= startDate : true;
      const isBeforeEnd = endDate ? p.date <= endDate : true;
      return isAfterStart && isBeforeEnd;
    });
  }, [purchases, startDate, endDate]);

  const total = calculateTotalExpenses(filteredPurchases);
  const productNames = filteredPurchases.map(p => p.name);
  const topProduct = getTopProduct(productNames);
  const categoryData = getExpensesByCategory(filteredPurchases);

  const budgetUsagePercent = Math.min((total / budget) * 100, 100);
  const isOverBudget = total > budget;
  const isCloseToBudget = !isOverBudget && total > budget * 0.8;

  const isActiveRange = (days: number | 'all') => {
    if (days === 'all') return !startDate && !endDate;
    const end = formatDate(new Date());
    const start = new Date();
    start.setDate(new Date().getDate() - days);
    return startDate === formatDate(start) && endDate === end;
  };

  return (
    <div className="space-y-8 mb-8">
      {/* Date Range Selection Bar */}
      <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-200 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="bg-indigo-600 p-4 rounded-3xl shadow-2xl shadow-indigo-200">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-950">Statistiques</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Analyse des habitudes familiales</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-center bg-slate-50/50 p-2 rounded-[2rem] border border-slate-100">
          <div className="flex gap-1">
            {[
              { label: '7j', val: 7 },
              { label: '30j', val: 30 },
              { label: 'Total', val: 'all' as const }
            ].map((btn) => (
              <button
                key={btn.label}
                onClick={() => setRange(btn.val)}
                className={`px-5 py-2.5 text-xs font-black rounded-2xl transition-all ${
                  isActiveRange(btn.val) 
                    ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' 
                    : 'text-slate-400 hover:text-slate-600 hover:bg-white'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>

          <div className="h-8 w-px bg-slate-200 hidden md:block mx-2" />

          <div className="flex items-center gap-3">
            <input
              type="date"
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
              className="bg-white px-4 py-2.5 rounded-xl border-2 border-transparent focus:border-indigo-600 outline-none font-black text-xs text-slate-900"
            />
            <span className="text-slate-300 font-black">→</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
              className="bg-white px-4 py-2.5 rounded-xl border-2 border-transparent focus:border-indigo-600 outline-none font-black text-xs text-slate-900"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main Budget Card */}
        <div className={`bg-white p-8 rounded-[3rem] shadow-sm border-2 transition-all duration-700 ${isOverBudget ? 'border-red-200 ring-8 ring-red-50' : isCloseToBudget ? 'border-amber-200 ring-8 ring-amber-50' : 'border-slate-100'}`}>
          <div className="flex justify-between items-start mb-6">
            <div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">Dépenses de la période</span>
              <p className={`text-4xl font-black mt-1 ${isOverBudget ? 'text-red-600' : 'text-slate-950'}`}>
                {total.toFixed(2)}€
              </p>
              <p className="text-slate-400 font-bold mt-1 text-sm">sur un budget de {budget}€</p>
            </div>
            <div className={`p-4 rounded-[1.5rem] ${isOverBudget ? 'bg-red-600 text-white' : isCloseToBudget ? 'bg-amber-500 text-white' : 'bg-indigo-600 text-white'} shadow-2xl`}>
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest">
              <span className={isOverBudget ? 'text-red-500' : isCloseToBudget ? 'text-amber-500' : 'text-slate-500'}>
                {budgetUsagePercent.toFixed(0)}% consommé
              </span>
              {isOverBudget && <span className="animate-pulse text-red-600">Dépassement !</span>}
            </div>
            <div className="h-5 bg-slate-100 rounded-full overflow-hidden p-1">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ${isOverBudget ? 'bg-red-500' : isCloseToBudget ? 'bg-amber-500' : 'bg-indigo-600'}`}
                style={{ width: `${budgetUsagePercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Favorite Product Card */}
        <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-200 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute -right-8 -top-8 p-12 opacity-[0.03] group-hover:opacity-[0.08] transition-all duration-700 group-hover:rotate-12">
            <svg className="w-48 h-48 text-indigo-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </div>
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">Article Favori</span>
            <p className="text-3xl font-black text-indigo-700 mt-2 truncate relative z-10">{topProduct}</p>
            <p className="text-xs text-slate-400 font-bold mt-2 uppercase tracking-tighter">Basé sur {filteredPurchases.length} achats récents</p>
          </div>
          <div className="mt-8 pt-6 border-t border-slate-50 relative z-10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center">
                <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
              </div>
              <span className="text-xs font-black text-indigo-900 uppercase">Top récurrence</span>
            </div>
          </div>
        </div>

        {/* Categories Analysis */}
        <div className="bg-white p-6 rounded-[3rem] shadow-sm border border-slate-200 flex items-center">
          <div className="h-32 w-32 flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  innerRadius={35}
                  outerRadius={55}
                  paddingAngle={6}
                  dataKey="value"
                  animationDuration={1200}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="ml-6 flex-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 block">Par Catégorie</span>
            <div className="space-y-2">
              {categoryData.slice(0, 3).map((cat, idx) => (
                <div key={cat.name} className="flex items-center justify-between group">
                  <div className="flex items-center min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full mr-3 flex-shrink-0" style={{backgroundColor: COLORS[idx % COLORS.length]}}></span>
                    <span className="text-[11px] font-black text-slate-600 truncate uppercase tracking-tighter">{cat.name}</span>
                  </div>
                  <span className="text-xs font-black text-slate-950 ml-2">{cat.value.toFixed(0)}€</span>
                </div>
              ))}
              {categoryData.length === 0 && (
                <p className="text-[10px] text-slate-300 italic font-bold text-center mt-4">Aucune donnée disponible</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummaryDashboard;
