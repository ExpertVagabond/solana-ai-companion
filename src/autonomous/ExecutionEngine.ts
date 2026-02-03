/**
 * Execution Engine - Optimal trade execution with MEV protection
 * Part of Solana AI Companion for Colosseum Agent Hackathon
 */

import { Connection, PublicKey, Transaction, VersionedTransaction } from '@solana/web3.js';

export interface SwapRequest {
  from: string; // Token mint address
  to: string; // Token mint address
  amount: number; // Amount in smallest units
  slippage?: number; // Basis points (50 = 0.5%)
  priorityFee?: number; // Microlamports
  useMEVProtection?: boolean; // Use Jito bundles
}

export interface SwapQuote {
  inputMint: string;
  outputMint: string;
  inAmount: number;
  outAmount: number;
  priceImpact: number; // Percentage
  route: RouteStep[];
  estimatedFee: number; // Lamports
  slippage: number; // Basis points
}

export interface RouteStep {
  protocol: string; // e.g., "Raydium", "Orca"
  poolAddress: string;
  inputMint: string;
  outputMint: string;
  inAmount: number;
  outAmount: number;
}

export interface ExecutionResult {
  signature: string;
  success: boolean;
  route: RouteStep[];
  actualOutput?: number;
  mevProtected: boolean;
  executionTime: number; // milliseconds
  priorityFee: number;
  error?: string;
}

export interface ExecutionSettings {
  defaultSlippage: number; // Basis points
  maxSlippage: number; // Basis points
  minPriorityFee: number; // Microlamports
  maxPriorityFee: number; // Microlamports
  mevProtectionThreshold: number; // USD value above which to use Jito
  simulateBeforeExecute: boolean;
}

export class ExecutionEngine {
  private connection: Connection;
  private settings: ExecutionSettings;
  private jupiterApiUrl = 'https://quote-api.jup.ag/v6';
  private jitoApiUrl = 'https://mainnet.block-engine.jito.wtf/api/v1';

  constructor(
    rpcUrl: string,
    settings?: Partial<ExecutionSettings>
  ) {
    this.connection = new Connection(rpcUrl, 'confirmed');

    this.settings = {
      defaultSlippage: 50, // 0.5%
      maxSlippage: 500, // 5%
      minPriorityFee: 1000, // 0.000001 SOL
      maxPriorityFee: 1000000, // 0.001 SOL
      mevProtectionThreshold: 1000, // $1000+
      simulateBeforeExecute: true,
      ...settings
    };
  }

  /**
   * Get best swap quote from Jupiter V6
   */
  async getQuote(request: SwapRequest): Promise<SwapQuote> {
    try {
      const slippage = request.slippage || this.settings.defaultSlippage;

      // Jupiter V6 quote API
      const params = new URLSearchParams({
        inputMint: request.from,
        outputMint: request.to,
        amount: request.amount.toString(),
        slippageBps: slippage.toString(),
        onlyDirectRoutes: 'false',
        asLegacyTransaction: 'false'
      });

      const response = await fetch(`${this.jupiterApiUrl}/quote?${params}`);

      if (!response.ok) {
        throw new Error(`Jupiter API error: ${response.statusText}`);
      }

      const data = await response.json();

      // Parse Jupiter response
      const quote: SwapQuote = {
        inputMint: data.inputMint,
        outputMint: data.outputMint,
        inAmount: parseInt(data.inAmount),
        outAmount: parseInt(data.outAmount),
        priceImpact: parseFloat(data.priceImpactPct),
        route: this.parseRoute(data.routePlan),
        estimatedFee: data.contextSlot ? 5000 : 5000, // Estimate
        slippage
      };

      console.log(`[Execution Engine] Quote: ${quote.inAmount} → ${quote.outAmount} (impact: ${quote.priceImpact.toFixed(3)}%)`);

      return quote;
    } catch (error) {
      console.error('[Execution Engine] Quote failed:', error);
      throw error;
    }
  }

  /**
   * Parse Jupiter route plan
   */
  private parseRoute(routePlan: any[]): RouteStep[] {
    if (!routePlan || routePlan.length === 0) return [];

    return routePlan.map((step: any) => ({
      protocol: step.swapInfo?.label || 'Unknown',
      poolAddress: step.swapInfo?.ammKey || '',
      inputMint: step.swapInfo?.inputMint || '',
      outputMint: step.swapInfo?.outputMint || '',
      inAmount: parseInt(step.swapInfo?.inAmount || '0'),
      outAmount: parseInt(step.swapInfo?.outAmount || '0')
    }));
  }

