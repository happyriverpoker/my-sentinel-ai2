import React, { useState, useMemo, useEffect } from 'react';
import { CalculatorParams } from './types';

interface TradeCalculatorProps {
  currentMarketPrice: string;
  initialParams?: CalculatorParams | null;
  onClearParams?: () => void;
}

const TradeCalculator: React.FC<TradeCalculatorProps> = ({ currentMarketPrice, initialParams, onClearParams }) => {
  const [leverage, setLeverage] = useState<number>(10);
  const [entryPrice, setEntryPrice] = useState<string>(currentMarketPrice);
  const [tradeType, setTradeType] = useState<'long' | 'short' | 'spot'>('long');
  const [margin, setMargin] = useState<string>('1000');
  const [tp, setTp] = useState<string>('');
  const [sl, setSl] = useState<string>('');

  useEffect(() => {
    if (initialParams) {
      if (initialParams.entry) setEntryPrice(initialParams.entry);
      if (initialParams.tp) setTp(initialParams.tp);
      if (initialParams.sl) setSl(initialParams.sl);
      
      if (initialParams.type) {
        const typeNormalized = initialParams.type.toLowerCase();
        if (typeNormalized.includes('long') || typeNormalized.includes('buy')) {
          setTradeType('long');
        } else if (typeNormalized.includes('short') || typeNormalized.includes('sell')) {
          setTradeType('short');
        } else if (typeNormalized.includes('spot')) {
          setTradeType('spot');
        } else {
          // Fallback to whatever was provided if it doesn't match common patterns
          setTradeType(initialParams.type as any);
        }
      }
    }
  }, [initialParams]);

  const stats = useMemo(() => {
    const entry = parseFloat(entryPrice);
    const marg = parseFloat(margin);
    const posSize = marg * leverage;
    const maintenanceMargin = 0.005;

    if (isNaN(entry) || isNaN(marg) || entry === 0) return null;

    let liq = 0;
    if (tradeType === 'long') {
      liq = entry * (1 - (1 / leverage) + maintenanceMargin);
    } else if (tradeType === 'short') {
      liq = entry * (1 + (1 / leverage) - maintenanceMargin);
    } else {
      liq = 0;
    }

    const calculatePL = (exit: string) => {
      const exitPrice = parseFloat(exit);
      if (isNaN(exitPrice)) return null;
      const profitPerUnit = (tradeType === 'long' || tradeType === 'spot') ? (exitPrice - entry) : (entry - exitPrice);
      const profit = profitPerUnit * (posSize / entry);
      const roe = (profit / marg) * 100;
      return { profit, roe };
    };

    const targetPL = calculatePL(tp);
    const stopPL = calculatePL(sl);

    return {
      liqPrice: liq.toFixed(2),
      target: targetPL,
      stop: stopPL,
      posSize: posSize.toFixed(2)
    };
  }, [entryPrice, leverage, tradeType, margin, tp, sl]);

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="p-8 bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Trade Calculator</h2>
          {initialParams && (
            <button onClick={onClearParams} className="text-[10px] font-black text-indigo-400 uppercase tracking-widest border border-indigo-500/30 px-3 py-1.5 rounded-xl hover:bg-indigo-500/5 transition-all">Clear Alpha Link</button>
          )}
        </div>
        
        {initialParams?.asset && (
          <div className="mb-6 p-4 bg-indigo-600/10 border border-indigo-500/20 rounded-2xl flex items-center justify-between">
            <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">Analyzing Alpha Signal</span>
            <span className="text-sm font-black text-white">{initialParams.asset}</span>
          </div>
        )}

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={() => setTradeType('long')} 
              className={`py-4 rounded-xl font-black text-xs transition-all ${tradeType === 'long' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 border-emerald-500' : 'bg-slate-950 text-slate-500 border border-slate-800'}`}
            >
              LONG
            </button>
            <button 
              onClick={() => setTradeType('short')} 
              className={`py-4 rounded-xl font-black text-xs transition-all ${tradeType === 'short' ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/20 border-rose-500' : 'bg-slate-950 text-slate-500 border border-slate-800'}`}
            >
              SHORT
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase block mb-1 tracking-widest">Leverage: {leverage}x</label>
              <input type="range" min="1" max="100" value={leverage} onChange={e => setLeverage(parseInt(e.target.value))} className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase block mb-1 tracking-widest">Margin (USDT)</label>
              <input type="number" value={margin} onChange={e => setMargin(e.target.value)} className="w-full bg-slate-950 p-4 rounded-xl border border-slate-800 text-sm font-bold text-white outline-none focus:border-indigo-500 transition-all" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase block mb-1 tracking-widest">Entry</label>
              <input type="number" value={entryPrice} onChange={e => setEntryPrice(e.target.value)} className="w-full bg-slate-950 p-4 rounded-xl border border-slate-800 text-sm font-bold text-white outline-none focus:border-indigo-500 transition-all" />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase block mb-1 tracking-widest">Take Profit</label>
              <input type="number" value={tp} onChange={e => setTp(e.target.value)} className="w-full bg-slate-950 p-4 rounded-xl border border-emerald-500/30 text-emerald-400 text-sm font-bold outline-none focus:border-emerald-500 transition-all" />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase block mb-1 tracking-widest">Stop Loss</label>
              <input type="number" value={sl} onChange={e => setSl(e.target.value)} className="w-full bg-slate-950 p-4 rounded-xl border border-rose-500/30 text-rose-400 text-sm font-bold outline-none focus:border-rose-500 transition-all" />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 mt-8">
            <div className="p-8 bg-indigo-600/10 border border-indigo-500/20 rounded-[2rem] text-center shadow-xl">
              <h4 className="text-[10px] font-black text-indigo-400 uppercase mb-2 tracking-widest">Estimated Liquidation</h4>
              <p className="text-5xl font-black text-white tracking-tighter">${stats?.liqPrice || '---'}</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase mt-2 tracking-widest">Safety Buffer: {(((parseFloat(stats?.liqPrice || '0') / parseFloat(entryPrice)) * 100 - 100).toFixed(1))}%</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-[2rem] text-center shadow-lg">
                <h4 className="text-[10px] font-black text-emerald-500 uppercase mb-2 tracking-widest">Profit at TP</h4>
                <p className="text-2xl font-black text-emerald-400">${stats?.target?.profit?.toFixed(2) || '---'}</p>
                <p className="text-[11px] font-bold text-emerald-600/80 uppercase tracking-widest">{stats?.target?.roe?.toFixed(1) || '--'}% ROE</p>
              </div>
              <div className="p-6 bg-rose-500/5 border border-rose-500/20 rounded-[2rem] text-center shadow-lg">
                <h4 className="text-[10px] font-black text-rose-500 uppercase mb-2 tracking-widest">Loss at SL</h4>
                <p className="text-2xl font-black text-rose-400">-${Math.abs(stats?.stop?.profit || 0).toFixed(2)}</p>
                <p className="text-[11px] font-bold text-rose-600/80 uppercase tracking-widest">{stats?.stop?.roe?.toFixed(1) || '--'}% ROE</p>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] pt-6 border-t border-slate-800">
            <span>Total Position Size</span>
            <span className="text-white">${stats?.posSize} USDT</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradeCalculator;