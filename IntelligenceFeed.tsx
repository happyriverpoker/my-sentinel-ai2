
import React, { useState } from 'react';
import { InsightReport, Catalyst } from '../types';

interface FeedProps {
  report: InsightReport | null;
  loading: boolean;
  onRefresh: () => void;
}

const ImpactBar: React.FC<{ label: string; score: number; color: string }> = ({ label, score, color }) => (
  <div className="flex flex-col gap-1 flex-1">
    <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase">
      <span>{label}</span>
      <span>{score}/10</span>
    </div>
    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
      <div 
        className={`h-full ${color} transition-all duration-1000`} 
        style={{ width: `${score * 10}%` }}
      ></div>
    </div>
  </div>
);

const CatalystCard: React.FC<{ catalyst: Catalyst }> = ({ catalyst }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isPositive = catalyst.sentiment === 'positive';
  const isNeutral = catalyst.sentiment === 'neutral';

  return (
    <div className={`p-6 rounded-2xl bg-slate-900 border transition-all duration-300 group shadow-xl shadow-black/20 ${
      isExpanded ? 'border-indigo-500/40 bg-slate-900/80' : 'border-slate-800 hover:border-slate-700'
    }`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${
            isPositive ? 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20' : 
            isNeutral ? 'bg-slate-400/10 text-slate-400 border border-slate-400/20' : 
            'bg-rose-400/10 text-rose-400 border border-rose-400/20'
          }`}>
            {catalyst.category}
          </span>
          <span className="text-slate-500 text-xs">{new Date(catalyst.timestamp).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs font-bold text-slate-500">AGGREGATE IMPACT</span>
          <div className="flex gap-0.5">
            {[...Array(10)].map((_, i) => (
              <div 
                key={i} 
                className={`w-1.5 h-3 rounded-sm ${i < catalyst.impactScore ? 'bg-indigo-500' : 'bg-slate-800'}`}
              ></div>
            ))}
          </div>
        </div>
      </div>

      <h3 className="text-xl font-bold mb-3 text-slate-100 group-hover:text-indigo-300 transition-colors">
        {catalyst.title}
      </h3>
      
      <p className={`text-slate-400 leading-relaxed mb-4 ${isExpanded ? '' : 'line-clamp-2'}`}>
        {catalyst.summary}
      </p>

      {isExpanded && (
        <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300 py-4 border-t border-slate-800 mt-4">
          <div>
            <h4 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-3">Intelligence Deep Dive</h4>
            <div className="text-sm text-slate-300 leading-relaxed space-y-4 whitespace-pre-line">
              {catalyst.detailedAnalysis}
            </div>
          </div>

          <div>
            <h4 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-3">Impact Vector Breakdown</h4>
            <div className="flex flex-col md:flex-row gap-6 p-4 bg-slate-950 rounded-xl border border-slate-800">
              <ImpactBar label="Market" score={catalyst.impactBreakdown.market} color="bg-emerald-500" />
              <ImpactBar label="Technical" score={catalyst.impactBreakdown.technical} color="bg-indigo-500" />
              <ImpactBar label="Regulatory" score={catalyst.impactBreakdown.regulatory} color="bg-amber-500" />
            </div>
          </div>

          <div>
            <h4 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-3">Verification Sources ({catalyst.sources?.length || 0})</h4>
            <div className="flex flex-wrap gap-3">
              {catalyst.sources?.map((source, i) => (
                <a 
                  key={i} 
                  href={source.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 hover:text-white hover:border-indigo-500 transition-all"
                >
                  <svg className="w-3.5 h-3.5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  {source.title}
                </a>
              ))}
              {(!catalyst.sources || catalyst.sources.length === 0) && (
                <span className="text-xs text-slate-600 italic">No primary documentation found in this scan.</span>
              )}
            </div>
          </div>
        </div>
      )}

      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full mt-4 pt-4 border-t border-slate-800/50 flex items-center justify-center gap-2 text-xs font-bold text-slate-500 hover:text-indigo-400 transition-colors"
      >
        {isExpanded ? (
          <>COLLAPSE ANALYSIS <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg></>
        ) : (
          <>EXPAND DEEP DIVE <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></>
        )}
      </button>
    </div>
  );
};

const IntelligenceFeed: React.FC<FeedProps> = ({ report, loading, onRefresh }) => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold mb-1">Catalyst Intelligence</h2>
          <p className="text-slate-400">Targeted opportunities analyzed for your specific persona and focus areas.</p>
        </div>
        <button 
          onClick={onRefresh}
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl font-semibold transition-all flex items-center gap-2 shadow-lg shadow-indigo-600/20"
        >
          <svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Re-Scan Markets
        </button>
      </div>

      <div className="space-y-6 pb-20">
        {report?.topCatalysts.map((catalyst) => (
          <CatalystCard key={catalyst.id} catalyst={catalyst} />
        ))}

        {!loading && (!report || report.topCatalysts.length === 0) && (
          <div className="text-center py-20 bg-slate-900 rounded-3xl border border-slate-800 border-dashed">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-300">No active catalysts found</h3>
            <p className="text-slate-500 mt-2 max-w-xs mx-auto">Broaden your focus areas in the persona settings or try a fresh global scan.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default IntelligenceFeed;
