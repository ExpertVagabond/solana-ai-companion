/**
 * Main Screen - Orchestrates all autonomous features
 * Part of Solana AI Companion for Colosseum Agent Hackathon
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Text,
} from 'react-native';
import { useAutonomous } from '../context/AutonomousContext';
import ChatInterface, { Message } from '../components/ChatInterface';
import PortfolioDashboard, { PortfolioStats } from '../components/PortfolioDashboard';
import AISelector, { AIOption } from '../components/AISelector';
import OpportunitiesList from '../components/OpportunitiesList';

type Screen = 'chat' | 'portfolio' | 'opportunities' | 'ai';
type AIProvider = 'claude' | 'gpt' | 'gemini' | 'doubao';

export default function MainScreen() {
  const autonomous = useAutonomous();

  // UI State
  const [currentScreen, setCurrentScreen] = useState<Screen>('chat');
  const [selectedAI, setSelectedAI] = useState<AIProvider>('claude');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Mock wallet state (would come from Solana provider in production)
  const [walletConnected, setWalletConnected] = useState(true);
  const [walletAddress] = useState('7TzN...k9mP'); // Mock address

  // Opportunity filters
  const [riskFilter, setRiskFilter] = useState(100);
  const [typeFilter, setTypeFilter] = useState('all');

  // AI Options
  const aiOptions: AIOption[] = [
    {
      id: 'claude',
      name: 'Claude',
      model: 'Sonnet 4.5',
      personality: 'Conservative',
      description: 'Risk-averse and focused on capital preservation. Prioritizes stability over high returns.',
      color: '#CC9B7A',
      isAvailable: true,
    },
    {
      id: 'gpt',
      name: 'GPT-4o',
      model: 'GPT-4o',
      personality: 'Aggressive',
      description: 'Opportunity-focused and comfortable with calculated risks. Prioritizes growth and alpha generation.',
      color: '#10A37F',
      isAvailable: false, // Would check for API key
    },
    {
      id: 'gemini',
      name: 'Gemini',
      model: '2.0 Flash',
      personality: 'Balanced',
      description: 'Analytical and objective, weighing both risks and opportunities equally. Provides measured, data-driven recommendations.',
      color: '#4285F4',
      isAvailable: false,
    },
    {
      id: 'doubao',
      name: 'Doubao',
      model: '1.5 Pro',
      personality: 'Contrarian',
      description: 'Skeptical of consensus and focused on alternative perspectives. Challenges conventional wisdom.',
      color: '#FF6B35',
      isAvailable: false,
    },
  ];

  // Initialize: Analyze portfolio and scan opportunities
  useEffect(() => {
    if (walletConnected) {
      // Analyze portfolio
      autonomous.analyzePortfolio(walletAddress);

      // Scan opportunities
      autonomous.scanOpportunities({
        riskTolerance: 'moderate',
        minAPY: 5,
        maxRisk: 70,
        preferredProtocols: ['Kamino', 'Drift'],
        minTVL: 1000000,
      });
    }
  }, [walletConnected]);

  // Handle chat messages
  const handleSendMessage = async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsProcessing(true);

    try {
      // Process message based on intent
      const response = await processMessage(content);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        aiProvider: selectedAI,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Failed to process message:', error);

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        timestamp: new Date(),
        aiProvider: selectedAI,
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  // Process message and generate response
  const processMessage = async (content: string): Promise<string> => {
    const lowercaseContent = content.toLowerCase();

    // Portfolio analysis
    if (lowercaseContent.includes('portfolio') || lowercaseContent.includes('analyze')) {
      if (!autonomous.portfolioMetrics) {
        return "I'm analyzing your portfolio now. This will take a moment...";
      }

      const { portfolioMetrics, portfolioRecommendations } = autonomous;
      const metrics = portfolioMetrics!;

      let response = `📊 **Portfolio Analysis**\n\n`;
      response += `Total Value: $${metrics.totalValueUSD.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}\n`;
      response += `Risk Score: ${metrics.riskScore}/100 (${
        metrics.riskScore < 30 ? 'Low' : metrics.riskScore < 60 ? 'Medium' : 'High'
      })\n`;
      response += `Concentration: ${(metrics.concentration * 100).toFixed(0)}/100\n`;
      response += `Top Asset: ${metrics.dominantToken} (${(
        metrics.dominantPercentage * 100
      ).toFixed(1)}%)\n\n`;

      if (portfolioRecommendations.length > 0) {
        response += `**Recommendations:**\n`;
        portfolioRecommendations.slice(0, 3).forEach((rec, i) => {
          response += `${i + 1}. ${rec.action || rec.type}: ${rec.message}\n`;
        });
      }

      return response;
    }

    // Opportunities
    if (
      lowercaseContent.includes('opportunit') ||
      lowercaseContent.includes('yield') ||
      lowercaseContent.includes('find')
    ) {
      if (autonomous.opportunities.length === 0) {
        return "I'm scanning for opportunities now. This will take a moment...";
      }

      const topOpps = autonomous.opportunities.slice(0, 5);

      let response = `💎 **Top Opportunities**\n\n`;
      topOpps.forEach((opp, i) => {
        response += `${i + 1}. ${opp.protocol} ${opp.asset}\n`;
        response += `   APY: ${opp.apy.toFixed(2)}% | Risk: ${opp.risk}/100\n`;
        response += `   Type: ${opp.type} | TVL: $${(opp.tvl / 1000000).toFixed(1)}M\n\n`;
      });

      response += `Tap "Find Opportunities" to see full details.`;

      return response;
    }

    // Risk check
    if (lowercaseContent.includes('risk') || lowercaseContent.includes('safe')) {
      if (!autonomous.portfolioMetrics) {
        return "Connect your wallet first to check portfolio risks.";
      }

      const alerts = autonomous.riskAlerts;

      if (alerts.length === 0) {
        return "🛡️ No critical risks detected. Your portfolio looks healthy!";
      }

      let response = `🛡️ **Risk Assessment**\n\n`;
      alerts.forEach((alert, i) => {
        const icon =
          alert.severity === 'critical'
            ? '🔴'
            : alert.severity === 'warning'
            ? '🟡'
            : '🔵';
        response += `${icon} ${alert.ruleId}: ${alert.message}\n`;
        if (alert.recommendedAction) {
          response += `   Action: ${alert.recommendedAction}\n`;
        }
        response += `\n`;
      });

      return response;
    }

    // Consensus request
    if (lowercaseContent.includes('consensus') || lowercaseContent.includes('all ai')) {
      return `🤖 To get consensus from all 4 AIs, tap "Request Consensus Decision" in the AI Selector screen.

This will:
• Get opinions from Claude, GPT, Gemini, and Doubao
• Calculate agreement percentage
• Run debate rounds if they disagree
• Provide final recommendation

What decision would you like consensus on?`;
    }

    // Default response
    return `I'm ${getAIName(selectedAI)}, your ${getPersonality(
      selectedAI
    )} AI advisor.

I can help you with:
• 📊 Analyzing your portfolio
• 💎 Finding high-yield opportunities
• 🛡️ Checking portfolio risks
• 🤖 Getting multi-AI consensus
• 💰 Executing swaps

What would you like to do?`;
  };

  const getAIName = (ai: AIProvider): string => {
    const names = { claude: 'Claude', gpt: 'GPT-4o', gemini: 'Gemini', doubao: 'Doubao' };
    return names[ai];
  };

  const getPersonality = (ai: AIProvider): string => {
    const personalities = {
      claude: 'conservative',
      gpt: 'aggressive',
      gemini: 'balanced',
      doubao: 'contrarian',
    };
    return personalities[ai];
  };

  // Convert portfolio metrics to dashboard format
  const portfolioStats: PortfolioStats | null = autonomous.portfolioMetrics
    ? {
        totalValue: autonomous.portfolioMetrics.totalValueUSD,
        change24h: 0, // Would calculate from price history
        change24hPercent: 0,
        riskScore: autonomous.portfolioMetrics.riskScore,
        diversificationScore: (1 - autonomous.portfolioMetrics.concentration) * 100,
        holdings: [], // Would map from actual token balances
      }
    : null;

  // Render current screen
  const renderScreen = () => {
    switch (currentScreen) {
      case 'chat':
        return (
          <ChatInterface
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isProcessing}
            selectedAI={selectedAI}
            onChangeAI={setSelectedAI}
            walletConnected={walletConnected}
            portfolioValue={autonomous.portfolioMetrics?.totalValueUSD}
          />
        );

      case 'portfolio':
        return (
          <PortfolioDashboard
            stats={portfolioStats}
            isLoading={autonomous.isAnalyzingPortfolio}
            onRefresh={() => autonomous.analyzePortfolio(walletAddress)}
            onViewOpportunities={() => setCurrentScreen('opportunities')}
            onCheckRisks={() => {
              if (autonomous.portfolioMetrics) {
                autonomous.checkRisks(autonomous.portfolioMetrics);
              }
            }}
          />
        );

      case 'opportunities':
        return (
          <OpportunitiesList
            opportunities={autonomous.opportunities}
            isLoading={autonomous.isScanningOpportunities}
            onRefresh={() => autonomous.scanOpportunities()}
            onSelectOpportunity={opp => {
              // Would navigate to opportunity details
              console.log('Selected opportunity:', opp);
            }}
            onFilterByRisk={setRiskFilter}
            onFilterByType={setTypeFilter}
            selectedRiskFilter={riskFilter}
            selectedTypeFilter={typeFilter}
          />
        );

      case 'ai':
        return (
          <AISelector
            selectedAI={selectedAI}
            onSelectAI={setSelectedAI}
            aiOptions={aiOptions}
            showConsensusOption={true}
            onRequestConsensus={() => {
              // Would show consensus modal
              console.log('Request consensus');
            }}
          />
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F0F0F" />

      {/* Main Content */}
      <View style={styles.content}>{renderScreen()}</View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={[styles.navButton, currentScreen === 'chat' && styles.navButtonActive]}
          onPress={() => setCurrentScreen('chat')}
        >
          <Text style={styles.navIcon}>💬</Text>
          <Text
            style={[
              styles.navLabel,
              currentScreen === 'chat' && styles.navLabelActive,
            ]}
          >
            Chat
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.navButton,
            currentScreen === 'portfolio' && styles.navButtonActive,
          ]}
          onPress={() => setCurrentScreen('portfolio')}
        >
          <Text style={styles.navIcon}>📊</Text>
          <Text
            style={[
              styles.navLabel,
              currentScreen === 'portfolio' && styles.navLabelActive,
            ]}
          >
            Portfolio
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.navButton,
            currentScreen === 'opportunities' && styles.navButtonActive,
          ]}
          onPress={() => setCurrentScreen('opportunities')}
        >
          <Text style={styles.navIcon}>💎</Text>
          <Text
            style={[
              styles.navLabel,
              currentScreen === 'opportunities' && styles.navLabelActive,
            ]}
          >
            Opportunities
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navButton, currentScreen === 'ai' && styles.navButtonActive]}
          onPress={() => setCurrentScreen('ai')}
        >
          <Text style={styles.navIcon}>🤖</Text>
          <Text
            style={[
              styles.navLabel,
              currentScreen === 'ai' && styles.navLabelActive,
            ]}
          >
            AI
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F0F',
  },
  content: {
    flex: 1,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#1F1F1F',
    borderTopWidth: 1,
    borderTopColor: '#2D2D2D',
    paddingBottom: 8,
  },
  navButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  navButtonActive: {
    backgroundColor: '#2D2D2D',
  },
  navIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  navLabel: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '600',
  },
  navLabelActive: {
    color: '#8B5CF6',
  },
});
