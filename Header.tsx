
import React from 'react';
import { View } from './types';

interface HeaderProps {
  activeView: View; 
  setView: (v: View) => void; 
  unreadCount: number; 
  onMenuToggle: () => void; 
  onRefresh: () => void; 
  loading: boolean;
  isCustomizing: boolean;
  onCustomizingToggle: () => void;
  mandate?: string;
  theme: 'dark' | 'light';
  onThemeToggle: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  activeView, setView, unreadCount, onMenuToggle, onRefresh, loading, mandate, theme, onThemeToggle
}) => {
  const getTitle = () => {
    switch(activeView) {
      case 'dashboard': return 'TERMINAL';
      case 'intelligence': return 'PULSE HUB';
      case 'calculator': return 'TRADE CALCULATOR';
      case 'profile': return 'COUNCIL CALIBRATION';
      case 'settings': return 'TUNING';
      case 'alerts': return 'INBOX';
      case 'deep-dive': return 'STRATEGY ANALYSIS';
      case 'landing': return 'COUNCIL CALIBRATION';
      default: return 'VORA AI';
    }
  };

  return (
    <header className="h-20 border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-xl flex items-center justify-between px-6 sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <button onClick={onMenuToggle} className="lg:hidden p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-400">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
        <div className="flex flex-col text-left max-w-[150px] md:max-w-xs">
          <span className="text-[10px] font-black text-indigo-400 tracking-[0.2em] uppercase opacity-90 truncate">
            {mandate || 'Autonomous Researcher'}
          </span>
          <h2 className="text-xl font-black tracking-tighter text-white uppercase">{getTitle()}</h2>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {activeView === 'dashboard' && (
          <button 
            onClick={onRefresh} 
            disabled={loading} 
            className={`p-3 rounded-xl border transition-all duration-300 ${loading ? 'bg-slate-900 border-slate-800 text-slate-600' : 'bg-slate-900 border-slate-800 text-indigo-400 hover:border-indigo-500/50 hover:bg-indigo-500/5 shadow-lg'}`}
          >
            <svg className={`w-6 h-6 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        )}

        {/* Theme Switcher Button */}
        <button 
          onClick={onThemeToggle}
          className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white hover:border-slate-600 transition-all shadow-lg flex items-center justify-center"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Theme`}
        >
          {theme === 'dark' ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>

        <button 
          onClick={() => setView('alerts')} 
          className="relative p-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white hover:border-slate-600 transition-all shadow-lg"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-50 text-[10px] font-black items-center justify-center text-white">{unreadCount}</span>
            </span>
          )}
        </button>
      </div>
    </header>
  );
};

export default Header;
