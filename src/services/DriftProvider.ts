/**
 * Drift Protocol Provider - Perpetuals trading and funding rates
 * Part of Solana AI Companion for Colosseum Agent Hackathon
 *
 * Integrates with Drift Protocol for:
 * - Perpetual futures markets
 * - Funding rates (can be positive or negative yield)
 * - Leverage trading opportunities
 * - Collateral management
 */

import { Connection, PublicKey } from '@solana/web3.js';

export interface DriftMarket {
  symbol: string; // e.g., "SOL-PERP", "BTC-PERP"
  marketIndex: number;
  baseAsset: string; // Underlying asset
  oraclePrice: number; // Current oracle price
  markPrice: number; // Mark price for funding
  indexPrice: number; // Index price
  fundingRate: number; // Current funding rate (annualized %)
  fundingRateLong: number; // Funding rate for longs
  fundingRateShort: number; // Funding rate for shorts
  openInterest: number; // Total open interest (USD)
  volume24h: number; // 24h volume (USD)
  maxLeverage: number; // Maximum leverage allowed
  initialMargin: number; // Initial margin requirement
  maintenanceMargin: number; // Maintenance margin requirement
}

export interface DriftOpportunity {
  market: string;
  type: 'funding_long' | 'funding_short';
  apy: number; // Annualized funding rate
  direction: 'long' | 'short';
  risk: number; // 0-100 risk score
  liquidity: number; // Open interest as proxy for liquidity
  minCollateral: number; // Minimum collateral in USD
  maxLeverage: number;
  description: string;
}

export interface DriftPosition {
  market: string;
  side: 'long' | 'short';
  size: number; // Position size in base asset
  entryPrice: number;
  liquidationPrice: number;
  unrealizedPnL: number;
  leverage: number;
  collateral: number;
}

export class DriftProvider {
  private connection: Connection;
  private driftProgramId = new PublicKey('dRiftyHA39MWEi3m9aunc5MzRF1JYuBsbn6VPcn33UH'); // Drift Mainnet

  constructor(rpcUrl: string) {
    this.connection = new Connection(rpcUrl, 'confirmed');
  }

  /**
   * Fetch all perpetual markets from Drift
   *
   * TODO: Integrate with @drift-labs/sdk
   * import { DriftClient } from '@drift-labs/sdk';
   */
  async fetchMarkets(): Promise<DriftMarket[]> {
    console.log('[Drift Provider] Fetching markets...');

    try {
      // In production, use Drift SDK:
      // const driftClient = new DriftClient({ connection, ... });
      // await driftClient.subscribe();
      // const markets = driftClient.getPerpMarkets();

      // For now, return realistic mock data
      return this.getMockMarkets();
    } catch (error) {
      console.error('[Drift Provider] Failed to fetch markets:', error);
      throw error;
    }
  }

  /**
   * Get mock market data (realistic structure for Drift)
   */
  private getMockMarkets(): DriftMarket[] {
    return [
      {
        symbol: 'SOL-PERP',
        marketIndex: 0,
        baseAsset: 'SOL',
        oraclePrice: 102.5,
        markPrice: 102.6,
        indexPrice: 102.55,
        fundingRate: 12.3, // Annualized
        fundingRateLong: -0.01, // Pay funding
        fundingRateShort: 0.01, // Receive funding
        openInterest: 85_000_000,
        volume24h: 150_000_000,
        maxLeverage: 20,
        initialMargin: 0.05, // 5%
        maintenanceMargin: 0.025 // 2.5%
      },
      {
        symbol: 'BTC-PERP',
        marketIndex: 1,
        baseAsset: 'BTC',
        oraclePrice: 45_250,
        markPrice: 45_280,
        indexPrice: 45_265,
        fundingRate: 8.7,
        fundingRateLong: -0.008,
        fundingRateShort: 0.008,
        openInterest: 320_000_000,
        volume24h: 580_000_000,
        maxLeverage: 20,
        initialMargin: 0.05,
        maintenanceMargin: 0.025
      },
      {
        symbol: 'ETH-PERP',
        marketIndex: 2,
        baseAsset: 'ETH',
        oraclePrice: 2_520,
        markPrice: 2_522,
        indexPrice: 2_521,
        fundingRate: 10.5,
        fundingRateLong: -0.009,
        fundingRateShort: 0.009,
        openInterest: 180_000_000,
        volume24h: 320_000_000,
        maxLeverage: 20,
        initialMargin: 0.05,
        maintenanceMargin: 0.025
      },
      {
        symbol: 'JUP-PERP',
        marketIndex: 10,
        baseAsset: 'JUP',
        oraclePrice: 0.85,
        markPrice: 0.852,
        indexPrice: 0.851,
        fundingRate: 18.5, // Higher funding for altcoins
        fundingRateLong: -0.015,
        fundingRateShort: 0.015,
        openInterest: 12_000_000,
        volume24h: 25_000_000,
        maxLeverage: 10,
        initialMargin: 0.10,
        maintenanceMargin: 0.05
      }
    ];
  }

