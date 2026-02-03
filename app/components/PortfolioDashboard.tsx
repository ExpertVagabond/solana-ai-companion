/**
 * Portfolio Dashboard - Real-time portfolio visualization
 * Part of Solana AI Companion for Colosseum Agent Hackathon
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

export interface TokenHolding {
  symbol: string;
  amount: number;
  valueUSD: number;
  percentageOfPortfolio: number;
  priceUSD: number;
  change24h?: number;
}

export interface PortfolioStats {
  totalValue: number;
  change24h: number;
  change24hPercent: number;
  riskScore: number;
  diversificationScore: number;
  holdings: TokenHolding[];
}

export interface PortfolioDashboardProps {
  stats: PortfolioStats | null;
  isLoading: boolean;
  onRefresh: () => void;
  onViewOpportunities: () => void;
  onCheckRisks: () => void;
}

export default function PortfolioDashboard({
  stats,
  isLoading,
  onRefresh,
  onViewOpportunities,
  onCheckRisks,
}: PortfolioDashboardProps) {
  const getRiskColor = (score: number) => {
    if (score < 30) return '#10B981'; // Green - Low risk
    if (score < 60) return '#F59E0B'; // Yellow - Medium risk
    return '#EF4444'; // Red - High risk
  };

  const getRiskLabel = (score: number) => {
    if (score < 30) return 'Low Risk';
    if (score < 60) return 'Medium Risk';
    return 'High Risk';
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading portfolio...</Text>
      </View>
    );
  }

  if (!stats) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No Portfolio Data</Text>
        <Text style={styles.emptySubtitle}>
          Connect your wallet to view your portfolio
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Total Value Card */}
      <View style={styles.valueCard}>
        <Text style={styles.valueLabel}>Total Portfolio Value</Text>
        <Text style={styles.valueAmount}>
          ${stats.totalValue.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </Text>
        <View style={styles.changeContainer}>
          <Text
            style={[
              styles.changeText,
              stats.change24h >= 0 ? styles.changePositive : styles.changeNegative,
            ]}
          >
            {stats.change24h >= 0 ? '+' : ''}
            ${Math.abs(stats.change24h).toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{' '}
            ({stats.change24h >= 0 ? '+' : ''}
            {stats.change24hPercent.toFixed(2)}%)
          </Text>
          <Text style={styles.changePeriod}>24h</Text>
        </View>
      </View>

      {/* Risk & Diversification */}
      <View style={styles.metricsRow}>
        <View style={[styles.metricCard, styles.metricCardLeft]}>
          <Text style={styles.metricLabel}>Risk Score</Text>
          <View style={styles.metricValueContainer}>
            <Text
              style={[
                styles.metricValue,
                { color: getRiskColor(stats.riskScore) },
              ]}
            >
              {stats.riskScore}
            </Text>
            <Text style={styles.metricSuffix}>/100</Text>
          </View>
          <Text style={[styles.riskLabel, { color: getRiskColor(stats.riskScore) }]}>
            {getRiskLabel(stats.riskScore)}
          </Text>
        </View>

        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Diversification</Text>
          <View style={styles.metricValueContainer}>
            <Text style={styles.metricValue}>{stats.diversificationScore}</Text>
            <Text style={styles.metricSuffix}>/100</Text>
          </View>
          <Text style={styles.diversificationLabel}>
            {stats.diversificationScore >= 70
              ? 'Well Diversified'
              : stats.diversificationScore >= 40
              ? 'Moderately Diverse'
              : 'Concentrated'}
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={[styles.actionButton, styles.actionButtonPrimary]}
          onPress={onViewOpportunities}
        >
          <Text style={styles.actionButtonText}>💎 Find Opportunities</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onCheckRisks}
        >
          <Text style={styles.actionButtonText}>🛡️ Check Risks</Text>
        </TouchableOpacity>
      </View>

      {/* Holdings */}
      <View style={styles.holdingsSection}>
        <View style={styles.holdingsHeader}>
          <Text style={styles.holdingsTitle}>Holdings</Text>
          <TouchableOpacity onPress={onRefresh}>
            <Text style={styles.refreshText}>Refresh</Text>
          </TouchableOpacity>
        </View>

        {stats.holdings.map((holding, index) => (
          <View key={holding.symbol} style={styles.holdingCard}>
            <View style={styles.holdingLeft}>
              <View style={styles.holdingIcon}>
                <Text style={styles.holdingSymbol}>
                  {holding.symbol.slice(0, 2)}
                </Text>
              </View>
              <View style={styles.holdingInfo}>
                <Text style={styles.holdingName}>{holding.symbol}</Text>
                <Text style={styles.holdingAmount}>
                  {holding.amount.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 4,
                  })}
                </Text>
              </View>
            </View>

            <View style={styles.holdingRight}>
              <Text style={styles.holdingValue}>
                ${holding.valueUSD.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Text>
              <Text style={styles.holdingPercentage}>
                {holding.percentageOfPortfolio.toFixed(1)}%
              </Text>
              {holding.change24h !== undefined && (
                <Text
                  style={[
                    styles.holdingChange,
                    holding.change24h >= 0
                      ? styles.changePositive
                      : styles.changeNegative,
                  ]}
                >
                  {holding.change24h >= 0 ? '+' : ''}
                  {holding.change24h.toFixed(2)}%
                </Text>
              )}
            </View>
          </View>
        ))}
      </View>

      {/* AI Insights */}
      <View style={styles.insightsSection}>
        <Text style={styles.insightsTitle}>🤖 AI Insights</Text>
        <View style={styles.insightCard}>
          {stats.riskScore > 70 ? (
            <>
              <Text style={styles.insightText}>
                Your portfolio has a high risk score. Consider rebalancing to reduce
                concentration.
              </Text>
              <TouchableOpacity
                style={styles.insightButton}
                onPress={() => console.log('Get AI consensus')}
              >
                <Text style={styles.insightButtonText}>Get AI Consensus</Text>
              </TouchableOpacity>
            </>
          ) : stats.diversificationScore < 40 ? (
            <>
              <Text style={styles.insightText}>
                Your portfolio is concentrated in few assets. Diversifying could
                reduce risk.
              </Text>
              <TouchableOpacity
                style={styles.insightButton}
                onPress={onViewOpportunities}
              >
                <Text style={styles.insightButtonText}>View Opportunities</Text>
              </TouchableOpacity>
            </>
          ) : (
            <Text style={styles.insightText}>
              Your portfolio looks well-balanced with moderate risk and good
              diversification. 👍
            </Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F0F',
  },
  content: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F0F0F',
  },
  loadingText: {
    color: '#6B7280',
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F0F0F',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  valueCard: {
    backgroundColor: '#1F1F1F',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
  },
  valueLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  valueAmount: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  changeText: {
    fontSize: 16,
    fontWeight: '600',
  },
  changePositive: {
    color: '#10B981',
  },
  changeNegative: {
    color: '#EF4444',
  },
  changePeriod: {
    fontSize: 14,
    color: '#6B7280',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#1F1F1F',
    borderRadius: 16,
    padding: 20,
  },
  metricCardLeft: {
    marginRight: 0,
  },
  metricLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  metricValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  metricSuffix: {
    fontSize: 16,
    color: '#6B7280',
    marginLeft: 2,
  },
  riskLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  diversificationLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#1F1F1F',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2D2D2D',
  },
  actionButtonPrimary: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  holdingsSection: {
    marginBottom: 24,
  },
  holdingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  holdingsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  refreshText: {
    fontSize: 14,
    color: '#8B5CF6',
    fontWeight: '600',
  },
  holdingCard: {
    backgroundColor: '#1F1F1F',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  holdingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  holdingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  holdingSymbol: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  holdingInfo: {
    flex: 1,
  },
  holdingName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  holdingAmount: {
    fontSize: 13,
    color: '#6B7280',
  },
  holdingRight: {
    alignItems: 'flex-end',
  },
  holdingValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  holdingPercentage: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 2,
  },
  holdingChange: {
    fontSize: 12,
    fontWeight: '600',
  },
  insightsSection: {
    marginBottom: 24,
  },
  insightsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  insightCard: {
    backgroundColor: '#1F1F1F',
    borderRadius: 12,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#8B5CF6',
  },
  insightText: {
    fontSize: 14,
    color: '#E5E7EB',
    lineHeight: 20,
    marginBottom: 12,
  },
  insightButton: {
    backgroundColor: '#8B5CF6',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
  },
  insightButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
