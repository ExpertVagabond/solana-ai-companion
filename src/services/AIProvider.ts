/**
 * AI Provider - Real API integrations for multi-AI consensus
 * Part of Solana AI Companion for Colosseum Agent Hackathon
 *
 * Connects to actual AI APIs:
 * - Anthropic Claude (Sonnet 4.5)
 * - OpenAI GPT (GPT-4o)
 * - Google Gemini (2.0 Flash)
 * - ByteDance Doubao (1.5 Pro)
 */

export interface AIConfig {
  anthropicApiKey?: string;
  openaiApiKey?: string;
  googleApiKey?: string;
  doubaoApiKey?: string;
}

export interface AIRequest {
  systemPrompt: string;
  userPrompt: string;
  maxTokens?: number;
  temperature?: number;
}

export interface AIResponse {
  content: string;
  model: string;
  tokensUsed: number;
  latency: number; // milliseconds
}

export interface AnalysisRequest {
  decision: {
    type: string;
    description: string;
    context: any;
  };
  personality: 'conservative' | 'aggressive' | 'balanced' | 'contrarian';
}

export interface AnalysisResponse {
  stance: 'strong_yes' | 'yes' | 'neutral' | 'no' | 'strong_no';
  confidence: number; // 0-100
  reasoning: string;
  risks: string[];
  benefits: string[];
  recommendation: string;
}

export class AIProvider {
  private config: AIConfig;

  // API endpoints
  private anthropicUrl = 'https://api.anthropic.com/v1/messages';
  private openaiUrl = 'https://api.openai.com/v1/chat/completions';
  private geminiUrl = 'https://generativelanguage.googleapis.com/v1beta/models';
  private doubaoUrl = 'https://ark.cn-beijing.volces.com/api/v3'; // Doubao endpoint

  constructor(config: AIConfig) {
    this.config = config;
  }