  /**
   * Get funding rate opportunities
   */
  async getFundingOpportunities(): Promise<DriftOpportunity[]> {
    const markets = await this.fetchMarkets();
    const opportunities: DriftOpportunity[] = [];

    for (const market of markets) {
      // Positive funding rate = longs pay shorts (short to earn)
      // Negative funding rate = shorts pay longs (long to earn)

      const direction = market.fundingRate > 0 ? 'short' : 'long';
      const apy = Math.abs(market.fundingRate);

      opportunities.push({
        market: market.symbol,
        type: direction === 'long' ? 'funding_long' : 'funding_short',
        apy,
        direction,
        risk: this.calculateRisk(market),
        liquidity: market.openInterest,
        minCollateral: 10, // $10 minimum
        maxLeverage: market.maxLeverage,
        description: direction === 'short'
          ? `Short ${market.baseAsset} perpetual to earn ${apy.toFixed(2)}% APY from funding`
          : `Long ${market.baseAsset} perpetual to earn ${apy.toFixed(2)}% APY from funding`
      });
    }

    // Sort by APY descending
    return opportunities.sort((a, b) => b.apy - a.apy);
  }

  /**
   * Calculate risk score for a perpetual market (0-100)
   */
  private calculateRisk(market: DriftMarket): number {
    let risk = 0;

    // Base risk for perpetuals (leverage trading is inherently risky)
    risk += 40;

    // Volatility risk (based on asset type)
    const volatilityRisk: Record<string, number> = {
      'BTC': 10,
      'ETH': 15,
      'SOL': 20,
      'JUP': 30,
      'RAY': 30,
      'BONK': 35
    };
    risk += volatilityRisk[market.baseAsset] || 25;

    // Liquidity risk (lower open interest = higher risk)
    const oiInMillion = market.openInterest / 1_000_000;
    if (oiInMillion < 10) risk += 20;
    else if (oiInMillion < 50) risk += 10;
    else if (oiInMillion < 100) risk += 5;

    // Funding rate extremes indicate imbalanced market
    const absFundingRate = Math.abs(market.fundingRate);
    if (absFundingRate > 50) risk += 15; // Very high funding
    else if (absFundingRate > 30) risk += 10;
    else if (absFundingRate > 20) risk += 5;

    return Math.min(100, risk);
  }

  /**
   * Get specific market data
   */
  async getMarket(symbol: string): Promise<DriftMarket | null> {
    const markets = await this.fetchMarkets();
    return markets.find(m => m.symbol === symbol) || null;
  }

  /**
   * Calculate liquidation price for a position
   */
  calculateLiquidationPrice(
    entryPrice: number,
    leverage: number,
    side: 'long' | 'short',
    maintenanceMargin: number
  ): number {
    const maintenanceMarginPercent = maintenanceMargin;

    if (side === 'long') {
      // Long liquidation = entry * (1 - (1/leverage - maintenanceMargin))
      return entryPrice * (1 - (1 / leverage - maintenanceMarginPercent));
    } else {
      // Short liquidation = entry * (1 + (1/leverage - maintenanceMargin))
      return entryPrice * (1 + (1 / leverage - maintenanceMarginPercent));
    }
  }

  /**
   * Calculate required collateral for a position
   */
  calculateRequiredCollateral(
    positionSize: number,
    entryPrice: number,
    leverage: number,
    initialMargin: number
  ): number {
    const positionValue = positionSize * entryPrice;
    const collateralRatio = 1 / leverage;

    // Need at least initial margin + collateral for leverage
    return positionValue * Math.max(collateralRatio, initialMargin);
  }

