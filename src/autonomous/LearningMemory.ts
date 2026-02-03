/**
 * Learning Memory - Learn from decisions to improve recommendations
 * Part of Solana AI Companion for Colosseum Agent Hackathon
 */

export interface DecisionRecord {
  id: string;
  timestamp: Date;
  type: 'trade' | 'rebalance' | 'invest' | 'withdraw' | 'hold';
  decision: string;
  aiRecommendation: {
    action: string;
    confidence: number;
    reasoning: string;
  };
  userChoice: 'accepted' | 'rejected' | 'modified';
  outcome?: {
    expectedReturn: number;
    actualReturn: number;
    timeHorizon: number; // days
    success: boolean;
  };
  context: {
    portfolioValue: number;
    marketConditions: 'bullish' | 'bearish' | 'neutral';
    userSentiment?: number; // -1 to 1
    riskScore?: number;
  };
}

export interface UserPreferences {
  riskTolerance: number; // 0-100, higher = more risk tolerant
  preferredAssets: string[]; // Token mints user prefers
  timeHorizon: 'short' | 'medium' | 'long'; // Investment horizon
  trustInAI: number; // 0-1, how often user follows AI advice
  decisionPattern: 'conservative' | 'moderate' | 'aggressive';
  activeHours: number[]; // Hours of day user is most active (0-23)
}

export interface LearningInsight {
  category: 'risk' | 'timing' | 'preference' | 'trust' | 'performance';
  insight: string;
  confidence: number; // 0-1
  basedOnSamples: number;
  recommendation?: string;
}

export class LearningMemory {
  private decisions: DecisionRecord[] = [];
  private maxDecisions = 1000; // Keep last 1000 decisions

  constructor() {
    this.loadFromStorage();
  }

  /**
   * Record a decision made by user
   */
  recordDecision(record: Omit<DecisionRecord, 'id' | 'timestamp'>): DecisionRecord {
    const fullRecord: DecisionRecord = {
      id: this.generateId(),
      timestamp: new Date(),
      ...record
    };

    this.decisions.push(fullRecord);

    // Trim to max size
    if (this.decisions.length > this.maxDecisions) {
      this.decisions = this.decisions.slice(-this.maxDecisions);
    }

    this.saveToStorage();

    console.log(`[Learning Memory] Recorded decision: ${fullRecord.type} (${fullRecord.userChoice})`);

    return fullRecord;
  }

  /**
   * Update decision outcome after time has passed
   */
  updateOutcome(
    decisionId: string,
    outcome: DecisionRecord['outcome']
  ): void {
    const decision = this.decisions.find(d => d.id === decisionId);

    if (decision) {
      decision.outcome = outcome;
      this.saveToStorage();

      console.log(`[Learning Memory] Updated outcome for ${decisionId}: ${outcome.success ? 'success' : 'failure'}`);
    }
  }

  /**
   * Infer user preferences from decision history
   */
  inferPreferences(): UserPreferences {
    if (this.decisions.length < 10) {
      // Not enough data, return defaults
      return {
        riskTolerance: 50,
        preferredAssets: [],
        timeHorizon: 'medium',
        trustInAI: 0.5,
        decisionPattern: 'moderate',
        activeHours: []
      };
    }

    return {
      riskTolerance: this.calculateRiskTolerance(),
      preferredAssets: this.findPreferredAssets(),
      timeHorizon: this.inferTimeHorizon(),
      trustInAI: this.calculateAITrust(),
      decisionPattern: this.inferDecisionPattern(),
      activeHours: this.findActiveHours()
    };
  }

  /**
   * Calculate user's risk tolerance
   */
  private calculateRiskTolerance(): number {
    const recentDecisions = this.decisions.slice(-50);

    if (recentDecisions.length === 0) return 50;

    // Analyze accepted high-risk decisions
    const highRiskAccepted = recentDecisions.filter(d =>
      d.userChoice === 'accepted' &&
      (d.context.riskScore ?? 0) > 60
    ).length;

    const lowRiskRejected = recentDecisions.filter(d =>
      d.userChoice === 'rejected' &&
      (d.context.riskScore ?? 0) < 40
    ).length;

    const riskScore = ((highRiskAccepted / recentDecisions.length) * 100) +
                     ((lowRiskRejected / recentDecisions.length) * 50);

    return Math.max(0, Math.min(100, riskScore));
  }

