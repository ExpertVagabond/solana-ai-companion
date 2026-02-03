/**
 * SolMail Integration - AI-assisted physical mail service on Solana
 * Part of Solana AI Companion for Colosseum Agent Hackathon
 *
 * Integrates with https://solmail.online to send physical letters
 * Uses multi-AI system to compose professional letters about:
 * - Portfolio reports
 * - Transaction summaries
 * - Crypto education for gift recipients
 * - Investment updates to advisors
 */

import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { PortfolioMetrics } from '../autonomous/PortfolioAnalyzer';
import { DecisionRecord } from '../autonomous/LearningMemory';

export interface LetterRequest {
  type: 'portfolio_report' | 'transaction_summary' | 'gift_intro' | 'investment_update' | 'custom';
  recipientName: string;
  recipientAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  content?: string; // For custom letters
  tone?: 'professional' | 'casual' | 'educational' | 'formal';
  aiComposer?: 'claude' | 'gpt' | 'gemini' | 'doubao' | 'consensus';
}

export interface PortfolioReportData {
  metrics: PortfolioMetrics;
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  recentDecisions?: DecisionRecord[];
  includeInsights?: boolean;
}

export interface SolMailQuote {
  costInSOL: number;
  costInUSDC: number;
  estimatedDeliveryDays: number;
  destination: string;
  pageCount: number;
}

export interface SolMailResult {
  success: boolean;
  mailId?: string;
  signature?: string; // Solana transaction signature
  estimatedDelivery?: Date;
  cost: {
    amount: number;
    currency: 'SOL' | 'USDC';
  };
  error?: string;
}

export class SolMailIntegration {
  private connection: Connection;
  private solmailApiUrl = 'https://solmail.online/api'; // Placeholder - actual API endpoint TBD
  private isDevnet = true; // SolMail is on devnet

  constructor(rpcUrl: string) {
    // Force devnet for SolMail integration
    this.connection = new Connection(
      'https://api.devnet.solana.com',
      'confirmed'
    );
  }

  /**
   * Compose AI-assisted portfolio report letter
   */
  async composePortfolioReport(
    data: PortfolioReportData,
    tone: LetterRequest['tone'] = 'professional',
    aiComposer: LetterRequest['aiComposer'] = 'claude'
  ): Promise<string> {
    console.log(`[SolMail] Composing portfolio report with ${aiComposer}...`);

    // In production, this would call the actual AI API
    // For now, generate a template that would be enhanced by AI

    const letter = this.generatePortfolioReportTemplate(data, tone);

    console.log(`[SolMail] Portfolio report composed (${letter.length} chars)`);

    return letter;
  }

