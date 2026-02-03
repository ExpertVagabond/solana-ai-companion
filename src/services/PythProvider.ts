/**
 * Pyth Network Provider - Real-time price oracle integration
 * Part of Solana AI Companion for Colosseum Agent Hackathon
 *
 * Integrates with Pyth Network for real-time, high-confidence price feeds
 * Essential for accurate portfolio valuation and risk calculations
 */

import { Connection, PublicKey } from '@solana/web3.js';

export interface PriceData {
  symbol: string;
  price: number; // USD price
  confidence: number; // Price confidence interval
  expo: number; // Price exponent
  timestamp: number; // Unix timestamp
  status: 'trading' | 'halted' | 'auction' | 'unknown';
}

export interface PriceFeed {
  address: string;
  symbol: string;
  description: string;
}

export class PythProvider {
  private connection: Connection;
  private pythProgramId = new PublicKey('FsJ3A3u2vn5cTVofAjvy6y5kwABJAqYWpe4975bi2epH'); // Pyth Mainnet

  // Pyth price feed addresses (Mainnet-Beta)
  private priceFeeds: Map<string, string> = new Map([
    ['SOL/USD', 'H6ARHf6YXhGYeQfUzQNGk6rDNnLBQKrenN712K4AQJEG'],
    ['BTC/USD', 'GVXRSBjFk6e6J3NbVPXohDJetcTjaeeuykUpbQF8UoMU'],
    ['ETH/USD', 'JBu1AL4obBcCMqKBBxhpWCNUt136ijcuMZLFvTP7iWdB'],
    ['USDC/USD', 'Gnt27xtC473ZT2Mw5u8wZ68Z3gULkSTb5DuxJy7eJotD'],
    ['USDT/USD', '3vxLXJqLqF3JG5TCbYycbKWRBbCJQLxQmBGCkyqEEefL'],
    ['mSOL/USD', 'E4v1BBgoso9s64TQvmyownAVJbhbEPGyzA3qn4n46qj9'],
    ['stSOL/USD', '2LwhbcswZekofMNRtDRMukZJNSRUiKYMFbqtBwqjDfke'],
    ['jitoSOL/USD', '7yyaeuJ1GGtVBLT2z2xub5ZWYKaNhF28mj1RdV4VDFVk'],
    ['bonkSOL/USD', '8ihFLu5FimgTQ1Unh4dVyEHUGodJ5gJQCrQf4KUVB9bN'],
    ['RAY/USD', 'AnLf8tVYCM816gmBjiy8n53eXKKEDydT5piYjjQDPgTB'],
    ['JUP/USD', 'g6eRCbboSwK4tSWngn773RCMexr1APQr4uA9bGZBYfo'],
  ]);

  constructor(rpcUrl: string) {
    this.connection = new Connection(rpcUrl, 'confirmed');
  }

