import React, { useState } from 'react';
import { UserProfile, PersonaWeights } from '../types';

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
  role: string;
}

const SENTINELS: SentinelDef[] = [
  { 
    id: 'safe', 
    name: 'VORA SHIELD', 
    role: 'Preservation',
    color: 'indigo',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    )
  },
  { 
    id: 'riskTaker', 
    name: 'VORA SCOUT', 
    role: 'Speculation',
    color: 'amber',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    )
  },
  { 
    id: 'ta', 
    name: 'VORA PRISM', 
    role: 'Patterns',
    color: 'emerald',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    )
  },
  { 
    id: 'fa', 
    name: 'VORA CORE', 
    role: 'Catalysts',
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

  const toggleMarket = (market: string) => {
    const current = formData.focusAreas;
    if (current.includes(market)) {
      setFormData({ ...formData, focusAreas: current.filter(a => a !== market) });
    } else {
      setFormData({ ...formData, focusAreas: [...current, market] });
    }
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
    <div className="max-w-2xl mx-auto space-y-8 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500 px-4 md:px-0">
      <div className="p-8 md:p-10 bg-slate-900 rounded-[2.5rem] border border-slate-800 shadow-2xl">
        <div className="flex flex-col mb-10">
          <h2 className="text-3xl font-black mb-2 uppercase italic tracking-tight text-white">Council Calibration</h2>
          <p className="text-slate-400 text-sm font-medium">Fine-tune your Sentinels to adjust your intelligence lens.</p>
        </div>
        
        <div className="space-y-10">
          {/* Identity & Mandate Section */}
          <div className="space-y-6">
            <div>
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">Agent Designation (Name)</label>
              <input 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
                className="w-full bg-slate-950 p-4 rounded-2xl border border-slate-800 focus:border-indigo-500 transition-all outline-none text-slate-100 font-bold" 
              />
            </div>
            <div>
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">Intelligence Mandate (Instructions)</label>
              <textarea 
                value={formData.mandate} 
                rows={3}
                onChange={e => setFormData({...formData, mandate: e.target.value})} 
                className="w-full bg-slate-950 p-4 rounded-2xl border border-slate-800 focus:border-indigo-500 transition-all outline-none text-slate-100 font-bold text-sm leading-relaxed resize-none" 
              />
            </div>
          </div>

          {/* Sentinel Mixer */}
          <div className="space-y-8">
            <div className="flex items-center justify-between">
               <label className="text-xs font-black text-indigo-400 uppercase tracking-widest block">The Sentinel Council Mixer</label>
               <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Weight Distribution</span>
            </div>
            <div className="space-y-8">
              {SENTINELS.map(sentinel => {
                const weight = formData.personaWeights[sentinel.id];
                const colorMap: any = {
                   indigo: 'accent-indigo-500',
                   amber: 'accent-amber-500',
                   emerald: 'accent-emerald-500',
                   purple: 'accent-purple-500'
                };
                return (
                  <div key={sentinel.id} className="space-y-3">
                    <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest">
                       <div className="flex items-center gap-2">
                          <span className={`text-${sentinel.color}-400 uppercase tracking-widest font-black`}>{sentinel.name}</span>
                          <span className={`text-[10px] bg-slate-950 px-2 py-0.5 rounded border border-${sentinel.color}-500/20 text-slate-400`}>{sentinel.role}</span>
                       </div>
                       <span className="text-slate-300 font-black">{Math.round(weight * 100)}%</span>
                    </div>
                    <input 
                      type="range" min="0" max="2" step="0.1" 
                      value={weight} 
                      onChange={(e) => updateWeight(sentinel.id, parseFloat(e.target.value))}
                      className={`w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer ${colorMap[sentinel.color]}`} 
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Market Interests Section */}
          <div className="space-y-6 pt-4">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">Market Specializations</label>
            <div className="grid grid-cols-2 gap-3">
              {PREDEFINED_MARKETS.map(market => {
                const isSelected = formData.focusAreas.includes(market);
                return (
                  <button
                    key={market}
                    onClick={() => toggleMarket(market)}
                    className={`flex items-center justify-between px-4 py-3 rounded-2xl border text-xs font-black uppercase tracking-widest transition-all ${
                      isSelected 
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300' 
                      : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700 hover:text-white'
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
            className="bg-white text-slate-950 w-full py-6 rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] mt-8 shadow-2xl transition-all active:scale-[0.98] hover:scale-[1.01]"
          >
            Update Council Calibration
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileEditor;