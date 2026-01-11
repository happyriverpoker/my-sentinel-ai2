
import React, { useState } from 'react';
import { UserProfile, AlertSettings, AIModel, PersonaWeights } from '../types';

interface TuningLandingProps {
  profile: UserProfile;
  settings: AlertSettings;
  onRunScan: (p: UserProfile, s: AlertSettings) => void;
  onBack?: () => void;
  onNavigateToHQ: () => void;
  canGoBack?: boolean;
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
  desc: string;
  role: string;
}

const SENTINELS: SentinelDef[] = [
  { 
    id: 'safe', 
    name: 'VORA SHIELD', 
    color: 'blue', 
    role: 'PRESERVATION CORE',
    desc: 'Ensures capital preservation by identifying deep support levels and mitigating downside volatility for portfolio survival.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    )
  },
  { 
    id: 'riskTaker', 
    name: 'VORA SCOUT', 
    color: 'orange', 
    role: 'SPECULATION CORE',
    desc: 'Detects high-velocity momentum spikes and aggressive breakouts in frontier market sectors to capture untapped alpha.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    )
  },
  { 
    id: 'ta', 
    name: 'VORA PRISM', 
    color: 'emerald', 
    role: 'EXECUTION CORE',
    desc: 'Maps technical confluences and liquidity gaps to pinpoint high-probability geometric entries and exit points.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    )
  },
  { 
    id: 'fa', 
    name: 'VORA CORE', 
    color: 'purple', 
    role: 'CATALYST CORE',
    desc: 'Synthesizes macro trends and institutional flows to decode the fundamental drivers behind major market pivots.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    )
  },
];

const PRESETS = [
  { id: 'default', name: 'Equilibrium', weights: { safe: 1, riskTaker: 1, ta: 1, fa: 1 } },
  { id: 'ta-focused', name: 'Technical', weights: { safe: 0.5, riskTaker: 0.8, ta: 2, fa: 0.7 } },
  { id: 'fa-focused', name: 'Macro', weights: { safe: 1, riskTaker: 0.5, ta: 0.5, fa: 2 } },
  { id: 'high-alpha', name: 'Aggressive', weights: { safe: 0.2, riskTaker: 2, ta: 1, fa: 0.8 } },
];

