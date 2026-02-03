/**
 * Autonomous Context - State management for autonomous AI features
 * Part of Solana AI Companion for Colosseum Agent Hackathon
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import PortfolioAnalyzer, { PortfolioMetrics, Recommendation } from '../../src/autonomous/PortfolioAnalyzer';
import RiskGuardian, { RiskAlert, RiskSettings } from '../../src/autonomous/RiskGuardian';
import OpportunityScanner, { Opportunity, OpportunityScanResult, UserProfile } from '../../src/autonomous/OpportunityScanner';
import ConsensusEngine, { Decision, Consensus } from '../../src/autonomous/ConsensusEngine';
import ExecutionEngine, { SwapRequest, SwapQuote, ExecutionResult } from '../../src/autonomous/ExecutionEngine';
import LearningMemory, { DecisionRecord, UserPreferences, LearningInsight } from '../../src/autonomous/LearningMemory';
import AIProvider, { AIConfig } from '../../src/services/AIProvider';
import PythProvider from '../../src/services/PythProvider';

interface AutonomousState {
  // Portfolio
  portfolioMetrics: PortfolioMetrics | null;
  portfolioRecommendations: Recommendation[];
  isAnalyzingPortfolio: boolean;

  // Risk
  riskAlerts: RiskAlert[];
  isMonitoringRisk: boolean;

  // Opportunities
  opportunities: Opportunity[];
  scanResult: OpportunityScanResult | null;
  isScanningOpportunities: boolean;

  // Consensus
  lastConsensus: Consensus | null;
  isGettingConsensus: boolean;

  // Learning
  userPreferences: UserPreferences | null;
  learningInsights: LearningInsight[];

  // Configuration
  useRealData: boolean;
  rpcUrl: string;
}

interface AutonomousActions {
  // Portfolio
  analyzePortfolio: (walletAddress: string) => Promise<void>;
  startPortfolioMonitoring: (walletAddress: string) => void;
  stopPortfolioMonitoring: () => void;

  // Risk
  checkRisks: (metrics: PortfolioMetrics) => Promise<RiskAlert[]>;
  updateRiskSettings: (settings: Partial<RiskSettings>) => void;

  // Opportunities
  scanOpportunities: (userProfile?: UserProfile) => Promise<void>;
  filterOpportunities: (criteria: { minAPY?: number; maxRisk?: number; type?: string }) => Opportunity[];

  // Consensus
  getConsensus: (decision: Decision) => Promise<Consensus>;

  // Execution
  getSwapQuote: (request: SwapRequest) => Promise<SwapQuote>;
  executeSwap: (request: SwapRequest, walletPublicKey: any) => Promise<ExecutionResult>;

  // Learning
  recordDecision: (record: Omit<DecisionRecord, 'id' | 'timestamp'>) => void;
  getUserPreferences: () => UserPreferences | null;
  getInsights: () => LearningInsight[];

  // Configuration
  setUseRealData: (useReal: boolean) => void;
  setAIConfig: (config: AIConfig) => void;
}

type AutonomousContextType = AutonomousState & AutonomousActions;

const AutonomousContext = createContext<AutonomousContextType | undefined>(undefined);

export function AutonomousProvider({
  children,
  rpcUrl = 'https://api.mainnet-beta.solana.com',
  initialUseRealData = false,
}: {
  children: ReactNode;
  rpcUrl?: string;
  initialUseRealData?: boolean;
}) {
  // State
  const [state, setState] = useState<AutonomousState>({
    portfolioMetrics: null,
    portfolioRecommendations: [],
    isAnalyzingPortfolio: false,
    riskAlerts: [],
    isMonitoringRisk: false,
    opportunities: [],
    scanResult: null,
    isScanningOpportunities: false,
    lastConsensus: null,
    isGettingConsensus: false,
    userPreferences: null,
    learningInsights: [],
    useRealData: initialUseRealData,
    rpcUrl,
  });

  // Module instances
  const [portfolioAnalyzer] = useState(() => new PortfolioAnalyzer(rpcUrl, state.useRealData));
  const [riskGuardian] = useState(() => new RiskGuardian({
    stopLossPercentage: 20,
    maxConcentration: 0.7,
    minDiversification: 3,
    autoProtect: false,
  }));
  const [opportunityScanner] = useState(() => new OpportunityScanner(rpcUrl, state.useRealData));
  const [consensusEngine] = useState<ConsensusEngine>(() => new ConsensusEngine());
  const [executionEngine] = useState(() => new ExecutionEngine(rpcUrl));
  const [learningMemory] = useState(() => new LearningMemory());
  const [aiProvider] = useState<AIProvider | null>(null); // Will be set via setAIConfig
  const [pythProvider] = useState(() => new PythProvider(rpcUrl));

  // Portfolio Actions
  const analyzePortfolio = async (walletAddress: string) => {
    setState(prev => ({ ...prev, isAnalyzingPortfolio: true }));

    try {
      const { metrics, recommendations } = await portfolioAnalyzer.analyzePortfolio(walletAddress);

      setState(prev => ({
        ...prev,
        portfolioMetrics: metrics,
        portfolioRecommendations: recommendations,
        isAnalyzingPortfolio: false,
      }));

      // Auto-check risks
      await checkRisks(metrics);
    } catch (error) {
      console.error('Failed to analyze portfolio:', error);
      setState(prev => ({ ...prev, isAnalyzingPortfolio: false }));
    }
  };

  const startPortfolioMonitoring = (walletAddress: string) => {
    portfolioAnalyzer.startMonitoring(walletAddress, 5 * 60 * 1000, async (result) => {
      setState(prev => ({
        ...prev,
        portfolioMetrics: result.metrics,
        portfolioRecommendations: result.recommendations,
      }));

      // Auto-check risks
      await checkRisks(result.metrics);
    });

    setState(prev => ({ ...prev, isMonitoringRisk: true }));
  };

  const stopPortfolioMonitoring = () => {
    portfolioAnalyzer.stopMonitoring();
    setState(prev => ({ ...prev, isMonitoringRisk: false }));
  };

  // Risk Actions
  const checkRisks = async (metrics: PortfolioMetrics): Promise<RiskAlert[]> => {
    try {
      const alerts = await riskGuardian.monitor(metrics);

      setState(prev => ({ ...prev, riskAlerts: alerts }));

      return alerts;
    } catch (error) {
      console.error('Failed to check risks:', error);
      return [];
    }
  };

  const updateRiskSettings = (settings: Partial<RiskSettings>) => {
    riskGuardian.updateSettings(settings);
  };

  // Opportunity Actions
  const scanOpportunities = async (userProfile?: UserProfile) => {
    setState(prev => ({ ...prev, isScanningOpportunities: true }));

    try {
      const result = await opportunityScanner.scanAll(userProfile);

      setState(prev => ({
        ...prev,
        opportunities: result.opportunities,
        scanResult: result,
        isScanningOpportunities: false,
      }));
    } catch (error) {
      console.error('Failed to scan opportunities:', error);
      setState(prev => ({ ...prev, isScanningOpportunities: false }));
    }
  };

  const filterOpportunities = (criteria: {
    minAPY?: number;
    maxRisk?: number;
    type?: string;
  }): Opportunity[] => {
    return state.opportunities.filter(opp => {
      if (criteria.minAPY && opp.apy < criteria.minAPY) return false;
      if (criteria.maxRisk && opp.risk > criteria.maxRisk) return false;
      if (criteria.type && opp.type !== criteria.type) return false;
      return true;
    });
  };

  // Consensus Actions
  const getConsensus = async (decision: Decision): Promise<Consensus> => {
    setState(prev => ({ ...prev, isGettingConsensus: true }));

    try {
      const consensus = await consensusEngine.getConsensus(decision);

      setState(prev => ({
        ...prev,
        lastConsensus: consensus,
        isGettingConsensus: false,
      }));

      return consensus;
    } catch (error) {
      console.error('Failed to get consensus:', error);
      setState(prev => ({ ...prev, isGettingConsensus: false }));
      throw error;
    }
  };

  // Execution Actions
  const getSwapQuote = async (request: SwapRequest): Promise<SwapQuote> => {
    return executionEngine.getQuote(request);
  };

  const executeSwap = async (
    request: SwapRequest,
    walletPublicKey: any
  ): Promise<ExecutionResult> => {
    return executionEngine.executeSwap(request, walletPublicKey);
  };

  // Learning Actions
  const recordDecision = (record: Omit<DecisionRecord, 'id' | 'timestamp'>) => {
    learningMemory.recordDecision(record);

    // Update preferences
    const preferences = learningMemory.inferPreferences();
    const insights = learningMemory.getInsights();

    setState(prev => ({
      ...prev,
      userPreferences: preferences,
      learningInsights: insights,
    }));
  };

  const getUserPreferences = (): UserPreferences | null => {
    return learningMemory.inferPreferences();
  };

  const getInsights = (): LearningInsight[] => {
    return learningMemory.getInsights();
  };

  // Configuration Actions
  const setUseRealData = (useReal: boolean) => {
    setState(prev => ({ ...prev, useRealData: useReal }));
    // Note: Would need to recreate analyzers with new setting
  };

  const setAIConfig = (config: AIConfig) => {
    // Would create new AIProvider and update consensus engine
    console.log('Setting AI config:', config);
  };

  // Auto-load user preferences on mount
  useEffect(() => {
    const preferences = learningMemory.inferPreferences();
    const insights = learningMemory.getInsights();

    setState(prev => ({
      ...prev,
      userPreferences: preferences,
      learningInsights: insights,
    }));
  }, []);

  const value: AutonomousContextType = {
    // State
    ...state,

    // Actions
    analyzePortfolio,
    startPortfolioMonitoring,
    stopPortfolioMonitoring,
    checkRisks,
    updateRiskSettings,
    scanOpportunities,
    filterOpportunities,
    getConsensus,
    getSwapQuote,
    executeSwap,
    recordDecision,
    getUserPreferences,
    getInsights,
    setUseRealData,
    setAIConfig,
  };

  return (
    <AutonomousContext.Provider value={value}>
      {children}
    </AutonomousContext.Provider>
  );
}

export function useAutonomous() {
  const context = useContext(AutonomousContext);
  if (context === undefined) {
    throw new Error('useAutonomous must be used within an AutonomousProvider');
  }
  return context;
}

export default AutonomousContext;
