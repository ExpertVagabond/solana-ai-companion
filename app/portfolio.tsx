import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useSolana } from '../src/providers/SolanaProvider';
import { useAutonomous } from './context/AutonomousContext';
import PortfolioDashboard from './components/PortfolioDashboard';
import { BottomNav } from '../src/components';

export default function PortfolioScreen() {
  const router = useRouter();
  const { wallet } = useSolana();
  const {
    portfolioMetrics,
    isAnalyzingPortfolio,
    analyzePortfolio,
    checkRisks,
  } = useAutonomous();

  useEffect(() => {
    if (wallet.connected && wallet.publicKey) {
      analyzePortfolio(wallet.publicKey);
    }
  }, [wallet.connected, wallet.publicKey]);

  // Map PortfolioMetrics (autonomous) -> PortfolioStats (UI component)
  // PortfolioMetrics has: totalValueUSD, concentration, riskScore, allocation
  // PortfolioStats expects: totalValue, change24h, change24hPercent, riskScore, diversificationScore, holdings
  const stats = portfolioMetrics
    ? {
        totalValue: portfolioMetrics.totalValueUSD,
        change24h: 0, // Not tracked by PortfolioAnalyzer
        change24hPercent: 0,
        riskScore: portfolioMetrics.riskScore,
        diversificationScore: Math.round((1 - portfolioMetrics.concentration) * 100),
        holdings: Object.entries(portfolioMetrics.allocation).map(([symbol, pct]) => ({
          symbol,
          amount: 0,
          valueUSD: portfolioMetrics.totalValueUSD * (pct / 100),
          percentageOfPortfolio: pct,
          priceUSD: 0,
        })),
      }
    : null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <PortfolioDashboard
        stats={stats}
        isLoading={isAnalyzingPortfolio}
        onRefresh={() => {
          if (wallet.connected && wallet.publicKey) {
            analyzePortfolio(wallet.publicKey);
          }
        }}
        onViewOpportunities={() => router.push('/opportunities')}
        onCheckRisks={() => {
          if (portfolioMetrics) {
            checkRisks(portfolioMetrics);
          }
        }}
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