  /**
   * Find user's preferred assets
   */
  private findPreferredAssets(): string[] {
    // Count which assets appear most in successful trades
    const assetCounts = new Map<string, number>();

    for (const decision of this.decisions) {
      if (decision.outcome?.success && decision.type === 'trade') {
        // Extract asset from decision (simplified)
        const asset = this.extractAsset(decision.decision);
        if (asset) {
          assetCounts.set(asset, (assetCounts.get(asset) || 0) + 1);
        }
      }
    }

    // Return top 5 assets
    return Array.from(assetCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([asset]) => asset);
  }

  /**
   * Extract asset from decision text (simplified)
   */
  private extractAsset(decision: string): string | null {
    // This is simplified - in production would use proper parsing
    const match = decision.match(/\b(SOL|USDC|USDT|BTC|ETH)\b/);
    return match ? match[1] : null;
  }

  /**
   * Infer user's time horizon
   */
  private inferTimeHorizon(): UserPreferences['timeHorizon'] {
    const decisionsWithOutcomes = this.decisions.filter(d => d.outcome);

    if (decisionsWithOutcomes.length === 0) return 'medium';

    const avgHorizon = decisionsWithOutcomes.reduce(
      (sum, d) => sum + (d.outcome?.timeHorizon ?? 0),
      0
    ) / decisionsWithOutcomes.length;

    if (avgHorizon < 7) return 'short';
    if (avgHorizon < 30) return 'medium';
    return 'long';
  }

  /**
   * Calculate how often user trusts AI recommendations
   */
  private calculateAITrust(): number {
    const recentDecisions = this.decisions.slice(-100);

    if (recentDecisions.length === 0) return 0.5;

    const accepted = recentDecisions.filter(d => d.userChoice === 'accepted').length;

    return accepted / recentDecisions.length;
  }

  /**
   * Infer user's decision pattern
   */
  private inferDecisionPattern(): UserPreferences['decisionPattern'] {
    const riskTolerance = this.calculateRiskTolerance();

    if (riskTolerance < 40) return 'conservative';
    if (riskTolerance < 70) return 'moderate';
    return 'aggressive';
  }

  /**
   * Find user's most active hours
   */
  private findActiveHours(): number[] {
    const hourCounts = new Array(24).fill(0);

    for (const decision of this.decisions) {
      const hour = decision.timestamp.getHours();
      hourCounts[hour]++;
    }

    // Return hours with above-average activity
    const avgActivity = hourCounts.reduce((a, b) => a + b, 0) / 24;

    return hourCounts
      .map((count, hour) => ({ hour, count }))
      .filter(({ count }) => count > avgActivity)
      .map(({ hour }) => hour);
  }

  /**
   * Get learning insights
   */
  getInsights(): LearningInsight[] {
    const insights: LearningInsight[] = [];

    if (this.decisions.length < 10) {
      return [{
        category: 'trust',
        insight: 'Not enough decision history yet. Continue using the app to get personalized insights.',
        confidence: 1,
        basedOnSamples: this.decisions.length
      }];
    }

    // Risk insight
    const riskTolerance = this.calculateRiskTolerance();
    insights.push({
      category: 'risk',
      insight: riskTolerance > 70
        ? 'You tend to accept high-risk opportunities'
        : riskTolerance < 40
          ? 'You prefer low-risk, conservative strategies'
          : 'You balance risk and reward effectively',
      confidence: Math.min(this.decisions.length / 100, 1),
      basedOnSamples: this.decisions.length,
      recommendation: riskTolerance > 80
        ? 'Consider diversification to reduce portfolio concentration risk'
        : undefined
    });

    // Trust insight
    const trustInAI = this.calculateAITrust();
    insights.push({
      category: 'trust',
      insight: trustInAI > 0.7
        ? `You follow AI recommendations ${(trustInAI * 100).toFixed(0)}% of the time`
        : trustInAI < 0.3
          ? 'You often override AI recommendations'
          : 'You selectively follow AI advice',
      confidence: Math.min(this.decisions.length / 50, 1),
      basedOnSamples: this.decisions.length
    });

    // Performance insight
    const successRate = this.calculateSuccessRate();
    if (successRate !== null) {
      insights.push({
        category: 'performance',
        insight: `Your decisions have been successful ${(successRate * 100).toFixed(0)}% of the time`,
        confidence: Math.min(
          this.decisions.filter(d => d.outcome).length / 30,
          1
        ),
        basedOnSamples: this.decisions.filter(d => d.outcome).length,
        recommendation: successRate < 0.5
          ? 'Consider following AI recommendations more closely'
          : successRate > 0.8
            ? 'Your decision-making is excellent - keep it up!'
            : undefined
      });
    }

    return insights;
  }

