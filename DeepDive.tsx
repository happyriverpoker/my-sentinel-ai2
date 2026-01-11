
import React, { useMemo, useState, useEffect } from 'react';
import { TradeSuggestion, PersonaWeights, TradeRetrospection } from './types';
import { SentinelAIService } from './services/geminiService';

interface DeepDiveProps {
  trade: TradeSuggestion;
  weights: PersonaWeights;
  onBack: () => void;
}

const resolveAgentKey = (name: string): keyof PersonaWeights => {
  const n = name.toLowerCase();
  if (n.includes('shield') || n.includes('safe') || n.includes('preservation')) return 'safe';
  if (n.includes('scout') || n.includes('risk') || n.includes('momentum') || n.includes('speculation') || n.includes('scanner')) return 'riskTaker';
  if (n.includes('prism') || n.includes('technical') || n.includes('pattern') || n.includes('chart') || n.includes('execution') || n.includes('ta')) return 'ta';
  if (n.includes('core') || n.includes('macro') || n.includes('fundamental') || n.includes('catalyst') || n.includes('alpha') || n.includes('fa')) return 'fa';
  return 'fa';
};

const getOfficialName = (name: string): string => {
  const key = resolveAgentKey(name);
  switch (key) {
    case 'safe': return 'Vora Shield';
    case 'riskTaker': return 'Vora Scout';
    case 'ta': return 'Vora Prism';
    case 'fa': return 'Vora Core';
    default: return name;
  }
};

const getAgentIcon = (name: string) => {
  const key = resolveAgentKey(name);
  switch (key) {
    case 'safe':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      );
    case 'riskTaker':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      );
    case 'ta':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      );
    case 'fa':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      );
    default:
      return '🤖';
  }
};

const getAgentTheming = (name: string) => {
  const key = resolveAgentKey(name);
  switch (key) {
    case 'safe': return { text: 'text-blue-400', border: 'border-blue-500/20', bg: 'bg-blue-500/5', accent: 'bg-blue-500' };
    case 'riskTaker': return { text: 'text-orange-400', border: 'border-orange-500/20', bg: 'bg-orange-500/5', accent: 'bg-orange-500' };
    case 'ta': return { text: 'text-emerald-400', border: 'border-emerald-500/20', bg: 'bg-emerald-500/5', accent: 'bg-emerald-500' };
    case 'fa': return { text: 'text-purple-400', border: 'border-purple-500/20', bg: 'bg-purple-500/5', accent: 'bg-purple-500' };
    default: return { text: 'text-indigo-400', border: 'border-indigo-500/20', bg: 'bg-indigo-500/5', accent: 'bg-indigo-500' };
  }
};

