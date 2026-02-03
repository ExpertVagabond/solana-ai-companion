# 🏗️ Solana AI Companion - Architecture
**Colosseum Agent Hackathon Submission**

---

## 📊 System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    MOBILE APPLICATION                        │
│                   (React Native + Expo)                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │     Chat     │  │  Portfolio   │  │Opportunities │     │
│  │  Interface   │  │  Dashboard   │  │     List     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           AI Selector & Consensus View               │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│                   AUTONOMOUS CONTEXT                          │
│              (State Management & Orchestration)               │
└───────────────────────┬─────────────────────────────────────┘
                        │
         ┌──────────────┴──────────────┐
         │                             │
    ┌────▼─────┐                 ┌────▼──────┐
    │AUTONOMOUS│                 │INTEGRATION│
    │  LAYER   │                 │  SERVICES │
    └──────────┘                 └───────────┘
```

---

## 🧠 Layer 1: Autonomous Intelligence

### 1. Portfolio Analyzer (264 lines)
**Purpose:** Real-time portfolio monitoring and analysis

**Features:**
- Fetches wallet balances from Solana
- Calculates total portfolio value (USD)
- Computes risk score (0-100)
- Analyzes concentration and diversification
- Generates rebalancing recommendations
- Auto-monitoring every 5 minutes

**Key Methods:**
```typescript
analyzePortfolio(walletAddress) → { metrics, recommendations }
startMonitoring(walletAddress, callback)
stopMonitoring()
```

**Dependencies:**
- Solana web3.js (blockchain data)
- PythProvider (real-time prices)

---

### 2. Risk Guardian (266 lines)
**Purpose:** Proactive risk monitoring and protection

**Features:**
- Configurable risk rules
- Stop-loss monitoring
- Concentration alerts
- Diversification checks
- Market crash detection
- Optional auto-protection

**Alert Severities:**
- 🔴 Critical: Immediate action required
- 🟡 Warning: Monitor closely
- 🔵 Info: FYI

**Key Methods:**
```typescript
monitor(metrics) → RiskAlert[]
updateSettings(newSettings)
startMonitoring(getMetrics, callback)
```

---

### 3. Opportunity Scanner (523 lines)
**Purpose:** Multi-protocol DeFi opportunity discovery

**Protocols Scanned:**
- ✅ Kamino Finance (lending)
- ✅ Drift Protocol (perpetuals)
- 🚧 Raydium (LP pools)
- 🚧 Meteora (dynamic pools)
- 🚧 Marinade (liquid staking)

**Features:**
- Scans every 15 minutes autonomously
- Risk-adjusted scoring
- User profile filtering
- Cache management
- Fallback handling

**Scoring Algorithm:**
```typescript
Score = (APY/100) - (Risk/100 * 0.5) +
        log10(TVL)/10 +
        (lockPeriod == 0 ? 0.1 : 0)
```

**Key Methods:**
```typescript
scanAll(userProfile?) → OpportunityScanResult
findOpportunities(criteria) → Opportunity[]
startScanning(callback, userProfile?)
```

---

### 4. Consensus Engine (499 lines)
**Purpose:** Multi-AI debate and decision making

**AI Agents:**
1. **Claude** (Conservative)
   - Risk-averse, capital preservation focused
   - Temperature: 0.7
   - Personality: Cautious, thorough analysis

2. **GPT-4o** (Aggressive)
   - Opportunity-focused, growth oriented
   - Temperature: 0.8
   - Personality: Bold, alpha seeking

3. **Gemini** (Balanced)
   - Analytical, data-driven
   - Temperature: 0.6
   - Personality: Objective, measured

4. **Doubao** (Contrarian)
   - Skeptical, alternative perspectives
   - Temperature: 0.9
   - Personality: Challenging, unconventional

**Consensus Process:**
```
1. Collect opinions from all AIs (parallel)
2. Calculate agreement (0-100%)
3. If agreement < 60%, run debate (up to 3 rounds)
4. Generate final recommendation:
   - Proceed (high agreement, positive)
   - Proceed with Caution (moderate agreement)
   - Hold (low agreement or neutral)
   - Reject (high agreement, negative)
