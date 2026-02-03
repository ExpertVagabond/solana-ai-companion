# 🧪 Testing Guide - Solana AI Companion
**Comprehensive Testing for Hackathon Submission**

---

## 📋 Test Coverage

### ✅ Unit Tests
- Autonomous modules
- Integration services
- Utility functions
- State management

### ✅ Integration Tests
- Module interactions
- API integrations
- Data flow
- Error handling

### ✅ E2E Tests
- User flows
- Screen navigation
- Full feature demos

### ✅ Manual Testing
- UI/UX validation
- Performance checks
- Edge cases
- Demo rehearsal

---

## 🎯 Critical User Flows

### Flow 1: Portfolio Analysis (2 minutes)
```
1. Open app (MainScreen loads)
   ✓ Shows Chat screen by default
   ✓ Bottom navigation visible

2. Navigate to Portfolio tab
   ✓ Portfolio dashboard loads
   ✓ Shows loading state initially
   ✓ Displays metrics within 3 seconds

3. View portfolio metrics
   ✓ Total value displayed correctly
   ✓ 24h change shown (if available)
   ✓ Risk score visible (0-100)
   ✓ Diversification score visible

4. View holdings list
   ✓ All tokens listed
   ✓ Values calculated correctly
   ✓ Percentages sum to ~100%
   ✓ Price changes shown

5. Check AI insights
   ✓ Insight card displayed
   ✓ Relevant recommendation
   ✓ Action button functional

6. Tap "Check Risks"
   ✓ Risk alerts generated
   ✓ Severity levels correct
   ✓ Suggested actions shown

7. Tap "Refresh"
   ✓ Re-analyzes portfolio
   ✓ Shows loading state
   ✓ Updates all metrics

PASS: ☐ | FAIL: ☐ | Notes: _______________
```

### Flow 2: Opportunity Discovery (3 minutes)
```
1. Navigate to Opportunities tab
   ✓ Shows loading state
   ✓ Opportunities list loads
   ✓ Multiple protocols shown

2. View opportunity cards
   ✓ Protocol name displayed
   ✓ APY percentage prominent
   ✓ Risk score color-coded
   ✓ TVL shown in millions
   ✓ Min deposit displayed

3. Filter by risk
   ✓ Tap "Low Risk" filter
   ✓ List updates immediately
   ✓ Only low-risk opps shown
   ✓ Count updates correctly

4. Filter by type
   ✓ Tap "Lending" filter
   ✓ Only lending opps shown
   ✓ Filters work together

5. Sort options
   ✓ Sort by APY (default)
   ✓ Sort by Risk
   ✓ Sort by TVL
   ✓ List reorders correctly

6. Select opportunity
   ✓ Card taps register
   ✓ Details shown/action taken

7. Tap "Refresh"
   ✓ Re-scans all protocols
   ✓ Shows loading state
   ✓ Updates list

PASS: ☐ | FAIL: ☐ | Notes: _______________
```

### Flow 3: AI Chat Interaction (4 minutes)
```
1. Navigate to Chat tab
   ✓ Empty state shows welcome
   ✓ Suggestion buttons visible
   ✓ Input field ready

2. Send message: "Analyze my portfolio"
   ✓ Message appears in chat
   ✓ Typing indicator shows
   ✓ AI responds within 5 seconds
   ✓ Response contains metrics

3. Send message: "Find opportunities"
   ✓ Message sent successfully
   ✓ AI responds with list
   ✓ Top 5 opportunities shown
   ✓ Formatted nicely

4. Send message: "Check risks"
   ✓ AI analyzes risk alerts
   ✓ Lists any concerns
   ✓ Suggests actions

5. Send message: "Get consensus on swapping SOL to USDC"
   ✓ AI explains consensus process
   ✓ Instructs how to request

6. Check AI indicator
   ✓ Shows current AI (Claude/GPT/etc)
   ✓ Color matches personality

7. Scroll through messages
   ✓ Auto-scrolls to bottom
   ✓ Timestamps visible
   ✓ Messages formatted correctly

PASS: ☐ | FAIL: ☐ | Notes: _______________
```

### Flow 4: AI Selector & Personalities (2 minutes)
```
1. Navigate to AI tab
   ✓ Shows all 4 AI cards
   ✓ Currently selected highlighted

2. View AI personalities
   ✓ Claude: Conservative
   ✓ GPT: Aggressive
   ✓ Gemini: Balanced
   ✓ Doubao: Contrarian

3. View comparison charts
   ✓ Risk approach bars visible
   ✓ Opportunity focus shown
   ✓ Contrarian view displayed
   ✓ Legend matches colors

4. Tap different AI
   ✓ Selection changes
   ✓ Checkmark moves
   ✓ Border highlights

5. View unavailable AIs
   ✓ "Setup Required" badge shown
   ✓ Cards slightly dimmed
   ✓ Tap does nothing

6. View Consensus section
   ✓ Consensus button visible
   ✓ Explanation shown
   ✓ Features listed

7. Switch back to original AI
   ✓ Selection persists
   ✓ Affects chat messages

PASS: ☐ | FAIL: ☐ | Notes: _______________
```

