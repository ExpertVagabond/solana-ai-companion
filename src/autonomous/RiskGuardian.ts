/**
 * Risk Guardian - Proactive risk monitoring and protection
 * Part of Solana AI Companion for Colosseum Agent Hackathon
 */

import { PortfolioMetrics } from './PortfolioAnalyzer';

export interface RiskRule {
  id: string;
  name: string;
  description: string;
  severity: 'info' | 'warning' | 'critical';
  condition: (data: any) => boolean;
  action: string;
  autoExecute: boolean;
}

export interface RiskAlert {
  ruleId: string;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  recommendedAction: string;
  timestamp: Date;
  autoExecuted: boolean;
}

export interface RiskSettings {
  stopLossPercentage: number; // e.g., 20 = stop at 20% loss
  maxConcentration: number; // e.g., 0.7 = max 70% in single token
  minDiversification: number; // e.g., 3 = minimum 3 different tokens
  autoProtect: boolean; // Enable auto-execution of critical protections
}

export class RiskGuardian {
  private rules: RiskRule[];
  private settings: RiskSettings;
  private alertHistory: RiskAlert[] = [];
  private monitoringInterval: NodeJS.Timeout | null = null;

  constructor(settings?: Partial<RiskSettings>) {
    this.settings = {
      stopLossPercentage: 20,
      maxConcentration: 0.7,
      minDiversification: 3,
      autoProtect: false,
      ...settings
    };

    this.rules = this.initializeRules();
  }

  /**
   * Initialize risk rules
   */
  private initializeRules(): RiskRule[] {
    return [
      {
        id: 'concentration_critical',
        name: 'Critical Concentration Risk',
        description: 'Single token exceeds safe concentration threshold',
        severity: 'critical',
        condition: (metrics: PortfolioMetrics) =>
          metrics.dominantPercentage > this.settings.maxConcentration * 100,
        action: 'Immediately diversify portfolio',
        autoExecute: false
      },
      {
        id: 'low_diversification',
        name: 'Insufficient Diversification',
        description: 'Portfolio has too few different assets',
        severity: 'warning',
        condition: (metrics: PortfolioMetrics) =>
          metrics.tokenCount < this.settings.minDiversification,
        action: 'Add more tokens to portfolio',
        autoExecute: false
      },
      {
        id: 'high_risk_score',
        name: 'High Overall Risk',
        description: 'Portfolio risk score exceeds safe threshold',
        severity: 'warning',
        condition: (metrics: PortfolioMetrics) =>
          metrics.riskScore > 70,
        action: 'Review and rebalance portfolio',
        autoExecute: false
      }
    ];
  }

  /**
   * Monitor portfolio for risk violations
   */
  async monitor(metrics: PortfolioMetrics): Promise<RiskAlert[]> {
    const newAlerts: RiskAlert[] = [];

    for (const rule of this.rules) {
      if (rule.condition(metrics)) {
        const alert = await this.handleRiskViolation(rule, metrics);
        newAlerts.push(alert);
      }
    }

    return newAlerts;
  }

  /**
   * Handle a risk rule violation
   */
  private async handleRiskViolation(
    rule: RiskRule,
    data: any
  ): Promise<RiskAlert> {
    const alert: RiskAlert = {
      ruleId: rule.id,
      severity: rule.severity,
      message: `${rule.name}: ${rule.description}`,
      recommendedAction: rule.action,
      timestamp: new Date(),
      autoExecuted: false
    };

    // Check if this alert was recently triggered (avoid spam)
    const recentAlert = this.alertHistory.find(
      a => a.ruleId === rule.id &&
      Date.now() - a.timestamp.getTime() < 5 * 60 * 1000 // 5 minutes
    );

    if (recentAlert) {
      return recentAlert; // Don't re-alert within 5 minutes
    }

    // Add to history
    this.alertHistory.push(alert);

    // Trim history to last 100 alerts
    if (this.alertHistory.length > 100) {
      this.alertHistory = this.alertHistory.slice(-100);
    }

    // Auto-execute if enabled and rule allows it
    if (this.settings.autoProtect && rule.autoExecute) {
      await this.executeProtection(rule, data);
      alert.autoExecuted = true;
    }

    // Send notification (will integrate with push notifications)
    await this.sendNotification(alert);

    return alert;
  }

  /**
   * Execute protective action
   */
  private async executeProtection(rule: RiskRule, data: any): Promise<void> {
    console.log(`[Risk Guardian] Auto-executing protection for ${rule.name}`);

    // TODO: Implement actual protective actions
    // For now, just log what would happen
    switch (rule.id) {
      case 'concentration_critical':
        console.log('Would execute: Rebalance to reduce concentration');
        break;
      default:
        console.log(`Would execute: ${rule.action}`);
    }
  }

  /**
   * Send risk notification
   */
  private async sendNotification(alert: RiskAlert): Promise<void> {
    // TODO: Integrate with push notification system
    console.log(`[Risk Alert - ${alert.severity.toUpperCase()}] ${alert.message}`);

    // For now, just log to console
    // In production, this would:
    // - Send push notification
    // - Show in-app alert
    // - Log to analytics
  }

  /**
   * Get recent alerts
   */
  getRecentAlerts(limit: number = 10): RiskAlert[] {
    return this.alertHistory.slice(-limit).reverse();
  }

  /**
   * Get active (unresolved) alerts
   */
  getActiveAlerts(metrics: PortfolioMetrics): RiskAlert[] {
    return this.alertHistory
      .filter(alert => {
        const rule = this.rules.find(r => r.id === alert.ruleId);
        return rule && rule.condition(metrics);
      })
      .slice(-10)
      .reverse();
  }

  /**
   * Update risk settings
   */
  updateSettings(newSettings: Partial<RiskSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    console.log('[Risk Guardian] Settings updated:', this.settings);
  }

  /**
   * Get current settings
   */
  getSettings(): RiskSettings {
    return { ...this.settings };
  }

  /**
   * Start continuous monitoring
   */
  startMonitoring(
    getMetrics: () => Promise<PortfolioMetrics>,
    interval: number = 5 * 60 * 1000 // 5 minutes
  ): void {
    if (this.monitoringInterval) {
      console.warn('[Risk Guardian] Monitoring already active');
      return;
    }

    // Monitor immediately
    getMetrics().then(metrics => this.monitor(metrics));

    // Then monitor at interval
    this.monitoringInterval = setInterval(async () => {
      try {
        const metrics = await getMetrics();
        await this.monitor(metrics);
      } catch (error) {
        console.error('[Risk Guardian] Monitoring error:', error);
      }
    }, interval);

    console.log(`[Risk Guardian] Started monitoring (interval: ${interval / 1000}s)`);
  }

  /**
   * Stop continuous monitoring
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      console.log('[Risk Guardian] Stopped monitoring');
    }
  }

  /**
   * Clear alert history
   */
  clearHistory(): void {
    this.alertHistory = [];
    console.log('[Risk Guardian] Alert history cleared');
  }
}

export default RiskGuardian;
