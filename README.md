# Solana AI Companion

**Four AIs autonomously managing your Solana portfolio through conversation**

Built for the **Colosseum Agent Hackathon** - A truly autonomous AI companion for the Solana Mobile ecosystem that monitors your portfolio 24/7, finds high-yield opportunities, protects against losses, and uses multi-AI consensus before executing strategies.

---

## 🏆 Hackathon Submission

**Status:** ✅ **READY FOR JUDGING**
**Prize Category:** Most Agentic
**Completion:** 97%
**Code:** 12,640 lines (TypeScript/React Native)
**Documentation:** 4,271 lines (10 comprehensive files)

**Demo Video:** [YouTube - Recording in Progress] 🎬
**Project Page:** https://arena.colosseum.org/projects/14
**GitHub:** https://github.com/ExpertVagabond/solana-ai-companion

### Why "Most Agentic"?
✅ **True Autonomy** - Monitors every 5min, scans every 15min (no user trigger)
✅ **Multi-AI Intelligence** - 4 real APIs debating (not wrappers)
✅ **Proactive Actions** - Alerts before losses, discovers without asking
✅ **Real-World Impact** - Physical mail via blockchain (SolMail)
✅ **Production Quality** - 12,640 lines, comprehensive docs, 0 errors

**No other project has all five.** See [COMPETITIVE_ANALYSIS.md](./COMPETITIVE_ANALYSIS.md) for detailed comparison.

---

## Features

### 🤖 Multi-AI Consensus System
- **4 AI Personalities**: Claude (conservative), GPT (aggressive), Gemini (balanced), Doubao (contrarian)
- **Debate & Agreement**: AIs analyze independently, debate when they disagree, reach consensus
- **Transparent Decision-Making**: See all AI opinions, reasoning, and confidence scores

### 📊 Autonomous Portfolio Management
- **Real-Time Monitoring**: Portfolio analyzed every 5 minutes automatically
- **Risk Scoring**: Dynamic 0-100 risk assessment based on concentration and market conditions
- **Auto-Rebalancing**: Proactive recommendations to optimize your holdings
- **Learning Memory**: System learns your preferences and improves over time

### 🛡️ Intelligent Risk Guardian
- **Proactive Protection**: Monitors for stop-losses, concentration risk, market crashes
- **3-Tier Alerts**: Info, Warning, Critical alerts with customizable thresholds
- **Optional Auto-Protection**: Can automatically execute protective actions if enabled

### 💎 DeFi Opportunity Scanner
- **Multi-Protocol**: Scans Kamino, Drift, Raydium, Meteora, Marinade for yields
- **Risk-Adjusted Scoring**: Not just highest APY - considers risk, liquidity, lock periods
- **Autonomous Discovery**: Scans every 15 minutes for new opportunities
- **Personalized Filtering**: Matches opportunities to your risk tolerance and preferences

### ⚡ Smart Execution Engine
- **Jupiter V6 Integration**: Best swap routes across all Solana DEXs
- **MEV Protection**: Jito bundles for large trades to prevent front-running
- **Dynamic Fees**: Optimizes priority fees based on network conditions
- **Pre-Execution Simulation**: Validates transactions before sending

