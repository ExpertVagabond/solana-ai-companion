/**
 * AI Selector - Choose between 4 AI personalities
 * Part of Solana AI Companion for Colosseum Agent Hackathon
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';

export type AIProvider = 'claude' | 'gpt' | 'gemini' | 'doubao';

export interface AIOption {
  id: AIProvider;
  name: string;
  model: string;
  personality: string;
  description: string;
  color: string;
  isAvailable: boolean;
}

export interface AISelectorProps {
  selectedAI: AIProvider;
  onSelectAI: (ai: AIProvider) => void;
  aiOptions: AIOption[];
  showConsensusOption?: boolean;
  onRequestConsensus?: () => void;
}

export default function AISelector({
  selectedAI,
  onSelectAI,
  aiOptions,
  showConsensusOption = true,
  onRequestConsensus,
}: AISelectorProps) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Choose Your AI</Text>
      <Text style={styles.subtitle}>
        Each AI has a unique personality and approach to financial decisions
      </Text>

      {/* AI Options */}
      <View style={styles.optionsContainer}>
        {aiOptions.map((ai) => (
          <TouchableOpacity
            key={ai.id}
            style={[
              styles.aiCard,
              selectedAI === ai.id && styles.aiCardSelected,
              !ai.isAvailable && styles.aiCardDisabled,
            ]}
            onPress={() => ai.isAvailable && onSelectAI(ai.id)}
            disabled={!ai.isAvailable}
          >
            <View style={styles.aiCardHeader}>
              <View
                style={[
                  styles.aiAvatar,
                  { backgroundColor: ai.color },
                  selectedAI === ai.id && styles.aiAvatarSelected,
                ]}
              >
                <Text style={styles.aiInitial}>{ai.name[0]}</Text>
              </View>
              <View style={styles.aiInfo}>
                <Text style={styles.aiName}>{ai.name}</Text>
                <Text style={styles.aiModel}>{ai.model}</Text>
              </View>
              {selectedAI === ai.id && (
                <View style={styles.selectedBadge}>
                  <Text style={styles.selectedBadgeText}>✓</Text>
                </View>
              )}
              {!ai.isAvailable && (
                <View style={styles.unavailableBadge}>
                  <Text style={styles.unavailableBadgeText}>Setup Required</Text>
                </View>
              )}
            </View>

            <View style={styles.aiDetails}>
              <View style={styles.personalityBadge}>
                <Text style={styles.personalityText}>{ai.personality}</Text>
              </View>
              <Text style={styles.aiDescription}>{ai.description}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Consensus Option */}
      {showConsensusOption && onRequestConsensus && (
        <View style={styles.consensusSection}>
          <Text style={styles.consensusTitle}>🤖 Multi-AI Consensus</Text>
          <Text style={styles.consensusSubtitle}>
            Get all 4 AIs to analyze and debate before making a decision
          </Text>

          <TouchableOpacity
            style={styles.consensusButton}
            onPress={onRequestConsensus}
          >
            <Text style={styles.consensusButtonText}>
              Request Consensus Decision
            </Text>
          </TouchableOpacity>

          <View style={styles.consensusInfo}>
            <Text style={styles.consensusInfoText}>
              • All 4 AIs analyze independently{'\n'}
              • They debate when opinions differ{'\n'}
              • Final recommendation based on agreement{'\n'}
              • See reasoning from each AI
            </Text>
          </View>
        </View>
      )}

      {/* Personality Comparison */}
      <View style={styles.comparisonSection}>
        <Text style={styles.comparisonTitle}>Personality Comparison</Text>

        <View style={styles.comparisonGrid}>
          <View style={styles.comparisonRow}>
            <Text style={styles.comparisonLabel}>Risk Approach</Text>
            <View style={styles.comparisonBars}>
              <View style={[styles.comparisonBar, { width: '30%', backgroundColor: '#CC9B7A' }]} />
              <View style={[styles.comparisonBar, { width: '90%', backgroundColor: '#10A37F' }]} />
              <View style={[styles.comparisonBar, { width: '60%', backgroundColor: '#4285F4' }]} />
              <View style={[styles.comparisonBar, { width: '40%', backgroundColor: '#FF6B35' }]} />
            </View>
          </View>

          <View style={styles.comparisonRow}>
            <Text style={styles.comparisonLabel}>Opportunity Focus</Text>
            <View style={styles.comparisonBars}>
              <View style={[styles.comparisonBar, { width: '40%', backgroundColor: '#CC9B7A' }]} />
              <View style={[styles.comparisonBar, { width: '95%', backgroundColor: '#10A37F' }]} />
              <View style={[styles.comparisonBar, { width: '70%', backgroundColor: '#4285F4' }]} />
              <View style={[styles.comparisonBar, { width: '85%', backgroundColor: '#FF6B35' }]} />
            </View>
          </View>

          <View style={styles.comparisonRow}>
            <Text style={styles.comparisonLabel}>Contrarian View</Text>
            <View style={styles.comparisonBars}>
              <View style={[styles.comparisonBar, { width: '20%', backgroundColor: '#CC9B7A' }]} />
              <View style={[styles.comparisonBar, { width: '30%', backgroundColor: '#10A37F' }]} />
              <View style={[styles.comparisonBar, { width: '50%', backgroundColor: '#4285F4' }]} />
              <View style={[styles.comparisonBar, { width: '100%', backgroundColor: '#FF6B35' }]} />
            </View>
          </View>
        </View>

        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#CC9B7A' }]} />
            <Text style={styles.legendText}>Claude</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#10A37F' }]} />
            <Text style={styles.legendText}>GPT</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#4285F4' }]} />
            <Text style={styles.legendText}>Gemini</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#FF6B35' }]} />
            <Text style={styles.legendText}>Doubao</Text>
          </View>
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
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 24,
    lineHeight: 22,
  },
  optionsContainer: {
    marginBottom: 32,
  },
  aiCard: {
    backgroundColor: '#1F1F1F',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  aiCardSelected: {
    borderColor: '#8B5CF6',
  },
  aiCardDisabled: {
    opacity: 0.5,
  },
  aiCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  aiAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  aiAvatarSelected: {
    borderWidth: 3,
    borderColor: '#8B5CF6',
  },
  aiInitial: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  aiInfo: {
    flex: 1,
  },
  aiName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  aiModel: {
    fontSize: 13,
    color: '#6B7280',
  },
  selectedBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedBadgeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  unavailableBadge: {
    backgroundColor: '#374151',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  unavailableBadgeText: {
    color: '#9CA3AF',
    fontSize: 11,
    fontWeight: '600',
  },
  aiDetails: {},
  personalityBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#2D2D2D',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 12,
  },
  personalityText: {
    color: '#A78BFA',
    fontSize: 12,
    fontWeight: '600',
  },
  aiDescription: {
    fontSize: 14,
    color: '#9CA3AF',
    lineHeight: 20,
  },
  consensusSection: {
    backgroundColor: '#1F1F1F',
    borderRadius: 16,
    padding: 24,
    marginBottom: 32,
    borderWidth: 2,
    borderColor: '#8B5CF6',
  },
  consensusTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  consensusSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 16,
    lineHeight: 20,
  },
  consensusButton: {
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  consensusButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  consensusInfo: {
    backgroundColor: '#2D2D2D',
    borderRadius: 12,
    padding: 16,
  },
  consensusInfoText: {
    color: '#9CA3AF',
    fontSize: 13,
    lineHeight: 20,
  },
  comparisonSection: {
    marginBottom: 32,
  },
  comparisonTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  comparisonGrid: {
    marginBottom: 16,
  },
  comparisonRow: {
    marginBottom: 20,
  },
  comparisonLabel: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  comparisonBars: {
    gap: 6,
  },
  comparisonBar: {
    height: 8,
    borderRadius: 4,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 13,
    color: '#9CA3AF',
  },
});