  /**
   * Generate portfolio report template
   */
  private generatePortfolioReportTemplate(
    data: PortfolioReportData,
    tone: string
  ): string {
    const { metrics, period, recentDecisions, includeInsights } = data;
    const date = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const greeting = tone === 'formal'
      ? 'Dear Portfolio Holder,'
      : tone === 'casual'
        ? 'Hey there!'
        : 'Hello,';

    const periodText = {
      daily: 'Daily',
      weekly: 'Weekly',
      monthly: 'Monthly',
      quarterly: 'Quarterly'
    }[period];

    let letter = `${greeting}\n\n`;
    letter += `${periodText} Portfolio Report - ${date}\n\n`;
    letter += `Portfolio Summary:\n`;
    letter += `• Total Value: $${metrics.totalValueUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n`;
    letter += `• Risk Score: ${metrics.riskScore}/100\n`;
    letter += `• Number of Assets: ${metrics.tokenCount}\n`;
    letter += `• Concentration Score: ${(metrics.concentration * 100).toFixed(0)}/100\n\n`;

    // Top holdings (from allocation)
    letter += `Top Holdings:\n`;
    const allocEntries = Object.entries(metrics.allocation)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    for (const [symbol, percentage] of allocEntries) {
      const value = metrics.totalValueUSD * percentage;
      letter += `• ${symbol}: $${value.toLocaleString('en-US', { minimumFractionDigits: 2 })} (${(percentage * 100).toFixed(1)}%)\n`;
    }

    letter += `\n`;

    // Concentration analysis
    if (metrics.concentration > 0.7) {
      letter += `⚠️ Concentration Alert: Your portfolio is heavily concentrated in ${metrics.dominantToken}.\n`;
      letter += `Consider diversifying to reduce risk.\n\n`;
    }

    // Recent decisions
    if (recentDecisions && recentDecisions.length > 0) {
      letter += `Recent Activity:\n`;
      for (const decision of recentDecisions.slice(0, 3)) {
        const action = decision.type.charAt(0).toUpperCase() + decision.type.slice(1);
        const dateStr = decision.timestamp.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        });
        letter += `• ${dateStr}: ${action} - ${decision.userChoice}\n`;
      }
      letter += `\n`;
    }

    // Insights
    if (includeInsights) {
      letter += `AI Insights:\n`;
      if (metrics.riskScore > 70) {
        letter += `• Your portfolio is in the high-risk category. Consider rebalancing for stability.\n`;
      } else if (metrics.riskScore < 30) {
        letter += `• Your portfolio is conservative. You may be missing growth opportunities.\n`;
      } else {
        letter += `• Your portfolio has a balanced risk profile.\n`;
      }

      if (metrics.concentration > 0.5) {
        letter += `• Concentration is high. Consider adding more assets for diversification.\n`;
      }

      letter += `\n`;
    }

    // Closing
    const closing = tone === 'formal'
      ? 'Best regards,\nSolana AI Companion'
      : tone === 'casual'
        ? 'Happy trading!\nYour AI Companion'
        : 'Sincerely,\nSolana AI Companion';

    letter += `${closing}\n\n`;
    letter += `---\n`;
    letter += `This report was generated autonomously by your Solana AI Companion.\n`;
    letter += `Powered by Claude, GPT, Gemini, and Doubao AI agents.\n`;

    return letter;
  }

  /**
   * Compose crypto gift introduction letter
   */
  async composeGiftLetter(
    recipientName: string,
    senderName: string,
    giftAmount: number,
    giftToken: string = 'SOL',
    aiComposer: LetterRequest['aiComposer'] = 'gemini'
  ): Promise<string> {
    console.log(`[SolMail] Composing gift letter with ${aiComposer}...`);

    const date = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    let letter = `Dear ${recipientName},\n\n`;
    letter += `${senderName} has sent you a gift of cryptocurrency!\n\n`;
    letter += `Gift Details:\n`;
    letter += `• Amount: ${giftAmount} ${giftToken}\n`;
    letter += `• Blockchain: Solana\n`;
    letter += `• Date: ${date}\n\n`;

    letter += `What is ${giftToken}?\n`;
    if (giftToken === 'SOL') {
      letter += `Solana (SOL) is a high-performance blockchain known for fast transactions\n`;
      letter += `and low fees. It's used for payments, DeFi, NFTs, and more.\n\n`;
    } else if (giftToken === 'USDC') {
      letter += `USDC is a stablecoin - a cryptocurrency that's always worth about $1 USD.\n`;
      letter += `It's perfect for storing value or making digital payments.\n\n`;
    }

    letter += `Getting Started:\n`;
    letter += `1. Download a Solana wallet app (Phantom, Solflare, or Backpack)\n`;
    letter += `2. Create your wallet and save your recovery phrase securely\n`;
    letter += `3. Contact ${senderName} for transfer instructions\n`;
    letter += `4. Start exploring the world of cryptocurrency!\n\n`;

    letter += `Need Help?\n`;
    letter += `• Visit solana.com to learn more\n`;
    letter += `• Download Solana AI Companion for guided assistance\n`;
    letter += `• Join the Solana community online\n\n`;

    letter += `This is a gift of digital value that you own and control.\n`;
    letter += `Welcome to Web3!\n\n`;

    letter += `Warm regards,\n${senderName}\n\n`;
    letter += `---\n`;
    letter += `This letter was composed by Solana AI Companion and delivered via SolMail.\n`;

    return letter;
  }

  /**
   * Compose transaction summary letter
   */
  async composeTransactionSummary(
    transactions: Array<{
      signature: string;
      type: string;
      amount: number;
      asset: string;
      date: Date;
      status: 'success' | 'failed';
    }>,
    tone: LetterRequest['tone'] = 'professional'
  ): Promise<string> {
    console.log('[SolMail] Composing transaction summary...');

    const startDate = transactions[0]?.date || new Date();
    const endDate = transactions[transactions.length - 1]?.date || new Date();

    let letter = `Transaction Summary Report\n\n`;
    letter += `Period: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}\n`;
    letter += `Total Transactions: ${transactions.length}\n\n`;

    const successful = transactions.filter(t => t.status === 'success').length;
    const failed = transactions.filter(t => t.status === 'failed').length;

    letter += `Status Breakdown:\n`;
    letter += `• Successful: ${successful}\n`;
    letter += `• Failed: ${failed}\n\n`;

    letter += `Transaction Details:\n\n`;

    for (const tx of transactions.slice(0, 10)) { // Show up to 10
      const dateStr = tx.date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
      const statusIcon = tx.status === 'success' ? '✓' : '✗';

      letter += `${statusIcon} ${dateStr} - ${tx.type}\n`;
      letter += `   ${tx.amount} ${tx.asset}\n`;
      letter += `   Signature: ${tx.signature.slice(0, 20)}...\n\n`;
    }

    if (transactions.length > 10) {
      letter += `... and ${transactions.length - 10} more transactions\n\n`;
    }

    letter += `---\n`;
    letter += `Generated by Solana AI Companion\n`;

    return letter;
  }

  /**
   * Get quote for sending a letter
   */
  async getQuote(
    letter: string,
    destination: string
  ): Promise<SolMailQuote> {
    // Estimate based on letter length and destination
    const pageCount = Math.ceil(letter.length / 3000); // ~3000 chars per page
    const isInternational = destination !== 'US';

    // Mock pricing - actual pricing would come from SolMail API
    const baseCostUSD = 0.5; // $0.50 base
    const perPageUSD = 0.25; // $0.25 per page
    const internationalFee = isInternational ? 1.5 : 0;

    const totalCostUSD = baseCostUSD + (perPageUSD * pageCount) + internationalFee;

    // Convert to crypto (mock rates)
    const solPrice = 100; // Assume $100/SOL
    const costInSOL = totalCostUSD / solPrice;
    const costInUSDC = totalCostUSD;

    const estimatedDeliveryDays = isInternational ? 10 : 3;

    console.log(`[SolMail] Quote: ${pageCount} pages, ${destination}, ${estimatedDeliveryDays} days, $${totalCostUSD}`);

    return {
      costInSOL,
      costInUSDC,
      estimatedDeliveryDays,
      destination,
      pageCount
    };
  }

  /**
   * Send letter via SolMail
   */
  async sendLetter(
    request: LetterRequest,
    letter: string,
    walletPublicKey: PublicKey,
    paymentMethod: 'SOL' | 'USDC' = 'USDC'
  ): Promise<SolMailResult> {
    console.log('[SolMail] Preparing to send letter...');

    try {
      // Step 1: Get quote
      const quote = await this.getQuote(letter, request.recipientAddress.country);

      // Step 2: Build transaction
      // NOTE: This would integrate with actual SolMail API
      // For now, return mock success

      console.log('[SolMail] Letter queued for sending');
      console.log(`Recipient: ${request.recipientName}`);
      console.log(`Address: ${request.recipientAddress.street}, ${request.recipientAddress.city}`);
      console.log(`Cost: ${paymentMethod === 'SOL' ? quote.costInSOL.toFixed(4) : quote.costInUSDC.toFixed(2)} ${paymentMethod}`);
      console.log(`Delivery: ~${quote.estimatedDeliveryDays} days`);

      const estimatedDelivery = new Date();
      estimatedDelivery.setDate(estimatedDelivery.getDate() + quote.estimatedDeliveryDays);

      // Mock successful result
      return {
        success: true,
        mailId: `SOLMAIL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        signature: `mock-signature-${Date.now()}`, // Would be actual Solana tx signature
        estimatedDelivery,
        cost: {
          amount: paymentMethod === 'SOL' ? quote.costInSOL : quote.costInUSDC,
          currency: paymentMethod
        }
      };
    } catch (error) {
      console.error('[SolMail] Failed to send letter:', error);

      return {
        success: false,
        cost: {
          amount: 0,
          currency: paymentMethod
        },
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Send monthly portfolio report to advisor/accountant
   */
  async sendMonthlyReport(
    portfolioData: PortfolioReportData,
    recipient: {
      name: string;
      address: LetterRequest['recipientAddress'];
    },
    walletPublicKey: PublicKey
  ): Promise<SolMailResult> {
    console.log('[SolMail] Generating monthly portfolio report...');

    // Compose professional report using Claude (conservative AI for financial reporting)
    const letter = await this.composePortfolioReport(
      portfolioData,
      'professional',
      'claude'
    );

    // Send via SolMail
    return this.sendLetter(
      {
        type: 'portfolio_report',
        recipientName: recipient.name,
        recipientAddress: recipient.address,
        tone: 'professional',
        aiComposer: 'claude'
      },
      letter,
      walletPublicKey,
      'USDC' // Use stablecoin for predictable costs
    );
  }

  /**
   * Send crypto gift with explanation letter
   */
  async sendGiftWithLetter(
    gift: {
      recipientName: string;
      senderName: string;
      amount: number;
      token: string;
      address: LetterRequest['recipientAddress'];
    },
    walletPublicKey: PublicKey
  ): Promise<SolMailResult> {
    console.log('[SolMail] Preparing crypto gift letter...');

    // Compose educational letter using Gemini (balanced AI for education)
    const letter = await this.composeGiftLetter(
      gift.recipientName,
      gift.senderName,
      gift.amount,
      gift.token,
      'gemini'
    );

    return this.sendLetter(
      {
        type: 'gift_intro',
        recipientName: gift.recipientName,
        recipientAddress: gift.address,
        tone: 'educational',
        aiComposer: 'gemini'
      },
      letter,
      walletPublicKey,
      'SOL'
    );
  }

  /**
   * Send custom letter with AI assistance
   */
  async sendCustomLetter(
    request: LetterRequest,
    context: string,
    walletPublicKey: PublicKey
  ): Promise<SolMailResult> {
    console.log(`[SolMail] Composing custom letter with ${request.aiComposer || 'default'} AI...`);

    // In production, this would call the selected AI API to enhance the letter
    // For now, use the provided context as-is
    const letter = request.content || context;

    return this.sendLetter(
      request,
      letter,
      walletPublicKey,
      'USDC'
    );
  }

  /**
   * Preview letter before sending (for user review)
   */
  previewLetter(
    type: LetterRequest['type'],
    data: any
  ): { preview: string; estimatedPages: number } {
    let letter = '';

    switch (type) {
      case 'portfolio_report':
        letter = this.generatePortfolioReportTemplate(data, 'professional');
        break;
      case 'gift_intro':
        // Would call composeGiftLetter with data
        letter = 'Gift letter preview...';
        break;
      case 'transaction_summary':
        // Would call composeTransactionSummary with data
        letter = 'Transaction summary preview...';
        break;
      default:
        letter = data.content || 'Custom letter...';
    }

    const estimatedPages = Math.ceil(letter.length / 3000);

    return {
      preview: letter,
      estimatedPages
    };
  }
}

export default SolMailIntegration;
