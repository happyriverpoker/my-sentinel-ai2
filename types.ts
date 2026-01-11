
export type AIModel = 'gemini-3-pro-preview' | 'gemini-3-flash-preview';
export type SubscriptionTier = 'free' | 'pro' | 'elite';

export interface PersonaWeights { 
  safe: number; 
  riskTaker: number; 
  ta: number; 
  fa: number; 
}

export interface UserProfile { 
  name: string; 
  mandate: string; 
  focusAreas: string[]; 
  riskTolerance: 'low' | 'medium' | 'high'; 
  goals: string; 
  monitoredSources: string[]; 
  personaWeights: PersonaWeights; 
  tuningMode: 'default' | 'manual';
  tradingPreference: 'spot' | 'futures' | 'both';
  selectedModel: AIModel;
  subscriptionTier: SubscriptionTier;
}

export interface UsageStats {
  refreshesUsed: number;
  dailyLimit: number;
}

export interface VolatilityEvent { 
  event: string; 
  date: string; 
  impact: 'high' | 'medium'; 
}

export interface MacroPulse {
  fearAndGreed: { value: number; label: string; };
  fomcProjection: string;
  dxyIndex: string;
  tenYearYield: string;
  nextVolatilityEvents: VolatilityEvent[];
}

export interface TrendingKeyword {
  word: string;
  momentum: number; // 0-100
  sentiment: 'bullish' | 'bearish' | 'neutral';
  context: string;
}

export interface SourceConsensus {
  source: string;
  stance: 'bullish' | 'bearish' | 'neutral';
  summary: string;
  credibilityScore: number; // 0-100
}

export interface SentinelRetrospection {
  agentName: string;
  analysisOfOutcome: string;
  lessonLearned: string;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
}

export interface TradeRetrospection {
  summary: string;
  sentinelInterviews: SentinelRetrospection[];
  finalVerdict: string;
}

export interface WidgetConfig { id: string; label: string; visible: boolean; }
export interface DashboardLayout { main: WidgetConfig[]; sidebar: WidgetConfig[]; }
export interface AlertSettings { 
  priceAlerts: boolean; 
  catalystAlerts: boolean; 
  alphaSignals: boolean; 
  newsPulse: boolean; 
  pushEnabled: boolean; 
  emailEnabled: boolean; 
  urgencyThreshold: 'all' | 'high-only';
  reportFrequency: 'off' | 'daily' | 'weekly' | 'monthly';
  autonomousScouring: boolean;
  scouringInterval: number;
  minAlphaScore: number; 
}
export interface AlertMessage { id: string; type: 'catalyst' | 'signal' | 'price'; title: string; description: string; timestamp: string; isRead: boolean; metadata?: any; }
export interface CryptoPrice { symbol: string; price: string; change24h: string; }
export interface KeyMetrics { projectedROI: string; fundingRate: string; estimatedVolume: string; }
export interface AgentInsight { agentName: string; verdict: 'approved' | 'caution'; note: string; individualScore?: number; }
export interface CrossAnalysis { consensusScore: number; agentInsights: AgentInsight[]; }
export interface UserTradeFeedback { signalId: string; asset: string; verdict: 'like' | 'dislike'; timestamp: string; }

export interface TradeSuggestion { 
  id?: string; 
  asset: string; 
  type: 'long' | 'short' | 'spot'; 
  reasoning: string; 
  confidence: number; 
  currentPrice: string;
  entry: string; 
  takeProfit: string; 
  stopLoss: string; 
  catalyst: string; 
  keyMetrics: KeyMetrics; 
  isTimeSensitive?: boolean; 
  additionalInfo?: string; 
  deepDiveUrl?: string; 
  crossAnalysis?: CrossAnalysis; 
  expiryHours: number;
  generatedAt?: string;
  isSharedAlpha?: boolean;
  retrospection?: TradeRetrospection;
}

export interface NewsHeadline { title: string; source: string; url: string; timestamp: string; }
export interface MarketOverview { 
  cryptoPrices: CryptoPrice[]; 
  macroPulse: MacroPulse;
  usMarketSentiment: string; 
  tradeSuggestions: TradeSuggestion[]; 
}
export interface Catalyst { 
  id: string; 
  title: string; 
  summary: string; 
  detailedAnalysis: string; 
  impactBreakdown: { market: number; technical: number; regulatory: number; }; 
  impactScore: number; 
  sentiment: 'positive' | 'negative' | 'neutral'; 
  timestamp: string; 
  sources: { title: string; url: string }[]; 
  category: string;
  consensusBreakdown?: SourceConsensus[];
  overallCredibilityScore?: number; // 0-100
}
export interface InsightReport { 
  summary: string; 
  marketSentiment: number; 
  topCatalysts: Catalyst[]; 
  marketOverview: MarketOverview; 
  newsHeadlines: NewsHeadline[]; 
  trendingKeywords: TrendingKeyword[];
  generatedAt?: string;
  cacheKey?: string;
}

export type View = 'landing' | 'dashboard' | 'profile' | 'intelligence' | 'settings' | 'calculator' | 'alerts' | 'deep-dive' | 'sentinel-hq';

export interface CalculatorParams {
  entry?: string;
  tp?: string;
  sl?: string;
  type?: 'long' | 'short' | 'spot';
  asset?: string;
}
