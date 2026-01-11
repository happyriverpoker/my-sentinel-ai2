
import React from 'react';
import { AlertMessage } from './types';

interface AlertsInboxProps {
  alerts: AlertMessage[];
  onRead: (id: string) => void;
  onMarkAllRead: () => void;
}

const AlertsInbox: React.FC<AlertsInboxProps> = ({ alerts, onRead, onMarkAllRead }) => {
  return (
    <div className="max-w-xl mx-auto space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Intelligence Inbox</h2>
        {alerts.some(a => !a.isRead) && (
          <button onClick={onMarkAllRead} className="text-xs font-bold text-indigo-400 uppercase">Clear All</button>
        )}
      </div>
      {alerts.length === 0 ? (
        <div className="py-20 text-center bg-slate-900 border border-slate-800 rounded-3xl border-dashed">
          <p className="text-slate-500">Inbox is empty. Detecting new signals...</p>
        </div>
      ) : (
        alerts.map(alert => (
          <div key={alert.id} onClick={() => onRead(alert.id)} className={`p-4 rounded-xl border transition-all cursor-pointer ${alert.isRead ? 'bg-slate-900/40 border-slate-800 opacity-60' : 'bg-indigo-600/5 border-indigo-500/30 ring-1 ring-indigo-500/10'}`}>
            <h4 className="font-bold">{alert.title}</h4>
            <p className="text-xs text-slate-500 mt-1">{alert.description}</p>
            <div className="flex gap-2 mt-2">
               <span className="text-[10px] font-bold uppercase text-slate-600">{alert.type}</span>
               <span className="text-[10px] text-slate-600">{new Date(alert.timestamp).toLocaleTimeString()}</span>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default AlertsInbox;
