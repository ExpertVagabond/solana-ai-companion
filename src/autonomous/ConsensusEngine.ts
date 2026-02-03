/**
 * Consensus Engine - Multi-AI debate and decision making
 * Part of Solana AI Companion for Colosseum Agent Hackathon
 */

import AIProvider, { AnalysisRequest } from '../services/AIProvider';

export interface AIAgent {
  name: string;
  personality: 'conservative' | 'aggressive' | 'balanced' | 'contrarian';
  provider: 'claude' | 'openai' | 'gemini' | 'doubao';
}

export interface Opinion {
  agent: AIAgent;
  stance: 'strong_yes' | 'yes' | 'neutral' | 'no' | 'strong_no';
  confidence: number; // 0-100
  reasoning: string;
  risks: string[];
  benefits: string[];
  recommendation?: string;
}

export interface Decision {
  type: 'trade' | 'rebalance' | 'invest' | 'withdraw' | 'hold';
  description: string;
  context: {
    portfolioValue?: number;
    currentAllocation?: Record<string, number>;
    marketConditions?: string;
    userRiskTolerance?: string;
  };
  options?: Array<{
    action: string;
    expectedOutcome: string;
  }>;
}

export interface Consensus {
  decision: Decision;
  recommendation: 'proceed' | 'proceed_with_caution' | 'hold' | 'reject';
  confidence: number; // 0-100, based on agreement
  opinions: Opinion[];
  agreement: number; // 0-1, how much agents agree
  debate?: DebateRound[];
  summary: string;
  finalAdvice: string;
}

export interface DebateRound {
  round: number;
  exchanges: Array<{
    agent: string;
    statement: string;
    addressing?: string; // Which agent they're responding to
  }>;
  convergence: number; // 0-1, are they converging?
}

export class ConsensusEngine {
  private agents: AIAgent[];
  private aiProvider: AIProvider | null;
  private useRealAI: boolean;

  constructor(aiProvider?: AIProvider) {
    this.agents = [
      {
        name: 'Claude',
        personality: 'conservative',
        provider: 'claude'
      },
      {
        name: 'GPT',
        personality: 'aggressive',
        provider: 'openai'
      },
      {
        name: 'Gemini',
        personality: 'balanced',
        provider: 'gemini'
      },
      {
        name: 'Doubao',
        personality: 'contrarian',
        provider: 'doubao'
      }
    ];

    this.aiProvider = aiProvider || null;
    this.useRealAI = !!aiProvider;

    if (this.useRealAI) {
      console.log('[Consensus Engine] Initialized with real AI providers:',
        aiProvider!.getAvailableProviders().join(', '));
    } else {
      console.log('[Consensus Engine] Initialized with simulated AI (mock mode)');
    }
  }

  /**
   * Get consensus from all AI agents on a decision
   */
  async getConsensus(decision: Decision): Promise<Consensus> {
    console.log(`[Consensus Engine] Analyzing decision: ${decision.description}`);

    // Step 1: Collect initial opinions from all agents
    const opinions = await this.collectOpinions(decision);

    // Step 2: Calculate agreement level
    const agreement = this.calculateAgreement(opinions);

    // Step 3: If low agreement, run debate
    const debate = agreement < 0.6
      ? await this.runDebate(decision, opinions)
      : undefined;

    // Step 4: Generate final recommendation
    const recommendation = this.generateRecommendation(opinions, agreement);

    // Step 5: Create summary
    const summary = this.generateSummary(opinions, agreement);
    const finalAdvice = this.generateFinalAdvice(recommendation, opinions);

    return {
      decision,
      recommendation,
      confidence: agreement * 100,
      opinions,
      agreement,
      debate,
      summary,
      finalAdvice
    };
  }

  /**
   * Collect opinions from all AI agents
   */
  private async collectOpinions(decision: Decision): Promise<Opinion[]> {
    const opinions: Opinion[] = [];

    if (this.useRealAI && this.aiProvider) {
      // Use real AI APIs
      console.log('[Consensus Engine] Collecting real AI opinions...');

      const analysisRequest: AnalysisRequest = {
        decision: {
          type: decision.type,
          description: decision.description,
          context: decision.context
        },
        personality: 'balanced' // Will be overridden per agent
      };

      // Collect opinions in parallel
      const results = await this.aiProvider.analyzeWithAll(analysisRequest);

      // Map results to opinions
      if (results.claude) {
        opinions.push(this.mapAnalysisToOpinion(this.agents[0], results.claude));
      } else {
        opinions.push(this.simulateAgentOpinion(this.agents[0], decision));
      }

      if (results.gpt) {
        opinions.push(this.mapAnalysisToOpinion(this.agents[1], results.gpt));
      } else {
        opinions.push(this.simulateAgentOpinion(this.agents[1], decision));
      }

      if (results.gemini) {
        opinions.push(this.mapAnalysisToOpinion(this.agents[2], results.gemini));
      } else {
        opinions.push(this.simulateAgentOpinion(this.agents[2], decision));
      }

      if (results.doubao) {
        opinions.push(this.mapAnalysisToOpinion(this.agents[3], results.doubao));
      } else {
        opinions.push(this.simulateAgentOpinion(this.agents[3], decision));
      }

      if (results.errors.length > 0) {
        console.warn('[Consensus Engine] Some AI APIs failed:', results.errors);
      }
    } else {
      // Use simulated opinions (mock mode)
      console.log('[Consensus Engine] Using simulated opinions (no AI provider)');

      for (const agent of this.agents) {
        const opinion = this.simulateAgentOpinion(agent, decision);
        opinions.push(opinion);
      }
    }

    return opinions;
  }