  /**
   * Calculate success rate of decisions with outcomes
   */
  private calculateSuccessRate(): number | null {
    const decisionsWithOutcomes = this.decisions.filter(d => d.outcome);

    if (decisionsWithOutcomes.length === 0) return null;

    const successful = decisionsWithOutcomes.filter(
      d => d.outcome?.success
    ).length;

    return successful / decisionsWithOutcomes.length;
  }

  /**
   * Get recommendation adjustment based on learning
   */
  adjustRecommendation(
    baseRecommendation: {
      action: string;
      confidence: number;
    },
    context: {
      riskLevel: number;
      type: string;
    }
  ): {
    action: string;
    confidence: number;
    learningAdjustment: string;
  } {
    const preferences = this.inferPreferences();

    let adjustedConfidence = baseRecommendation.confidence;
    let adjustment = '';

    // Adjust based on risk tolerance
    if (context.riskLevel > 70 && preferences.riskTolerance < 40) {
      adjustedConfidence *= 0.7;
      adjustment = 'Confidence lowered - this is riskier than your usual preferences';
    } else if (context.riskLevel < 30 && preferences.riskTolerance > 70) {
      adjustedConfidence *= 0.8;
      adjustment = 'You typically prefer higher-risk opportunities';
    }

    // Adjust based on trust
    if (preferences.trustInAI < 0.3) {
      adjustment = adjustment
        ? `${adjustment}. Note: You typically override AI recommendations`
        : 'Note: You typically override AI recommendations';
    }

    return {
      action: baseRecommendation.action,
      confidence: adjustedConfidence,
      learningAdjustment: adjustment
    };
  }

  /**
   * Get decision history
   */
  getHistory(limit = 50): DecisionRecord[] {
    return this.decisions.slice(-limit).reverse();
  }

  /**
   * Get decisions by type
   */
  getDecisionsByType(type: DecisionRecord['type']): DecisionRecord[] {
    return this.decisions.filter(d => d.type === type);
  }

  /**
   * Clear all learning data
   */
  clearHistory(): void {
    this.decisions = [];
    this.saveToStorage();
    console.log('[Learning Memory] History cleared');
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Load from local storage (browser/mobile)
   */
  private loadFromStorage(): void {
    // TODO: Implement actual storage (AsyncStorage for React Native)
    // For now, just log
    console.log('[Learning Memory] Initialized (storage not yet implemented)');
  }

  /**
   * Save to local storage
   */
  private saveToStorage(): void {
    // TODO: Implement actual storage
    // For now, just keep in memory
  }

  /**
   * Export learning data for backup
   */
  exportData(): string {
    return JSON.stringify({
      decisions: this.decisions,
      preferences: this.inferPreferences(),
      insights: this.getInsights(),
      exportedAt: new Date().toISOString()
    }, null, 2);
  }

  /**
   * Import learning data from backup
   */
  importData(jsonData: string): void {
    try {
      const data = JSON.parse(jsonData);

      if (data.decisions && Array.isArray(data.decisions)) {
        this.decisions = data.decisions.map((d: any) => ({
          ...d,
          timestamp: new Date(d.timestamp)
        }));

        this.saveToStorage();
        console.log(`[Learning Memory] Imported ${this.decisions.length} decisions`);
      }
    } catch (error) {
      console.error('[Learning Memory] Import failed:', error);
      throw error;
    }
  }
}

export default LearningMemory;
