
import React, { useState, useEffect } from 'react';

interface ScouringOverlayProps {
  isVisible: boolean;
}

const ScouringOverlay: React.FC<ScouringOverlayProps> = ({ isVisible }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isVisible) {
      const interval = setInterval(() => {
        setProgress(prev => (prev >= 100 ? 100 : prev + 2));
      }, 100);
      return () => clearInterval(interval);
    } else {
      setProgress(0);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 backdrop-blur-md">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-10 rounded-[3rem] text-center">
        <h2 className="text-white font-black uppercase tracking-widest mb-4">Deep Intelligence Scour</h2>
        <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
          <div className="h-full bg-indigo-600 transition-all" style={{ width: `${progress}%` }}></div>
        </div>
      </div>
    </div>
  );
};

export default ScouringOverlay;
