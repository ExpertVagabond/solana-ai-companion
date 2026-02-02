/**
 * Portfolio Analyzer - Autonomous portfolio monitoring and analysis
 * Part of Solana AI Companion for Colosseum Agent Hackathon
 */

import { Connection, PublicKey } from '@solana/web3.js';

export interface TokenBalance {
  mint: string;
  symbol: string;
  balance: number;
  decimals: number;
  uiAmount: number;
  priceUSD?: number;
  valueUSD?: number;
}

export interface PortfolioMetrics {
  totalValueUSD: number;
  tokenCount: number;
  allocation: Record<string, number>; // token -> percentage
  concentration: number; // 0-1, higher = more concentrated
  dominantToken: string;
  dominantPercentage: number;
  riskScore: number; // 0-100, higher = riskier
  lastUpdated: Date;
}

export interface Recommendation {
  type: 'rebalance' | 'diversify' | 'reduce_exposure' | 'good_standing';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  action?: string;
  suggestedTrades?: Array<{
    from: string;
    to: string;
    amount: number;
    reason: string;
  }>;
}

export class PortfolioAnalyzer {
  private connection: Connection;
  private updateInterval: NodeJS.Timeout | null = null;

  constructor(rpcUrl: string) {
    this.connection = new Connection(rpcUrl, 'confirmed');
  }

  /**
   * Analyze a wallet's portfolio and return comprehensive metrics
   */
  async analyzePortfolio(walletAddress: string): Promise<{
    metrics: PortfolioMetrics;
    recommendations: Recommendation[];
  }> {
    try {
      const publicKey = new PublicKey(walletAddress);

      // Get token balances (simplified - will integrate with Helius/MCP)
      const balances = await this.getTokenBalances(publicKey);

      // Calculate metrics
      const metrics = this.calculateMetrics(balances);

      // Generate recommendations based on metrics
      const recommendations = this.generateRecommendations(metrics, balances);

      return { metrics, recommendations };
    } catch (error) {
      console.error('Portfolio analysis error:', error);
      throw error;
    }
  }

