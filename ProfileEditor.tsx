
import React, { useState } from 'react';
import { UserProfile, PersonaWeights } from './types';

interface ProfileEditorProps {
  profile: UserProfile;
  onSave: (p: UserProfile) => void;
}

const PREDEFINED_MARKETS = [
  'Crypto', 'Stocks', 'Commodities', 'Currencies', 
  'Real Estate (RWA)', 'AI & Tech', 'Precious Metals', 'Bonds/Macro'
];

interface SentinelDef {
  id: keyof PersonaWeights;
  name: string;
  icon: React.ReactNode;
  color: string;
}

// Added missing icon property to SENTINELS configuration to resolve TypeScript compilation errors.
const SENTINELS: SentinelDef[] = [
  { 
    id: 'safe', 
    name: 'Shield (Safe)', 
    color: 'indigo',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    )
  },
  { 
    id: 'riskTaker', 
    name: 'Scout (Risk)', 
    color: 'amber',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    )
  },
  { 
    id: 'ta', 
    name: 'Prism (Technical)', 
    color: 'emerald',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    )
  },
  { 
    id: 'fa', 
    name: 'Core (Fundamental)', 
    color: 'purple',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    )
  },
];

const ProfileEditor: React.FC<ProfileEditorProps> = ({ profile, onSave }) => {
  const [formData, setFormData] = useState<UserProfile>(profile);
  const [newArea, setNewArea] = useState('');

  const toggleMarket = (market: string) => {
    const current = formData.focusAreas;
    if (current.includes(market)) {
      setFormData({ ...formData, focusAreas: current.filter(a => a !== market) });
    } else {
      setFormData({ ...formData, focusAreas: [...current, market] });
    }
  };

  const addCustomArea = () => {
    if (newArea.trim() && !formData.focusAreas.includes(newArea.trim())) {
      setFormData({ ...formData, focusAreas: [...formData.focusAreas, newArea.trim()] });
      setNewArea('');
    }
  };

  const removeArea = (area: string) => {
    setFormData({ ...formData, focusAreas: formData.focusAreas.filter(a => a !== area) });
  };

  const updateWeight = (id: keyof PersonaWeights, val: number) => {
    setFormData({
      ...formData,
      personaWeights: {
        ...formData.personaWeights,
        [id]: val
      }
    });
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="p-8 bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl">
        <h2 className="text-2xl font-bold mb-2 uppercase italic tracking-tight text-white">Council Configuration</h2>
        <p className="text-slate-400 text-sm mb-8">Fine-tune your Sentinels to adjust your intelligence lens.</p>
        
        <div className="space-y-8">
          {/* Identity Section */}
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">Agent Designation</label>
              <input 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
                className="w-full bg-slate-950 p-4 rounded-xl border border-slate-800 focus:border-indigo-500 transition-all outline-none text-slate-100 font-bold" 
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">Role / Profession</label>
              {/* Fix: Replaced 'profession' with 'mandate' to align with the UserProfile interface */}
              <input 
                value={formData.mandate} 
                onChange={e => setFormData({...formData, mandate: e.target.value})} 
                className="w-full bg-slate-950 p-4 rounded-xl border border-slate-800 focus:border-indigo-500 transition-all outline-none text-slate-100 font-bold" 
              />
            </div>
          </div>

          {/* Sentinel Mixer */}
          <div className="space-y-6">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">The Sentinel Council Mixer</label>
            <div className="space-y-5">
              {SENTINELS.map(sentinel => {
                const weight = formData.personaWeights[sentinel.id];
                const colorMap: any = {
                   indigo: 'accent-indigo-500',
                   amber: 'accent-amber-500',
                   emerald: 'accent-emerald-500',
                   purple: 'accent-purple-500'
                };
                return (
                  <div key={sentinel.id} className="space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                       <span className={`text-${sentinel.color}-400`}>{sentinel.name}</span>
                       <span className="text-slate-500">{Math.round(weight * 100)}%</span>
                    </div>
                    <input 
                      type="range" min="0" max="2" step="0.1" 
                      value={weight} 
                      onChange={(e) => updateWeight(sentinel.id, parseFloat(e.target.value))}
                      className={`w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer ${colorMap[sentinel.color]}`} 
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Market Interests Section */}
          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Specializations</label>
            <div className="grid grid-cols-2 gap-2">
              {PREDEFINED_MARKETS.map(market => {
                const isSelected = formData.focusAreas.includes(market);
                return (
                  <button
                    key={market}
                    onClick={() => toggleMarket(market)}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${
                      isSelected 
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300' 
                      : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'
                    }`}
                  >
                    {market}
                  </button>
                );
              })}
            </div>
          </div>

          <button 
            onClick={() => onSave(formData)} 
            className="bg-white text-slate-950 w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] mt-8 shadow-xl transition-all active:scale-[0.98]"
          >
            Update Council Tuning
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileEditor;