### Flow 5: Navigation & State (1 minute)
```
1. Test bottom navigation
   ✓ Chat tab switches screen
   ✓ Portfolio tab switches
   ✓ Opportunities tab switches
   ✓ AI tab switches

2. Check state persistence
   ✓ Switch to Portfolio, back to Chat
   ✓ Messages still visible
   ✓ Scroll position maintained

3. Check filters persistence
   ✓ Set filters in Opportunities
   ✓ Navigate away
   ✓ Come back - filters intact

4. Check selected AI persistence
   ✓ Select different AI
   ✓ Navigate away
   ✓ Come back - selection intact

PASS: ☐ | FAIL: ☐ | Notes: _______________
```

---

## 🔬 Module Testing

### PortfolioAnalyzer Tests
```typescript
// Test 1: Analyze wallet with holdings
✓ Fetches balances from Solana
✓ Calculates total value
✓ Computes risk score (0-100)
✓ Identifies dominant token
✓ Generates recommendations

// Test 2: Empty wallet
✓ Handles zero balance gracefully
✓ Returns default metrics
✓ No recommendations generated

// Test 3: High concentration
✓ Detects concentration > 70%
✓ Risk score increases
✓ Recommends diversification

// Test 4: Real-time monitoring
✓ Updates every 5 minutes
✓ Calls callback with new data
✓ Can be stopped
```

### RiskGuardian Tests
```typescript
// Test 1: Stop-loss detection
✓ Detects loss > threshold
✓ Generates critical alert
✓ Suggests protective action

// Test 2: Concentration alert
✓ Detects concentration > max
✓ Generates warning alert
✓ Suggests rebalancing

// Test 3: Diversification alert
✓ Detects low diversification
✓ Generates info alert
✓ Suggests adding assets

// Test 4: No risks
✓ Returns empty alerts array
✓ Logs "no risks detected"
```

### OpportunityScanner Tests
```typescript
// Test 1: Scan all protocols
✓ Calls Kamino scanner
✓ Calls Drift scanner
✓ Combines results
✓ Ranks by risk-adjusted score

// Test 2: Filter by risk
✓ Filters maxRisk correctly
✓ Returns only qualifying opps
✓ Maintains sorted order

// Test 3: Real data mode
✓ Uses KaminoProvider
✓ Uses DriftProvider
✓ Fetches real APYs
✓ Calculates real risks

// Test 4: Cache behavior
✓ Caches results for 15 min
✓ Returns cached on subsequent calls
✓ Refreshes when stale
```

### ConsensusEngine Tests
```typescript
// Test 1: High agreement
✓ All AIs agree (stance similar)
✓ Agreement > 75%
✓ No debate needed
✓ Recommendation: Proceed

// Test 2: Low agreement
✓ AIs disagree (stance differs)
✓ Agreement < 60%
✓ Runs debate (3 rounds)
✓ Calculates convergence

// Test 3: With real AI
✓ Calls AIProvider
✓ Gets real opinions
✓ Parses JSON responses
✓ Falls back to simulation if fails

// Test 4: Stance distribution
✓ Counts positive/neutral/negative
✓ Generates summary correctly
```

### ExecutionEngine Tests
```typescript
// Test 1: Get quote
✓ Calls Jupiter V6 API
✓ Parses response
✓ Calculates price impact
✓ Returns valid SwapQuote

// Test 2: MEV risk assessment
✓ High impact → high risk
✓ Multi-hop → increased risk
✓ Large slippage → higher risk
✓ Returns 0-1 risk score

// Test 3: Priority fee calculation
✓ Samples recent blocks
✓ Calculates percentile
✓ Clamps to min/max
✓ Returns reasonable fee

// Test 4: Swap validation
✓ Rejects high impact (>10%)
✓ Rejects high slippage
✓ Accepts valid swaps
```

### LearningMemory Tests
```typescript
// Test 1: Record decision
✓ Generates unique ID
✓ Sets timestamp
✓ Stores in array
✓ Saves to storage

// Test 2: Infer preferences
✓ Calculates risk tolerance
✓ Finds preferred assets
✓ Infers time horizon
✓ Calculates AI trust

// Test 3: Generate insights
✓ Returns insights array
✓ Each has confidence score
✓ Recommendations included
✓ Based on sample size

// Test 4: Adjust recommendations
✓ Lowers confidence for risky (conservative user)
✓ Adds learning adjustment text
✓ Considers AI trust level
```