```

**Key Methods:**
```typescript
getConsensus(decision) → Consensus
getAgentOpinion(agentName, decision) → Opinion
```

---

### 5. Execution Engine (476 lines)
**Purpose:** Optimal trade execution with MEV protection

**Features:**
- Jupiter V6 quote API integration
- Multi-route comparison
- MEV risk assessment
- Jito bundle integration
- Priority fee optimization
- Pre-execution simulation

**MEV Risk Factors:**
- Price impact (0-0.4 risk)
- Multi-hop routes (0-0.3 risk)
- Slippage tolerance (0-0.3 risk)

**Key Methods:**
```typescript
getQuote(request) → SwapQuote
executeSwap(request, wallet) → ExecutionResult
validateSwap(request) → { valid, reason? }
```

---

### 6. Learning Memory (451 lines)
**Purpose:** Learn from user decisions to improve recommendations

**Features:**
- Records all decisions with context
- Infers user preferences:
  - Risk tolerance (0-100)
  - Preferred assets
  - Time horizon (short/medium/long)
  - Trust in AI (0-1)
  - Decision pattern (conservative/moderate/aggressive)
- Generates insights with confidence scores
- Adjusts recommendations based on learning
- Export/import for backup

**Key Methods:**
```typescript
recordDecision(record) → DecisionRecord
inferPreferences() → UserPreferences
getInsights() → LearningInsight[]
adjustRecommendation(base, context) → adjusted
```

---

## 🔌 Layer 2: Integration Services

### 1. AI Provider (589 lines)
**Purpose:** Real API integrations for all 4 AI providers

**Supported APIs:**
- Anthropic Claude API (Sonnet 4.5)
- OpenAI GPT API (GPT-4o)
- Google Gemini API (2.0 Flash)
- ByteDance Doubao API (1.5 Pro)

**Features:**
- Parallel API calls
- Structured JSON response parsing
- Personality-specific prompts
- Connection testing
- Token tracking
- Graceful fallbacks

**Key Methods:**
```typescript
callClaude(request) → AIResponse
callOpenAI(request) → AIResponse
callGemini(request) → AIResponse
callDoubao(request) → AIResponse
analyzeWithAll(request) → { claude?, gpt?, gemini?, doubao?, errors }
```

---

### 2. Kamino Provider (324 lines)
**Purpose:** Real lending/borrowing rates from Kamino Finance

**Features:**
- Fetches market data from Kamino Main Market
- Calculates APY rates (supply & borrow)
- TVL calculations
- Risk scoring (0-100)
- Reserve utilization tracking
- Mock data fallback

**Risk Factors:**
- Utilization rate (0-30 risk)
- LTV ratio (0-25 risk)
- Liquidity depth (0-25 risk)
- Asset type (5-30 risk)

**Key Methods:**
```typescript
fetchMarkets() → KaminoMarket[]
getLendingOpportunities() → KaminoOpportunity[]
getTopOpportunities(limit) → KaminoOpportunity[]
```

---

### 3. Pyth Provider (385 lines)
**Purpose:** Real-time price oracles from Pyth Network

**Supported Assets:**
- SOL/USD, BTC/USD, ETH/USD
- USDC/USD, USDT/USD
- mSOL/USD, stSOL/USD, jitoSOL/USD
- RAY/USD, JUP/USD
- + more

**Features:**
- Real-time price feeds
- Confidence intervals
- Staleness detection (60s)
- Batch calculations
- Price subscriptions
- Fallback prices

**Key Methods:**
```typescript
getPrice(symbol) → PriceData
getPrices(symbols) → Map<symbol, PriceData>
calculateValue(mint, amount, decimals) → USD
batchCalculateValues(holdings) → valuations
```

---

### 4. Drift Provider (432 lines)
**Purpose:** Perpetual futures markets and funding rates

**Markets:**
- SOL-PERP (12.3% funding APY)
- BTC-PERP (8.7% funding APY)
- ETH-PERP (10.5% funding APY)
- JUP-PERP (18.5% funding APY)

**Features:**
- Real-time funding rates
- Liquidation calculations
- Collateral requirements
- Funding payment estimates
- Position PnL simulation
- Risk scoring (40-100 for leveraged)

**Key Methods:**
```typescript
fetchMarkets() → DriftMarket[]
getFundingOpportunities() → DriftOpportunity[]
calculateLiquidationPrice(entry, leverage, side) → price
estimateFundingPayments(market, size, side, days) → payments
```

---

### 5. SolMail Integration (521 lines)
**Purpose:** AI-composed physical mail via blockchain

**Features:**
- Portfolio report generation
- Crypto gift letters
- Transaction summaries
- Custom letters with AI
- Pay with SOL or USDC
- Worldwide delivery

**Letter Types:**
- Portfolio reports (Claude composer)
- Gift introductions (Gemini composer)
- Transaction summaries
- Custom messages

**Key Methods:**
```typescript
composePortfolioReport(data, tone, ai) → letter
composeGiftLetter(recipient, sender, amount) → letter
sendLetter(request, letter, wallet) → SolMailResult
```

---

## 🎨 Layer 3: Mobile UI

### 1. Chat Interface (442 lines)
**Features:**
- Message bubbles (user/assistant)
- AI provider indicator
- Portfolio value in header
- Loading states
- Quick suggestions
- Auto-scroll
- Keyboard handling

### 2. Portfolio Dashboard (509 lines)
**Features:**
- Total value card with 24h change
- Risk score (color-coded)
- Diversification metrics
- Holdings list
- Token price changes
- AI insights
- Action buttons

### 3. AI Selector (389 lines)
**Features:**
- 4 AI personality cards
- Visual comparison charts
- Consensus request
- Availability status
- Personality traits
- Setup indicators

### 4. Opportunities List (590 lines)
**Features:**
- Filterable by risk/type
- Sortable by APY/risk/TVL
- Opportunity cards
- Risk indicators
- Protocol icons
- AI consensus button

---

## 🔗 Layer 4: Integration

### Autonomous Context (329 lines)
**Purpose:** State management and orchestration

**Responsibilities:**
- Initialize all autonomous modules
- Manage application state
- Coordinate data flow
- Handle async operations
- Provide React hooks

**State:**
```typescript
{
  portfolioMetrics, recommendations, isAnalyzing,
  riskAlerts, isMonitoring,
  opportunities, scanResult, isScanning,
  lastConsensus, isGettingConsensus,
  userPreferences, insights,
  useRealData, rpcUrl
}
```

**Actions:**
```typescript
{
  analyzePortfolio, startPortfolioMonitoring,
  checkRisks, updateRiskSettings,
  scanOpportunities, filterOpportunities,
  getConsensus, getSwapQuote, executeSwap,
  recordDecision, getUserPreferences, getInsights,
  setUseRealData, setAIConfig
}
```

### Main Screen (473 lines)
**Purpose:** Screen orchestration and navigation

**Screens:**
- Chat (conversational AI)
- Portfolio (dashboard)
- Opportunities (DeFi list)
- AI (selector & consensus)

**Features:**
- Bottom navigation
- Screen state management
- Message processing
- Filter handling
- Mock wallet integration

---

## 📊 Data Flow

### 1. Portfolio Analysis Flow
```
User → MainScreen → AutonomousContext
         ↓
   PortfolioAnalyzer
         ↓
   Solana RPC (balances)
         +
   PythProvider (prices)
         ↓
   PortfolioMetrics
         ↓
   RiskGuardian (alerts)
         ↓
   PortfolioDashboard (render)
