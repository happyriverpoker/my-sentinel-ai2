
import React, { useMemo, useState, useEffect } from 'react';
import { UserProfile, InsightReport, TradeSuggestion, DashboardLayout, UserTradeFeedback, PersonaWeights, CalculatorParams, UsageStats, AlertSettings, View } from './types';

interface DashboardProps {
  profile: UserProfile;
  report: InsightReport | null;
  loading: boolean;
  onRefresh: () => void;
  layout: DashboardLayout;
  onUpdateLayout: (l: DashboardLayout) => void;
  isCustomizing: boolean;
  feedback: UserTradeFeedback[];
  onTradeFeedback: (signalId: string, asset: string, verdict: 'like' | 'dislike') => void;
  lastUpdated?: Date | null;
  onOpenCalculator?: (params: CalculatorParams) => void;
  onOpenDeepDive?: (trade: TradeSuggestion) => void;
  usage: UsageStats;
  onUpgrade: () => void;
  settings: AlertSettings;
  setView: (v: View) => void;
}

const TradeCard: React.FC<{ 
  trade: TradeSuggestion; 
  onFeedback: (verdict: 'like' | 'dislike') => void;
  userVerdict?: 'like' | 'dislike';
  weights: PersonaWeights;
  onOpenCalculator?: (params: CalculatorParams) => void;
  onOpenDeepDive?: (trade: TradeSuggestion) => void;
}> = ({ trade, onFeedback, userVerdict, weights, onOpenCalculator, onOpenDeepDive }) => {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [viabilityPercent, setViabilityPercent] = useState<number>(100);

  useEffect(() => {
    const updateExpiry = () => {
      const generatedAt = new Date(trade.generatedAt || 0).getTime();
      const expiryMs = (trade.expiryHours || 2) * 60 * 60 * 1000;
      const now = new Date().getTime();
      const remaining = expiryMs - (now - generatedAt);

      if (remaining <= 0) {
        setTimeLeft('EXPIRED');
        setViabilityPercent(0);
      } else {
        const hours = Math.floor(remaining / (1000 * 60 * 60));
        const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
        setTimeLeft(`${hours}h ${minutes}m`);
        setViabilityPercent(Math.max(0, Math.min(100, (remaining / expiryMs) * 100)));
      }
    };

    const timer = setInterval(updateExpiry, 60000);
    updateExpiry();

    return () => clearInterval(timer);
  }, [trade.expiryHours, trade.generatedAt]);

  const weightedConfidence = useMemo(() => {
    if (!trade.crossAnalysis?.agentInsights || trade.crossAnalysis.agentInsights.length === 0) {
      return trade.confidence;
    }
    
    let totalWeight = 0, weightedSum = 0;
    trade.crossAnalysis.agentInsights.forEach(insight => {
      const lowerName = insight.agentName.toLowerCase();
      const key = lowerName.includes('shield') ? 'safe' : lowerName.includes('scout') ? 'riskTaker' : lowerName.includes('prism') ? 'ta' : 'fa';
      const weight = weights[key as keyof PersonaWeights] ?? 1;
      let rawScore = insight.individualScore ?? 50;
      weightedSum += rawScore * weight;
      totalWeight += weight;
    });
    
    const result = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : trade.confidence;
    return Math.min(100, Math.max(0, result));
  }, [trade, weights]);

  const isLong = trade.type.toLowerCase() === 'long' || trade.type.toLowerCase() === 'buy';
  const isShort = trade.type.toLowerCase() === 'short' || trade.type.toLowerCase() === 'sell';

  const themeClass = isLong 
    ? 'border-emerald-500/20 bg-emerald-500/[0.02] hover:border-emerald-500/40 shadow-emerald-500/5' 
    : isShort 
    ? 'border-rose-500/20 bg-rose-500/[0.02] hover:border-rose-500/40 shadow-rose-500/5' 
    : 'border-amber-500/20 bg-amber-500/[0.02] hover:border-amber-500/40 shadow-amber-500/5';

  const accentColor = isLong ? 'text-emerald-400' : isShort ? 'text-rose-400' : 'text-amber-400';
  const accentBg = isLong ? 'bg-emerald-500/20' : isShort ? 'bg-rose-500/20' : 'bg-amber-500/20';
  
  const progressColor = viabilityPercent > 75 
    ? 'stroke-emerald-500' 
    : viabilityPercent > 25 
      ? 'stroke-amber-500' 
      : 'stroke-rose-500';

  const isFresh = viabilityPercent > 90;

  return (
    <div className={`p-6 rounded-3xl border transition-all duration-300 ${themeClass} ${userVerdict === 'dislike' ? 'opacity-40 scale-95' : 'shadow-xl'} relative overflow-hidden`}>
      <div className="absolute top-0 right-0 flex items-center">
        {trade.isSharedAlpha && (
          <div className="bg-indigo-600 text-white text-[8px] font-black px-3 py-1 uppercase tracking-widest border-l border-b border-white/10">
            Shared Alpha
          </div>
        )}
        <div className="group relative flex items-center bg-slate-800/80 px-3 py-1 border-l border-b border-white/10 transition-colors hover:bg-slate-700/80">
          <div className="w-4 h-4 mr-2 relative">
            {isFresh && (
              <div className="absolute inset-0 rounded-full border border-emerald-500/50 animate-ping opacity-30"></div>
            )}
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              <circle cx="18" cy="18" r="16" fill="none" className="stroke-slate-700" strokeWidth="4"></circle>
              <circle 
                cx="18" cy="18" r="16" fill="none" 
                className={`${progressColor} transition-all duration-1000`} 
                strokeWidth="4"
                strokeDasharray={`${viabilityPercent}, 100`}
                strokeLinecap="round"
              ></circle>
            </svg>
          </div>
          <span className={`text-[8px] font-black uppercase tracking-widest ${timeLeft === 'EXPIRED' ? 'text-rose-400' : 'text-white'}`}>
            {timeLeft}
          </span>
          <div className="absolute top-full right-0 mt-1 w-32 bg-slate-900 border border-slate-700 p-2 rounded-xl text-[8px] font-black text-slate-300 uppercase tracking-widest text-center opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none shadow-2xl">
            Signal Viability
          </div>
        </div>
      </div>

      <div className="flex justify-between items-start mb-5 pt-2">
        <div>
          <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full ${accentBg} ${accentColor}`}>
            {trade.type}
          </span>
          <h4 className="font-black text-2xl mt-2 tracking-tighter text-white uppercase">{trade.asset}</h4>
        </div>
        <div className="text-right group/tooltip relative">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1 text-right flex items-center justify-end gap-1 cursor-help">
            Confidence
            <svg className="w-2.5 h-2.5 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </span>
          <span className={`font-black text-3xl tracking-tighter ${accentColor}`}>{weightedConfidence}%</span>
          
          {/* Weighted Confidence Tooltip */}
          <div className="absolute top-full right-0 mt-2 w-48 bg-slate-900 border border-slate-700 p-3 rounded-2xl text-[9px] font-black text-slate-300 uppercase tracking-[0.1em] text-center opacity-0 group-hover/tooltip:opacity-100 transition-opacity z-30 pointer-events-none shadow-2xl leading-relaxed">
            <span className="text-indigo-400 mb-1 block tracking-[0.2em]">Weighted Analysis</span>
            Final score adjusted based on your selected Sentinel priority weighting.
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-slate-900/50 p-3 rounded-2xl border border-slate-800 text-center">
          <div className="text-[9px] text-slate-500 font-black uppercase mb-1">Entry</div>
          <div className="text-sm font-black text-slate-100 truncate">{trade.entry}</div>
        </div>
        <div className={`${accentBg} p-3 rounded-2xl border border-white/5 text-center`}>
          <div className="text-[9px] font-black text-white/40 uppercase mb-1">Target</div>
          <div className={`text-sm font-black ${accentColor} truncate`}>{trade.takeProfit}</div>
        </div>
        <div className="bg-slate-950/50 p-3 rounded-2xl border border-slate-800 text-center">
          <div className="text-[9px] text-slate-500 font-black uppercase mb-1">Stop</div>
          <div className="text-sm font-black text-rose-400 truncate">{trade.stopLoss}</div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => onOpenCalculator?.({ entry: trade.entry.split('-')[0].trim().replace(/[^0-9.]/g, ''), tp: trade.takeProfit.replace(/[^0-9.]/g, ''), sl: trade.stopLoss.replace(/[^0-9.]/g, ''), type: trade.type as any, asset: trade.asset })}
            className="py-3 bg-slate-900 border border-slate-700 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] text-slate-300 hover:text-white hover:border-slate-500 transition-all shadow-md active:scale-95"
          >
            Calculator
          </button>
          <button 
            onClick={() => onOpenDeepDive?.(trade)}
            className="py-3 bg-indigo-600 border border-indigo-500 text-white hover:bg-indigo-500 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
          >
            Deep Dive
          </button>
        </div>
      </div>
    </div>
  );
};

const Dashboard: React.FC<DashboardProps> = ({ 
  profile, report, loading, feedback, onTradeFeedback, lastUpdated, 
  onOpenCalculator, onOpenDeepDive, onRefresh, usage, onUpgrade, 
  layout, onUpdateLayout, isCustomizing, settings, setView
}) => {
  const weights = profile.tuningMode === 'default' ? { safe: 1, riskTaker: 1, ta: 1, fa: 1 } : (profile.personaWeights || { safe: 1, riskTaker: 1, ta: 1, fa: 1 });

  const filteredSignals = useMemo(() => {
    if (!report?.marketOverview.tradeSuggestions) return [];
    
    return report.marketOverview.tradeSuggestions.filter(trade => {
      let weightedConf = trade.confidence;
      if (trade.crossAnalysis?.agentInsights && trade.crossAnalysis.agentInsights.length > 0) {
        let totalWeight = 0, weightedSum = 0;
        trade.crossAnalysis.agentInsights.forEach(insight => {
          const lowerName = insight.agentName.toLowerCase();
          const key = lowerName.includes('shield') ? 'safe' : lowerName.includes('scout') ? 'riskTaker' : lowerName.includes('prism') ? 'ta' : 'fa';
          const weight = weights[key as keyof PersonaWeights] ?? 1;
          let rawScore = insight.individualScore ?? 50;
          weightedSum += rawScore * weight;
          totalWeight += weight;
        });
        weightedConf = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : trade.confidence;
      }
      return weightedConf >= Math.max(65, settings.minAlphaScore);
    }).sort((a,b) => (b.confidence || 0) - (a.confidence || 0));
  }, [report, settings.minAlphaScore, weights]);

  return (
    <div className="space-y-8 pb-12 max-w-6xl mx-auto animate-in fade-in duration-700">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl flex items-center justify-between px-8">
           <div className="flex items-center gap-4">
              <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-[0_0_8px_#6366f1] animate-pulse"></div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Research Engine</p>
                <p className="text-sm font-bold text-slate-100">Scouring Market Vectors...</p>
              </div>
           </div>
           <button onClick={onRefresh} disabled={loading} className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-indigo-400 hover:text-white transition-all disabled:opacity-50">
              <svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
           </button>
        </div>

        <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl flex items-center justify-between px-8">
           <div className="flex flex-col flex-1 mr-4">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Alpha Capacity</span>
              <div className="flex items-center gap-3">
                 <div className="flex-1 h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div 
                      className="h-full bg-indigo-500 transition-all duration-500 shadow-[0_0_8px_#6366f1]" 
                      style={{ width: `${Math.min(100, (usage.refreshesUsed / usage.dailyLimit) * 100)}%` }}
                    ></div>
                 </div>
                 <span className="text-xs font-black text-slate-100">{usage.refreshesUsed}/{usage.dailyLimit}</span>
              </div>
           </div>
           {profile.subscriptionTier === 'free' && (
              <button onClick={onUpgrade} className="px-4 py-2 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20">
                PRO
              </button>
           )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-8 bg-slate-900 border border-slate-800 rounded-[2.5rem] relative overflow-hidden group shadow-2xl flex flex-col">
          <div className="relative z-10 flex-1">
            <h3 className="text-[11px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-6">Market Narrative Overview</h3>
            {loading ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-6 w-full bg-slate-800/50 rounded-full"></div>
                <div className="h-6 w-5/6 bg-slate-800/50 rounded-full"></div>
              </div>
            ) : (
              <div>
                <p className="text-xl md:text-2xl font-bold text-slate-100 leading-tight tracking-tight mb-8">
                  {report?.marketOverview.usMarketSentiment || 'Synthesizing global research data...'}
                </p>
                {report && (
                  <button 
                    onClick={() => setView('intelligence')}
                    className="group flex items-center gap-2 px-5 py-2.5 bg-indigo-600/10 border border-indigo-500/30 rounded-xl text-[10px] font-black text-indigo-400 uppercase tracking-[0.15em] hover:bg-indigo-600/20 transition-all"
                  >
                    View Global Catalysts
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="p-8 bg-slate-900 border border-slate-800 rounded-[2.5rem] shadow-xl text-center flex flex-col items-center justify-center">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 block">Market Greed Index</span>
          <div className="flex flex-col items-center">
             <span className="text-6xl font-black text-white tracking-tighter mb-2">{report?.marketOverview.macroPulse.fearAndGreed.value || '--'}</span>
             <span className="text-[10px] font-black uppercase text-indigo-500 tracking-[0.4em]">{report?.marketOverview.macroPulse.fearAndGreed.label || 'IDLE'}</span>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
          <div className="flex items-center gap-4">
             <h3 className="text-2xl font-black tracking-tighter text-white uppercase">Council Alpha Signals</h3>
             <div className="hidden sm:flex gap-2">
                <span className="px-3 py-1 bg-indigo-600/10 border border-indigo-500/30 text-[10px] font-black text-indigo-400 rounded-full uppercase tracking-widest">
                  High Precision
                </span>
             </div>
          </div>
          <span className="text-[10px] font-bold text-slate-400 tracking-[0.15em] uppercase">Target Confidence: {settings.minAlphaScore}%</span>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <div key={i} className="p-8 rounded-[2.5rem] border border-slate-800 bg-slate-900/50 animate-pulse h-64"></div>)}
          </div>
        ) : filteredSignals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredSignals.map((t, i) => (
              <TradeCard key={i} trade={t} weights={weights} onOpenCalculator={onOpenCalculator} onOpenDeepDive={onOpenDeepDive} onFeedback={()=>{}} />
            ))}
          </div>
        ) : (
          <div className="p-20 bg-slate-900/40 border-2 border-dashed border-slate-800 rounded-[3rem] text-center">
            <h4 className="text-xl font-black text-slate-200 mb-3 uppercase tracking-tight">Signal Integrity Gap</h4>
            <p className="text-slate-400 max-w-md mx-auto text-sm leading-relaxed font-medium">
              Vora is prioritizing signal integrity. Currently, no research points meet your <strong>{settings.minAlphaScore}%</strong> confidence threshold. Adjust your Sentinel weights or lower the threshold to explore broader data.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
