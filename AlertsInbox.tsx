
import React from 'react';
import { AlertMessage } from '../types';

interface AlertsInboxProps {
  alerts: AlertMessage[];
  onRead: (id: string) => void;
  onMarkAllRead: () => void;
}

const AlertsInbox: React.FC<AlertsInboxProps> = ({ alerts, onRead, onMarkAllRead }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-2xl font-bold">Intelligence Inbox</h2>
          <p className="text-sm text-slate-500">Historical trail of discovered opportunities and market catalysts.</p>
        </div>
        {alerts.some(a => !a.isRead) && (
          <button 
            onClick={onMarkAllRead}
            className="text-xs font-bold text-indigo-400 hover:text-white uppercase tracking-wider"
          >
            Mark all as read
          </button>
        )}
      </div>

      <div className="space-y-3">
        {alerts.length === 0 ? (
          <div className="py-20 text-center bg-slate-900/50 rounded-3xl border border-slate-800 border-dashed">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <p className="text-slate-400">Your Inbox is quiet. The engine is scanning for new alpha.</p>
          </div>
        ) : (
          alerts.map((alert) => (
            <div 
              key={alert.id}
              onClick={() => onRead(alert.id)}
              className={`p-5 rounded-2xl border transition-all relative overflow-hidden cursor-pointer group ${
                alert.isRead 
                ? 'bg-slate-900/40 border-slate-800 opacity-80' 
                : 'bg-indigo-600/5 border-indigo-500/30 ring-1 ring-indigo-500/10'
              }`}
            >
              {!alert.isRead && (
                <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
              )}
              
              <div className="flex justify-between items-start gap-4">
                <div className="flex gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                    alert.type === 'signal' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-indigo-500/10 text-indigo-400'
                  }`}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {alert.type === 'signal' ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      )}
                    </svg>
                  </div>
                  <div>
                    <h4 className={`font-bold transition-colors ${alert.isRead ? 'text-slate-300' : 'text-white'}`}>
                      {alert.title}
                    </h4>
                    <p className="text-sm text-slate-500 line-clamp-1 mt-1">{alert.description}</p>
                    <div className="flex items-center gap-3 mt-3">
                      <span className="text-[10px] font-black uppercase text-slate-600">
                        {new Date(alert.timestamp).toLocaleTimeString()}
                      </span>
                      <span className="text-[10px] font-black uppercase text-slate-600">
                        •
                      </span>
                      <span className="text-[10px] font-black uppercase text-slate-600 tracking-widest">
                        {alert.type}
                      </span>
                    </div>
                  </div>
                </div>
                {!alert.isRead && (
                  <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AlertsInbox;
