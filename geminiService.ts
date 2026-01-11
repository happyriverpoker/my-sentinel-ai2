
import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, InsightReport, UserTradeFeedback } from "./types";

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

  async scanForOpportunities(profile: UserProfile, feedbackHistory: UserTradeFeedback[] = []): Promise<InsightReport> {
    const modelToUse = profile.selectedModel || 'gemini-3-flash-preview';
    
    const prompt = `
      You are VORA AI, an autonomous Multi-Agent Market Intelligence Hub. 
      Your mission is to scour global data to find high-conviction "Alpha" signals.
      Analyze the current markets and simulate a "Consensus Meeting" between your 4 specialized VORA Sentinels.

      VORA USER PROFILE:
      - Designated User: ${profile.name}
      - Target Focus Areas: ${profile.focusAreas.join(', ')}
      - Risk Tolerance Profile: ${profile.riskTolerance}
      - Execution Preference: ${profile.tradingPreference}

      CRITICAL VORA PROTOCOLS:
      1. REAL-TIME DATA: Use Google Search for ACTUAL current prices and TRENDING topics in focus areas.
      2. REAL CATALYSTS: Synthesize news from the last 24-48 hours only.
      3. TRENDING KEYWORDS: Identify 5-8 trending search terms with 'momentum' (0-100).
      4. SOURCE CONSENSUS: For major catalysts, synthesize reporting from institutional sources (Bloomberg, Reuters, FT).
      5. PRECISION: Scores MUST be integers (0-100). Only return high-confidence signals (65+).

      VORA MISSION TASKS:
      1. MACRO SYNTHESIS: Fear/Greed, FOMC, DXY, and 10Y Yield.
      2. ACTIONABLE CATALYSTS: 3 market-moving events this week.
      3. ALPHA GENERATION: 3 high-conviction trade suggestions with specific Entry/TP/SL levels.
      4. MOMENTUM HUB: The trending keyword pulse.
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
                    consensusBreakdown: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          source: { type: Type.STRING },
                          stance: { type: Type.STRING, enum: ["bullish", "bearish", "neutral"] },
                          summary: { type: Type.STRING }
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

      return JSON.parse(response.text || '{}') as InsightReport;
    });
  }
}