---

## 🔌 Integration Testing

### AI Provider Integration
```typescript
// Test 1: Claude API
✓ Sends request with correct format
✓ Includes system prompt
✓ Parses response correctly
✓ Returns AIResponse

// Test 2: Parallel calls
✓ Calls all 4 AIs simultaneously
✓ Waits for all to complete
✓ Returns results object
✓ Includes errors array

// Test 3: Error handling
✓ Handles API key missing
✓ Handles network error
✓ Returns fallback response
✓ Logs error message

// Test 4: Token tracking
✓ Counts input tokens
✓ Counts output tokens
✓ Tracks latency
✓ Returns in response
```

### Kamino Provider Integration
```typescript
// Test 1: Fetch markets
✓ Connects to Kamino
✓ Fetches reserve data
✓ Parses APY rates
✓ Returns market array

// Test 2: Risk calculation
✓ Considers utilization
✓ Considers LTV
✓ Considers liquidity
✓ Considers asset type
✓ Returns 0-100 score

// Test 3: Fallback handling
✓ Returns mock data if API fails
✓ Logs fallback usage
✓ Mock data matches structure
```

### Pyth Provider Integration
```typescript
// Test 1: Get price
✓ Fetches from Pyth HTTP API
✓ Parses price data
✓ Applies exponent
✓ Returns PriceData

// Test 2: Batch prices
✓ Fetches multiple in parallel
✓ Returns Map
✓ Includes all requested
✓ Handles individual failures

// Test 3: Calculate value
✓ Gets price by mint
✓ Applies decimals
✓ Multiplies correctly
✓ Returns USD value

// Test 4: Staleness check
✓ Checks timestamp age
✓ Returns true if >60s
✓ Returns false if fresh
```

### Drift Provider Integration
```typescript
// Test 1: Fetch markets
✓ Returns market array
✓ Includes funding rates
✓ Includes open interest
✓ All fields populated

// Test 2: Funding opportunities
✓ Identifies positive funding (short)
✓ Identifies negative funding (long)
✓ Calculates annualized APY
✓ Ranks by APY

// Test 3: Liquidation price
✓ Calculates for long
✓ Calculates for short
✓ Considers maintenance margin
✓ Returns reasonable price

// Test 4: Risk scoring
✓ Base risk for perps (40)
✓ Adds volatility risk
✓ Adds liquidity risk
✓ Returns 40-100 score
```

---

## 🎨 UI/UX Testing

### Chat Interface
```
Visual:
✓ Dark background (#0F0F0F)
✓ Messages aligned correctly
✓ AI avatar colors correct
✓ Typing indicator animates
✓ Input field expands
✓ Send button changes state

Interaction:
✓ Keyboard appears on focus
✓ Send on keyboard return
✓ Disabled while loading
✓ Scrolls to bottom automatically
✓ Suggestion buttons tap correctly

Performance:
✓ Renders 100+ messages smoothly
✓ No lag on typing
✓ Fast message sending (<100ms)
```

### Portfolio Dashboard
```
Visual:
✓ Value card prominent
✓ Risk color-coded correctly
✓ Holdings list formatted
✓ Icons display
✓ Charts/bars visible
✓ AI insights styled

Interaction:
✓ Refresh button works
✓ Action buttons tap correctly
✓ Scrolls smoothly
✓ Pull-to-refresh (if implemented)

Performance:
✓ Loads within 2 seconds
✓ Smooth animations
✓ No jank on scroll
```

### Opportunities List
```
Visual:
✓ Filters visible
✓ Sort buttons clear
✓ Opportunity cards styled
✓ Risk badges color-coded
✓ Protocol icons shown
✓ APY emphasized

Interaction:
✓ Filters toggle correctly
✓ Sort changes order
✓ Cards tap correctly
✓ Horizontal scroll on filters
✓ Refresh works

Performance:
✓ Renders 50+ opps smoothly
✓ Filter instant (<50ms)
✓ Sort instant (<50ms)
```

### AI Selector
```
Visual:
✓ AI cards styled distinctly
✓ Colors match personalities
✓ Selected state clear
✓ Comparison charts visible
✓ Legend readable

Interaction:
✓ Cards tap to select
✓ Disabled cards don't tap
✓ Consensus button taps
✓ Scrolls smoothly

Performance:
✓ Smooth transitions
✓ No lag on selection
```

---

## 🚨 Error Scenarios

