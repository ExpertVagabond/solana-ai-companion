/**
 * Opportunities List - DeFi yield opportunities across protocols
 * Part of Solana AI Companion for Colosseum Agent Hackathon
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

export interface Opportunity {
  id: string;
  protocol: string;
  type: 'lending' | 'staking' | 'lp' | 'perpetuals' | 'arbitrage';
  asset: string;
  apy: number;
  tvl: number;
  risk: number;
  liquidity: number;
  minDeposit: number;
  description: string;
}

export interface OpportunitiesListProps {
  opportunities: Opportunity[];
  isLoading: boolean;
  onRefresh: () => void;
  onSelectOpportunity: (opportunity: Opportunity) => void;
  onFilterByRisk: (maxRisk: number) => void;
  onFilterByType: (type: string) => void;
  selectedRiskFilter: number;
  selectedTypeFilter: string;
}

export default function OpportunitiesList({
  opportunities,
  isLoading,
  onRefresh,
  onSelectOpportunity,
  onFilterByRisk,
  onFilterByType,
  selectedRiskFilter,
  selectedTypeFilter,
}: OpportunitiesListProps) {
  const [sortBy, setSortBy] = useState<'apy' | 'risk' | 'tvl'>('apy');

  const getRiskColor = (risk: number) => {
    if (risk < 30) return '#10B981';
    if (risk < 60) return '#F59E0B';
    return '#EF4444';
  };

  const getRiskLabel = (risk: number) => {
    if (risk < 30) return 'Low';
    if (risk < 60) return 'Medium';
    return 'High';
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      lending: '💰',
      staking: '🔒',
      lp: '💧',
      perpetuals: '📊',
    };
    return icons[type as keyof typeof icons] || '💎';
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      lending: 'Lending',
      staking: 'Staking',
      lp: 'Liquidity Pool',
      perpetuals: 'Perpetuals',
    };
    return labels[type as keyof typeof labels] || type;
  };

  const sortedOpportunities = [...opportunities].sort((a, b) => {
    if (sortBy === 'apy') return b.apy - a.apy;
    if (sortBy === 'risk') return a.risk - b.risk;
    if (sortBy === 'tvl') return b.tvl - a.tvl;
    return 0;
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Scanning protocols...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>DeFi Opportunities</Text>
          <Text style={styles.headerSubtitle}>
            {opportunities.length} opportunities found
          </Text>
        </View>
        <TouchableOpacity onPress={onRefresh}>
          <Text style={styles.refreshButton}>Refresh</Text>
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filtersRow}>
            {/* Risk Filters */}
            <TouchableOpacity
              style={[
                styles.filterButton,
                selectedRiskFilter === 100 && styles.filterButtonActive,
              ]}
              onPress={() => onFilterByRisk(100)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  selectedRiskFilter === 100 && styles.filterButtonTextActive,
                ]}
              >
                All Risk
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterButton,
                selectedRiskFilter === 30 && styles.filterButtonActive,
              ]}
              onPress={() => onFilterByRisk(30)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  selectedRiskFilter === 30 && styles.filterButtonTextActive,
                ]}
              >
                Low Risk
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterButton,
                selectedRiskFilter === 60 && styles.filterButtonActive,
              ]}
              onPress={() => onFilterByRisk(60)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  selectedRiskFilter === 60 && styles.filterButtonTextActive,
                ]}
              >
                Med Risk
              </Text>
            </TouchableOpacity>

            {/* Type Filters */}
            <View style={styles.filterDivider} />

            <TouchableOpacity
              style={[
                styles.filterButton,
                selectedTypeFilter === 'all' && styles.filterButtonActive,
              ]}
              onPress={() => onFilterByType('all')}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  selectedTypeFilter === 'all' && styles.filterButtonTextActive,
                ]}
              >
                All Types
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterButton,
                selectedTypeFilter === 'lending' && styles.filterButtonActive,
              ]}
              onPress={() => onFilterByType('lending')}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  selectedTypeFilter === 'lending' && styles.filterButtonTextActive,
                ]}
              >
                💰 Lending
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterButton,
                selectedTypeFilter === 'perpetuals' && styles.filterButtonActive,
              ]}
              onPress={() => onFilterByType('perpetuals')}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  selectedTypeFilter === 'perpetuals' && styles.filterButtonTextActive,
                ]}
              >
                📊 Perps
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>

      {/* Sort Options */}
      <View style={styles.sortContainer}>
        <Text style={styles.sortLabel}>Sort by:</Text>
        <View style={styles.sortButtons}>
          <TouchableOpacity
            style={[styles.sortButton, sortBy === 'apy' && styles.sortButtonActive]}
            onPress={() => setSortBy('apy')}
          >
            <Text
              style={[
                styles.sortButtonText,
                sortBy === 'apy' && styles.sortButtonTextActive,
              ]}
            >
              APY
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sortButton, sortBy === 'risk' && styles.sortButtonActive]}
            onPress={() => setSortBy('risk')}
          >
            <Text
              style={[
                styles.sortButtonText,
                sortBy === 'risk' && styles.sortButtonTextActive,
              ]}
            >
              Risk
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sortButton, sortBy === 'tvl' && styles.sortButtonActive]}
            onPress={() => setSortBy('tvl')}
          >
            <Text
              style={[
                styles.sortButtonText,
                sortBy === 'tvl' && styles.sortButtonTextActive,
              ]}
            >
              TVL
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Opportunities List */}
      <ScrollView
        style={styles.listContainer}
        contentContainerStyle={styles.listContent}
      >
        {sortedOpportunities.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              No opportunities match your filters
            </Text>
          </View>
        ) : (
          sortedOpportunities.map((opp) => (
            <TouchableOpacity
              key={opp.id}
              style={styles.opportunityCard}
              onPress={() => onSelectOpportunity(opp)}
            >
              {/* Header */}
              <View style={styles.oppHeader}>
                <View style={styles.oppHeaderLeft}>
                  <View style={styles.oppIcon}>
                    <Text style={styles.oppIconText}>{getTypeIcon(opp.type)}</Text>
                  </View>
                  <View style={styles.oppHeaderInfo}>
                    <Text style={styles.oppProtocol}>{opp.protocol}</Text>
                    <Text style={styles.oppType}>{getTypeLabel(opp.type)}</Text>
                  </View>
                </View>
                <View style={styles.oppHeaderRight}>
                  <Text style={styles.oppAPY}>{opp.apy.toFixed(2)}%</Text>
                  <Text style={styles.oppAPYLabel}>APY</Text>
                </View>
              </View>

              {/* Asset */}
              <Text style={styles.oppAsset}>{opp.asset}</Text>

              {/* Stats */}
              <View style={styles.oppStats}>
                <View style={styles.oppStat}>
                  <Text style={styles.oppStatLabel}>Risk</Text>
                  <View style={styles.oppRiskContainer}>
                    <View
                      style={[
                        styles.oppRiskBadge,
                        { backgroundColor: getRiskColor(opp.risk) },
                      ]}
                    />
                    <Text
                      style={[
                        styles.oppRiskText,
                        { color: getRiskColor(opp.risk) },
                      ]}
                    >
                      {getRiskLabel(opp.risk)} ({opp.risk})
                    </Text>
                  </View>
                </View>

                <View style={styles.oppStat}>
                  <Text style={styles.oppStatLabel}>TVL</Text>
                  <Text style={styles.oppStatValue}>
                    ${(opp.tvl / 1_000_000).toFixed(1)}M
                  </Text>
                </View>

                <View style={styles.oppStat}>
                  <Text style={styles.oppStatLabel}>Min Deposit</Text>
                  <Text style={styles.oppStatValue}>${opp.minDeposit}</Text>
                </View>
              </View>

              {/* Description */}
              <Text style={styles.oppDescription} numberOfLines={2}>
                {opp.description}
              </Text>

              {/* Action */}
              <View style={styles.oppAction}>
                <Text style={styles.oppActionText}>Get AI Consensus →</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F0F',
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1F1F1F',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  refreshButton: {
    fontSize: 14,
    color: '#8B5CF6',
    fontWeight: '600',
  },
  filtersContainer: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1F1F1F',
  },
  filtersRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
  },
  filterButton: {
    backgroundColor: '#1F1F1F',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2D2D2D',
  },
  filterButtonActive: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  filterButtonText: {
    color: '#9CA3AF',
    fontSize: 13,
    fontWeight: '600',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  filterDivider: {
    width: 1,
    backgroundColor: '#2D2D2D',
    marginHorizontal: 4,
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1F1F1F',
  },
  sortLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginRight: 12,
  },
  sortButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  sortButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#1F1F1F',
  },
  sortButtonActive: {
    backgroundColor: '#2D2D2D',
  },
  sortButtonText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  sortButtonTextActive: {
    color: '#FFFFFF',
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  emptyState: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6B7280',
  },
  opportunityCard: {
    backgroundColor: '#1F1F1F',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  oppHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  oppHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  oppIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2D2D2D',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  oppIconText: {
    fontSize: 20,
  },
  oppHeaderInfo: {},
  oppProtocol: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  oppType: {
    fontSize: 12,
    color: '#6B7280',
  },
  oppHeaderRight: {
    alignItems: 'flex-end',
  },
  oppAPY: {
    fontSize: 24,
    fontWeight: '700',
    color: '#10B981',
    marginBottom: 2,
  },
  oppAPYLabel: {
    fontSize: 11,
    color: '#6B7280',
  },
  oppAsset: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  oppStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  oppStat: {
    flex: 1,
  },
  oppStatLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 4,
  },
  oppRiskContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  oppRiskBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  oppRiskText: {
    fontSize: 12,
    fontWeight: '600',
  },
  oppStatValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  oppDescription: {
    fontSize: 13,
    color: '#9CA3AF',
    lineHeight: 18,
    marginBottom: 12,
  },
  oppAction: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#2D2D2D',
  },
  oppActionText: {
    fontSize: 14,
    color: '#8B5CF6',
    fontWeight: '600',
  },
});
