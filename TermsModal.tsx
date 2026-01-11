
import React from 'react';

interface TermsModalProps {
  onAccept: () => void;
}

const TermsModal: React.FC<TermsModalProps> = ({ onAccept }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
      <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl"></div>
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 shadow-2xl">
        <h2 className="text-2xl font-black text-white uppercase mb-4 italic">User Agreement</h2>
        <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 text-left space-y-4 mb-8">
          <p className="text-xs text-slate-400">Vora AI is a research tool only. We do not provide financial advice.</p>
        </div>
        <button onClick={onAccept} className="w-full py-5 bg-white text-slate-950 rounded-2xl font-black text-xs uppercase tracking-widest">
          I Accept
        </button>
      </div>
    </div>
  );
};

export default TermsModal;