  /**
   * Get all token balances for a wallet
   */
  private async getTokenBalances(publicKey: PublicKey): Promise<TokenBalance[]> {
    // TODO: Integrate with Helius RPC for enhanced token data
    // TODO: Integrate with Solana MCP for verified operations
    // TODO: Get prices from Birdeye/Pyth

    const tokenAccounts = await this.connection.getParsedTokenAccountsByOwner(
      publicKey,
      { programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA') }
    );

    const balances: TokenBalance[] = [];

    for (const account of tokenAccounts.value) {
      const parsedInfo = account.account.data.parsed.info;
      const balance = parsedInfo.tokenAmount;

      if (balance.uiAmount > 0) {
        balances.push({
          mint: parsedInfo.mint,
          symbol: parsedInfo.mint.slice(0, 8) + '...', // Will get from metadata
          balance: balance.amount,
          decimals: balance.decimals,
          uiAmount: balance.uiAmount,
          // Price data will come from price feeds
          priceUSD: undefined,
          valueUSD: undefined
        });
      }
    }

    return balances;
  }

  /**
   * Calculate portfolio metrics
   */
  private calculateMetrics(balances: TokenBalance[]): PortfolioMetrics {
    // Calculate total value (once we have prices)
    const totalValueUSD = balances.reduce(
      (sum, token) => sum + (token.valueUSD || 0),
      0
    );

    // Calculate allocation percentages
    const allocation: Record<string, number> = {};
    balances.forEach(token => {
      const percentage = totalValueUSD > 0
        ? ((token.valueUSD || 0) / totalValueUSD) * 100
        : 0;
      allocation[token.symbol] = percentage;
    });

    // Find dominant token
    const dominant = balances.reduce((max, token) =>
      (token.valueUSD || 0) > (max.valueUSD || 0) ? token : max
    , balances[0] || { symbol: 'N/A', valueUSD: 0 });

    const dominantPercentage = totalValueUSD > 0
      ? ((dominant.valueUSD || 0) / totalValueUSD) * 100
      : 0;

    // Calculate concentration (Herfindahl index)
    const concentration = balances.reduce((sum, token) => {
      const share = totalValueUSD > 0
        ? (token.valueUSD || 0) / totalValueUSD
        : 0;
      return sum + (share * share);
    }, 0);

    // Calculate risk score
    const riskScore = this.calculateRiskScore(concentration, dominantPercentage, balances.length);

    return {
      totalValueUSD,
      tokenCount: balances.length,
      allocation,
      concentration,
      dominantToken: dominant.symbol,
      dominantPercentage,
      riskScore,
      lastUpdated: new Date()
    };
  }

  /**
   * Calculate overall risk score (0-100)
   */
  private calculateRiskScore(
    concentration: number,
    dominantPercentage: number,
    tokenCount: number
  ): number {
    // Concentration risk (0-40 points)
    const concentrationRisk = concentration * 40;

    // Dominant token risk (0-40 points)
    const dominantRisk = (dominantPercentage / 100) * 40;

    // Diversification risk (0-20 points)
    const diversificationRisk = tokenCount < 3 ? 20 : (tokenCount < 5 ? 10 : 0);

    return Math.min(100, concentrationRisk + dominantRisk + diversificationRisk);
  }

  /**
   * Generate actionable recommendations
   */
  private generateRecommendations(
    metrics: PortfolioMetrics,
    balances: TokenBalance[]
  ): Recommendation[] {
    const recommendations: Recommendation[] = [];

    // Check concentration risk
    if (metrics.dominantPercentage > 70) {
      recommendations.push({
        type: 'reduce_exposure',
        severity: 'critical',
        message: `⚠️ High concentration risk: ${metrics.dominantToken} represents ${metrics.dominantPercentage.toFixed(1)}% of your portfolio`,
        action: `Consider reducing your ${metrics.dominantToken} exposure to below 50%`,
        suggestedTrades: [
          {
            from: metrics.dominantToken,
            to: 'USDC',
            amount: (metrics.dominantPercentage - 50) / 100 * metrics.totalValueUSD,
            reason: 'Reduce concentration risk'
          }
        ]
      });
    } else if (metrics.dominantPercentage > 50) {
      recommendations.push({
        type: 'diversify',
        severity: 'warning',
        message: `⚡ Moderate concentration: ${metrics.dominantToken} is ${metrics.dominantPercentage.toFixed(1)}% of portfolio`,
        action: 'Consider diversifying into additional assets'
      });
    }

    // Check diversification
    if (metrics.tokenCount < 3) {
      recommendations.push({
        type: 'diversify',
        severity: 'warning',
        message: `📊 Limited diversification: Only ${metrics.tokenCount} tokens in portfolio`,
        action: 'Consider adding 2-3 more quality assets to reduce risk'
      });
    }

    // If portfolio is healthy
    if (metrics.riskScore < 30 && metrics.tokenCount >= 3) {
      recommendations.push({
        type: 'good_standing',
        severity: 'info',
        message: '✅ Portfolio is well-balanced with good diversification',
        action: 'Continue monitoring for new opportunities'
      });
    }

    return recommendations;
  }

  /**
   * Start autonomous monitoring (runs every 5 minutes)
   */
  startMonitoring(walletAddress: string, callback: (analysis: any) => void) {
    // Run immediately
    this.analyzePortfolio(walletAddress).then(callback);

    // Then run every 5 minutes
    this.updateInterval = setInterval(() => {
      this.analyzePortfolio(walletAddress).then(callback);
    }, 5 * 60 * 1000);
  }

  /**
   * Stop autonomous monitoring
   */
  stopMonitoring() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }
}

export default PortfolioAnalyzer;
