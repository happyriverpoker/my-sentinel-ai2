
import React from 'react';

interface TermsModalProps {
  onAccept: () => void;
}

const TermsModal: React.FC<TermsModalProps> = ({ onAccept }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
      <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl"></div>
      
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in fade-in duration-500">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 mb-8 bg-indigo-600/20 rounded-2xl flex items-center justify-center border border-indigo-500/30">
            <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>

          <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-4 italic">User Agreement</h2>
          
          <div className="bg-slate-950/50 border border-slate-800 rounded-3xl p-6 text-left space-y-4 mb-8 overflow-y-auto max-h-[300px] scrollbar-hide">
            <p className="text-xs text-slate-400 leading-relaxed">
              Before initializing the Vora Research Assistant, please acknowledge the following terms of use:
            </p>
            <ul className="space-y-3">
              <li className="flex gap-3 text-xs text-slate-300">
                <span className="text-indigo-500 font-bold">•</span>
                <span><strong>No Financial Advice:</strong> Vora AI is an information tool. We do not provide financial, investment, legal, or tax advice.</span>
              </li>
              <li className="flex gap-3 text-xs text-slate-300">
                <span className="text-indigo-500 font-bold">•</span>
                <span><strong>Research Purpose:</strong> All data, analysis, and hypothetical trade setups are for research purposes. Verify all information independently.</span>
              </li>
              <li className="flex gap-3 text-xs text-slate-300">
                <span className="text-indigo-500 font-bold">•</span>
                <span><strong>Risk of Loss:</strong> Trading involves significant risk. You may lose your entire investment. Past performance is not indicative of future results.</span>
              </li>
              <li className="flex gap-3 text-xs text-slate-300">
                <span className="text-indigo-500 font-bold">•</span>
                <span><strong>User Responsibility:</strong> You are solely responsible for any decisions made based on information presented within the app.</span>
              </li>
            </ul>
          </div>

          <button 
            onClick={onAccept}
            className="w-full py-5 bg-white text-slate-950 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
          >
            I Understand and Accept
          </button>
        </div>
      </div>
    </div>
  );
};

export default TermsModal;