const TuningLanding: React.FC<TuningLandingProps> = ({ profile, settings, onRunScan, onBack, onNavigateToHQ, canGoBack }) => {
  const [formData, setFormData] = useState<UserProfile>(profile);
  const [alertData, setAlertData] = useState<AlertSettings>(settings);

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

  const applyPreset = (presetId: string) => {
    const preset = PRESETS.find(p => p.id === presetId);
    if (preset) {
      setFormData({ ...formData, personaWeights: { ...preset.weights } });
    }
  };

  const setModel = (m: AIModel) => {
    setFormData({ ...formData, selectedModel: m });
  };

  return (
    <div className="max-w-7xl w-full mx-auto animate-in fade-in duration-700 pb-20 px-4 md:px-8 overflow-x-hidden">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row items-center justify-between pt-8 pb-12 gap-6 text-center md:text-left">
        <div className="flex flex-col">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tighter text-white uppercase italic leading-none">
            COUNCIL <span className="text-indigo-500">CALIBRATION</span>
          </h1>
          <p className="text-slate-500 font-black uppercase tracking-[0.2em] mt-3 text-[10px] sm:text-xs">
            Refining the multi-agent research lens for global focus areas
          </p>
        </div>
        {canGoBack && (
          <button 
            onClick={onBack}
            className="px-6 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 hover:text-white transition-all flex items-center gap-3 active:scale-95 shadow-xl whitespace-nowrap"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="text-[10px] font-black uppercase tracking-widest">Dashboard</span>
          </button>
        )}
      </header>

      <div className="flex flex-col gap-10 sm:gap-14">
        
        {/* 01. SCOUR FOCUS */}
        <section className="p-6 sm:p-10 lg:p-12 bg-slate-900 border border-slate-800 rounded-[2.5rem] sm:rounded-[3rem] shadow-2xl relative overflow-hidden group">
          <div className="flex justify-between items-start mb-8 sm:mb-10">
             <div className="text-left">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-emerald-400 uppercase tracking-tight mb-1">01. Scour Focus</h2>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Global Acquisition parameters</p>
             </div>
             <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
             </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {PREDEFINED_MARKETS.map(market => {
              const isSelected = formData.focusAreas.includes(market);
              return (
                <button
                  key={market}
                  onClick={() => toggleMarket(market)}
                  className={`px-4 py-6 rounded-2xl border text-[11px] lg:text-xs font-black uppercase tracking-tighter transition-all flex items-center justify-center text-center leading-tight ${
                    isSelected 
                    ? 'bg-emerald-600 border-emerald-400 text-white shadow-xl scale-[1.02]' 
                    : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  {market}
                </button>
              );
            })}
          </div>
        </section>

        {/* 02. SENTINEL PRIORITY MIXER */}
        <section className="p-6 sm:p-10 lg:p-12 bg-slate-900 border border-slate-800 rounded-[2.5rem] sm:rounded-[3rem] shadow-2xl relative overflow-hidden">
          <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-10 gap-8 relative z-10">
            <div className="text-left">
              <h2 className="text-xl sm:text-2xl lg:text-4xl font-black text-indigo-400 uppercase tracking-tight mb-1">02. Priority Mixer</h2>
              <p className="text-[10px] sm:text-xs text-slate-500 font-black uppercase tracking-widest">Adjust Deliberation Bias across specialized Sentinel nodes</p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full xl:w-auto">
              <div className="flex items-center gap-3 bg-slate-950 border border-slate-800 px-4 py-2 rounded-2xl">
                 <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Preset:</span>
                 <select 
                   onChange={(e) => applyPreset(e.target.value)}
                   className="bg-transparent text-indigo-400 text-[10px] font-black uppercase focus:outline-none cursor-pointer"
                 >
                   {PRESETS.map(p => <option key={p.id} value={p.id} className="bg-slate-900 text-white">{p.name}</option>)}
                 </select>
              </div>
              <button 
                onClick={onNavigateToHQ}
                className="px-6 py-3 bg-indigo-600/10 border border-indigo-500/20 rounded-2xl text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-lg"
              >
                Meet the Sentinels
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8 relative z-10">
            {SENTINELS.map(sentinel => {
              const weight = formData.personaWeights[sentinel.id];
              const textClass = sentinel.color === 'blue' ? 'text-blue-400' : sentinel.color === 'orange' ? 'text-orange-400' : sentinel.color === 'emerald' ? 'text-emerald-400' : 'text-purple-400';
              const borderClass = sentinel.color === 'blue' ? 'border-blue-500/30' : sentinel.color === 'orange' ? 'border-orange-500/30' : sentinel.color === 'emerald' ? 'border-emerald-500/30' : 'border-purple-500/30';
              const accentClass = sentinel.color === 'blue' ? 'accent-blue-500' : sentinel.color === 'orange' ? 'accent-orange-500' : sentinel.color === 'emerald' ? 'accent-emerald-500' : 'accent-purple-500';
              const barBgClass = sentinel.color === 'blue' ? 'bg-blue-600/20' : sentinel.color === 'orange' ? 'bg-orange-600/20' : sentinel.color === 'emerald' ? 'bg-emerald-600/20' : 'bg-purple-600/20';
              const barFillClass = sentinel.color === 'blue' ? 'bg-blue-400' : sentinel.color === 'orange' ? 'bg-orange-400' : sentinel.color === 'emerald' ? 'bg-emerald-400' : 'bg-purple-400';

              return (
                <div key={sentinel.id} className="p-6 sm:p-10 bg-slate-950/60 border border-white/5 rounded-[2rem] sm:rounded-[2.5rem] flex flex-col gap-6 sm:gap-10 transition-all hover:border-white/10 group/card shadow-inner">
                  {/* Card Header: Reverted to flex-row for Tablet/PC to prevent squashing, kept mobile-specific Bar */}
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                    <div className="flex items-center gap-5 min-w-0">
                      <div className={`p-4 sm:p-5 rounded-2xl bg-slate-900 border ${borderClass} ${textClass} shadow-xl shrink-0 group-hover/card:scale-110 transition-transform duration-500`}>
                        {sentinel.icon}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-lg sm:text-xl lg:text-2xl font-black text-white uppercase tracking-tighter leading-none mb-1 truncate sm:whitespace-normal">{sentinel.name}</h3>
                        <p className="text-[9px] sm:text-[10px] font-black text-slate-600 uppercase tracking-widest">{sentinel.role}</p>
                      </div>
                    </div>
                    
                    {/* Weight & Bias Section */}
                    <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-4 pt-4 sm:pt-0 border-t sm:border-t-0 border-white/5">
                      {/* Bias Visualization Bar: Mobile ONLY (hidden on sm+) to fill requested gap */}
                      <div className="flex-1 max-w-[140px] block sm:hidden">
                         <div className={`w-full h-1 ${barBgClass} rounded-full overflow-hidden`}>
                            <div className={`h-full ${barFillClass} shadow-[0_0_8px_rgba(255,255,255,0.3)] transition-all duration-500`} style={{ width: `${Math.min(100, (weight/2)*100)}%` }}></div>
                         </div>
                         <span className="text-[7px] font-black text-slate-600 uppercase tracking-widest mt-1 block">Bias Factor</span>
                      </div>
                      
                      <div className="text-right">
                        <span className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tighter leading-none">{Math.round(weight * 100)}%</span>
                        <span className="text-[8px] sm:text-[10px] font-black text-slate-600 uppercase tracking-widest sm:mt-1 block">Impact</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-base sm:text-lg lg:text-2xl text-slate-300 font-medium leading-relaxed italic opacity-90 border-t border-white/5 pt-6 text-left">
                    "{sentinel.desc}"
                  </p>

                  <div className="pt-2">
                    <input 
                      type="range" min="0" max="2" step="0.1" 
                      value={weight} 
                      onChange={(e) => updateWeight(sentinel.id, parseFloat(e.target.value))}
                      className={`w-full h-2 sm:h-3 bg-slate-800 rounded-full appearance-none cursor-pointer ${accentClass} focus:ring-0`} 
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="absolute top-0 right-0 w-full h-full bg-indigo-500/5 blur-[150px] pointer-events-none rounded-full"></div>
        </section>

        {/* 03. SIGNAL GATING */}
        <section className="p-6 sm:p-10 lg:p-12 bg-slate-900 border border-slate-800 rounded-[2.5rem] sm:rounded-[3rem] shadow-2xl relative overflow-hidden text-center lg:text-left">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-10 lg:gap-14 relative z-10">
            <div className="max-w-2xl">
              <h2 className="text-xl sm:text-2xl lg:text-4xl font-black text-amber-500 uppercase tracking-tight mb-2 leading-none">03. Signal Gating</h2>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-6">Autonomous Consensus Threshold</p>
              <p className="text-base sm:text-lg lg:text-2xl text-slate-400 font-medium leading-relaxed">
                Controls the minimum required council conviction score. High gating ensures institutional integrity, while lower gating increases coverage.
              </p>
            </div>
            
            <div className="flex flex-col items-center gap-8 w-full lg:w-auto shrink-0">
              <div className="flex flex-col items-center">
                 <span className="text-7xl sm:text-9xl font-black text-white tracking-tighter leading-none drop-shadow-2xl">
                   {alertData.minAlphaScore}%
                 </span>
                 <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest mt-4">Required Alpha Confidence</span>
              </div>
              <input 
                type="range" min="65" max="100" step="1" 
                value={alertData.minAlphaScore} 
                onChange={(e) => setAlertData({ ...alertData, minAlphaScore: parseInt(e.target.value) })}
                className="w-full max-w-sm h-3 bg-slate-950 rounded-full appearance-none cursor-pointer accent-amber-500 shadow-xl" 
              />
            </div>
          </div>
        </section>

        {/* 04. NEURAL ENGINE */}
        <section className="p-6 sm:p-10 lg:p-12 bg-slate-900 border border-slate-800 rounded-[2.5rem] sm:rounded-[3rem] shadow-2xl relative overflow-hidden">
          <div className="flex justify-between items-start mb-10">
             <div className="text-left">
                <h2 className="text-xl sm:text-2xl lg:text-4xl font-black text-indigo-400 uppercase tracking-tight mb-1">04. Neural Engine</h2>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Synthesis architecture architecture</p>
             </div>
             <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10">
            <button 
              onClick={() => setModel('gemini-3-pro-preview')}
              className={`p-8 lg:p-12 rounded-[2rem] sm:rounded-[2.5rem] border-2 flex flex-col items-start text-left transition-all relative overflow-hidden group ${formData.selectedModel === 'gemini-3-pro-preview' ? 'bg-indigo-600 border-indigo-400 text-white shadow-2xl scale-[1.01]' : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'}`}
            >
              <div className="relative z-10">
                <span className="text-xl sm:text-2xl lg:text-4xl font-black uppercase tracking-tighter block mb-4 leading-none text-white">PRO CORE</span>
                <p className="text-base sm:text-lg lg:text-2xl font-medium opacity-80 leading-relaxed max-w-md">
                  Enhanced reasoning depth for complex market confluences. Best for institutional-grade alpha and high-conviction research signals.
                </p>
              </div>
              {formData.selectedModel === 'gemini-3-pro-preview' && <div className="absolute top-6 right-6 w-5 h-5 bg-white rounded-full animate-ping"></div>}
            </button>
            
            <button 
              onClick={() => setModel('gemini-3-flash-preview')}
              className={`p-8 lg:p-12 rounded-[2rem] sm:rounded-[2.5rem] border-2 flex flex-col items-start text-left transition-all relative overflow-hidden group ${formData.selectedModel === 'gemini-3-flash-preview' ? 'bg-indigo-600 border-indigo-400 text-white shadow-2xl scale-[1.01]' : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'}`}
            >
              <div className="relative z-10">
                <span className="text-xl sm:text-2xl lg:text-4xl font-black uppercase tracking-tighter block mb-4 leading-none text-white">FLASH CORE</span>
                <p className="text-base sm:text-lg lg:text-2xl font-medium opacity-80 leading-relaxed max-w-md">
                  Optimized for velocity and high-frequency intake of news streams. Highest ingestion speed for rapid narrative shifts and live scouring.
                </p>
              </div>
              {formData.selectedModel === 'gemini-3-flash-preview' && <div className="absolute top-6 right-6 w-5 h-5 bg-white rounded-full animate-ping"></div>}
            </button>
          </div>
        </section>

        {/* FINAL SUMMON BUTTON */}
        <div className="pt-8 text-center">
          <button 
            onClick={() => onRunScan(formData, alertData)}
            className="w-full py-12 md:py-16 lg:py-20 bg-white text-slate-950 rounded-[2.5rem] sm:rounded-[3rem] font-black text-2xl sm:text-4xl lg:text-7xl uppercase tracking-tighter sm:tracking-[0.1em] lg:tracking-[0.2em] shadow-[0_30px_90px_rgba(255,255,255,0.15)] hover:scale-[1.01] active:scale-95 transition-all flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-14 group relative overflow-hidden px-6"
          >
            <div className="absolute inset-0 bg-indigo-500/5 group-hover:scale-110 transition-transform duration-1000"></div>
            <span className="relative z-10 leading-none">SUMMON THE COUNCIL</span>
            <svg className="w-10 h-10 sm:w-14 lg:w-20 lg:h-20 relative z-10 group-hover:translate-x-8 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
          <p className="text-slate-500 font-black uppercase tracking-widest mt-12 text-xs sm:text-sm text-center flex items-center justify-center gap-4 sm:gap-6">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_15px_#10b981]"></span>
            Protocol: Verification Sequence Complete
          </p>
        </div>

      </div>
    </div>
  );
};

export default TuningLanding;