  /**
   * Execute swap with optimal routing and MEV protection
   */
  async executeSwap(
    request: SwapRequest,
    walletPublicKey: PublicKey
  ): Promise<ExecutionResult> {
    const startTime = Date.now();

    try {
      console.log('[Execution Engine] Starting swap execution...');

      // Step 1: Get best quote
      const quote = await this.getQuote(request);

      // Step 2: Assess MEV risk
      const mevRisk = this.assessMEVRisk(quote);
      const useMEVProtection = request.useMEVProtection ?? (mevRisk > 0.3);

      // Step 3: Calculate optimal priority fee
      const priorityFee = request.priorityFee ||
        await this.calculateOptimalPriorityFee();

      // Step 4: Build transaction
      const transaction = await this.buildSwapTransaction(
        quote,
        walletPublicKey,
        priorityFee
      );

      // Step 5: Simulate if enabled
      if (this.settings.simulateBeforeExecute) {
        await this.simulateTransaction(transaction);
      }

      // Step 6: Execute (with or without MEV protection)
      const signature = useMEVProtection
        ? await this.executeViaJito(transaction)
        : await this.executeDirectly(transaction);

      const executionTime = Date.now() - startTime;

      console.log(`[Execution Engine] Swap executed: ${signature} (${executionTime}ms)`);

      return {
        signature,
        success: true,
        route: quote.route,
        mevProtected: useMEVProtection,
        executionTime,
        priorityFee,
        actualOutput: quote.outAmount
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      console.error('[Execution Engine] Execution failed:', error);

      return {
        signature: '',
        success: false,
        route: [],
        mevProtected: false,
        executionTime,
        priorityFee: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Assess MEV risk for a swap
   */
  private assessMEVRisk(quote: SwapQuote): number {
    // Factors that increase MEV risk:
    // 1. High price impact
    // 2. Large trade size
    // 3. Illiquid pools

    let risk = 0;

    // Price impact risk (0-0.4)
    if (quote.priceImpact > 5) risk += 0.4;
    else if (quote.priceImpact > 2) risk += 0.3;
    else if (quote.priceImpact > 1) risk += 0.2;
    else if (quote.priceImpact > 0.5) risk += 0.1;

    // Multi-hop risk (0-0.3)
    if (quote.route.length > 3) risk += 0.3;
    else if (quote.route.length > 2) risk += 0.2;
    else if (quote.route.length > 1) risk += 0.1;

    // Slippage risk (0-0.3)
    if (quote.slippage > 300) risk += 0.3; // >3%
    else if (quote.slippage > 100) risk += 0.2; // >1%
    else if (quote.slippage > 50) risk += 0.1; // >0.5%

    return Math.min(1, risk);
  }

  /**
   * Calculate optimal priority fee based on network conditions
   */
  private async calculateOptimalPriorityFee(): Promise<number> {
    try {
      // Get recent priority fees from recent blocks
      const recentFees = await this.getRecentPriorityFees();

      // Use 75th percentile for reliable confirmation
      const p75 = this.percentile(recentFees, 75);

      // Clamp to min/max settings
      return Math.max(
        this.settings.minPriorityFee,
        Math.min(p75, this.settings.maxPriorityFee)
      );
    } catch (error) {
      console.warn('[Execution Engine] Could not fetch priority fees, using default');
      return this.settings.minPriorityFee;
    }
  }

  /**
   * Get recent priority fees from the network
   */
  private async getRecentPriorityFees(): Promise<number[]> {
    // TODO: Implement actual priority fee sampling from recent blocks
    // For now, return reasonable defaults
    return [
      1000, 2000, 5000, 10000, 15000, 20000, 25000, 30000
    ];
  }

  /**
   * Calculate percentile of an array
   */
  private percentile(arr: number[], p: number): number {
    if (arr.length === 0) return 0;

    const sorted = [...arr].sort((a, b) => a - b);
    const index = Math.ceil((p / 100) * sorted.length) - 1;

    return sorted[Math.max(0, index)];
  }

  /**
   * Build swap transaction using Jupiter V6
   */
  private async buildSwapTransaction(
    quote: SwapQuote,
    walletPublicKey: PublicKey,
    priorityFee: number
  ): Promise<VersionedTransaction> {
    try {
      // Jupiter V6 swap API
      const response = await fetch(`${this.jupiterApiUrl}/swap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quoteResponse: quote,
          userPublicKey: walletPublicKey.toString(),
          wrapAndUnwrapSol: true,
          computeUnitPriceMicroLamports: priorityFee,
          dynamicComputeUnitLimit: true
        })
      });

      if (!response.ok) {
        throw new Error(`Jupiter swap API error: ${response.statusText}`);
      }

      const { swapTransaction } = await response.json();

      // Deserialize transaction
      const transactionBuf = Buffer.from(swapTransaction, 'base64');
      const transaction = VersionedTransaction.deserialize(transactionBuf);

      return transaction;
    } catch (error) {
      console.error('[Execution Engine] Failed to build transaction:', error);
      throw error;
    }
  }

  /**
   * Simulate transaction before execution
   */
  private async simulateTransaction(
    transaction: VersionedTransaction
  ): Promise<void> {
    try {
      const simulation = await this.connection.simulateTransaction(transaction);

      if (simulation.value.err) {
        throw new Error(
          `Simulation failed: ${JSON.stringify(simulation.value.err)}`
        );
      }

      console.log('[Execution Engine] Simulation successful');
    } catch (error) {
      console.error('[Execution Engine] Simulation failed:', error);
      throw error;
    }
  }

  /**
   * Execute transaction directly (no MEV protection)
   */
  private async executeDirectly(
    transaction: VersionedTransaction
  ): Promise<string> {
    // NOTE: This would require wallet signing via Mobile Wallet Adapter
    // For now, this is a placeholder showing the flow

    console.log('[Execution Engine] Executing directly...');

    // In real implementation:
    // 1. Sign with Mobile Wallet Adapter
    // 2. Send via connection.sendTransaction
    // 3. Confirm with connection.confirmTransaction

    // Placeholder
    throw new Error('Requires wallet signature - integrate with Mobile Wallet Adapter');
  }

  /**
   * Execute transaction via Jito bundle (MEV protection)
   */
  private async executeViaJito(
    transaction: VersionedTransaction
  ): Promise<string> {
    console.log('[Execution Engine] Executing via Jito bundle for MEV protection...');

    // NOTE: Jito bundle implementation
    // For now, this is a placeholder

    try {
      // In real implementation:
      // 1. Sign transaction
      // 2. Create Jito bundle
      // 3. Send to Jito block engine
      // 4. Wait for bundle confirmation

      // Placeholder
      throw new Error('Jito bundle requires wallet signature and Jito SDK integration');
    } catch (error) {
      console.error('[Execution Engine] Jito execution failed:', error);
      throw error;
    }
  }

  /**
   * Get multiple quotes for comparison
   */
  async compareRoutes(request: SwapRequest): Promise<SwapQuote[]> {
    // Get quotes with different parameters
    const quotes = await Promise.all([
      this.getQuote({ ...request, slippage: 50 }),  // 0.5%
      this.getQuote({ ...request, slippage: 100 }), // 1%
      this.getQuote({ ...request, slippage: 200 })  // 2%
    ]);

    // Sort by best output amount
    return quotes.sort((a, b) => b.outAmount - a.outAmount);
  }

  /**
   * Estimate swap output
   */
  async estimateOutput(
    fromMint: string,
    toMint: string,
    amount: number
  ): Promise<number> {
    const quote = await this.getQuote({
      from: fromMint,
      to: toMint,
      amount
    });

    return quote.outAmount;
  }

  /**
   * Check if swap is executable
   */
  async validateSwap(request: SwapRequest): Promise<{
    valid: boolean;
    reason?: string;
  }> {
    try {
      const quote = await this.getQuote(request);

      // Check price impact
      if (quote.priceImpact > 10) {
        return {
          valid: false,
          reason: `Price impact too high: ${quote.priceImpact.toFixed(2)}% (max 10%)`
        };
      }

      // Check slippage
      if (quote.slippage > this.settings.maxSlippage) {
        return {
          valid: false,
          reason: `Slippage too high: ${quote.slippage}bps (max ${this.settings.maxSlippage}bps)`
        };
      }

      return { valid: true };
    } catch (error) {
      return {
        valid: false,
        reason: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Update execution settings
   */
  updateSettings(newSettings: Partial<ExecutionSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    console.log('[Execution Engine] Settings updated:', this.settings);
  }

  /**
   * Get current settings
   */
  getSettings(): ExecutionSettings {
    return { ...this.settings };
  }
}

export default ExecutionEngine;
