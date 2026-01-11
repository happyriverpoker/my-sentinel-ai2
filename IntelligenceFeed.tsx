
import React, { useState } from 'react';
import { InsightReport, Catalyst, TrendingKeyword, SourceConsensus } from './types';

interface FeedProps {
  report: InsightReport | null;
  loading: boolean;
  onRefresh: () => void;
}

const SentimentBadge: React.FC<{ sentiment: string }> = ({ sentiment }) => {
  const colors = {
    bullish: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    bearish: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    neutral: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
    positive: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    negative: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
  };
  const colorClass = colors[sentiment.toLowerCase() as keyof typeof colors] || colors.neutral;
  
  return (
    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border ${colorClass}`}>
      {sentiment}
    </span>
  );
};

const TrendingHub: React.FC<{ keywords: TrendingKeyword[] }> = ({ keywords }) => {
  return (
    <div className="p-8 bg-slate-900 border border-slate-800 rounded-[2.5rem] shadow-2xl mb-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-[11px] font-black text-indigo-500 uppercase tracking-[0.3em]">Market Momentum Pulse</h3>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
          <span className="text-[10px] font-black text-slate-500 uppercase">Live Data Stream</span>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-4">
        {keywords.map((kw, i) => (
          <div key={i} className="group relative">
            <div className="flex items-center gap-3 bg-slate-950 border border-slate-800 rounded-2xl px-5 py-3 hover:border-indigo-500/50 transition-all cursor-default">
              <div className="flex flex-col">
                <span className="text-sm font-black text-white group-hover:text-indigo-400 transition-colors">{kw.word}</span>
                <div className="flex items-center gap-2 mt-1 text-left">
                  <div className="w-16 h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500" style={{ width: `${kw.momentum}%` }}></div>
                  </div>
                  <span className="text-[9px] font-black text-slate-600">{kw.momentum}%</span>
                </div>
              </div>
              <SentimentBadge sentiment={kw.sentiment} />
            </div>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-slate-800 border border-slate-700 rounded-xl text-[10px] text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 shadow-xl leading-relaxed">
              {kw.context}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const SynthesizedReport: React.FC<{ catalyst: Catalyst }> = ({ catalyst }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={`p-8 bg-slate-900 border border-slate-800 rounded-[2.5rem] shadow-xl transition-all duration-300 group ${isExpanded ? 'ring-2 ring-indigo-500/20' : 'hover:border-slate-700'}`}>
      <div className="flex justify-between items-start mb-6">
        <div className="text-left">
          <div className="flex items-center gap-3 mb-2">
            <SentimentBadge sentiment={catalyst.sentiment} />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{catalyst.category}</span>
          </div>
          <h3 className="text-xl font-black text-white group-hover:text-indigo-300 transition-colors tracking-tight leading-tight max-w-2xl">{catalyst.title}</h3>
        </div>
        <div className="text-right">
          <div className="text-[9px] font-black text-slate-500 uppercase mb-1 tracking-widest text-right">Data Impact</div>
          <div className="flex gap-0.5 justify-end">
            {[...Array(10)].map((_, i) => (
              <div key={i} className={`w-1 h-3 rounded-full ${i < catalyst.impactScore / 10 ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]' : 'bg-slate-800'}`}></div>
            ))}
          </div>
          {catalyst.overallCredibilityScore && (
             <div className="mt-2 text-[8px] font-black text-emerald-500 uppercase tracking-widest">
                Source Credibility: {catalyst.overallCredibilityScore}%
             </div>
          )}
        </div>
      </div>

      <p className="text-slate-400 text-sm leading-relaxed mb-6 font-medium text-left line-clamp-3 group-hover:line-clamp-none transition-all">
        {catalyst.summary}
      </p>

      {isExpanded && (
        <div className="animate-in fade-in slide-in-from-top-4 duration-500 pt-6 border-t border-slate-800 mt-6 space-y-8">
          <div>
            <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4 text-left">Synthesized Analysis</h4>
            <div className="text-sm text-slate-300 leading-relaxed text-left whitespace-pre-line font-medium p-6 bg-slate-950 rounded-3xl border border-slate-800">
              {catalyst.detailedAnalysis}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest text-left">Institutional Proof of Work Map</h4>
              <span className="text-[8px] font-bold text-slate-600 uppercase">Consensus Verification</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {catalyst.consensusBreakdown?.map((cb, idx) => (
                <div key={idx} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl relative overflow-hidden group/desk">
                  <div className={`absolute top-0 left-0 w-1 h-full ${cb.stance === 'bullish' ? 'bg-emerald-500' : cb.stance === 'bearish' ? 'bg-rose-500' : 'bg-slate-500'}`}></div>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex flex-col">
                      <span className="text-[11px] font-black text-white uppercase tracking-tighter">{cb.source}</span>
                      <div className="flex items-center gap-1 mt-0.5">
                        <div className="w-12 h-0.5 bg-slate-800 rounded-full overflow-hidden">
                           <div className="h-full bg-emerald-500" style={{ width: `${cb.credibilityScore}%` }}></div>
                        </div>
                        <span className="text-[7px] font-bold text-slate-500">{cb.credibilityScore}% Reliability</span>
                      </div>
                    </div>
                    <SentimentBadge sentiment={cb.stance} />
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-medium text-left">{cb.summary}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full mt-6 flex items-center justify-center gap-3 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors"
      >
        {isExpanded ? 'Minimize Synthesis' : 'Expand Research & Proof of Work'}
        <svg className={`w-3 h-3 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
      </button>
    </div>
  );
};

const IntelligenceFeed: React.FC<FeedProps> = ({ report, loading, onRefresh }) => {
  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-24">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
        <div className="text-left">
          <h2 className="text-4xl font-black text-white tracking-tighter mb-2 italic">RESEARCH PULSE HUB</h2>
          <p className="text-slate-400 font-medium max-w-xl">
            Synthesized market observations compiled from verified data streams and institutional reporting.
          </p>
        </div>
        <button 
          onClick={onRefresh}
          disabled={loading}
          className="px-8 py-4 bg-indigo-600 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-indigo-500/20 hover:scale-105 transition-all disabled:opacity-50 flex items-center gap-3"
        >
          <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          Refresh Research
        </button>
      </div>

      {loading ? (
        <div className="space-y-8 px-4 animate-pulse">
          <div className="h-64 bg-slate-900 border border-slate-800 rounded-[2.5rem]"></div>
          <div className="h-48 bg-slate-900 border border-slate-800 rounded-[2.5rem]"></div>
          <div className="h-48 bg-slate-900 border border-slate-800 rounded-[2.5rem]"></div>
        </div>
      ) : report ? (
        <div className="px-4 animate-in fade-in slide-in-from-bottom-6 duration-700">
          <TrendingHub keywords={report.trendingKeywords || []} />
          
          <div className="space-y-8">
            <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] px-4 text-left">Key Research Drivers</h3>
            {report.topCatalysts.length > 0 ? (
              report.topCatalysts.map((c) => (
                <SynthesizedReport key={c.id} catalyst={c} />
              ))
            ) : (
              <div className="p-20 bg-slate-900/40 border-2 border-dashed border-slate-800 rounded-[3rem] text-center">
                <h4 className="text-xl font-black text-slate-300">Pulse Scan Inactive</h4>
                <p className="text-slate-500 max-w-sm mx-auto text-sm">No significant observations detected. Broaden your focus area to capture more data.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="p-20 bg-slate-900 border border-slate-800 rounded-[3rem] text-center">
          <p className="text-slate-500 font-bold uppercase tracking-widest">Initialize Research Scour</p>
        </div>
      )}
    </div>
  );
};

export default IntelligenceFeed;
