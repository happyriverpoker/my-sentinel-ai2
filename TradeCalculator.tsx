
import React, { useState, useEffect, useMemo } from 'react';
import { CalculatorParams } from '../types';

interface Level {
  price: string;
  percent: string; // percentage of total size to close
}

interface TradeCalculatorProps {
  currentMarketPrice: string;
  // Added missing props required by App.tsx to fix TS errors
  initialParams?: CalculatorParams | null;
  onClearParams?: () => void;
}

const TradeCalculator: React.FC<TradeCalculatorProps> = ({ currentMarketPrice, initialParams, onClearParams }) => {
  const [tradeType, setTradeType] = useState<'long' | 'short'>('long');
  const [marginMode, setMarginMode] = useState<'isolated' | 'cross'>('isolated');
  const [leverage, setLeverage] = useState<number>(10);
  const [entryPrice, setEntryPrice] = useState<string>(currentMarketPrice);
  const [margin, setMargin] = useState<string>('1000');
  const [size, setSize] = useState<string>('');
  
  const [takeProfits, setTakeProfits] = useState<Level[]>([{ price: '', percent: '100' }]);
  const [stopLosses, setStopLosses] = useState<Level[]>([{ price: '', percent: '100' }]);

  // Handle incoming parameters from external triggers (e.g., clicking 'Calc' on a signal)
  useEffect(() => {
    if (initialParams) {
      if (initialParams.entry) setEntryPrice(initialParams.entry);
      if (initialParams.type && (initialParams.type === 'long' || initialParams.type === 'short')) {
        setTradeType(initialParams.type);
      } else if (initialParams.type === 'spot') {
        setTradeType('long'); // Map spot to long for leverage calcs
      }
      if (initialParams.tp) setTakeProfits([{ price: initialParams.tp, percent: '100' }]);
      if (initialParams.sl) setStopLosses([{ price: initialParams.sl, percent: '100' }]);
    }
  }, [initialParams]);

  // Synchronization between Margin and Size
  useEffect(() => {
    const m = parseFloat(margin);
    if (!isNaN(m)) {
      setSize((m * leverage).toFixed(2));
    }
  }, [margin, leverage]);

  const handleSizeChange = (val: string) => {
    setSize(val);
    const s = parseFloat(val);
    if (!isNaN(s)) {
      setMargin((s / leverage).toFixed(2));
    }
  };

  const addTP = () => setTakeProfits([...takeProfits, { price: '', percent: '0' }]);
  const addSL = () => setStopLosses([...stopLosses, { price: '', percent: '0' }]);

  const removeLevel = (index: number, type: 'tp' | 'sl') => {
    if (type === 'tp') {
      setTakeProfits(takeProfits.filter((_, i) => i !== index));
    } else {
      setStopLosses(stopLosses.filter((_, i) => i !== index));
    }
  };

  const updateLevel = (index: number, field: keyof Level, val: string, type: 'tp' | 'sl') => {
    const list = type === 'tp' ? [...takeProfits] : [...stopLosses];
    list[index][field] = val;
    type === 'tp' ? setTakeProfits(list) : setStopLosses(list);
  };

  const stats = useMemo(() => {
    const entry = parseFloat(entryPrice);
    const posSize = parseFloat(size);
    const lev = leverage;
    const marg = parseFloat(margin);

    if (isNaN(entry) || isNaN(posSize) || entry === 0) return null;

    // Liquidation Price approx (Isolated)
    // MM is approx 0.5% (common for BTC/ETH on many exchanges)
    const maintenanceMargin = 0.005;
    let liqPrice = 0;
    if (tradeType === 'long') {
      liqPrice = entry * (1 - (1 / lev) + maintenanceMargin);
    } else {
      liqPrice = entry * (1 + (1 / lev) - maintenanceMargin);
    }

    // Weighted Avg TP and Risk Reward
    const validTPs = takeProfits.filter(t => !isNaN(parseFloat(t.price)));
    const weightedTPPrice = validTPs.reduce((acc, curr) => {
      return acc + (parseFloat(curr.price) * (parseFloat(curr.percent) / 100));
    }, 0) || entry;

    const validSLs = stopLosses.filter(s => !isNaN(parseFloat(s.price)));
    const weightedSLPrice = validSLs.reduce((acc, curr) => {
      return acc + (parseFloat(curr.price) * (parseFloat(curr.percent) / 100));
    }, 0) || entry;

    const reward = Math.abs(weightedTPPrice - entry);
    const risk = Math.abs(entry - weightedSLPrice);
    const rrRatio = risk > 0 ? (reward / risk).toFixed(2) : 'N/A';

    // PnL Estimates
    const totalProfit = validTPs.reduce((acc, curr) => {
      const p = parseFloat(curr.price);
      const perc = parseFloat(curr.percent) / 100;
      const profitPerUnit = tradeType === 'long' ? (p - entry) : (entry - p);
      return acc + (profitPerUnit * (posSize / entry) * perc);
    }, 0);

    const totalLoss = validSLs.reduce((acc, curr) => {
      const p = parseFloat(curr.price);
      const perc = parseFloat(curr.percent) / 100;
      const lossPerUnit = tradeType === 'long' ? (entry - p) : (p - entry);
      return acc + (lossPerUnit * (posSize / entry) * perc);
    }, 0);

    return {
      liqPrice: liqPrice.toFixed(2),
      rrRatio,
      totalProfit: totalProfit.toFixed(2),
      totalLoss: totalLoss.toFixed(2),
      roeAtTP: ((totalProfit / marg) * 100).toFixed(2),
      roeAtSL: ((totalLoss / marg) * 100).toFixed(2)
    };
  }, [entryPrice, size, leverage, tradeType, takeProfits, stopLosses, margin]);

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-8 flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold mb-2">Alpha Trade Calculator</h2>
          <p className="text-slate-400">Simulate leveraged positions and calculate risk management profiles.</p>
        </div>
        {/* Added button to clear deep-linked alpha signal parameters */}
        {initialParams && onClearParams && (
          <button 
            onClick={onClearParams}
            className="px-4 py-2 bg-slate-800 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-xl hover:text-white transition-all border border-slate-700"
          >
            Reset From Alpha
          </button>
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Panel */}
        <div className="space-y-6">
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
            <h3 className="text-sm font-bold text-slate-500 uppercase mb-4">Core Parameters</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <button 
                onClick={() => setTradeType('long')}
                className={`py-3 rounded-xl border font-bold transition-all ${tradeType === 'long' ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400' : 'bg-slate-950 border-slate-800 text-slate-500'}`}
              >
                LONG
              </button>
              <button 
                onClick={() => setTradeType('short')}
                className={`py-3 rounded-xl border font-bold transition-all ${tradeType === 'short' ? 'bg-rose-600/20 border-rose-500 text-rose-400' : 'bg-slate-950 border-slate-800 text-slate-500'}`}
              >
                SHORT
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Margin Mode</label>
                <div className="flex gap-2">
                  {['isolated', 'cross'].map(m => (
                    <button 
                      key={m}
                      onClick={() => setMarginMode(m as any)}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold border capitalize transition-all ${marginMode === m ? 'bg-indigo-600 border-indigo-500' : 'bg-slate-950 border-slate-800 text-slate-500'}`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Leverage ({leverage}x)</label>
                <input 
                  type="range" min="1" max="100" step="1" 
                  value={leverage} 
                  onChange={(e) => setLeverage(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Entry Price</label>
                  <input 
                    type="number" value={entryPrice} onChange={(e) => setEntryPrice(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Position Margin (USDT)</label>
                  <input 
                    type="number" value={margin} onChange={(e) => setMargin(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Contract Size (USDT Equivalent)</label>
                <input 
                  type="number" value={size} onChange={(e) => handleSizeChange(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>
          </div>

          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-slate-500 uppercase">Exit Strategy (TP/SL)</h3>
              <div className="flex gap-2">
                <button onClick={addTP} className="text-[10px] font-bold text-indigo-400 hover:text-white uppercase">+ TP</button>
                <button onClick={addSL} className="text-[10px] font-bold text-rose-400 hover:text-white uppercase">+ SL</button>
              </div>
            </div>

            <div className="space-y-4">
              {takeProfits.map((tp, i) => (
                <div key={`tp-${i}`} className="flex gap-2 items-center">
                  <span className="text-[10px] font-bold text-emerald-500 w-8">TP {i+1}</span>
                  <input 
                    placeholder="Price" type="number" value={tp.price} 
                    onChange={(e) => updateLevel(i, 'price', e.target.value, 'tp')}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs outline-none"
                  />
                  <input 
                    placeholder="Size %" type="number" value={tp.percent} 
                    onChange={(e) => updateLevel(i, 'percent', e.target.value, 'tp')}
                    className="w-16 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs outline-none"
                  />
                  <button onClick={() => removeLevel(i, 'tp')} className="text-slate-600 hover:text-rose-500 text-xs px-2">✕</button>
                </div>
              ))}
              {stopLosses.map((sl, i) => (
                <div key={`sl-${i}`} className="flex gap-2 items-center">
                  <span className="text-[10px] font-bold text-rose-500 w-8">SL {i+1}</span>
                  <input 
                    placeholder="Price" type="number" value={sl.price} 
                    onChange={(e) => updateLevel(i, 'price', e.target.value, 'sl')}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs outline-none"
                  />
                  <input 
                    placeholder="Size %" type="number" value={sl.percent} 
                    onChange={(e) => updateLevel(i, 'percent', e.target.value, 'sl')}
                    className="w-16 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs outline-none"
                  />
                  <button onClick={() => removeLevel(i, 'sl')} className="text-slate-600 hover:text-rose-500 text-xs px-2">✕</button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Calculation Panel */}
        <div className="space-y-6">
          <div className="p-8 rounded-3xl bg-indigo-600/5 border border-indigo-500/20 shadow-2xl relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all"></div>
            
            <div className="text-center mb-8">
              <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-1">Estimated Liquidation Price</h4>
              <p className="text-5xl font-black text-slate-100 tracking-tighter">
                ${stats?.liqPrice || '---'}
              </p>
              <div className="mt-2 text-[10px] font-bold text-slate-500 uppercase italic">
                Approx MM 0.5% | {marginMode}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="p-4 bg-slate-950/50 rounded-2xl border border-slate-800 text-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Risk/Reward Ratio</span>
                <span className="text-2xl font-bold text-indigo-400">{stats?.rrRatio || '--'}</span>
              </div>
              <div className="p-4 bg-slate-950/50 rounded-2xl border border-slate-800 text-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">ROE at Target</span>
                <span className="text-2xl font-bold text-emerald-400">+{stats?.roeAtTP || '--'}%</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Total Profit (USDT)</span>
                <span className="text-emerald-400 font-bold">+${stats?.totalProfit || '0.00'}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Total Loss (USDT)</span>
                <span className="text-rose-400 font-bold">-${stats?.totalLoss || '0.00'}</span>
              </div>
              <div className="flex justify-between items-center text-sm pt-3 border-t border-slate-800">
                <span className="text-slate-500">Max ROE (SL Hit)</span>
                <span className="text-rose-500 font-bold">{stats?.roeAtSL || '0.00'}%</span>
              </div>
            </div>
          </div>

          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl">
            <h3 className="text-xs font-bold text-slate-500 uppercase mb-4">Risk Management Insight</h3>
            <p className="text-sm text-slate-400 leading-relaxed italic">
              "Based on your <strong>{tradeType}</strong> position at <strong>{leverage}x</strong> leverage, your liquidation price is <strong>{((parseFloat(stats?.liqPrice || '0') / parseFloat(entryPrice)) * 100 - 100).toFixed(2)}%</strong> away from entry. 
              {parseFloat(stats?.rrRatio || '0') < 2 ? ' This trade has a low Risk/Reward ratio. Consider tightening your SL or extending TP targets.' : ' This trade meets the standard 2:1 R/R requirement for a healthy alpha signal.'}"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradeCalculator;
