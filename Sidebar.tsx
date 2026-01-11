
import React from 'react';
import { View } from './types';
import Logo from './components/Logo';

interface SidebarProps {
  activeView: View;
  setView: (v: View) => void;
  isMonitoring: boolean;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, setView, isMonitoring, isOpen, onClose }) => {
  const navItems = [
    { id: 'dashboard' as View, label: 'Control Center', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
    { id: 'intelligence' as View, label: 'Research Pulse', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
    { id: 'calculator' as View, label: 'Trade Calculator', icon: 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z' },
    { id: 'sentinel-hq' as View, label: 'Sentinel HQ', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
    { id: 'landing' as View, label: 'Calibration', icon: 'M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4' },
  ];

  return (
    <>
      <div 
        className={`fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 transition-opacity lg:hidden ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      <aside className={`fixed left-0 top-0 h-full w-64 bg-slate-900 border-r border-slate-800 flex flex-col z-50 transition-transform duration-300 transform lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-8 text-left">
            <div className="flex items-center gap-3">
              <Logo size={36} />
              <div className="flex flex-col">
                 <span className="text-xl font-black tracking-tighter text-white uppercase leading-tight">VORA AI</span>
                 <span className="text-[8px] font-black text-indigo-500 uppercase tracking-widest opacity-70">Council Assistant</span>
              </div>
            </div>
            <button onClick={onClose} className="lg:hidden text-slate-500 hover:text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => { setView(item.id); onClose(); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                  activeView === item.id 
                  ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <svg className={`w-5 h-5 ${activeView === item.id ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                </svg>
                <span className="font-medium text-sm tracking-tight">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
        <div className="mt-auto p-6">
          <div className={`p-4 rounded-xl border transition-all duration-500 ${isMonitoring ? 'bg-indigo-600/10 border-indigo-500/40' : 'bg-slate-800/50 border-slate-700'}`}>
            <p className="text-[9px] text-slate-500 uppercase font-black mb-2 tracking-[0.2em]">{isMonitoring ? 'Council Monitoring' : 'System Ready'}</p>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isMonitoring ? 'bg-indigo-400 shadow-[0_0_8px_#818cf8]' : 'bg-emerald-500 shadow-[0_0_8px_#10b981]'} animate-pulse`}></div>
              <span className={`text-[11px] font-bold ${isMonitoring ? 'text-indigo-300' : 'text-slate-300'}`}>
                {isMonitoring ? 'Live Intelligence' : 'Ready for Scour'}
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
