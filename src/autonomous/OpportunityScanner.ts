/**
 * Opportunity Scanner - Find high-yield DeFi opportunities across Solana
 * Part of Solana AI Companion for Colosseum Agent Hackathon
 */

import { Connection, PublicKey } from '@solana/web3.js';
import KaminoProvider from '../services/KaminoProvider';
import DriftProvider from '../services/DriftProvider';

export interface Opportunity {
  id: string;
  protocol: 'Kamino' | 'Drift' | 'Raydium' | 'Meteora' | 'Jupiter' | 'Marinade';
  type: 'lending' | 'staking' | 'lp' | 'perpetuals' | 'arbitrage';
  asset: string;
  apy: number; // Annual Percentage Yield
  tvl: number; // Total Value Locked (USD)
  risk: number; // 0-100, higher = riskier
  liquidity: number; // USD available for this opportunity
  minDeposit: number; // Minimum deposit in USD
  lockPeriod: number; // Lock period in days (0 = no lock)
  description: string; // Human-readable description
  executionSteps: string[];
  estimatedReturn: {
    daily: number;
    weekly: number;
    monthly: number;
    yearly: number;
  };
  metadata: {
    url?: string;
    description?: string;
    lastUpdated: Date;
  };
}

export interface OpportunityScanResult {
  opportunities: Opportunity[];
  totalFound: number;
  highestAPY: Opportunity | null;
  lowestRisk: Opportunity | null;
  bestRiskAdjusted: Opportunity | null;
  scanTime: Date;
  nextScanIn: number; // milliseconds
}

export interface UserProfile {
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  minAPY: number;
  maxRisk: number;
  preferredProtocols: string[];
  minTVL: number;
}

export class OpportunityScanner {
  private connection: Connection;
  private kaminoProvider: KaminoProvider;
  private driftProvider: DriftProvider;
  private scanInterval: NodeJS.Timeout | null = null;
  private lastScan: Date | null = null;
  private cachedOpportunities: Opportunity[] = [];
  private useRealData: boolean;

  constructor(rpcUrl: string, useRealData: boolean = false) {
    this.connection = new Connection(rpcUrl, 'confirmed');
    this.kaminoProvider = new KaminoProvider(rpcUrl);
    this.driftProvider = new DriftProvider(rpcUrl);
    this.useRealData = useRealData;

    console.log(`[Opportunity Scanner] Initialized (${useRealData ? 'REAL DATA' : 'MOCK DATA'} mode)`);
  }

  /**
   * Scan all protocols for opportunities
   */
  async scanAll(userProfile?: UserProfile): Promise<OpportunityScanResult> {
    console.log('[Opportunity Scanner] Starting comprehensive scan...');
    const startTime = Date.now();

    try {
      // Scan all protocols in parallel
      const [
        kaminoOpps,
        driftOpps,
        lpOpps,
        stakingOpps
      ] = await Promise.all([
        this.scanKamino(),
        this.scanDrift(),
        this.scanLiquidityPools(),
        this.scanStaking()
      ]);

      // Combine all opportunities
      const allOpportunities = [
        ...kaminoOpps,
        ...driftOpps,
        ...lpOpps,
        ...stakingOpps
      ];

      // Filter by user profile if provided
      const filtered = userProfile
        ? this.filterByProfile(allOpportunities, userProfile)
        : allOpportunities;

      // Rank by risk-adjusted return
      const ranked = this.rankOpportunities(filtered);

      // Cache results
      this.cachedOpportunities = ranked;
      this.lastScan = new Date();

      const scanDuration = Date.now() - startTime;
      console.log(`[Opportunity Scanner] Scan complete: ${ranked.length} opportunities found in ${scanDuration}ms`);

      return {
        opportunities: ranked,
        totalFound: ranked.length,
        highestAPY: this.findHighestAPY(ranked),
        lowestRisk: this.findLowestRisk(ranked),
        bestRiskAdjusted: ranked[0] || null,
        scanTime: new Date(),
        nextScanIn: 15 * 60 * 1000 // 15 minutes
      };
    } catch (error) {
      console.error('[Opportunity Scanner] Scan failed:', error);
      throw error;
    }
  }