### Network Errors
```
Test 1: No internet connection
✓ Shows appropriate error message
✓ Falls back to cached data
✓ Allows retry

Test 2: API timeout
✓ Handles timeout gracefully
✓ Shows user-friendly message
✓ Doesn't crash app

Test 3: Rate limiting
✓ Detects 429 response
✓ Shows "try again later" message
✓ Implements backoff
```

### Invalid Data
```
Test 1: Malformed API response
✓ Catches parse errors
✓ Falls back to defaults
✓ Logs error details

Test 2: Missing fields
✓ Uses default values
✓ Doesn't crash
✓ Shows partial data

Test 3: Extreme values
✓ Handles very large numbers
✓ Handles negative values
✓ Clamps to reasonable ranges
```

### User Errors
```
Test 1: Empty input
✓ Disables send button
✓ Shows placeholder
✓ Doesn't send empty message

Test 2: Invalid wallet address
✓ Shows error message
✓ Doesn't crash
✓ Allows correction

Test 3: No wallet connected
✓ Shows connect prompt
✓ Disables wallet features
✓ Explains why
```

---

## ⚡ Performance Benchmarks

### Load Times
```
✓ App launch: <2 seconds
✓ Screen switch: <200ms
✓ Portfolio analysis: <3 seconds
✓ Opportunity scan: <5 seconds
✓ AI response: <5 seconds
✓ Message send: <100ms
```

### Memory Usage
```
✓ Initial: <50MB
✓ After 100 messages: <100MB
✓ After full scan: <120MB
✓ No memory leaks detected
```

### Battery Impact
```
✓ Idle: <2% per hour
✓ Active use: <10% per hour
✓ Background monitoring: <5% per hour
```

---

## 📝 Testing Checklist

### Pre-Demo Testing
- [ ] All screens load without errors
- [ ] Navigation works smoothly
- [ ] Data displays correctly
- [ ] No console errors
- [ ] All interactions work
- [ ] Filters/sort functional
- [ ] Messages send correctly
- [ ] AI responses make sense
- [ ] Portfolio metrics accurate
- [ ] Opportunities ranked properly

### Demo Rehearsal
- [ ] Practice full demo 3 times
- [ ] Time each section
- [ ] Smooth transitions
- [ ] No unexpected delays
- [ ] Prepare for questions
- [ ] Have backup plans
- [ ] Test recording setup
- [ ] Check audio quality
- [ ] Verify screen capture
- [ ] Practice narration

### Pre-Submission Checks
- [ ] All code committed
- [ ] README updated
- [ ] Demo video recorded
- [ ] Forum post written
- [ ] Architecture documented
- [ ] No TODOs in code
- [ ] All features working
- [ ] Performance acceptable
- [ ] No critical bugs
- [ ] Ready for judges

---

## 🎯 Test Results Summary

```
CRITICAL FLOWS:
Portfolio Analysis:    ☐ PASS  ☐ FAIL
Opportunity Discovery: ☐ PASS  ☐ FAIL
AI Chat:              ☐ PASS  ☐ FAIL
AI Selector:          ☐ PASS  ☐ FAIL
Navigation:           ☐ PASS  ☐ FAIL

MODULE TESTS:
PortfolioAnalyzer:    ☐ PASS  ☐ FAIL
RiskGuardian:         ☐ PASS  ☐ FAIL
OpportunityScanner:   ☐ PASS  ☐ FAIL
ConsensusEngine:      ☐ PASS  ☐ FAIL
ExecutionEngine:      ☐ PASS  ☐ FAIL
LearningMemory:       ☐ PASS  ☐ FAIL

INTEGRATION TESTS:
AIProvider:           ☐ PASS  ☐ FAIL
KaminoProvider:       ☐ PASS  ☐ FAIL
PythProvider:         ☐ PASS  ☐ FAIL
DriftProvider:        ☐ PASS  ☐ FAIL

UI/UX TESTS:
ChatInterface:        ☐ PASS  ☐ FAIL
PortfolioDashboard:   ☐ PASS  ☐ FAIL
OpportunitiesList:    ☐ PASS  ☐ FAIL
AISelector:           ☐ PASS  ☐ FAIL

ERROR HANDLING:
Network Errors:       ☐ PASS  ☐ FAIL
Invalid Data:         ☐ PASS  ☐ FAIL
User Errors:          ☐ PASS  ☐ FAIL

PERFORMANCE:
Load Times:           ☐ PASS  ☐ FAIL
Memory Usage:         ☐ PASS  ☐ FAIL
Battery Impact:       ☐ PASS  ☐ FAIL

OVERALL STATUS:  ☐ READY TO SUBMIT  ☐ NEEDS WORK
```

---

**Testing Complete: Ready for Demo & Submission! 🚀**
