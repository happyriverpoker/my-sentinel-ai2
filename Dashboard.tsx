
import React, { useState, useMemo } from 'react';
import { UserProfile, InsightReport, TradeSuggestion, NewsHeadline, DashboardLayout, WidgetConfig, UserTradeFeedback, PersonaWeights, UsageStats, CalculatorParams } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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
  // Added missing props required by App.tsx to fix TS errors
  usage: UsageStats;
  onUpgrade: () => void;
  lastUpdated: Date | null;
  onOpenCalculator: (p: CalculatorParams) => void;
  onOpenDeepDive: (t: TradeSuggestion) => void;
}

const getAgentKey = (name: string): keyof PersonaWeights => {
  const n = name.toLowerCase();
  if (n.includes('safe')) return 'safe';
  if (n.includes('risk')) return 'riskTaker';
  if (n.includes('ta') || n.includes('technical')) return 'ta';
  if (n.includes('fa') || n.includes('fundamental')) return 'fa';
  return 'safe';
};

const getAgentIcon = (name: string) => {
  const key = getAgentKey(name);
  switch(key) {
    case 'safe': return '🛡️';
    case 'riskTaker': return '🚀';
    case 'ta': return '📊';
    case 'fa': return '🧠';
    default: return '🤖';
  }
};

const TradeCard: React.FC<{ 
  trade: TradeSuggestion; 
  onFeedback: (verdict: 'like' | 'dislike') => void;
  userVerdict?: 'like' | 'dislike';
  weights: PersonaWeights;
  onOpenCalculator: (p: CalculatorParams) => void;
  onOpenDeepDive: (t: TradeSuggestion) => void;
}> = ({ trade, onFeedback, userVerdict, weights, onOpenCalculator, onOpenDeepDive }) => {
  const [expanded, setExpanded] = useState(false);
  
  const weightedConsensus = useMemo(() => {
    if (!trade.crossAnalysis?.agentInsights) return trade.confidence;
    let totalWeight = 0;
    let weightedSum = 0;
    trade.crossAnalysis.agentInsights.forEach(insight => {
      const key = getAgentKey(insight.agentName);
      const weight = weights[key] ?? 1;
      const score = insight.individualScore ?? (insight.verdict === 'approved' ? 90 : 40);
      weightedSum += score * weight;
      totalWeight += weight;
    });
    return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : trade.confidence;
  }, [trade, weights]);

  const isHighConviction = weightedConsensus >= 85;

  return (
    <div 
      className={`p-5 md:p-6 rounded-2xl border transition-all duration-300 relative overflow-hidden group/card ${
        expanded ? 'bg-indigo-600/15 border-indigo-500/40 shadow-2xl scale-[1.01]' : 'bg-indigo-600/5 border-indigo-500/20 hover:bg-indigo-600/10 hover:border-indigo-500/40'
      } ${userVerdict === 'like' ? 'ring-2 ring-emerald-500/50' : userVerdict === 'dislike' ? 'opacity-50 grayscale border-rose-500/30' : ''}`}
    >
      {trade.isTimeSensitive && (
        <div className="absolute top-0 right-0 bg-rose-500 text-white text-[10px] font-black px-3 py-1 uppercase tracking-tighter z-10">
          Time Sensitive
        </div>
      )}
      <div className="flex justify-between items-start mb-4">
        <div onClick={() => setExpanded(!expanded)} className="cursor-pointer">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[10px] font-bold uppercase tracking-widest ${trade.type === 'long' ? 'text-emerald-400' : 'text-rose-400'}`}>
              {trade.type === 'long' ? 'BUY' : 'SELL'}
            </span>
            {isHighConviction && <span className="bg-amber-500/20 text-amber-500 text-[10px] px-1.5 py-0.5 rounded border border-amber-500/30 font-bold animate-pulse">HIGH ALPHA</span>}
          </div>
          <h4 className="text-lg md:text-xl font-bold text-slate-100">{trade.asset}</h4>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-tighter">Confidence</span>
          <span className="text-base md:text-lg font-bold text-slate-100">{weightedConsensus}%</span>
        </div>
      </div>
      <div className="flex items-center justify-between mt-4">
        <div className="flex gap-1">
          {(trade.crossAnalysis?.agentInsights || []).map((insight, idx) => (
            <div key={idx} className={`w-6 h-6 rounded flex items-center justify-center text-[10px] border ${insight.verdict === 'approved' ? 'bg-emerald-500/10 border-emerald-400/30 text-emerald-400' : 'bg-amber-500/10 border-amber-400/30 text-amber-400'}`}>
              {getAgentIcon(insight.agentName)}
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          {/* Implement Calculator trigger from signal data */}
          <button 
            onClick={() => onOpenCalculator({ entry: trade.entry, tp: trade.takeProfit, sl: trade.stopLoss, type: trade.type as any, asset: trade.asset })}
            className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition-colors"
            title="Calculator"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
          </button>
          {/* Implement Deep Dive view trigger */}
          <button 
            onClick={() => onOpenDeepDive(trade)}
            className="p-1.5 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 hover:bg-indigo-600 hover:text-white transition-colors"
            title="Analysis"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
          </button>
          <button onClick={() => onFeedback('like')} className={`p-1.5 rounded-lg border ${userVerdict === 'like' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-slate-800 border-slate-700 text-slate-500'}`}><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 10.333z" /></svg></button>
          <button onClick={() => onFeedback('dislike')} className={`p-1.5 rounded-lg border ${userVerdict === 'dislike' ? 'bg-rose-500/20 border-rose-500 text-rose-400' : 'bg-slate-800 border-slate-700 text-slate-500'}`}><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.43a2 2 0 00-1.106-1.79l-.05-.025A4 4 0 0011.057 2H5.64a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.44 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01-.8 2.4l1.4-2.266z" /></svg></button>
        </div>
      </div>
      {expanded && (
        <div className="mt-4 pt-4 border-t border-indigo-500/20 animate-in fade-in slide-in-from-top-2 duration-300">
          <p className="text-xs text-slate-400 leading-relaxed italic">"{trade.reasoning}"</p>
        </div>
      )}
    </div>
  );
};

const Dashboard: React.FC<DashboardProps> = ({ 
  profile, report, loading, layout, isCustomizing, feedback, onTradeFeedback,
  usage, onUpgrade, lastUpdated, onOpenCalculator, onOpenDeepDive
}) => {
  const weights = profile.tuningMode === 'default' ? { safe: 1, riskTaker: 1, ta: 1, fa: 1 } : (profile.personaWeights || { safe: 1, riskTaker: 1, ta: 1, fa: 1 });
  const sortedSignals = useMemo(() => {
    return [...(report?.marketOverview?.tradeSuggestions || [])].sort((a, b) => b.confidence - a.confidence);
  }, [report?.marketOverview?.tradeSuggestions]);

  const renderWidget = (id: string) => {
    switch (id) {
      case 'ticker':
        return (
          <div key="ticker" className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {report?.marketOverview?.cryptoPrices?.map((c, i) => (
              <div key={i} className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-center">
                <p className="text-[10px] font-bold text-slate-500 uppercase">{c.symbol}</p>
                <p className="font-bold">{c.price}</p>
              </div>
            )) || <div className="col-span-full h-12 animate-pulse bg-slate-900/50 rounded-xl"></div>}
          </div>
        );
      case 'signals':
        return (
          <div key="signals" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold">Alpha Signals</h3>
              <span className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-black text-indigo-400 rounded-full uppercase tracking-widest">
                Engine: {profile.tuningMode}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sortedSignals.map((trade, i) => {
                const sid = `${trade.asset}-${trade.type}`;
                return <TradeCard key={i} trade={trade} weights={weights} userVerdict={feedback.find(f => f.signalId === sid)?.verdict} onFeedback={v => onTradeFeedback(sid, trade.asset, v)} onOpenCalculator={onOpenCalculator} onOpenDeepDive={onOpenDeepDive} />;
              })}
            </div>
          </div>
        );
      case 'narrative':
        return <div key="narrative" className="p-6 bg-slate-900 border border-slate-800 rounded-2xl"><h3 className="text-lg font-bold mb-2">Market Narrative</h3><p className="text-slate-400 text-sm leading-relaxed">{report?.marketOverview?.usMarketSentiment || 'Scanning global sentiment...'}</p></div>;
      case 'fearGreed':
        return <div key="fearGreed" className="p-6 bg-slate-900 border border-slate-800 rounded-2xl text-center"><h3 className="text-xs font-bold text-slate-500 uppercase mb-4">Fear & Greed</h3><p className="text-4xl font-black text-indigo-400">{report?.marketOverview?.macroPulse?.fearAndGreed?.value ?? '--'}</p></div>;
      case 'news':
        return <div key="news" className="p-6 bg-slate-900 border border-slate-800 rounded-2xl"><h3 className="text-sm font-bold text-slate-300 uppercase mb-4">Live Pulse</h3><div className="space-y-3">{report?.newsHeadlines.slice(0, 3).map((h, i) => <div key={i} className="text-xs font-semibold text-slate-200 line-clamp-2 border-b border-slate-800 pb-2">{h.title}</div>)}</div></div>;
      default: return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-4xl font-bold">Control Center</h1>
          <p className="text-slate-400">Targeting {profile.focusAreas.join(', ')}</p>
        </div>
        {/* Added missing usage HUD as implied by passing the 'usage' prop from App.tsx */}
        <div className="flex items-center gap-4 p-4 bg-slate-900/50 border border-slate-800 rounded-2xl">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Daily Scans</span>
            <div className="flex items-center gap-2">
              <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-500 transition-all duration-500" 
                  style={{ width: `${(usage.refreshesUsed / usage.dailyLimit) * 100}%` }}
                ></div>
              </div>
              <span className="text-xs font-bold text-slate-200">{usage.refreshesUsed}/{usage.dailyLimit}</span>
            </div>
          </div>
          {profile.subscriptionTier === 'free' && (
            <button onClick={onUpgrade} className="px-3 py-1.5 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-indigo-500 transition-all">
              Upgrade
            </button>
          )}
        </div>
      </header>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">{layout.main.filter(w => w.visible).map(w => renderWidget(w.id))}</div>
        <div className="space-y-6">{layout.sidebar.filter(w => w.visible).map(w => renderWidget(w.id))}</div>
      </div>
    </div>
  );
};

export default Dashboard;