  /**
   * Scan Kamino lending opportunities
   */
  private async scanKamino(): Promise<Opportunity[]> {
    console.log('[Opportunity Scanner] Scanning Kamino...');

    if (this.useRealData) {
      try {
        // Use real Kamino data
        const kaminoOpps = await this.kaminoProvider.getLendingOpportunities();

        return kaminoOpps.map(opp => ({
          id: `kamino-${opp.asset.toLowerCase()}`,
          protocol: 'Kamino',
          type: 'lending',
          asset: opp.asset,
          apy: opp.apy,
          tvl: opp.tvl,
          risk: opp.risk,
          liquidity: opp.liquidity,
          minDeposit: opp.minDeposit,
          lockPeriod: 0,
          description: `Lend ${opp.asset} on Kamino ${opp.market} for ${opp.apy.toFixed(2)}% APY`,
          executionSteps: [
            'Connect wallet',
            `Approve ${opp.asset}`,
            `Deposit to Kamino ${opp.market}`,
            `Receive k${opp.asset} receipt tokens`
          ],
          estimatedReturn: {
            daily: opp.apy / 365,
            weekly: (opp.apy / 365) * 7,
            monthly: (opp.apy / 365) * 30,
            yearly: opp.apy
          },
          metadata: {
            url: 'https://app.kamino.finance/',
            description: `Lend ${opp.asset} in Kamino ${opp.market}`,
            lastUpdated: new Date()
          }
        }));
      } catch (error) {
        console.error('[Opportunity Scanner] Kamino real data failed, falling back to mock:', error);
        return this.getKaminoMockData();
      }
    }

    return this.getKaminoMockData();
  }

  /**
   * Get mock Kamino data (fallback)
   */
  private async getKaminoMockData(): Promise<Opportunity[]> {
    console.log('[Opportunity Scanner] Using Kamino mock data...');

    // Mock data - will be replaced with actual Kamino SDK integration
    const mockOpportunities: Opportunity[] = [
      {
        id: 'kamino-usdc-main',
        protocol: 'Kamino',
        type: 'lending',
        asset: 'USDC',
        apy: 8.5,
        tvl: 45000000,
        risk: 15,
        liquidity: 5000000,
        minDeposit: 10,
        lockPeriod: 0,
        description: 'Lend USDC on Kamino Main Market for 8.50% APY',
        executionSteps: [
          'Connect wallet',
          'Approve USDC',
          'Deposit to Kamino Main Market',
          'Receive kUSDC receipt tokens'
        ],
        estimatedReturn: {
          daily: 0.023,
          weekly: 0.16,
          monthly: 0.71,
          yearly: 8.5
        },
        metadata: {
          url: 'https://app.kamino.finance/',
          description: 'Lend USDC in Kamino Main Market',
          lastUpdated: new Date()
        }
      },
      {
        id: 'kamino-sol-main',
        protocol: 'Kamino',
        type: 'lending',
        asset: 'SOL',
        apy: 6.2,
        tvl: 120000000,
        risk: 25,
        liquidity: 8000000,
        minDeposit: 0.1,
        lockPeriod: 0,
        description: 'Lend SOL on Kamino Main Market for 6.20% APY',
        executionSteps: [
          'Connect wallet',
          'Deposit SOL to Kamino',
          'Receive kSOL receipt tokens',
          'Earn yield automatically'
        ],
        estimatedReturn: {
          daily: 0.017,
          weekly: 0.12,
          monthly: 0.52,
          yearly: 6.2
        },
        metadata: {
          url: 'https://app.kamino.finance/',
          description: 'Lend SOL in Kamino Main Market',
          lastUpdated: new Date()
        }
      }
    ];

    return mockOpportunities;
  }

  /**
   * Scan Drift perpetuals funding rates
   */
  private async scanDrift(): Promise<Opportunity[]> {
    console.log('[Opportunity Scanner] Scanning Drift...');

    if (this.useRealData) {
      try {
        // Use real Drift data
        const driftOpps = await this.driftProvider.getFundingOpportunities();

        return driftOpps.map(opp => ({
          id: `drift-${opp.market.toLowerCase().replace('-perp', '')}`,
          protocol: 'Drift',
          type: 'perpetuals',
          asset: opp.market,
          apy: opp.apy,
          tvl: opp.liquidity,
          risk: opp.risk,
          liquidity: opp.liquidity,
          minDeposit: opp.minCollateral,
          lockPeriod: 0,
          description: opp.description || `${opp.direction} ${opp.market} for ${opp.apy.toFixed(2)}% funding APY`,
          executionSteps: [
            'Connect wallet',
            'Deposit USDC as collateral',
            `Open ${opp.direction} ${opp.market} position`,
            'Collect funding payments'
          ],
          estimatedReturn: {
            daily: opp.apy / 365,
            weekly: (opp.apy / 365) * 7,
            monthly: (opp.apy / 365) * 30,
            yearly: opp.apy
          },
          metadata: {
            url: 'https://app.drift.trade/',
            description: opp.description,
            lastUpdated: new Date()
          }
        }));
      } catch (error) {
        console.error('[Opportunity Scanner] Drift real data failed, falling back to mock:', error);
        return this.getDriftMockData();
      }
    }

    return this.getDriftMockData();
  }