  /**
   * Map AI analysis response to opinion format
   */
  private mapAnalysisToOpinion(agent: AIAgent, analysis: any): Opinion {
    return {
      agent,
      stance: analysis.stance,
      confidence: analysis.confidence,
      reasoning: analysis.reasoning,
      risks: analysis.risks,
      benefits: analysis.benefits,
      recommendation: analysis.recommendation
    };
  }

  /**
   * Simulate an AI agent's opinion (placeholder for real AI integration)
   */
  private simulateAgentOpinion(agent: AIAgent, decision: Decision): Opinion {
    // This will be replaced with actual AI API calls
    // For now, simulate based on personality

    let stance: Opinion['stance'];
    let confidence: number;
    let reasoning: string;
    let risks: string[];
    let benefits: string[];

    switch (agent.personality) {
      case 'conservative':
        stance = decision.type === 'hold' ? 'strong_yes' : 'neutral';
        confidence = 75;
        reasoning = 'Prefer stability and risk mitigation. ' +
                   'Market conditions suggest caution.';
        risks = ['Market volatility', 'Uncertain conditions', 'Potential downside'];
        benefits = ['Preserves capital', 'Reduces risk exposure'];
        break;

      case 'aggressive':
        stance = decision.type === 'trade' ? 'yes' : 'neutral';
        confidence = 80;
        reasoning = 'Opportunities exist for alpha generation. ' +
                   'Market inefficiencies can be exploited.';
        risks = ['Execution risk', 'Timing uncertainty'];
        benefits = ['Potential upside', 'Portfolio optimization', 'Yield generation'];
        break;

      case 'balanced':
        stance = 'neutral';
        confidence = 70;
        reasoning = 'Weighing both risks and opportunities. ' +
                   'Suggest measured approach with defined parameters.';
        risks = ['Market risk', 'Liquidity concerns'];
        benefits = ['Balanced exposure', 'Risk-adjusted returns'];
        break;

      case 'contrarian':
        stance = decision.type === 'hold' ? 'no' : 'yes';
        confidence = 65;
        reasoning = 'Market consensus may be wrong. ' +
                   'Consider alternative perspectives and scenarios.';
        risks = ['Consensus risk', 'Herd behavior'];
        benefits = ['Differentiated positioning', 'Contrarian edge'];
        break;

      default:
        stance = 'neutral';
        confidence = 50;
        reasoning = 'Insufficient data for strong opinion.';
        risks = ['Unknown risks'];
        benefits = ['Unknown benefits'];
    }

    return {
      agent,
      stance,
      confidence,
      reasoning,
      risks,
      benefits,
      recommendation: this.generateAgentRecommendation(stance, agent)
    };
  }

  /**
   * Generate specific recommendation from agent
   */
  private generateAgentRecommendation(
    stance: Opinion['stance'],
    agent: AIAgent
  ): string {
    const stanceMap = {
      'strong_yes': 'Strongly recommend proceeding',
      'yes': 'Recommend proceeding with monitoring',
      'neutral': 'Suggest careful evaluation before deciding',
      'no': 'Advise against this action',
      'strong_no': 'Strongly advise against proceeding'
    };

    return `${agent.name}: ${stanceMap[stance]}`;
  }

  /**
   * Calculate agreement level between agents (0-1)
   */
  private calculateAgreement(opinions: Opinion[]): number {
    if (opinions.length === 0) return 0;

    // Convert stances to numeric scores
    const stanceToScore: Record<Opinion['stance'], number> = {
      'strong_no': -2,
      'no': -1,
      'neutral': 0,
      'yes': 1,
      'strong_yes': 2
    };

    const scores = opinions.map(o => stanceToScore[o.stance]);
    const avgScore = scores.reduce((sum, s) => sum + s, 0) / scores.length;

    // Calculate variance
    const variance = scores.reduce(
      (sum, s) => sum + Math.pow(s - avgScore, 2),
      0
    ) / scores.length;

    // Convert variance to agreement (inverse relationship)
    // Low variance = high agreement
    const maxVariance = 4; // Max possible variance with scores -2 to 2
    const agreement = 1 - (Math.sqrt(variance) / Math.sqrt(maxVariance));

    return Math.max(0, Math.min(1, agreement));
  }