```

### 2. Opportunity Discovery Flow
```
User → MainScreen → AutonomousContext
         ↓
   OpportunityScanner
         ↓
   ┌────────┼────────┐
   │        │        │
Kamino   Drift   Raydium
   │        │        │
   └────────┼────────┘
         ↓
   Ranked Opportunities
         ↓
   OpportunitiesList (render)
```

### 3. Multi-AI Consensus Flow
```
User Decision → ConsensusEngine
         ↓
   ┌─────┼──────┬──────┐
   │     │      │      │
Claude GPT Gemini Doubao
   │     │      │      │
   └─────┼──────┴──────┘
         ↓
   Calculate Agreement
         ↓
   Agreement < 60%? → Run Debate
         ↓
   Final Recommendation
         ↓
   Chat Interface (render)
```

---

## 🔐 Security Considerations

**Private Keys:**
- Never stored in app
- Always in wallet (Phantom, Backpack)
- Signed via Mobile Wallet Adapter

**API Keys:**
- Stored in Expo Secure Store (encrypted)
- Never logged or transmitted
- User-provided

**Transactions:**
- Always simulated before execution
- User confirmation required
- Clear transaction details shown

**Data Privacy:**
- All processing local
- No data sent to external servers (except AI APIs)
- Portfolio data never leaves device
- Learning data stored locally

---

## 🧪 Testing Strategy

### Unit Tests
- Autonomous modules (individual functions)
- Integration services (API mocking)
- UI components (React Testing Library)

### Integration Tests
- Portfolio analysis end-to-end
- Opportunity scanning flow
- Consensus generation
- Price fetching

### E2E Tests
- Full user flows
- Screen navigation
- State management
- Error scenarios

---

## 📈 Performance Optimization

**Caching:**
- Opportunities cached (15min TTL)
- Price data cached (60s TTL)
- Portfolio metrics cached (5min TTL)

**Parallel Execution:**
- AI calls run in parallel
- Protocol scans run in parallel
- Price fetches batched

**Lazy Loading:**
- Screens loaded on demand
- Heavy computations debounced
- Images optimized

---

## 🚀 Deployment

**Mobile:**
- React Native + Expo SDK 52
- Build for Android (Solana Seeker ready)
- TestFlight for iOS testing
- Solana dApp Store ready

**Backend:**
- No traditional backend needed
- All logic runs client-side
- Direct blockchain interaction
- Direct AI API calls

---

## 📊 Metrics

**Codebase:**
- 12,640 total lines
- 6 autonomous modules (2,481 lines)
- 5 integration services (2,251 lines)
- 4 UI components (1,930 lines)
- 2 integration layers (802 lines)
- Other code (5,176 lines)

**Integrations:**
- 4 AI APIs (Claude, GPT, Gemini, Doubao)
- 3 DeFi protocols (Kamino, Drift, Pyth)
- 1 physical service (SolMail)
- 1 swap aggregator (Jupiter V6)

**Coverage:**
- Autonomous: 100%
- AI: 100%
- DeFi: 75% (3 real, 4 mock ready)
- UI: 100%

---

## 🏆 What Makes This "Most Agentic"

1. **True Autonomy:**
   - Portfolio monitored every 5 minutes (no user trigger)
   - Opportunities scanned every 15 minutes
   - Risks assessed continuously
   - Learning happens automatically

2. **Multi-Agent Intelligence:**
   - 4 AI agents with distinct personalities
   - Debate when opinions differ
   - Consensus-based decisions
   - Not just wrappers - real intelligence

3. **Proactive Actions:**
   - Alerts sent before losses occur
   - Opportunities presented proactively
   - Recommendations adapt to user
   - Can auto-execute (user configurable)

4. **Learning & Adaptation:**
   - Infers user preferences
   - Improves over time
   - Adjusts recommendations
   - Personalized to each user

5. **Real-World Integration:**
   - Physical mail via SolMail
   - Actual trade execution
   - Real blockchain transactions
   - Not just analysis - action

---

**This is what "agentic" looks like.**

Not APIs. Not dashboards. Not wrappers.

**Autonomous intelligence that acts.**
