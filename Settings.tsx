
import React, { useState } from 'react';
import { AlertSettings, UserProfile, PersonaWeights, AIModel } from '../types';

interface SettingsProps {
  settings: AlertSettings;
  profile: UserProfile;
  onSaveSettings: (s: AlertSettings) => void;
  onSaveProfile: (p: UserProfile) => void;
  onShowPricing: () => void;
}

const Settings: React.FC<SettingsProps> = ({ settings, profile, onSaveSettings, onSaveProfile, onShowPricing }) => {
  const [profileData, setProfileData] = useState<UserProfile>(profile);
  const [alertData, setAlertData] = useState<AlertSettings>(settings);

  const isElite = profile.subscriptionTier === 'elite';

  const setModel = (m: AIModel) => {
    setProfileData({ ...profileData, selectedModel: m });
  };

  const toggleAlertSetting = (key: keyof AlertSettings) => {
    if (key === 'autonomousScouring' && !isElite) {
      onShowPricing();
      return;
    }
    setAlertData({ ...alertData, [key]: !alertData[key] });
  };

  const handleSave = () => {
    onSaveSettings(alertData);
    onSaveProfile(profileData);
  };

  return (
    <div className="max-w-xl mx-auto space-y-8 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h2 className="text-3xl font-bold mb-2">Sentinel Tuning</h2>
        <p className="text-slate-400 text-sm">Fine-tune the intelligence engine and automation rules.</p>
      </header>

      {/* Model Selection */}
      <div className="p-6 bg-slate-900 rounded-[2rem] border border-slate-800 space-y-4">
        <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest">Intelligence Engine</h3>
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-2xl border border-slate-800">
          <button 
            onClick={() => setModel('gemini-3-pro-preview')}
            className={`py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${profileData.selectedModel === 'gemini-3-pro-preview' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500'}`}
          >
            Deep Reasoning (Pro)
          </button>
          <button 
            onClick={() => setModel('gemini-3-flash-preview')}
            className={`py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${profileData.selectedModel === 'gemini-3-flash-preview' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500'}`}
          >
            High Speed (Flash)
          </button>
        </div>
        <p className="text-[10px] text-slate-500 font-medium px-2">
          Flash model is recommended if you frequently encounter "Quota Exhausted" errors on the Pro engine.
        </p>
      </div>

      <div className="p-8 bg-indigo-600/10 border border-indigo-500/20 rounded-[2rem] shadow-xl flex items-center justify-between">
         <div>
            <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Current Tier</div>
            <h3 className="text-2xl font-black text-white uppercase">{profile.subscriptionTier}</h3>
         </div>
         <button onClick={onShowPricing} className="px-6 py-2 bg-white text-slate-950 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl transition-transform active:scale-95">
           Upgrade
         </button>
      </div>

      <div className="p-6 bg-slate-900 rounded-[2rem] border border-slate-800 space-y-4">
        <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest">Autonomous Engine</h3>
        <div className="flex items-center justify-between p-4 bg-slate-950 rounded-2xl border border-slate-800">
          <div>
            <div className="text-xs font-bold text-slate-200 uppercase flex items-center gap-2">
              Autonomous Scouring
              {!isElite && <span className="bg-amber-500/20 text-amber-500 text-[8px] px-1.5 py-0.5 rounded">ELITE</span>}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">Background intelligence harvesting.</div>
          </div>
          <button onClick={() => toggleAlertSetting('autonomousScouring')} className={`w-12 h-6 rounded-full transition-colors relative ${alertData.autonomousScouring ? 'bg-indigo-600' : 'bg-slate-800'}`}>
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${alertData.autonomousScouring ? 'left-7' : 'left-1'}`} />
          </button>
        </div>
      </div>

      <button onClick={handleSave} className="bg-indigo-600 w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-indigo-600/30 active:scale-95 transition-transform">
        Save Tuning Profile
      </button>
    </div>
  );
};

export default Settings;
