
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { UserProfile, View, InsightReport, AlertSettings, CalculatorParams, TradeSuggestion, DashboardLayout, AIModel, UsageStats } from './types';
import { SentinelAIService } from './geminiService';
import Sidebar from './Sidebar';
import Dashboard from './Dashboard';
import TuningLanding from './TuningLanding';
import IntelligenceFeed from './IntelligenceFeed';
import Settings from './Settings';
import TradeCalculator from './TradeCalculator';
import AlertsInbox from './AlertsInbox';
import Header from './Header';
import DeepDive from './DeepDive';
import SentinelHQ from './SentinelHQ';
import ScouringOverlay from './ScouringOverlay';
import Logo from './Logo';
import TermsModal from './TermsModal';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('landing');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('vora_theme') as 'dark' | 'light') || 'dark';
  });
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(() => {
    return localStorage.getItem('vora_terms_accepted') === 'true';
  });
  const [error, setError] = useState<{ type: 'quota' | 'key' | 'generic', msg: string } | null>(null);
  const [cooldown, setCooldown] = useState(0);
  
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [layout, setLayout] = useState<DashboardLayout>({
    main: [
      { id: 'ticker', label: 'Ticker', visible: true },
      { id: 'signals', label: 'Synthesized Insights', visible: true },
      { id: 'narrative', label: 'Market Narrative', visible: true },
    ],
    sidebar: [
      { id: 'fearGreed', label: 'Fear & Greed', visible: true },
      { id: 'news', label: 'Live Pulse', visible: true },
    ]
  });

  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('vora_profile');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (!parsed.mandate) parsed.mandate = parsed.profession || 'Identify high-conviction market signals.';
      return parsed;
    }
    return { 
      name: '', 
      mandate: 'Identify high-conviction market signals.', 
      focusAreas: ['Crypto', 'AI'], 
      riskTolerance: 'medium', 
      goals: 'Research', 
      monitoredSources: [], 
      tuningMode: 'default',
      tradingPreference: 'both',
      personaWeights: { safe: 1, riskTaker: 1, ta: 1, fa: 1 },
      selectedModel: 'gemini-3-flash-preview',
      subscriptionTier: 'free'
    };
  });

  const [settings, setSettings] = useState<AlertSettings>(() => {
    const saved = localStorage.getItem('vora_settings');
    return saved ? JSON.parse(saved) : {
      priceAlerts: true, catalystAlerts: true, alphaSignals: true, newsPulse: false,
      pushEnabled: true, emailEnabled: false, urgencyThreshold: 'all',
      reportFrequency: 'daily', autonomousScouring: false, scouringInterval: 15,
      minAlphaScore: 65
    };
  });

  const [usage, setUsage] = useState<UsageStats>({
    refreshesUsed: 0,
    dailyLimit: 20
  });

  const [calcParams, setCalcParams] = useState<CalculatorParams | null>(null);
  const [selectedTrade, setSelectedTrade] = useState<TradeSuggestion | null>(null);
  const [intelligence, setIntelligence] = useState<InsightReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  const sentinelRef = useRef(new SentinelAIService());

  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
    localStorage.setItem('vora_theme', theme);
  }, [theme]);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  const scan = useCallback(async (isAutomated: boolean = false, overrideProfile?: UserProfile, overrideSettings?: AlertSettings) => {
    if (loading || cooldown > 0) return;
    const currentProfile = overrideProfile || profile;

    setLoading(true);
    setError(null);
    try { 
      const cached = sentinelRef.current.findCachedReport(currentProfile);
      if (cached) {
        setIntelligence(cached);
        setLastUpdated(new Date());
        setActiveView('dashboard');
        setLoading(false);
        return;
      }

      const report = await sentinelRef.current.scanForOpportunities(currentProfile);
      setIntelligence(report);
      setLastUpdated(new Date());
      setUsage(prev => ({ ...prev, refreshesUsed: prev.refreshesUsed + 1 }));
      setActiveView('dashboard');
    } catch (e: any) {
      if (e.message === "GOOGLE_QUOTA_EXHAUSTED") {
        setError({ type: 'quota', msg: "Quota hit. Switch to Flash or try again in a moment." });
        setCooldown(15);
      } else {
        setError({ type: 'generic', msg: "Scan incomplete." });
      }
    } finally { 
      setLoading(false); 
    }
  }, [profile, settings, loading, cooldown]);

  const handleLogin = async () => {
    // @ts-ignore
    const hasKey = await window.aistudio?.hasSelectedApiKey();
    if (!hasKey) {
      // @ts-ignore
      await window.aistudio?.openSelectKey();
    }
    setIsLoggedIn(true);
  };

  const handleAcceptTerms = () => {
    localStorage.setItem('vora_terms_accepted', 'true');
    setHasAcceptedTerms(true);
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="mb-8">
             <Logo size={100} />
          </div>
          <h1 className="text-5xl font-black tracking-tighter mb-4 text-white uppercase italic">VORA AI</h1>
          <p className="text-slate-400 max-w-lg mb-12 font-medium leading-relaxed text-sm md:text-base">
            Vora is your autonomous market research assistant. We synthesize global data to surface relevant insights.
          </p>
          <button 
            onClick={handleLogin}
            className="bg-white text-slate-950 px-12 py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-indigo-500/10 mb-8"
          >
            Initialize Assistant
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 overflow-x-hidden transition-colors">
      {!hasAcceptedTerms && <TermsModal onAccept={handleAcceptTerms} />}
      
      {activeView !== 'landing' && (
        <Sidebar 
          activeView={activeView} setView={setActiveView} 
          isOpen={menuOpen} onClose={() => setMenuOpen(false)} 
          isMonitoring={settings.autonomousScouring} 
        />
      )}
      
      <main className={`flex-1 flex flex-col relative transition-all ${activeView !== 'landing' ? 'lg:ml-64' : ''}`}>
        {activeView !== 'landing' && (
          <Header 
            activeView={activeView} 
            setView={setActiveView} 
            unreadCount={0} 
            onMenuToggle={() => setMenuOpen(true)} 
            onRefresh={() => setActiveView('landing')} 
            loading={loading}
            isCustomizing={isCustomizing}
            onCustomizingToggle={() => setIsCustomizing(!isCustomizing)}
            mandate={profile.mandate}
            theme={theme}
            onThemeToggle={toggleTheme}
          />
        )}
        
        <ScouringOverlay isVisible={loading} />

        <div className={`p-4 md:p-8 flex-1 flex flex-col ${activeView === 'landing' ? 'items-center justify-center' : ''}`}>
          <div className="flex-1">
            {activeView === 'landing' && (
              <TuningLanding 
                profile={profile} 
                settings={settings}
                canGoBack={!!intelligence}
                onBack={() => setActiveView('dashboard')}
                onNavigateToHQ={() => setActiveView('sentinel-hq')}
                onRunScan={(p, s) => {
                  setProfile(p);
                  setSettings(s);
                  localStorage.setItem('vora_profile', JSON.stringify(p));
                  localStorage.setItem('vora_settings', JSON.stringify(s));
                  scan(false, p, s);
                }}
              />
            )}
            {activeView === 'dashboard' && (
              <Dashboard 
                profile={profile} report={intelligence} loading={loading}
                onRefresh={() => setActiveView('landing')} feedback={[]} onTradeFeedback={()=>{}} lastUpdated={lastUpdated} 
                onOpenCalculator={p => {setCalcParams(p); setActiveView('calculator');}}
                onOpenDeepDive={t => {setSelectedTrade(t); setActiveView('deep-dive');}}
                layout={layout} onUpdateLayout={setLayout} isCustomizing={isCustomizing}
                usage={usage} onUpgrade={() => setActiveView('settings')}
                settings={settings} setView={setActiveView}
              />
            )}
            {activeView === 'intelligence' && <IntelligenceFeed report={intelligence} loading={loading} onRefresh={() => scan(false)} />}
            {activeView === 'calculator' && <TradeCalculator currentMarketPrice="60000" initialParams={calcParams || undefined} onClearParams={() => setCalcParams(null)} />}
            {activeView === 'deep-dive' && selectedTrade && <DeepDive trade={selectedTrade} weights={profile.personaWeights!} onBack={() => setActiveView('dashboard')} />}
            {activeView === 'sentinel-hq' && <SentinelHQ onBack={() => setActiveView('dashboard')} />}
            {activeView === 'alerts' && <AlertsInbox alerts={[]} onRead={()=>{}} onMarkAllRead={()=>{}} />}
          </div>
        </div>
      </main>
    </div>
  );
};
export default App;