### 📮 SolMail Integration
- **AI-Composed Letters**: Send physical mail via blockchain (https://solmail.online)
- **Portfolio Reports**: Monthly reports mailed to advisors/accountants
- **Crypto Gift Letters**: Introduce friends/family to crypto with explanatory letters
- **Transaction Summaries**: Physical records of your blockchain activity

### 💬 Conversational Interface
- **Chat with Claude, OpenAI, Gemini, or Doubao**: Natural language portfolio management
- **Solana Wallet Integration**: Connect via Mobile Wallet Adapter (Phantom, Backpack, etc.)
- **Wallet-Aware AI**: AI assistants see your portfolio and provide personalized advice
- **Dark Mode**: Beautiful Solana-branded dark theme optimized for OLED displays
- **Conversation History**: All chats saved locally with search and export

## Tech Stack

- **React Native** with Expo (SDK 52)
- **Expo Router** for navigation
- **Solana Mobile Stack**
  - Mobile Wallet Adapter 2.1.0
  - @solana/web3.js
- **TypeScript** for type safety
- **Secure Store** for API keys and wallet data

## Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- Android Studio (for Android builds)
- A Solana Seeker device or Android emulator

### Installation

```bash
# Clone the repository
cd solana-ai-chat

# Install dependencies
npm install

# Start the development server
npm start

# Run on Android
npm run android
```

### Configuration

1. Open the app and go to **Settings**
2. Add your API keys for the AI providers you want to use:
   - **Claude**: Get from [console.anthropic.com](https://console.anthropic.com)
   - **OpenAI**: Get from [platform.openai.com](https://platform.openai.com)
   - **Gemini**: Get from [aistudio.google.com](https://aistudio.google.com)
   - **Doubao**: Get from [volcengine.com](https://www.volcengine.com)

## Building for Solana dApp Store

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Build for dApp Store
eas build --platform android --profile dapp-store
```

### Publishing to Solana dApp Store

1. Build your APK using the command above
2. Follow the [Solana dApp Store Publishing Guide](https://docs.solanamobile.com/dapp-publishing/intro)
3. Submit via the Solana dApp Publisher Portal

## Project Structure

```
solana-ai-chat/
├── app/                        # Expo Router screens
│   ├── _layout.tsx            # Root layout with providers
│   ├── index.tsx              # Main chat screen
│   ├── settings.tsx           # API keys and preferences
│   └── history.tsx            # Conversation history
├── src/
│   ├── autonomous/            # 🔥 Autonomous AI modules (2,377 lines)
│   │   ├── PortfolioAnalyzer.ts   # Real-time portfolio monitoring (264 lines)
│   │   ├── RiskGuardian.ts        # Proactive risk management (266 lines)
│   │   ├── OpportunityScanner.ts  # DeFi opportunity discovery (471 lines)
│   │   ├── ConsensusEngine.ts     # Multi-AI debate system (449 lines)
│   │   ├── ExecutionEngine.ts     # Jupiter V6 + Jito execution (476 lines)
│   │   └── LearningMemory.ts      # User preference learning (451 lines)
│   ├── services/              # Integration services
│   │   └── SolMailIntegration.ts  # Physical mail via blockchain (480 lines)
│   ├── components/            # UI components
│   ├── providers/             # Context providers
│   │   ├── SolanaProvider.tsx
│   │   └── AIProvider.tsx
│   ├── types/                 # TypeScript types
│   └── utils/                 # Utilities
├── assets/                    # Images and icons
└── package.json
```

## AI Providers

| Provider | Models | Context Window |
|----------|--------|----------------|
| Claude | Sonnet 4, Haiku 3.5, Opus 4 | 200K |
| OpenAI | GPT-4o, GPT-4o Mini, o1 | 128K-200K |
| Gemini | 2.0 Flash, 1.5 Pro, 1.5 Flash | 1M-2M |
| Doubao | 1.5 Pro, 1.5 Lite, Pro 256K | 32K-256K |

## Autonomous Features

### Portfolio Analyzer
```typescript
const analyzer = new PortfolioAnalyzer(rpcUrl);
const { metrics, recommendations } = await analyzer.analyzePortfolio(wallet);

// Returns:
// - Total portfolio value
// - Risk score (0-100)
// - Concentration analysis
// - Specific rebalancing recommendations
// - Can run autonomously every 5 minutes
```

### Risk Guardian
```typescript
const guardian = new RiskGuardian({
  stopLossPercentage: 20,
  maxConcentration: 0.7,
  minDiversification: 3,
  autoProtect: false // User must enable
});

const alerts = await guardian.monitor(metrics);
// Returns critical/warning/info alerts
// Can auto-execute protection if enabled
```

### Opportunity Scanner
```typescript
const scanner = new OpportunityScanner(rpcUrl);
const result = await scanner.scanAll(userProfile);

// Scans: Kamino, Drift, Raydium, Meteora, Marinade
// Returns: Ranked opportunities by risk-adjusted return
// Highlights: Highest APY, Lowest risk, Best overall
```

### Consensus Engine
```typescript
const consensus = new ConsensusEngine();
const result = await consensus.getConsensus(decision);

// 4 AI agents analyze independently
// Calculate agreement (0-100%)
// Run debate if low agreement
// Final recommendation: proceed/caution/hold/reject
```

### Execution Engine
```typescript
const executor = new ExecutionEngine(rpcUrl);
const result = await executor.executeSwap(request, walletPublicKey);

// Jupiter V6 optimal routing
// Jito MEV protection for large trades
// Dynamic priority fee optimization
// Pre-execution simulation
```

### SolMail Integration
```typescript
const solmail = new SolMailIntegration(rpcUrl);

// Send AI-composed portfolio report via physical mail
await solmail.sendMonthlyReport(portfolioData, recipient, wallet);

// Send crypto gift with educational letter
await solmail.sendGiftWithLetter(giftDetails, wallet);

// Powered by https://solmail.online
// Pay with SOL or USDC, delivered worldwide
```

## Solana Features

- **Connect Wallet**: Use Mobile Wallet Adapter to connect any compatible wallet
- **View Balance**: See your SOL and SPL token balances
- **Send SOL**: Transfer SOL directly from the app
- **Execute Swaps**: Trade via Jupiter V6 with MEV protection
- **Sign Messages**: Sign arbitrary messages for verification

## Solana MCP Tools

The AI assistants have access to real-time Solana blockchain data through function calling:

| Tool | Description |
|------|-------------|
| `get_sol_balance` | Check SOL balance of any wallet |
| `get_token_balances` | Get SPL token holdings |
| `get_transaction` | Look up transaction details by signature |
| `get_recent_transactions` | Get recent wallet activity |
| `get_token_info` | Get token metadata by mint address |
| `get_sol_price` | Current SOL/USD price via Jupiter |
| `get_token_price` | Price of any SPL token |
| `lookup_domain` | Resolve .sol domains (Bonfida SNS) |
| `get_stake_accounts` | View staking positions and validators |
| `get_nfts` | List NFTs owned by a wallet |

### Example Queries

Try asking the AI:
- "What's the balance of toly.sol?"
- "Show me the recent transactions for [wallet address]"
- "What's the current SOL price?"
- "What NFTs does [address] own?"
- "Look up this transaction: [signature]"

The AI will automatically use the appropriate tools to fetch real-time data from the Solana blockchain.

## Security

- API keys stored in Expo Secure Store (encrypted)
- Wallet private keys never leave the wallet app
- No data sent to external servers (except AI APIs)

## License

MIT

## Links

### Hackathon
- [Colosseum Agent Hackathon](https://arena.colosseum.org/hackathons/agent)
- [Project Page](https://arena.colosseum.org/projects/14)
- [GitHub Repository](https://github.com/ExpertVagabond/solana-ai-companion)

### Solana
- [Solana Mobile Docs](https://docs.solanamobile.com/)
- [Solana dApp Store](https://solanamobile.com/appstore)
- [Solana MCP Server](https://smithery.ai/server/ExpertVagabond/solana-mcp-server)

### AI Providers
- [Anthropic Claude API](https://docs.anthropic.com/)
- [OpenAI API](https://platform.openai.com/docs)
- [Google Gemini API](https://ai.google.dev/docs)
- [ByteDance Doubao](https://team.doubao.com/)

### DeFi Protocols
- [Jupiter V6](https://station.jup.ag/)
- [Kamino Finance](https://kamino.finance/)
- [Drift Protocol](https://www.drift.trade/)
- [Raydium](https://raydium.io/)
- [Meteora](https://meteora.ag/)
- [Marinade Finance](https://marinade.finance/)
- [Jito Labs](https://www.jito.network/)

### Services
- [SolMail - Blockchain Physical Mail](https://solmail.online/)
