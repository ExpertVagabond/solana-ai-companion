/**
 * Chat Interface - Main conversational UI for Solana AI Companion
 * Part of Solana AI Companion for Colosseum Agent Hackathon
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  aiProvider?: 'claude' | 'gpt' | 'gemini' | 'doubao';
}

export interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (message: string) => Promise<void>;
  isLoading: boolean;
  selectedAI: 'claude' | 'gpt' | 'gemini' | 'doubao';
  onChangeAI: (ai: 'claude' | 'gpt' | 'gemini' | 'doubao') => void;
  walletConnected: boolean;
  portfolioValue?: number;
}

export default function ChatInterface({
  messages,
  onSendMessage,
  isLoading,
  selectedAI,
  onChangeAI,
  walletConnected,
  portfolioValue,
}: ChatInterfaceProps) {
  const [inputText, setInputText] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const handleSend = async () => {
    if (inputText.trim() === '' || isLoading) return;

    const message = inputText.trim();
    setInputText('');

    try {
      await onSendMessage(message);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const getAIColor = (ai: string) => {
    const colors = {
      claude: '#CC9B7A',
      gpt: '#10A37F',
      gemini: '#4285F4',
      doubao: '#FF6B35',
    };
    return colors[ai as keyof typeof colors] || '#8B5CF6';
  };

  const getAIName = (ai: string) => {
    const names = {
      claude: 'Claude',
      gpt: 'GPT-4o',
      gemini: 'Gemini',
      doubao: 'Doubao',
    };
    return names[ai as keyof typeof names] || ai;
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View
            style={[
              styles.aiIndicator,
              { backgroundColor: getAIColor(selectedAI) },
            ]}
          />
          <Text style={styles.headerTitle}>{getAIName(selectedAI)}</Text>
        </View>

        <View style={styles.headerRight}>
          {walletConnected ? (
            <View style={styles.portfolioInfo}>
              <Text style={styles.portfolioLabel}>Portfolio</Text>
              <Text style={styles.portfolioValue}>
                {portfolioValue
                  ? `$${portfolioValue.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}`
                  : '---'}
              </Text>
            </View>
          ) : (
            <Text style={styles.disconnectedText}>Not Connected</Text>
          )}
        </View>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
      >
        {messages.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>
              Welcome to Solana AI Companion
            </Text>
            <Text style={styles.emptyStateSubtitle}>
              Your autonomous portfolio manager powered by 4 AI agents
            </Text>
            <View style={styles.suggestionsContainer}>
              <TouchableOpacity
                style={styles.suggestionButton}
                onPress={() => setInputText('Analyze my portfolio')}
              >
                <Text style={styles.suggestionText}>📊 Analyze my portfolio</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.suggestionButton}
                onPress={() => setInputText('Find high-yield opportunities')}
              >
                <Text style={styles.suggestionText}>💎 Find opportunities</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.suggestionButton}
                onPress={() => setInputText('What are the risks in my portfolio?')}
              >
                <Text style={styles.suggestionText}>🛡️ Check risks</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.suggestionButton}
                onPress={() => setInputText('Get AI consensus on swapping SOL to USDC')}
              >
                <Text style={styles.suggestionText}>🤖 Get AI consensus</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          messages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.messageContainer,
                message.role === 'user'
                  ? styles.userMessageContainer
                  : styles.assistantMessageContainer,
              ]}
            >
              {message.role === 'assistant' && (
                <View
                  style={[
                    styles.aiAvatarSmall,
                    { backgroundColor: getAIColor(message.aiProvider || selectedAI) },
                  ]}
                />
              )}
              <View
                style={[
                  styles.messageBubble,
                  message.role === 'user'
                    ? styles.userMessageBubble
                    : styles.assistantMessageBubble,
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    message.role === 'user'
                      ? styles.userMessageText
                      : styles.assistantMessageText,
                  ]}
                >
                  {message.content}
                </Text>
                <Text style={styles.messageTime}>
                  {message.timestamp.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
            </View>
          ))
        )}

        {isLoading && (
          <View style={styles.loadingContainer}>
            <View style={styles.loadingBubble}>
              <ActivityIndicator size="small" color="#8B5CF6" />
              <Text style={styles.loadingText}>Thinking...</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Ask about your portfolio, opportunities, or get AI consensus..."
          placeholderTextColor="#6B7280"
          multiline
          maxLength={500}
          editable={!isLoading}
          onSubmitEditing={handleSend}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            (!inputText.trim() || isLoading) && styles.sendButtonDisabled,
          ]}
          onPress={handleSend}
          disabled={!inputText.trim() || isLoading}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F0F',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1F1F1F',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  portfolioInfo: {
    alignItems: 'flex-end',
  },
  portfolioLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 2,
  },
  portfolioValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#10B981',
  },
  disconnectedText: {
    fontSize: 12,
    color: '#6B7280',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 32,
  },
  suggestionsContainer: {
    width: '100%',
    gap: 12,
  },
  suggestionButton: {
    backgroundColor: '#1F1F1F',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2D2D2D',
  },
  suggestionText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '500',
  },
  messageContainer: {
    marginBottom: 16,
    flexDirection: 'row',
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
  },
  assistantMessageContainer: {
    justifyContent: 'flex-start',
  },
  aiAvatarSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    marginTop: 4,
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
  },
  userMessageBubble: {
    backgroundColor: '#8B5CF6',
    borderBottomRightRadius: 4,
  },
  assistantMessageBubble: {
    backgroundColor: '#1F1F1F',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 4,
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  assistantMessageText: {
    color: '#E5E7EB',
  },
  messageTime: {
    fontSize: 11,
    color: '#6B7280',
  },
  loadingContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 16,
  },
  loadingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F1F1F',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    gap: 8,
  },
  loadingText: {
    color: '#6B7280',
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#1F1F1F',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: '#1F1F1F',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 12,
    color: '#FFFFFF',
    fontSize: 15,
    maxHeight: 100,
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#374151',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});
