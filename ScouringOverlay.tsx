
import React, { useState, useEffect } from 'react';

interface ScouringOverlayProps {
  isVisible: boolean;
}

const SCOURING_MESSAGES = [
  "Initializing multi-agent session...",
  "Sentinel-Safe parsing risk-off narratives...",
  "Risk-Taker scouring global alpha vectors...",
  "Technical Agent performing deep candle analysis...",
  "Fundamental Agent scouring macroeconomic news...",
  "Grounding intelligence with Google Search...",
  "Synthesizing consensus across sentinel nodes...",
  "Finalizing market narrative report...",
  "Ranking alpha signals by weighted confidence...",
  "Applying persona-based intelligence filters..."
];

const ScouringOverlay: React.FC<ScouringOverlayProps> = ({ isVisible }) => {
  const [messageIndex, setMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let interval: any;
    if (isVisible) {
      setProgress(0);
      setMessageIndex(0);
      
      // Cycle through messages
      interval = setInterval(() => {
        setMessageIndex(prev => (prev + 1) % SCOURING_MESSAGES.length);
      }, 2500);

      // Faux progress bar simulation
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) return prev;
          return prev + Math.random() * 5;
        });
      }, 400);

      return () => {
        clearInterval(interval);
        clearInterval(progressInterval);
      };
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-6 pointer-events-none animate-in fade-in duration-500">
      <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-md pointer-events-auto"></div>
      
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-[3rem] p-10 shadow-2xl shadow-indigo-500/10 pointer-events-auto">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 mb-8 relative">
            <div className="absolute inset-0 bg-indigo-500/20 rounded-2xl animate-ping"></div>
            <div className="relative w-full h-full bg-indigo-600 rounded-2xl flex items-center justify-center border border-white/10 shadow-lg">
              <svg className="w-8 h-8 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <h2 className="text-xl font-black text-white uppercase tracking-[0.2em] mb-2">Deep Intelligence Scour</h2>
          <div className="h-6 overflow-hidden mb-8">
            <p key={messageIndex} className="text-slate-400 font-medium text-sm animate-in slide-in-from-bottom-2 fade-in duration-500">
              {SCOURING_MESSAGES[messageIndex]}
            </p>
          </div>

          {/* Progress Section */}
          <div className="w-full space-y-3">
            <div className="flex justify-between items-center px-1">
              <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Acquisition Progress</span>
              <span className="text-[10px] font-black text-slate-500">{Math.round(progress)}%</span>
            </div>
            <div className="w-full h-3 bg-slate-950 rounded-full border border-slate-800 p-0.5 overflow-hidden">
              <div 
                className="h-full bg-indigo-600 rounded-full transition-all duration-500 ease-out shadow-[0_0_12px_rgba(79,70,229,0.4)]"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="pt-2 flex justify-center gap-1.5">
              {[...Array(4)].map((_, i) => (
                <div 
                  key={i} 
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${i === Math.floor(progress / 25) ? 'bg-indigo-500 scale-125' : 'bg-slate-800'}`}
                ></div>
              ))}
            </div>
          </div>
        </div>

        {/* Decorative corner accents */}
        <div className="absolute top-8 left-8 w-4 h-4 border-t-2 border-l-2 border-slate-800 rounded-tl-lg"></div>
        <div className="absolute top-8 right-8 w-4 h-4 border-t-2 border-r-2 border-slate-800 rounded-tr-lg"></div>
        <div className="absolute bottom-8 left-8 w-4 h-4 border-b-2 border-l-2 border-slate-800 rounded-bl-lg"></div>
        <div className="absolute bottom-8 right-8 w-4 h-4 border-b-2 border-r-2 border-slate-800 rounded-br-lg"></div>
      </div>
    </div>
  );
};

export default ScouringOverlay;
