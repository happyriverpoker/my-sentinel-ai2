
import React, { useMemo } from 'react';
import { TradeSuggestion } from './types';

interface SentinelHQProps {
  onBack: () => void;
}

interface SentinelDossier {
  id: string;
  name: string;
  codename: string;
  role: string;
  bio: string;
  specialization: string[];
  color: string;
}

const SENTINELS: SentinelDossier[] = [
  {
    id: 'safe',
    name: 'Vora Shield',
    codename: 'THE BASTION',
    role: 'Preservation Core',
    bio: 'Shield algorithms are optimized for capital preservation. It parses downside variance and support integrity to ensure portfolio survival above all else.',
    specialization: ['Support Mapping', 'Liquidity Analysis', 'Volatility Indexing'],
    color: 'indigo'
  },
  {
    id: 'riskTaker',
    name: 'Vora Scout',
    codename: 'THE VANGUARD',
    role: 'Speculation Core',
    bio: 'Scout focuses on high-conviction breakout momentum. It monitors social heatmaps and liquidity gaps to capture alpha in frontier markets.',
    specialization: ['Momentum Heatmaps', 'Breakout Detection', 'Social Sentiment'],
    color: 'orange'
  },
  {
    id: 'ta',
    name: 'Vora Prism',
    codename: 'THE ARCHITECT',
    role: 'Execution Core',
    bio: 'Prism synthesizes technical pattern confluences. It maps RSI profiles, trend-line integrity, and oscillating indicators into a geometric alpha lens.',
    specialization: ['Pattern Recognition', 'Confluence Logic', 'Candle Synthesis'],
    color: 'emerald'
  },
  {
    id: 'fa',
    name: 'Vora Core',
    codename: 'THE ORACLE',
    role: 'Catalyst Core',
    bio: 'Core parses the fundamental narrative landscape. From institutional reporting to FOMC shifts, it finds the "Why" behind major market pivots.',
    specialization: ['Macro Narratives', 'Institutional Flow', 'News Synthesis'],
    color: 'purple'
  }
];

const gradeToValue = (grade: string) => {
  switch (grade) {
    case 'A': return 4.0;
    case 'B': return 3.0;
    case 'C': return 2.0;
    case 'D': return 1.0;
    case 'F': return 0.0;
    default: return null;
  }
};

const SentinelHQ: React.FC<SentinelHQProps> = ({ onBack }) => {
  const stats = useMemo(() => {
    const rawHistory = localStorage.getItem('vora_resolved_alpha');
    const history: TradeSuggestion[] = rawHistory ? JSON.parse(rawHistory) : [];
    
    const grades: Record<string, number[]> = { safe: [], riskTaker: [], ta: [], fa: [] };
    
    history.forEach(trade => {
      trade.retrospection?.sentinelInterviews.forEach(interview => {
        const name = interview.agentName.toLowerCase();
        let key = '';
        if (name.includes('shield')) key = 'safe';
        else if (name.includes('scout')) key = 'riskTaker';
        else if (name.includes('prism')) key = 'ta';
        else if (name.includes('core')) key = 'fa';
        
        if (key && grades[key]) {
          const val = gradeToValue(interview.grade);
          if (val !== null) grades[key].push(val);
        }
      });
    });

    return Object.keys(grades).reduce((acc, key) => {
      const gList = grades[key];
      acc[key] = gList.length > 0 ? (gList.reduce((a, b) => a + b, 0) / gList.length).toFixed(1) : 'N/A';
      return acc;
    }, {} as Record<string, string>);
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-24 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4 text-left">
        <div>
          <h2 className="text-5xl font-black text-white tracking-tighter italic uppercase">Sentinel HQ</h2>
          <p className="text-slate-400 font-medium max-w-xl mt-2">
            The inner sanctum of the Council. Review the bios and historical performance metrics of your intelligence agents.
          </p>
        </div>
        <div className="flex gap-4">
           <div className="px-6 py-3 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col justify-center">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-0.5">Council Accuracy</span>
              <span className="text-lg font-black text-indigo-400">ACTIVE SCANNING</span>
           </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-4">
        {SENTINELS.map((s) => {
          const gpa = stats[s.id];
          const colorClass = s.color === 'indigo' ? 'text-blue-400 border-blue-500/30' : 
                            s.color === 'orange' ? 'text-orange-400 border-orange-500/30' : 
                            s.color === 'emerald' ? 'text-emerald-400 border-emerald-500/30' : 
                            'text-purple-400 border-purple-500/30';
          const bgClass = s.color === 'indigo' ? 'bg-blue-500/5' : 
                            s.color === 'orange' ? 'bg-orange-500/5' : 
                            s.color === 'emerald' ? 'bg-emerald-500/5' : 
                            'bg-purple-500/5';
          
          return (
            <div key={s.id} className={`p-8 bg-slate-900 border border-slate-800 rounded-[3rem] shadow-2xl relative overflow-hidden group hover:border-slate-700 transition-all text-left`}>
              <div className="flex justify-between items-start mb-6">
                 <div>
                    <span className={`text-[10px] font-black uppercase tracking-[0.3em] ${colorClass}`}>{s.codename}</span>
                    <h3 className="text-3xl font-black text-white tracking-tight mt-1">{s.name}</h3>
                    <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest mt-1">{s.role}</p>
                 </div>
                 <div className={`p-4 rounded-3xl ${bgClass} border ${colorClass} flex flex-col items-center justify-center min-w-[70px]`}>
                    <span className="text-2xl font-black text-white">{gpa}</span>
                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">Avg Grade</span>
                 </div>
              </div>

              <p className="text-slate-400 text-sm leading-relaxed mb-8 font-medium">
                {s.bio}
              </p>

              <div className="space-y-4">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Agent Specializations</span>
                <div className="flex flex-wrap gap-2">
                  {s.specialization.map((spec, idx) => (
                    <span key={idx} className="px-3 py-1 bg-slate-950 border border-slate-800 rounded-full text-[10px] font-bold text-slate-300">
                      {spec}
                    </span>
                  ))}
                </div>
              </div>

              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
          );
        })}
      </div>

      <div className="px-4">
         <div className="p-10 bg-indigo-600/5 border border-indigo-500/20 rounded-[3rem] text-center">
            <h4 className="text-[11px] font-black text-indigo-400 uppercase tracking-[0.4em] mb-4">Council Synergy Status</h4>
            <p className="text-slate-400 text-sm max-w-2xl mx-auto leading-relaxed font-medium italic">
              The Council is currently synchronized. Use the Retrospection protocol on expired signals to feed the historical performance engine and improve designated agent accuracy.
            </p>
         </div>
      </div>
    </div>
  );
};

export default SentinelHQ;
