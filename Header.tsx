
import React from 'react';
import { View } from '../types';

interface HeaderProps {
  activeView: View;
  setView: (v: View) => void;
  unreadCount: number;
  onMenuToggle: () => void;
  isCustomizing: boolean;
  onCustomizingToggle: () => void;
  onRefresh: () => void;
  loading: boolean;
}

const Header: React.FC<HeaderProps> = ({ 
  activeView, 
  setView, 
  unreadCount, 
  onMenuToggle, 
  isCustomizing, 
  onCustomizingToggle, 
  onRefresh, 
  loading 
}) => {
  const getTitle = () => {
    switch(activeView) {
      case 'dashboard': return 'Control Center';
      case 'intelligence': return 'Intelligence Feed';
      case 'calculator': return 'Alpha Calculator';
      case 'profile': return 'My Persona';
      case 'settings': return 'Alert Settings';
      case 'alerts': return 'Intelligence Inbox';
      default: return 'Sentinel AI';
    }
  };

  return (
    <header className="h-20 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-40 px-3 md:px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button 
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h2 className="text-base md:text-xl font-bold text-slate-100 truncate max-w-[120px] md:max-w-none">
          {getTitle()}
        </h2>
      </div>

      <div className="flex items-center gap-1.5 md:gap-4">
        {/* Global Market Refresh */}
        {activeView === 'dashboard' && (
          <button 
            onClick={onRefresh}
            disabled={loading}
            className={`p-2.5 rounded-xl border transition-all ${
              loading 
              ? 'bg-slate-800 border-slate-700 opacity-50' 
              : 'bg-indigo-600/10 border-indigo-500/30 text-indigo-400 hover:bg-indigo-600 hover:text-white'
            }`}
            title="Global Market Refresh"
          >
            <svg className={`w-6 h-6 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        )}

        {/* Dashboard Customization */}
        {activeView === 'dashboard' && (
          <button 
            onClick={onCustomizingToggle}
            className={`p-2.5 rounded-xl border transition-all ${
              isCustomizing 
              ? 'bg-amber-600 border-amber-500 text-white shadow-lg shadow-amber-600/20' 
              : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500 hover:text-white'
            }`}
            title="Customize Dashboard"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          </button>
        )}

        {/* Inbox Bell */}
        <button 
          onClick={() => setView('alerts')}
          className={`relative p-2.5 rounded-xl border transition-all ${
            activeView === 'alerts' 
            ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20' 
            : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500 hover:text-white'
          }`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-slate-900">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        <div className="hidden sm:flex items-center gap-3 pl-4 border-l border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shadow-md">
            AR
          </div>
          <span className="hidden md:block text-xs font-semibold text-slate-400">Alex Rivera</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
