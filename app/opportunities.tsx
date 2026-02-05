import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAutonomous } from './context/AutonomousContext';
import OpportunitiesList from './components/OpportunitiesList';
import { BottomNav } from '../src/components';
import type { Opportunity } from './components/OpportunitiesList';

export default function OpportunitiesScreen() {
  const {
    opportunities,
    isScanningOpportunities,
    scanOpportunities,
    filterOpportunities,
    getConsensus,
  } = useAutonomous();

  const [riskFilter, setRiskFilter] = useState(100);
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    if (opportunities.length === 0) {
      scanOpportunities();
    }
  }, []);

  const filtered = filterOpportunities({
    maxRisk: riskFilter < 100 ? riskFilter : undefined,
    type: typeFilter !== 'all' ? typeFilter : undefined,
  });

  // Map autonomous Opportunity -> UI Opportunity (same fields, just narrowing types)
  const mappedOpportunities: Opportunity[] = filtered.map((opp) => ({
    id: opp.id,
    protocol: opp.protocol,
    type: opp.type as Opportunity['type'],
    asset: opp.asset,
    apy: opp.apy,
    tvl: opp.tvl,
    risk: opp.risk,
    liquidity: opp.liquidity,
    minDeposit: opp.minDeposit,
    description: opp.description,
  }));

  const handleSelectOpportunity = useCallback(async (opp: Opportunity) => {
    try {
      // Decision type must be 'invest', context keys must match Decision interface
      const consensus = await getConsensus({
        type: 'invest',
        description: `Should I invest in ${opp.protocol} ${opp.type} (${opp.asset}) with ${opp.apy.toFixed(2)}% APY and risk score ${opp.risk}?`,
        context: {
          marketConditions: `APY: ${opp.apy}%, Risk: ${opp.risk}/100, TVL: $${opp.tvl}`,
        },
        options: [
          { action: 'invest', expectedOutcome: `Earn ~${opp.apy.toFixed(1)}% APY` },
          { action: 'skip', expectedOutcome: 'No exposure to this opportunity' },
          { action: 'wait', expectedOutcome: 'Monitor for better entry' },
        ],
      });
      Alert.alert(
        'AI Consensus',
        `Recommendation: ${consensus.recommendation}\nConfidence: ${consensus.confidence}%\n\n${consensus.summary}`,
      );
    } catch {
      Alert.alert('Error', 'Failed to get AI consensus');
    }
  }, [getConsensus]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <OpportunitiesList
        opportunities={mappedOpportunities}
        isLoading={isScanningOpportunities}
        onRefresh={() => scanOpportunities()}
        onSelectOpportunity={handleSelectOpportunity}
        onFilterByRisk={setRiskFilter}
        onFilterByType={setTypeFilter}
        selectedRiskFilter={riskFilter}
        selectedTypeFilter={typeFilter}
      />
      <BottomNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
});