  /**
   * Call Claude API (Anthropic)
   */
  async callClaude(request: AIRequest): Promise<AIResponse> {
    if (!this.config.anthropicApiKey) {
      throw new Error('Anthropic API key not configured');
    }

    const startTime = Date.now();

    try {
      const response = await fetch(this.anthropicUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.config.anthropicApiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-5-20250929',
          max_tokens: request.maxTokens || 2000,
          temperature: request.temperature || 1.0,
          system: request.systemPrompt,
          messages: [
            {
              role: 'user',
              content: request.userPrompt
            }
          ]
        })
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Claude API error: ${response.status} ${error}`);
      }

      const data = await response.json();
      const latency = Date.now() - startTime;

      return {
        content: data.content[0].text,
        model: data.model,
        tokensUsed: data.usage.input_tokens + data.usage.output_tokens,
        latency
      };
    } catch (error) {
      console.error('[AI Provider] Claude API failed:', error);
      throw error;
    }
  }

  /**
   * Call OpenAI GPT API
   */
  async callOpenAI(request: AIRequest): Promise<AIResponse> {
    if (!this.config.openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const startTime = Date.now();

    try {
      const response = await fetch(this.openaiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.openaiApiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          max_tokens: request.maxTokens || 2000,
          temperature: request.temperature || 1.0,
          messages: [
            {
              role: 'system',
              content: request.systemPrompt
            },
            {
              role: 'user',
              content: request.userPrompt
            }
          ]
        })
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`OpenAI API error: ${response.status} ${error}`);
      }

      const data = await response.json();
      const latency = Date.now() - startTime;

      return {
        content: data.choices[0].message.content,
        model: data.model,
        tokensUsed: data.usage.total_tokens,
        latency
      };
    } catch (error) {
      console.error('[AI Provider] OpenAI API failed:', error);
      throw error;
    }
  }

  /**
   * Call Google Gemini API
   */
  async callGemini(request: AIRequest): Promise<AIResponse> {
    if (!this.config.googleApiKey) {
      throw new Error('Google API key not configured');
    }

    const startTime = Date.now();

    try {
      const model = 'gemini-2.0-flash-exp';
      const url = `${this.geminiUrl}/${model}:generateContent?key=${this.config.googleApiKey}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: request.systemPrompt }]
          },
          contents: [
            {
              parts: [{ text: request.userPrompt }]
            }
          ],
          generationConfig: {
            temperature: request.temperature || 1.0,
            maxOutputTokens: request.maxTokens || 2000
          }
        })
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Gemini API error: ${response.status} ${error}`);
      }

      const data = await response.json();
      const latency = Date.now() - startTime;

      return {
        content: data.candidates[0].content.parts[0].text,
        model,
        tokensUsed: data.usageMetadata?.totalTokenCount || 0,
        latency
      };
    } catch (error) {
      console.error('[AI Provider] Gemini API failed:', error);
      throw error;
    }
  }

  /**
   * Call ByteDance Doubao API
   */
  async callDoubao(request: AIRequest): Promise<AIResponse> {
    if (!this.config.doubaoApiKey) {
      throw new Error('Doubao API key not configured');
    }

    const startTime = Date.now();

    try {
      // Note: Doubao API structure may vary - adjust based on actual API docs
      const response = await fetch(`${this.doubaoUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.doubaoApiKey}`
        },
        body: JSON.stringify({
          model: 'doubao-1.5-pro',
          messages: [
            {
              role: 'system',
              content: request.systemPrompt
            },
            {
              role: 'user',
              content: request.userPrompt
            }
          ],
          max_tokens: request.maxTokens || 2000,
          temperature: request.temperature || 1.0
        })
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Doubao API error: ${response.status} ${error}`);
      }

      const data = await response.json();
      const latency = Date.now() - startTime;

      return {
        content: data.choices[0].message.content,
        model: data.model,
        tokensUsed: data.usage?.total_tokens || 0,
        latency
      };
    } catch (error) {
      console.error('[AI Provider] Doubao API failed:', error);
      throw error;
    }
  }

  /**
   * Get financial analysis from Claude (conservative personality)
   */
  async analyzeWithClaude(request: AnalysisRequest): Promise<AnalysisResponse> {
    const systemPrompt = `You are a conservative financial AI assistant analyzing cryptocurrency investment decisions.
Your personality is risk-averse and focused on capital preservation.
You prioritize stability over high returns and prefer established assets.

Analyze the decision and respond in JSON format with:
{
  "stance": "strong_yes" | "yes" | "neutral" | "no" | "strong_no",
  "confidence": <number 0-100>,
  "reasoning": "<your analysis>",
  "risks": ["<risk1>", "<risk2>", ...],
  "benefits": ["<benefit1>", "<benefit2>", ...],
  "recommendation": "<specific advice>"
}`;

    const userPrompt = `Decision Type: ${request.decision.type}
Description: ${request.decision.description}
Context: ${JSON.stringify(request.decision.context, null, 2)}

Please analyze this decision from a conservative, risk-averse perspective.`;

    const response = await this.callClaude({
      systemPrompt,
      userPrompt,
      temperature: 0.7,
      maxTokens: 1500
    });

    return this.parseAnalysisResponse(response.content);
  }

  /**
   * Get financial analysis from GPT (aggressive personality)
   */
  async analyzeWithGPT(request: AnalysisRequest): Promise<AnalysisResponse> {
    const systemPrompt = `You are an aggressive financial AI assistant analyzing cryptocurrency investment decisions.
Your personality is opportunity-focused and comfortable with calculated risks.
You prioritize growth and alpha generation over stability.

Analyze the decision and respond in JSON format with:
{
  "stance": "strong_yes" | "yes" | "neutral" | "no" | "strong_no",
  "confidence": <number 0-100>,
  "reasoning": "<your analysis>",
  "risks": ["<risk1>", "<risk2>", ...],
  "benefits": ["<benefit1>", "<benefit2>", ...],
  "recommendation": "<specific advice>"
}`;

    const userPrompt = `Decision Type: ${request.decision.type}
Description: ${request.decision.description}
Context: ${JSON.stringify(request.decision.context, null, 2)}

Please analyze this decision from an aggressive, opportunity-seeking perspective.`;

    const response = await this.callOpenAI({
      systemPrompt,
      userPrompt,
      temperature: 0.8,
      maxTokens: 1500
    });

    return this.parseAnalysisResponse(response.content);
  }

  /**
   * Get financial analysis from Gemini (balanced personality)
   */
  async analyzeWithGemini(request: AnalysisRequest): Promise<AnalysisResponse> {
    const systemPrompt = `You are a balanced financial AI assistant analyzing cryptocurrency investment decisions.
Your personality is analytical and objective, weighing both risks and opportunities equally.
You provide measured, data-driven recommendations.

Analyze the decision and respond in JSON format with:
{
  "stance": "strong_yes" | "yes" | "neutral" | "no" | "strong_no",
  "confidence": <number 0-100>,
  "reasoning": "<your analysis>",
  "risks": ["<risk1>", "<risk2>", ...],
  "benefits": ["<benefit1>", "<benefit2>", ...],
  "recommendation": "<specific advice>"
}`;

    const userPrompt = `Decision Type: ${request.decision.type}
Description: ${request.decision.description}
Context: ${JSON.stringify(request.decision.context, null, 2)}

Please analyze this decision from a balanced, analytical perspective.`;

    const response = await this.callGemini({
      systemPrompt,
      userPrompt,
      temperature: 0.6,
      maxTokens: 1500
    });

    return this.parseAnalysisResponse(response.content);
  }

  /**
   * Get financial analysis from Doubao (contrarian personality)
   */
  async analyzeWithDoubao(request: AnalysisRequest): Promise<AnalysisResponse> {
    const systemPrompt = `You are a contrarian financial AI assistant analyzing cryptocurrency investment decisions.
Your personality is skeptical of consensus and focused on finding alternative perspectives.
You challenge conventional wisdom and look for overlooked factors.

Analyze the decision and respond in JSON format with:
{
  "stance": "strong_yes" | "yes" | "neutral" | "no" | "strong_no",
  "confidence": <number 0-100>,
  "reasoning": "<your analysis>",
  "risks": ["<risk1>", "<risk2>", ...],
  "benefits": ["<benefit1>", "<benefit2>", ...],
  "recommendation": "<specific advice>"
}`;

    const userPrompt = `Decision Type: ${request.decision.type}
Description: ${request.decision.description}
Context: ${JSON.stringify(request.decision.context, null, 2)}

Please analyze this decision from a contrarian, alternative-thinking perspective.`;

    const response = await this.callDoubao({
      systemPrompt,
      userPrompt,
      temperature: 0.9,
      maxTokens: 1500
    });

    return this.parseAnalysisResponse(response.content);
  }

  /**
   * Parse JSON analysis response from AI
   */
  private parseAnalysisResponse(content: string): AnalysisResponse {
    try {
      // Extract JSON from response (in case AI wraps it in markdown)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      return {
        stance: parsed.stance,
        confidence: parsed.confidence,
        reasoning: parsed.reasoning,
        risks: parsed.risks || [],
        benefits: parsed.benefits || [],
        recommendation: parsed.recommendation || ''
      };
    } catch (error) {
      console.error('[AI Provider] Failed to parse analysis:', error);

      // Fallback response if parsing fails
      return {
        stance: 'neutral',
        confidence: 50,
        reasoning: content.slice(0, 500),
        risks: ['Unable to parse structured response'],
        benefits: [],
        recommendation: 'Review manually'
      };
    }
  }

  /**
   * Get analysis from all available AIs in parallel
   */
  async analyzeWithAll(request: AnalysisRequest): Promise<{
    claude?: AnalysisResponse;
    gpt?: AnalysisResponse;
    gemini?: AnalysisResponse;
    doubao?: AnalysisResponse;
    errors: string[];
  }> {
    const results: any = {};
    const errors: string[] = [];

    // Call all AIs in parallel
    const promises = [];

    if (this.config.anthropicApiKey) {
      promises.push(
        this.analyzeWithClaude(request)
          .then(r => { results.claude = r; })
          .catch(e => errors.push(`Claude: ${e.message}`))
      );
    }

    if (this.config.openaiApiKey) {
      promises.push(
        this.analyzeWithGPT(request)
          .then(r => { results.gpt = r; })
          .catch(e => errors.push(`GPT: ${e.message}`))
      );
    }

    if (this.config.googleApiKey) {
      promises.push(
        this.analyzeWithGemini(request)
          .then(r => { results.gemini = r; })
          .catch(e => errors.push(`Gemini: ${e.message}`))
      );
    }

    if (this.config.doubaoApiKey) {
      promises.push(
        this.analyzeWithDoubao(request)
          .then(r => { results.doubao = r; })
          .catch(e => errors.push(`Doubao: ${e.message}`))
      );
    }

    await Promise.all(promises);

    return { ...results, errors };
  }

  /**
   * Check which AI APIs are configured
   */
  getAvailableProviders(): string[] {
    const available: string[] = [];

    if (this.config.anthropicApiKey) available.push('claude');
    if (this.config.openaiApiKey) available.push('gpt');
    if (this.config.googleApiKey) available.push('gemini');
    if (this.config.doubaoApiKey) available.push('doubao');

    return available;
  }

  /**
   * Test API connections
   */
  async testConnections(): Promise<{
    claude: boolean;
    gpt: boolean;
    gemini: boolean;
    doubao: boolean;
  }> {
    const testPrompt = {
      systemPrompt: 'You are a helpful AI assistant.',
      userPrompt: 'Respond with just "OK" to confirm the connection is working.',
      maxTokens: 10
    };

    const results = {
      claude: false,
      gpt: false,
      gemini: false,
      doubao: false
    };

    if (this.config.anthropicApiKey) {
      try {
        await this.callClaude(testPrompt);
        results.claude = true;
      } catch (e) {
        console.error('[AI Provider] Claude test failed:', e);
      }
    }

    if (this.config.openaiApiKey) {
      try {
        await this.callOpenAI(testPrompt);
        results.gpt = true;
      } catch (e) {
        console.error('[AI Provider] OpenAI test failed:', e);
      }
    }

    if (this.config.googleApiKey) {
      try {
        await this.callGemini(testPrompt);
        results.gemini = true;
      } catch (e) {
        console.error('[AI Provider] Gemini test failed:', e);
      }
    }

    if (this.config.doubaoApiKey) {
      try {
        await this.callDoubao(testPrompt);
        results.doubao = true;
      } catch (e) {
        console.error('[AI Provider] Doubao test failed:', e);
      }
    }

    return results;
  }

  /**
   * Update API keys
   */
  updateConfig(newConfig: Partial<AIConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('[AI Provider] Config updated. Available:', this.getAvailableProviders());
  }
}

export default AIProvider;