  /**
   * Run debate between agents (simulated for now)
   */
  private async runDebate(
    decision: Decision,
    initialOpinions: Opinion[]
  ): Promise<DebateRound[]> {
    console.log('[Consensus Engine] Low agreement detected, starting debate...');

    const rounds: DebateRound[] = [];
    const maxRounds = 3;

    for (let i = 0; i < maxRounds; i++) {
      const round: DebateRound = {
        round: i + 1,
        exchanges: [],
        convergence: 0
      };

      // Each agent makes a statement
      for (const opinion of initialOpinions) {
        round.exchanges.push({
          agent: opinion.agent.name,
          statement: `Round ${i + 1}: ${opinion.reasoning}`,
          addressing: i > 0 ? this.findDisagreement(opinion, initialOpinions) : undefined
        });
      }

      // Calculate convergence
      round.convergence = this.calculateAgreement(initialOpinions);
      rounds.push(round);

      // Stop if converged
      if (round.convergence > 0.75) {
        console.log(`[Consensus Engine] Converged after ${i + 1} rounds`);
        break;
      }
    }

    return rounds;
  }

  /**
   * Find which agent this opinion disagrees with most
   */
  private findDisagreement(
    opinion: Opinion,
    allOpinions: Opinion[]
  ): string | undefined {
    const stanceToScore: Record<Opinion['stance'], number> = {
      'strong_no': -2,
      'no': -1,
      'neutral': 0,
      'yes': 1,
      'strong_yes': 2
    };

    const myScore = stanceToScore[opinion.stance];

    let maxDiff = 0;
    let target: string | undefined;

    for (const other of allOpinions) {
      if (other.agent.name === opinion.agent.name) continue;

      const diff = Math.abs(myScore - stanceToScore[other.stance]);
      if (diff > maxDiff) {
        maxDiff = diff;
        target = other.agent.name;
      }
    }

    return target;
  }

  /**
   * Generate final recommendation based on consensus
   */
  private generateRecommendation(
    opinions: Opinion[],
    agreement: number
  ): Consensus['recommendation'] {
    // Calculate average stance
    const stanceToScore: Record<Opinion['stance'], number> = {
      'strong_no': -2,
      'no': -1,
      'neutral': 0,
      'yes': 1,
      'strong_yes': 2
    };

    const avgScore = opinions.reduce(
      (sum, o) => sum + stanceToScore[o.stance],
      0
    ) / opinions.length;

    // High agreement
    if (agreement > 0.75) {
      if (avgScore >= 1) return 'proceed';
      if (avgScore <= -1) return 'reject';
      return 'hold';
    }

    // Moderate agreement
    if (agreement > 0.5) {
      if (avgScore > 0) return 'proceed_with_caution';
      if (avgScore < 0) return 'hold';
      return 'hold';
    }

    // Low agreement - default to caution
    return 'hold';
  }

  /**
   * Generate consensus summary
   */
  private generateSummary(opinions: Opinion[], agreement: number): string {
    const agreementLevel = agreement > 0.75
      ? 'strong consensus'
      : agreement > 0.5
        ? 'moderate agreement'
        : 'significant disagreement';

    const distribution = this.getStanceDistribution(opinions);

    return `The AI agents show ${agreementLevel} on this decision. ` +
           `${distribution}`;
  }

  /**
   * Get distribution of stances
   */
  private getStanceDistribution(opinions: Opinion[]): string {
    const counts = {
      positive: 0,
      neutral: 0,
      negative: 0
    };

    for (const opinion of opinions) {
      if (opinion.stance.includes('yes')) counts.positive++;
      else if (opinion.stance.includes('no')) counts.negative++;
      else counts.neutral++;
    }

    return `${counts.positive} favorable, ${counts.neutral} neutral, ${counts.negative} cautious.`;
  }

  /**
   * Generate final advice
   */
  private generateFinalAdvice(
    recommendation: Consensus['recommendation'],
    opinions: Opinion[]
  ): string {
    const adviceMap: Record<Consensus['recommendation'], string> = {
      'proceed': '✅ The consensus is to proceed with this action. ' +
                'All agents see favorable risk/reward.',
      'proceed_with_caution': '⚠️ Proceed with caution. ' +
                             'Set clear stop-losses and monitor closely.',
      'hold': '⏸️ Hold and reassess. ' +
             'Wait for clearer market signals or better consensus.',
      'reject': '❌ Do not proceed. ' +
               'Agents identify significant risks that outweigh potential benefits.'
    };

    return adviceMap[recommendation];
  }

  /**
   * Get individual agent opinion (without full consensus)
   */
  async getAgentOpinion(
    agentName: string,
    decision: Decision
  ): Promise<Opinion | null> {
    const agent = this.agents.find(a => a.name === agentName);
    if (!agent) return null;

    return this.simulateAgentOpinion(agent, decision);
  }

  /**
   * List available agents
   */
  getAgents(): AIAgent[] {
    return [...this.agents];
  }
}

export default ConsensusEngine;