const DeepDive: React.FC<DeepDiveProps> = ({ trade, weights, onBack }) => {
  const [retro, setRetro] = useState<TradeRetrospection | null>(trade.retrospection || null);
  const [loadingRetro, setLoadingRetro] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const sentinelAIService = useMemo(() => new SentinelAIService(), []);

  useEffect(() => {
    const checkExpiry = () => {
      const genAt = new Date(trade.generatedAt || 0).getTime();
      const expHours = trade.expiryHours || 2;
      const now = Date.now();
      setIsExpired(now > genAt + (expHours * 60 * 60 * 1000));
    };
    checkExpiry();
    const timer = setInterval(checkExpiry, 60000);
    return () => clearInterval(timer);
  }, [trade]);

  const weightedConsensus = useMemo(() => {
    if (!trade.crossAnalysis?.agentInsights || trade.crossAnalysis.agentInsights.length === 0) {
      return trade.confidence;
    }
    
    let totalWeight = 0, weightedSum = 0;
    trade.crossAnalysis.agentInsights.forEach(insight => {
      const key = resolveAgentKey(insight.agentName);
      const weight = weights[key] ?? 1;
      let rawScore = insight.individualScore ?? 50;
      weightedSum += rawScore * weight;
      totalWeight += weight;
    });
    
    const result = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : trade.confidence;
    return Math.min(100, Math.max(0, result));
  }, [trade, weights]);

  const handleRetrospection = async () => {
    if (!isExpired) return;
    setLoadingRetro(true);
    try {
      const result = await sentinelAIService.generateRetrospection(trade);
      setRetro(result);
      
      const historyRaw = localStorage.getItem('vora_resolved_alpha');
      const history = historyRaw ? JSON.parse(historyRaw) : [];
      const updatedTrade = { ...trade, retrospection: result };
      history.push(updatedTrade);
      localStorage.setItem('vora_resolved_alpha', JSON.stringify(history));
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingRetro(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex items-center gap-6 pt-4">
        <button 
          onClick={onBack}
          className="p-4 bg-slate-900 border border-slate-800 rounded-3xl text-slate-400 hover:text-white transition-all shadow-lg active:scale-95"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <div className="flex-1 text-left">
          <h2 className="text-4xl font-black uppercase tracking-tight text-white italic">{trade.asset} DEEP DIVE</h2>
          <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-1">Multi-Agent Strategic Analysis</p>
        </div>
        <div className="relative group">
          <button 
            onClick={handleRetrospection}
            disabled={loadingRetro || !isExpired || !!retro}
            className={`px-6 py-3 border rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
              !isExpired ? 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed' : 
              retro ? 'bg-indigo-600 border-indigo-500 text-white cursor-default' :
              'bg-slate-800 border-slate-700 text-indigo-400 hover:bg-slate-700 hover:text-white'
            }`}
          >
            {loadingRetro ? 'Interviewing Sentinels...' : retro ? 'Retrospection Resolved' : 'Sentinel Retrospection'}
          </button>
          {!isExpired && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-slate-900 border border-slate-800 p-3 rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 text-center">
              <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Protocol Locked</span>
              <p className="text-[9px] text-slate-500 mt-1 uppercase leading-tight">Retrospection requires signal maturity. Protocol unlocks after expiry.</p>
            </div>
          )}
        </div>
      </header>

      {retro && (
        <div className="p-10 bg-slate-950 border border-indigo-500/20 rounded-[3rem] shadow-2xl animate-in zoom-in duration-500 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-10">
             <svg className="w-24 h-24 text-indigo-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
          </div>
          <h3 className="text-[11px] font-black text-indigo-400 uppercase tracking-[0.4em] mb-6 text-left">Post-Mortem Analysis</h3>
          <p className="text-xl font-bold text-slate-100 mb-8 leading-relaxed italic text-left">"{retro.summary}"</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            {retro.sentinelInterviews.map((interview, idx) => {
              const theme = getAgentTheming(interview.agentName);
              const agentDisplayName = getOfficialName(interview.agentName);
              return (
                <div key={idx} className={`p-6 rounded-[2rem] border ${theme.border} ${theme.bg} relative text-left`}>
                  <div className="flex justify-between items-center mb-4">
                    <span className={`text-[10px] font-black uppercase tracking-widest ${theme.text}`}>{agentDisplayName}</span>
                    <span className={`text-xl font-black ${interview.grade === 'A' ? 'text-emerald-400' : 'text-slate-500'}`}>{interview.grade}</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed mb-4">"{interview.analysisOfOutcome}"</p>
                  <div className="pt-3 border-t border-white/5">
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mb-1">Lesson Learned</span>
                    <p className="text-[10px] text-slate-400 font-bold italic">{interview.lessonLearned}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="p-6 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-center">
            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1 block">Final Calibration Verdict</span>
            <p className="text-sm font-bold text-slate-100">{retro.finalVerdict}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 p-10 bg-slate-900 rounded-[3rem] border border-slate-800 flex flex-col justify-center items-center text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
             <svg className="w-32 h-32 text-indigo-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 100-16 8 8 0 000 16zM11 7h2v2h-2V7zm0 4h2v6h-2v-6z"/></svg>
          </div>
          <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] mb-4">Strategic Confidence</span>
          <span className="text-9xl font-black text-white tracking-tighter shadow-indigo-500/50">
            {weightedConsensus}%
          </span>
          <div className="mt-8 flex justify-center gap-3">
            <span className={`px-6 py-2 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] border ${trade.type.toLowerCase().includes('long') || trade.type.toLowerCase().includes('buy') ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-emerald-500/10' : 'bg-rose-500/10 border-rose-500 text-rose-400 shadow-rose-500/10'}`}>
              BIAS: {trade.type}
            </span>
          </div>
        </div>

        <div className="lg:col-span-7 p-10 bg-slate-900 rounded-[3rem] border border-slate-800 shadow-2xl flex flex-col text-left">
          <h3 className="text-[11px] font-black text-indigo-400 uppercase tracking-[0.4em] mb-6">Central Strategic Thesis</h3>
          <p className="text-xl font-bold text-slate-200 leading-relaxed flex-1">
            {trade.reasoning}
          </p>
          <div className="mt-10 pt-8 border-t border-slate-800">
             <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Dominant Market Catalyst</div>
             <div className="bg-slate-950 p-5 rounded-2xl border border-indigo-500/20 text-indigo-400 font-bold leading-relaxed">
               {trade.catalyst}
             </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] px-4 text-left">Sentinel Deliberation Ledger</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {trade.crossAnalysis?.agentInsights.map((insight, idx) => {
            const theme = getAgentTheming(insight.agentName);
            const key = resolveAgentKey(insight.agentName);
            const userWeight = weights[key] ?? 1;
            const agentDisplayName = getOfficialName(insight.agentName);

            return (
              <div key={idx} className={`p-8 rounded-[2.5rem] border ${theme.border} ${theme.bg} flex flex-col relative overflow-hidden transition-all hover:scale-[1.01] shadow-xl text-left`}>
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-2xl bg-slate-950 border ${theme.border} ${theme.text}`}>
                      {getAgentIcon(insight.agentName)}
                    </div>
                    <div>
                      <h4 className={`font-black text-sm uppercase tracking-widest ${theme.text}`}>{agentDisplayName}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] font-black uppercase tracking-tighter ${insight.verdict === 'approved' ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {insight.verdict === 'approved' ? 'PRO-CONVICTION' : 'CAUTIONARY STANCE'}
                        </span>
                        <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest px-1.5 py-0.5 bg-slate-950 rounded border border-white/5">
                          WEIGHT: {Math.round(userWeight * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-black text-slate-500 uppercase block mb-1">Conviction</span>
                    <span className="text-2xl font-black text-white">{insight.individualScore || '--'}%</span>
                  </div>
                </div>
                
                <div className="bg-slate-950/60 p-6 rounded-3xl border border-white/5 flex-1 shadow-inner">
                  <div className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Sentinel Argument</div>
                  <p className="text-sm font-medium leading-relaxed text-slate-200">
                    {insight.note}
                  </p>
                </div>

                <div className={`absolute bottom-0 left-0 h-1.5 ${theme.accent}`} style={{ width: `${insight.individualScore}%`, opacity: 0.5 }}></div>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="p-10 bg-indigo-600/5 border border-indigo-500/20 rounded-[3rem] space-y-6 shadow-2xl">
        <h3 className="text-[11px] font-black text-indigo-400 uppercase tracking-[0.4em] text-left">Algorithmic Execution Metrics</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div className="bg-slate-950/40 p-6 rounded-3xl border border-white/5 text-center">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Projected Alpha (ROI)</span>
            <span className="text-3xl font-black text-emerald-400">{trade.keyMetrics.projectedROI}</span>
          </div>
          <div className="bg-slate-950/40 p-6 rounded-3xl border border-white/5 text-center">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Current Funding Load</span>
            <span className="text-3xl font-black text-slate-200">{trade.keyMetrics.fundingRate}</span>
          </div>
          <div className="bg-slate-950/40 p-6 rounded-3xl border border-white/5 text-center">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Velocity Index</span>
            <span className="text-3xl font-black text-slate-200">{trade.keyMetrics.estimatedVolume}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeepDive;
