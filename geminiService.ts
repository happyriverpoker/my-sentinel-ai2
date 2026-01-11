
import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, InsightReport, UserTradeFeedback, TradeSuggestion, TradeRetrospection } from "../types";

export class SentinelAIService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  private async retryWithBackoff<T>(fn: () => Promise<T>, retries = 5, delay = 3000): Promise<T> {
    try {
      return await fn();
    } catch (error: any) {
      const errorMsg = error?.message || "";
      const isQuotaError = errorMsg.includes('429') || errorMsg.includes('RESOURCE_EXHAUSTED') || errorMsg.includes('quota');

      if (isQuotaError && retries > 0) {
        console.warn(`Quota/Rate limit hit. Retrying in ${delay}ms... (${retries} left)`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.retryWithBackoff(fn, retries - 1, delay * 1.5);
      }

      if (isQuotaError) {
        throw new Error("GOOGLE_QUOTA_EXHAUSTED");
      }
      
      throw error;
    }
  }

  private generateCacheKey(profile: UserProfile): string {
    const focusString = [...profile.focusAreas].sort().join(',');
    const mandateClean = profile.mandate.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 100);
    return `registry_${focusString}_${mandateClean}`;
  }

  public findCachedReport(profile: UserProfile): InsightReport | null {
    const key = this.generateCacheKey(profile);
    const stored = localStorage.getItem(key);
    if (!stored) return null;

    try {
      const report: InsightReport = JSON.parse(stored);
      const generatedAt = new Date(report.generatedAt || 0).getTime();
      const now = new Date().getTime();

      if (now - generatedAt > 24 * 60 * 60 * 1000) return null;

      report.marketOverview.tradeSuggestions = report.marketOverview.tradeSuggestions.filter(trade => {
        const expiryMs = (trade.expiryHours || 2) * 60 * 60 * 1000;
        const tradeGenAt = new Date(trade.generatedAt || report.generatedAt || 0).getTime();
        return (now - tradeGenAt) < expiryMs;
      });

      report.marketOverview.tradeSuggestions.forEach(t => t.isSharedAlpha = true);

      return report.marketOverview.tradeSuggestions.length > 0 ? report : null;
    } catch (e) {
      return null;
    }
  }

  private cacheReport(profile: UserProfile, report: InsightReport) {
    const key = this.generateCacheKey(profile);
    report.generatedAt = new Date().toISOString();
    report.cacheKey = key;
    report.marketOverview.tradeSuggestions.forEach(t => t.generatedAt = report.generatedAt);
    localStorage.setItem(key, JSON.stringify(report));
  }

  async scanForOpportunities(profile: UserProfile, feedbackHistory: UserTradeFeedback[] = []): Promise<InsightReport> {
    const modelToUse = profile.selectedModel || 'gemini-3-flash-preview';
    
    const prompt = `
      You are VORA AI, an autonomous Multi-Agent Market Intelligence Hub. 
      Analyze the current markets and simulate a "Consensus Meeting" between your 4 specialized VORA Sentinels.

      VORA USER PROFILE:
      - Designated User: ${profile.name}
      - Target Focus Areas: ${profile.focusAreas.join(', ')}
      - Risk Tolerance Profile: ${profile.riskTolerance}
      - Execution Preference: ${profile.tradingPreference}

      CRITICAL PROTOCOLS:
      1. REAL-TIME DATA: Use Google Search for ACTUAL current prices and TRENDING topics.
      2. REAL CATALYSTS: Synthesize news from the last 24-48 hours.
      3. INSTITUTIONAL PROOF OF WORK: For major catalysts, identify at least 3-4 institutional desks (e.g., Bloomberg, Goldman Sachs, JP Morgan, BlackRock) reporting on it. Provide a "credibilityScore" (0-100) for each based on their specific record for that asset class.
      4. SIGNAL EXPIRY: Estimate validity duration in hours.
      5. PRECISION: Scores MUST be integers (0-100). Only return high-confidence signals (65+).

      VORA MISSION TASKS:
      1. MACRO SYNTHESIS: Fear/Greed, FOMC, DXY, and 10Y Yield.
      2. ALPHA GENERATION: 3 high-conviction trade suggestions with specific Entry/TP/SL levels.
    `;

    return this.retryWithBackoff(async () => {
      this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const response = await this.ai.models.generateContent({
        model: modelToUse,
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING },
              marketSentiment: { type: Type.NUMBER },
              trendingKeywords: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    word: { type: Type.STRING },
                    momentum: { type: Type.NUMBER },
                    sentiment: { type: Type.STRING, enum: ["bullish", "bearish", "neutral"] },
                    context: { type: Type.STRING }
                  }
                }
              },
              newsHeadlines: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    source: { type: Type.STRING },
                    url: { type: Type.STRING },
                    timestamp: { type: Type.STRING }
                  }
                }
              },
              marketOverview: {
                type: Type.OBJECT,
                properties: {
                  cryptoPrices: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        symbol: { type: Type.STRING },
                        price: { type: Type.STRING },
                        change24h: { type: Type.STRING }
                      }
                    }
                  },
                  macroPulse: {
                    type: Type.OBJECT,
                    properties: {
                      fearAndGreed: {
                        type: Type.OBJECT,
                        properties: { value: { type: Type.NUMBER }, label: { type: Type.STRING } }
                      },
                      fomcProjection: { type: Type.STRING },
                      dxyIndex: { type: Type.STRING },
                      tenYearYield: { type: Type.STRING },
                      nextVolatilityEvents: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: { 
                            event: { type: Type.STRING }, 
                            date: { type: Type.STRING }, 
                            impact: { type: Type.STRING, enum: ["high", "medium"] } 
                          }
                        }
                      }
                    }
                  },
                  usMarketSentiment: { type: Type.STRING },
                  tradeSuggestions: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        asset: { type: Type.STRING },
                        type: { type: Type.STRING },
                        reasoning: { type: Type.STRING },
                        confidence: { type: Type.NUMBER },
                        currentPrice: { type: Type.STRING },
                        entry: { type: Type.STRING },
                        takeProfit: { type: Type.STRING },
                        stopLoss: { type: Type.STRING },
                        catalyst: { type: Type.STRING },
                        expiryHours: { type: Type.NUMBER },
                        keyMetrics: {
                          type: Type.OBJECT,
                          properties: { projectedROI: { type: Type.STRING }, fundingRate: { type: Type.STRING }, estimatedVolume: { type: Type.STRING } }
                        },
                        crossAnalysis: {
                          type: Type.OBJECT,
                          properties: {
                            consensusScore: { type: Type.NUMBER },
                            agentInsights: {
                              type: Type.ARRAY,
                              items: {
                                type: Type.OBJECT,
                                properties: { agentName: { type: Type.STRING }, verdict: { type: Type.STRING }, note: { type: Type.STRING }, individualScore: { type: Type.NUMBER } }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              },
              topCatalysts: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    title: { type: Type.STRING },
                    summary: { type: Type.STRING },
                    detailedAnalysis: { type: Type.STRING },
                    impactBreakdown: {
                      type: Type.OBJECT,
                      properties: { market: { type: Type.NUMBER }, technical: { type: Type.NUMBER }, regulatory: { type: Type.NUMBER } }
                    },
                    impactScore: { type: Type.NUMBER },
                    sentiment: { type: Type.STRING },
                    category: { type: Type.STRING },
                    timestamp: { type: Type.STRING },
                    overallCredibilityScore: { type: Type.NUMBER },
                    consensusBreakdown: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          source: { type: Type.STRING },
                          stance: { type: Type.STRING, enum: ["bullish", "bearish", "neutral"] },
                          summary: { type: Type.STRING },
                          credibilityScore: { type: Type.NUMBER }
                        }
                      }
                    }
                  }
                }
              }
            },
            required: ["summary", "marketSentiment", "newsHeadlines", "marketOverview", "topCatalysts", "trendingKeywords"]
          }
        },
      });

      const result = JSON.parse(response.text || '{}') as InsightReport;
      this.cacheReport(profile, result);
      return result;
    });
  }

  /**
   * Generates a "Sentinel Retrospection" interview for a matured trade signal.
   */
  async generateRetrospection(trade: TradeSuggestion): Promise<TradeRetrospection> {
    const prompt = `
      VORA AI POST-MORTEM PROTOCOL:
      Perform an "Autonomous Sentinel Retrospection" on the following trade signal which has reached maturity (Expired or Resolved).
      
      SIGNAL DATA:
      - Asset: ${trade.asset}
      - Setup: ${trade.type} at ${trade.entry}
      - Logic: ${trade.reasoning}
      - Catalyst: ${trade.catalyst}
      
      TASKS:
      1. Scour the CURRENT market data to see how this asset performed since it was suggested.
      2. "Interview" the 4 Sentinels (Shield, Scout, Prism, Core) about why this setup was a success or failure.
      3. Provide a summary of lessons learned for the user's calibration.
      4. Grade each sentinel's contribution (A-F).
    `;

    return this.retryWithBackoff(async () => {
      this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING },
              finalVerdict: { type: Type.STRING },
              sentinelInterviews: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    agentName: { type: Type.STRING },
                    analysisOfOutcome: { type: Type.STRING },
                    lessonLearned: { type: Type.STRING },
                    grade: { type: Type.STRING, enum: ["A", "B", "C", "D", "F"] }
                  }
                }
              }
            }
          }
        }
      });
      return JSON.parse(response.text || '{}') as TradeRetrospection;
    });
  }
}