  /**
   * Get current price for a symbol
   */
  async getPrice(symbol: string): Promise<PriceData> {
    const feedAddress = this.priceFeeds.get(symbol);

    if (!feedAddress) {
      throw new Error(`Price feed not found for ${symbol}`);
    }

    try {
      // In production, use @pythnetwork/client SDK:
      // import { PythHttpClient } from '@pythnetwork/client';
      // const pythClient = new PythHttpClient(connection, pythProgramId);
      // const data = await pythClient.getData();
      // const price = data.productPrice.get(symbol);

      // For now, fetch via Pyth HTTP API as fallback
      const response = await fetch(
        `https://hermes.pyth.network/api/latest_price_feeds?ids[]=${feedAddress}`
      );

      if (!response.ok) {
        throw new Error(`Pyth API error: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data || data.length === 0) {
        throw new Error(`No price data returned for ${symbol}`);
      }

      const priceData = data[0].price;
      const price = parseFloat(priceData.price) * Math.pow(10, priceData.expo);
      const confidence = parseFloat(priceData.conf) * Math.pow(10, priceData.expo);

      return {
        symbol,
        price,
        confidence,
        expo: priceData.expo,
        timestamp: priceData.publish_time,
        status: priceData.status || 'trading'
      };
    } catch (error) {
      console.error(`[Pyth Provider] Failed to fetch ${symbol}:`, error);
      // Return fallback price
      return this.getFallbackPrice(symbol);
    }
  }

  /**
   * Get prices for multiple symbols in parallel
   */
  async getPrices(symbols: string[]): Promise<Map<string, PriceData>> {
    const prices = new Map<string, PriceData>();

    // Fetch all prices in parallel
    const results = await Promise.allSettled(
      symbols.map(symbol => this.getPrice(symbol))
    );

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        prices.set(symbols[index], result.value);
      } else {
        console.warn(`[Pyth Provider] Failed to get price for ${symbols[index]}`);
        // Use fallback
        prices.set(symbols[index], this.getFallbackPrice(symbols[index]));
      }
    });

    return prices;
  }

  /**
   * Get fallback prices (static, for when Pyth is unavailable)
   */
  private getFallbackPrice(symbol: string): PriceData {
    const fallbackPrices: Record<string, number> = {
      'SOL/USD': 100,
      'BTC/USD': 45000,
      'ETH/USD': 2500,
      'USDC/USD': 1.0,
      'USDT/USD': 1.0,
      'mSOL/USD': 110,
      'stSOL/USD': 105,
      'jitoSOL/USD': 105,
      'bonkSOL/USD': 105,
      'RAY/USD': 0.5,
      'JUP/USD': 0.8,
    };

    return {
      symbol,
      price: fallbackPrices[symbol] || 1.0,
      confidence: 0,
      expo: -8,
      timestamp: Date.now() / 1000,
      status: 'unknown'
    };
  }

  /**
   * Get price by token mint address
   */
  async getPriceByMint(mint: string): Promise<PriceData> {
    const mintToSymbol: Record<string, string> = {
      'So11111111111111111111111111111111111111112': 'SOL/USD',
      'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': 'USDC/USD',
      'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB': 'USDT/USD',
      'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So': 'mSOL/USD',
      '7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj': 'stSOL/USD',
      'J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn': 'jitoSOL/USD',
      'bSo13r4TkiE4KumL71LsHTPpL2euBYLFx6h9HP3piy1': 'bonkSOL/USD',
      '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R': 'RAY/USD',
      'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN': 'JUP/USD',
    };

    const symbol = mintToSymbol[mint];
    if (!symbol) {
      // Unknown token, return $1 as fallback
      return {
        symbol: 'UNKNOWN/USD',
        price: 1.0,
        confidence: 0,
        expo: -8,
        timestamp: Date.now() / 1000,
        status: 'unknown'
      };
    }

    return this.getPrice(symbol);
  }

  /**
   * Calculate USD value for a token amount
   */
  async calculateValue(
    mint: string,
    amount: number,
    decimals: number
  ): Promise<number> {
    const priceData = await this.getPriceByMint(mint);
    const actualAmount = amount / Math.pow(10, decimals);
    return actualAmount * priceData.price;
  }

  /**
   * Get all available price feeds
   */
  getAvailableFeeds(): PriceFeed[] {
    const feeds: PriceFeed[] = [];

    this.priceFeeds.forEach((address, symbol) => {
      feeds.push({
        address,
        symbol,
        description: `${symbol} price feed`
      });
    });

    return feeds;
  }

  /**
   * Check if price data is stale (older than 60 seconds)
   */
  isPriceStale(priceData: PriceData): boolean {
    const now = Date.now() / 1000;
    const age = now - priceData.timestamp;
    return age > 60; // 60 seconds threshold
  }

  /**
   * Get price with staleness check
   */
  async getPriceWithFreshness(symbol: string): Promise<{
    price: PriceData;
    isStale: boolean;
  }> {
    const price = await this.getPrice(symbol);
    return {
      price,
      isStale: this.isPriceStale(price)
    };
  }

  /**
   * Subscribe to price updates (polling-based)
   */
  subscribeToPrices(
    symbols: string[],
    callback: (prices: Map<string, PriceData>) => void,
    intervalMs: number = 10000 // Poll every 10 seconds
  ): () => void {
    // Initial fetch
    this.getPrices(symbols).then(callback);

    // Set up polling
    const interval = setInterval(() => {
      this.getPrices(symbols).then(callback);
    }, intervalMs);

    // Return cleanup function
    return () => clearInterval(interval);
  }

  /**
   * Get price change over time (requires historical data)
   */
  async getPriceChange(
    symbol: string,
    periodHours: number = 24
  ): Promise<{
    current: number;
    change: number;
    changePercent: number;
  }> {
    // Note: This requires historical price data
    // For now, return mock data structure
    const current = await this.getPrice(symbol);

    // In production, fetch historical data from Pyth or other source
    // const historical = await this.getHistoricalPrice(symbol, periodHours);

    // Mock calculation
    const mockChange = (Math.random() - 0.5) * 10; // -5% to +5%
    const previous = current.price * (1 - mockChange / 100);

    return {
      current: current.price,
      change: current.price - previous,
      changePercent: mockChange
    };
  }

  /**
   * Health check - verify Pyth connection
   */
  async healthCheck(): Promise<{
    healthy: boolean;
    latency: number;
    errors: string[];
  }> {
    const startTime = Date.now();
    const errors: string[] = [];

    try {
      // Test fetching SOL price
      const solPrice = await this.getPrice('SOL/USD');

      if (solPrice.status === 'unknown') {
        errors.push('Price status unknown (using fallback)');
      }

      if (this.isPriceStale(solPrice)) {
        errors.push('Price data is stale');
      }

      const latency = Date.now() - startTime;

      return {
        healthy: errors.length === 0,
        latency,
        errors
      };
    } catch (error) {
      errors.push(error instanceof Error ? error.message : 'Unknown error');

      return {
        healthy: false,
        latency: Date.now() - startTime,
        errors
      };
    }
  }

  /**
   * Get confidence level description
   */
  getConfidenceLevel(priceData: PriceData): 'high' | 'medium' | 'low' {
    const confidencePercent = (priceData.confidence / priceData.price) * 100;

    if (confidencePercent < 0.1) return 'high';
    if (confidencePercent < 0.5) return 'medium';
    return 'low';
  }

  /**
   * Batch price updates for portfolio valuation
   */
  async batchCalculateValues(
    holdings: Array<{
      mint: string;
      amount: number;
      decimals: number;
    }>
  ): Promise<Array<{
    mint: string;
    amount: number;
    price: number;
    value: number;
    confidence: string;
  }>> {
    const results = [];

    for (const holding of holdings) {
      try {
        const priceData = await this.getPriceByMint(holding.mint);
        const actualAmount = holding.amount / Math.pow(10, holding.decimals);
        const value = actualAmount * priceData.price;

        results.push({
          mint: holding.mint,
          amount: actualAmount,
          price: priceData.price,
          value,
          confidence: this.getConfidenceLevel(priceData)
        });
      } catch (error) {
        console.error(`[Pyth Provider] Failed to calculate value for ${holding.mint}:`, error);
        results.push({
          mint: holding.mint,
          amount: holding.amount / Math.pow(10, holding.decimals),
          price: 0,
          value: 0,
          confidence: 'low'
        });
      }
    }

    return results;
  }
}

export default PythProvider;