  /**
   * Get mock Drift data (fallback)
   */
  private getDriftMockData(): Opportunity[] {
    console.log('[Opportunity Scanner] Using Drift mock data...');

    const mockOpportunities: Opportunity[] = [
      {
        id: 'drift-sol-perp',
        protocol: 'Drift',
        type: 'perpetuals',
        asset: 'SOL-PERP',
        apy: 12.3, // Annualized funding rate
        tvl: 85000000,
        risk: 55, // Higher risk due to leverage
        liquidity: 3000000,
        minDeposit: 10,
        lockPeriod: 0,
        description: 'Earn SOL-PERP funding rate at 12.30% APY on Drift',
        executionSteps: [
          'Connect wallet',
          'Deposit USDC as collateral',
          'Open perpetual position',
          'Collect funding payments'
        ],
        estimatedReturn: {
          daily: 0.034,
          weekly: 0.24,
          monthly: 1.03,
          yearly: 12.3
        },
        metadata: {
          url: 'https://app.drift.trade/',
          description: 'Earn funding rate on SOL perpetual',
          lastUpdated: new Date()
        }
      }
    ];

    return mockOpportunities;
  }

  /**
   * Scan liquidity pool opportunities (Raydium, Meteora)
   */
  private async scanLiquidityPools(): Promise<Opportunity[]> {
    console.log('[Opportunity Scanner] Scanning LP pools...');

    const mockOpportunities: Opportunity[] = [
      {
        id: 'raydium-sol-usdc',
        protocol: 'Raydium',
        type: 'lp',
        asset: 'SOL-USDC',
        apy: 18.5,
        tvl: 95000000,
        risk: 45, // IL risk
        liquidity: 12000000,
        minDeposit: 20,
        lockPeriod: 0,
        description: 'Provide SOL-USDC liquidity on Raydium for 18.50% APY',
        executionSteps: [
          'Connect wallet',
          'Add liquidity (50% SOL, 50% USDC)',
          'Receive LP tokens',
          'Stake LP tokens for rewards'
        ],
        estimatedReturn: {
          daily: 0.051,
          weekly: 0.36,
          monthly: 1.54,
          yearly: 18.5
        },
        metadata: {
          url: 'https://raydium.io/',
          description: 'SOL-USDC liquidity pool on Raydium',
          lastUpdated: new Date()
        }
      }
    ];

    return mockOpportunities;
  }

  /**
   * Scan staking opportunities (Marinade, Jito, validators)
   */
  private async scanStaking(): Promise<Opportunity[]> {
    console.log('[Opportunity Scanner] Scanning staking...');

    const mockOpportunities: Opportunity[] = [
      {
        id: 'marinade-msol',
        protocol: 'Marinade',
        type: 'staking',
        asset: 'SOL',
        apy: 7.1,
        tvl: 580000000,
        risk: 10, // Very low risk
        liquidity: 50000000,
        minDeposit: 0.01,
        lockPeriod: 0, // Liquid staking
        description: 'Stake SOL with Marinade for 7.10% APY (liquid staking)',
        executionSteps: [
          'Connect wallet',
          'Stake SOL with Marinade',
          'Receive mSOL (liquid staking token)',
          'Use mSOL in DeFi or hold for yield'
        ],
        estimatedReturn: {
          daily: 0.019,
          weekly: 0.14,
          monthly: 0.59,
          yearly: 7.1
        },
        metadata: {
          url: 'https://marinade.finance/',
          description: 'Liquid stake SOL with Marinade',
          lastUpdated: new Date()
        }
      }
    ];

    return mockOpportunities;
  }