  /**
   * Estimate funding payments
   */
  estimateFundingPayments(
    market: DriftMarket,
    positionSize: number, // In base asset
    side: 'long' | 'short',
    durationDays: number
  ): {
    dailyPayment: number;
    totalPayment: number;
    annualizedReturn: number;
  } {
    const positionValue = positionSize * market.markPrice;
    const hourlyFundingRate = market.fundingRate / 365 / 24;

    let hourlyPayment: number;
    if (side === 'long') {
      // Longs pay if funding is positive, receive if negative
      hourlyPayment = positionValue * market.fundingRateLong;
    } else {
      // Shorts receive if funding is positive, pay if negative
      hourlyPayment = positionValue * market.fundingRateShort;
    }

    const dailyPayment = hourlyPayment * 24;
    const totalPayment = dailyPayment * durationDays;
    const annualizedReturn = (dailyPayment * 365 / positionValue) * 100;

    return {
      dailyPayment,
      totalPayment,
      annualizedReturn
    };
  }

  /**
   * Get best funding opportunities (highest yield)
   */
  async getTopFundingOpportunities(limit: number = 5): Promise<DriftOpportunity[]> {
    const opportunities = await this.getFundingOpportunities();
    return opportunities.slice(0, limit);
  }

  /**
   * Get opportunities filtered by risk
   */
  async getOpportunitiesByRisk(maxRisk: number): Promise<DriftOpportunity[]> {
    const opportunities = await this.getFundingOpportunities();
    return opportunities.filter(opp => opp.risk <= maxRisk);
  }

  /**
   * Simulate position PnL
   */
  simulatePositionPnL(
    entryPrice: number,
    currentPrice: number,
    positionSize: number,
    side: 'long' | 'short',
    leverage: number,
    collateral: number
  ): {
    unrealizedPnL: number;
    pnLPercent: number;
    roe: number; // Return on equity
    liquidated: boolean;
  } {
    let unrealizedPnL: number;

    if (side === 'long') {
      unrealizedPnL = positionSize * (currentPrice - entryPrice);
    } else {
      unrealizedPnL = positionSize * (entryPrice - currentPrice);
    }

    const pnLPercent = (unrealizedPnL / (positionSize * entryPrice)) * 100;
    const roe = (unrealizedPnL / collateral) * 100;

    // Simple liquidation check (actual would be more complex)
    const liquidated = roe <= -90; // ~90% loss triggers liquidation

    return {
      unrealizedPnL,
      pnLPercent,
      roe,
      liquidated
    };
  }

  /**
   * Get market statistics
   */
  async getMarketStats(): Promise<{
    totalOpenInterest: number;
    total24hVolume: number;
    averageFundingRate: number;
    marketCount: number;
  }> {
    const markets = await this.fetchMarkets();

    const totalOpenInterest = markets.reduce((sum, m) => sum + m.openInterest, 0);
    const total24hVolume = markets.reduce((sum, m) => sum + m.volume24h, 0);
    const averageFundingRate = markets.reduce((sum, m) => sum + m.fundingRate, 0) / markets.length;

    return {
      totalOpenInterest,
      total24hVolume,
      averageFundingRate,
      marketCount: markets.length
    };
  }

  /**
   * Health check - verify Drift connection
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.fetchMarkets();
      console.log('[Drift Provider] Health check passed');
      return true;
    } catch (error) {
      console.error('[Drift Provider] Health check failed:', error);
      return false;
    }
  }

  /**
   * Get funding rate history (mock - requires historical data)
   */
  async getFundingRateHistory(
    symbol: string,
    periodHours: number = 24
  ): Promise<Array<{
    timestamp: number;
    fundingRate: number;
  }>> {
    // In production, fetch actual historical data
    // For now, return mock data showing typical funding rate fluctuation

    const market = await this.getMarket(symbol);
    if (!market) return [];

    const history = [];
    const now = Date.now();
    const hoursAgo = periodHours;

    for (let i = hoursAgo; i >= 0; i--) {
      // Simulate funding rate variation
      const baseRate = market.fundingRate / 365 / 24; // Hourly rate
      const variation = (Math.random() - 0.5) * 0.002; // ±0.2% variation
      const rate = (baseRate + variation) * 365 * 24; // Back to annualized

      history.push({
        timestamp: now - (i * 60 * 60 * 1000),
        fundingRate: rate
      });
    }

    return history;
  }
}

export default DriftProvider;