  /**
   * Filter opportunities by user profile
   */
  private filterByProfile(
    opportunities: Opportunity[],
    profile: UserProfile
  ): Opportunity[] {
    return opportunities.filter(opp => {
      // Check APY minimum
      if (opp.apy < profile.minAPY) return false;

      // Check risk maximum
      if (opp.risk > profile.maxRisk) return false;

      // Check TVL minimum (safety threshold)
      if (opp.tvl < profile.minTVL) return false;

      // Check preferred protocols
      if (profile.preferredProtocols.length > 0 &&
          !profile.preferredProtocols.includes(opp.protocol)) {
        return false;
      }

      return true;
    });
  }

  /**
   * Rank opportunities by risk-adjusted return
   */
  private rankOpportunities(opportunities: Opportunity[]): Opportunity[] {
    return opportunities.sort((a, b) => {
      const scoreA = this.calculateScore(a);
      const scoreB = this.calculateScore(b);
      return scoreB - scoreA; // Descending order
    });
  }

  /**
   * Calculate risk-adjusted score for an opportunity
   */
  private calculateScore(opp: Opportunity): number {
    // Sharpe-like ratio
    const returnScore = opp.apy / 100; // Normalize APY
    const riskPenalty = (opp.risk / 100) * 0.5; // Risk discount
    const liquidityBonus = Math.min(Math.log10(opp.tvl) / 10, 0.2); // Cap at 0.2
    const accessibilityBonus = opp.lockPeriod === 0 ? 0.1 : 0; // Prefer liquid

    return (returnScore - riskPenalty + liquidityBonus + accessibilityBonus) * 100;
  }

  /**
   * Find opportunity with highest APY
   */
  private findHighestAPY(opportunities: Opportunity[]): Opportunity | null {
    if (opportunities.length === 0) return null;
    return opportunities.reduce((max, opp) =>
      opp.apy > max.apy ? opp : max
    );
  }

  /**
   * Find opportunity with lowest risk
   */
  private findLowestRisk(opportunities: Opportunity[]): Opportunity | null {
    if (opportunities.length === 0) return null;
    return opportunities.reduce((min, opp) =>
      opp.risk < min.risk ? opp : min
    );
  }

  /**
   * Get opportunities matching specific criteria
   */
  async findOpportunities(criteria: {
    minAPY?: number;
    maxRisk?: number;
    protocol?: string;
    type?: string;
  }): Promise<Opportunity[]> {
    // Use cached results if recent (< 15 min)
    const cacheAge = this.lastScan
      ? Date.now() - this.lastScan.getTime()
      : Infinity;

    let opportunities = this.cachedOpportunities;

    // Refresh if cache is stale
    if (cacheAge > 15 * 60 * 1000) {
      const result = await this.scanAll();
      opportunities = result.opportunities;
    }

    // Apply filters
    return opportunities.filter(opp => {
      if (criteria.minAPY && opp.apy < criteria.minAPY) return false;
      if (criteria.maxRisk && opp.risk > criteria.maxRisk) return false;
      if (criteria.protocol && opp.protocol !== criteria.protocol) return false;
      if (criteria.type && opp.type !== criteria.type) return false;
      return true;
    });
  }

  /**
   * Start autonomous scanning (runs every 15 minutes)
   */
  startScanning(
    callback: (result: OpportunityScanResult) => void,
    userProfile?: UserProfile
  ): void {
    if (this.scanInterval) {
      console.warn('[Opportunity Scanner] Already scanning');
      return;
    }

    // Scan immediately
    this.scanAll(userProfile).then(callback);

    // Then scan every 15 minutes
    this.scanInterval = setInterval(() => {
      this.scanAll(userProfile).then(callback);
    }, 15 * 60 * 1000);

    console.log('[Opportunity Scanner] Started autonomous scanning (15min interval)');
  }

  /**
   * Stop autonomous scanning
   */
  stopScanning(): void {
    if (this.scanInterval) {
      clearInterval(this.scanInterval);
      this.scanInterval = null;
      console.log('[Opportunity Scanner] Stopped scanning');
    }
  }

  /**
   * Get cached opportunities (instant, no network call)
   */
  getCached(): Opportunity[] {
    return [...this.cachedOpportunities];
  }

  /**
   * Clear cache and force refresh
   */
  async refresh(userProfile?: UserProfile): Promise<OpportunityScanResult> {
    this.cachedOpportunities = [];
    this.lastScan = null;
    return this.scanAll(userProfile);
  }
}

export default OpportunityScanner;
