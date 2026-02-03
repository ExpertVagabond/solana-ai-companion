# 🔧 Troubleshooting Guide
**Solana AI Companion - Common Issues and Solutions**

---

## 📋 Table of Contents

1. [Installation Issues](#installation-issues)
2. [Build Errors](#build-errors)
3. [Runtime Errors](#runtime-errors)
4. [AI Provider Issues](#ai-provider-issues)
5. [Wallet Connection Issues](#wallet-connection-issues)
6. [DeFi Integration Issues](#defi-integration-issues)
7. [Performance Issues](#performance-issues)
8. [Demo Mode Issues](#demo-mode-issues)

---

## Installation Issues

### Issue: npm install fails with ERESOLVE errors

**Symptoms:**
```bash
npm ERR! code ERESOLVE
npm ERR! ERESOLVE unable to resolve dependency tree
```

**Solution:**
```bash
# Use legacy peer deps
npm install --legacy-peer-deps

# Or use npm 8+ which handles peer deps better
npm install
```

**Alternative:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

---

### Issue: Expo CLI not found

**Symptoms:**
```bash
expo: command not found
```

**Solution:**
```bash
# Install Expo CLI globally
npm install -g expo-cli

# Or use npx (no global install needed)
npx expo start
```

---

### Issue: Wrong Node.js version

**Symptoms:**
```bash
Error: This project requires Node.js 18+
```

**Solution:**
```bash
# Check current version
node --version

# Install Node 18+ using nvm
nvm install 18
nvm use 18

# Or download from nodejs.org
```

---

## Build Errors

### Issue: TypeScript compilation errors

**Symptoms:**
```bash
error TS2345: Argument of type 'X' is not assignable to parameter of type 'Y'
```

**Solution:**
```bash
# Check for type errors
npx tsc --noEmit

# Our project should have 0 errors
# If you see errors, make sure you're on the latest commit

git pull origin main
npm install
npx tsc --noEmit
```

---

### Issue: Metro bundler cache issues

**Symptoms:**
```bash
error: Unexpected token
error: Transform failed with 1 error
```

**Solution:**
```bash
# Clear Metro cache
npx expo start --clear

# Or manually clear cache
rm -rf node_modules/.cache
rm -rf .expo

# Restart
npx expo start
```

---

### Issue: Android build fails

**Symptoms:**
```bash
error: Failed to install the app
```

**Solution:**
```bash
# Make sure Android SDK is installed
# Check Android Studio settings

# Clear build cache
cd android
./gradlew clean
cd ..

# Rebuild
npm run android
```

---

## Runtime Errors

### Issue: "Cannot read property 'X' of undefined"

**Symptoms:**
App crashes on startup with undefined property errors.

**Solution:**
```typescript
// Check that all providers are wrapped correctly in app/_layout.tsx

// Expected structure:
<SolanaProvider>
  <AIProvider>
    <AutonomousContext>
      {children}
    </AutonomousContext>
  </AIProvider>
</SolanaProvider>
```

**Check:**
- All providers initialized
- Context is accessed after provider mount
- Optional chaining used: `user?.wallet?.publicKey`

---

### Issue: White screen on startup

**Symptoms:**
App shows white screen, no errors in console.

**Solution:**
```bash
# Check if assets are loaded
ls assets/

# Restart with clear cache
npx expo start --clear

# Check app.json configuration
cat app.json | jq '.expo.icon, .expo.splash'
```

---

### Issue: "Network request failed"

**Symptoms:**
```bash
TypeError: Network request failed
```

**Solution:**
```typescript
// Check RPC endpoint
// Default: https://api.mainnet-beta.solana.com

// For testing, use devnet:
const connection = new Connection(
  'https://api.devnet.solana.com',
  'confirmed'
);
```

**Alternative RPC providers:**
- Helius: `https://mainnet.helius-rpc.com/?api-key=YOUR_KEY`
- QuickNode: `https://your-endpoint.quiknode.pro/YOUR_KEY/`
- Alchemy: `https://solana-mainnet.g.alchemy.com/v2/YOUR_KEY`

---

## AI Provider Issues

### Issue: Anthropic API rate limit

**Symptoms:**
```bash
Error 429: Rate limit exceeded
```

**Solution:**
1. **Check your API tier:**
   - Free tier: Limited requests/minute
   - Paid tier: Higher limits

2. **Implement retry logic:**
   ```typescript
   // Already implemented in src/services/AIProvider.ts
   // Waits and retries after rate limit
   ```

3. **Use demo mode:**
   ```typescript
   // In settings, enable "Demo Mode"
   // Uses mock responses instead of real API
   ```

---

### Issue: OpenAI API authentication failed

**Symptoms:**
```bash
Error 401: Invalid API key
```

**Solution:**
1. **Verify API key:**
   ```bash
   # Check at platform.openai.com/api-keys
   # Make sure key starts with "sk-"
   ```

2. **Re-enter in app:**
   - Go to Settings tab
   - Delete old key
   - Add new key
   - Tap "Save"

3. **Check key permissions:**
   - API key needs "Read" and "Write" access
   - Not "Restricted" or "Read-only"

---

### Issue: Gemini API not available

**Symptoms:**
```bash
Error: Gemini API is not available in your region
```

**Solution:**
1. **Check availability:**
   - Gemini available in: US, UK, EU, etc.
   - Not available in: China, some countries

2. **Use VPN (if allowed):**
   - Connect to supported region
   - Get API key
   - Use in app

3. **Skip Gemini:**
   - Use other 3 AIs (Claude, GPT, Doubao)
   - Consensus still works with 3 providers

---

### Issue: Doubao API connection timeout

**Symptoms:**
```bash
Error: Request timeout after 30000ms
```

**Solution:**
1. **Doubao is China-based:**
   - May be slow outside China
   - May require VPN in some regions

2. **Increase timeout:**
   ```typescript
   // In src/services/AIProvider.ts
   const TIMEOUT = 60000; // 60 seconds
   ```

3. **Skip Doubao:**
   - Use other 3 AIs
   - Update consensus to 3-AI mode

---

## Wallet Connection Issues

### Issue: Mobile Wallet Adapter not connecting

**Symptoms:**
```bash
Error: No wallet apps found
```

**Solution:**
1. **Install a Solana wallet:**
   - Phantom (recommended)
   - Backpack
   - Solflare

2. **Check wallet app is open:**
   - MWA requires wallet app to be installed
   - App must be running in background

3. **Restart both apps:**
   ```bash
   # Close both apps completely
   # Reopen wallet app first
   # Then open Solana AI Companion
   # Try connecting again
   ```

---

### Issue: Wallet balance shows $0

**Symptoms:**
Wallet connected but balance shows $0 when you have funds.

**Solution:**
1. **Check network:**
   ```typescript
   // Make sure you're on mainnet, not devnet
   const connection = new Connection(
     'https://api.mainnet-beta.solana.com'
   );
   ```

2. **Check RPC endpoint:**
   ```bash
   # Test RPC directly
   curl https://api.mainnet-beta.solana.com \
     -X POST \
     -H "Content-Type: application/json" \
     -d '{"jsonrpc":"2.0","id":1,"method":"getHealth"}'
   ```

3. **Wait for sync:**
   - Portfolio may take 5-10 seconds to load
   - Check loading indicator

---

### Issue: Transaction signing fails

**Symptoms:**
```bash
Error: User rejected the request
```

**Solution:**
1. **Check wallet app:**
   - Make sure wallet app is responding
   - Check for notifications/prompts

2. **Approve in wallet:**
   - Wallet app should show signing request
   - Tap "Approve" in wallet

3. **Check transaction simulation:**
   ```typescript
   // Transaction may be invalid
   // Check simulation result first
   const simulation = await connection.simulateTransaction(tx);
   console.log('Simulation:', simulation);
   ```

---

## DeFi Integration Issues

### Issue: Jupiter quote not found

**Symptoms:**
```bash
Error: No routes found for this swap
```

**Solution:**
1. **Check token liquidity:**
   - Some tokens have low liquidity
   - Try smaller amount
   - Try different token pair

2. **Check slippage:**
   ```typescript
   // Increase slippage tolerance
   const slippage = 2; // 2% instead of 0.5%
   ```

3. **Use demo mode:**
   - Demo mode has mock quotes
   - Useful for testing flow

---

### Issue: Kamino lend position not showing

**Symptoms:**
No lending positions found when you have deposits.

**Solution:**
1. **Check wallet connection:**
   - Correct wallet connected?
   - Correct network (mainnet)?

2. **Check Kamino directly:**
   ```bash
   # Visit kamino.finance
   # Connect same wallet
   # Verify position exists
   ```

3. **Wait for indexing:**
   - New positions may take 1-2 minutes to index
   - Refresh after waiting

---

### Issue: Pyth price outdated

**Symptoms:**
Prices shown are from 30+ seconds ago.

**Solution:**
1. **Check Pyth network:**
   ```bash
   # Visit pyth.network
   # Check network status
   ```

2. **Use backup price feeds:**
   ```typescript
   // Falls back to Jupiter if Pyth fails
   // See src/services/PythProvider.ts
   ```

3. **Refresh manually:**
   - Pull down to refresh portfolio
   - Prices update every 30 seconds automatically

---

## Performance Issues

### Issue: App is slow/laggy

**Symptoms:**
UI feels sluggish, animations stuttering.

**Solution:**
1. **Reduce polling frequency:**
   ```typescript
   // In src/autonomous/PortfolioAnalyzer.ts
   // Change from 5min to 10min
   const INTERVAL = 10 * 60 * 1000;
   ```

2. **Disable unused features:**
   ```typescript
   // Disable opportunity scanner if not needed
   opportunityScanner.stop();
   ```

3. **Clear cache:**
   ```bash
   # Clear app data (Settings > Storage)
   # Or reinstall app
   npm run android -- --reset-cache
   ```

---

### Issue: High memory usage

**Symptoms:**
```bash
Warning: Possible memory leak detected
```

**Solution:**
1. **Check for infinite loops:**
   ```typescript
   // Make sure intervals are cleared
   useEffect(() => {
     const interval = setInterval(...);
     return () => clearInterval(interval); // Important!
   }, []);
   ```

2. **Limit conversation history:**
   ```typescript
   // Keep only last 50 messages
   const messages = allMessages.slice(-50);
   ```

3. **Restart app:**
   ```bash
   # Close and reopen
   # Clears memory
   ```

---

## Demo Mode Issues

### Issue: Demo mode not working

**Symptoms:**
Demo mode enabled but still seeing real data.

**Solution:**
1. **Check demo mode setting:**
   ```typescript
   // In Settings tab
   // Toggle "Demo Mode" ON
   // Should see "Demo Mode Active" badge
   ```

2. **Restart app:**
   ```bash
   # Close app completely
   # Reopen
   # Demo mode should activate
   ```

3. **Verify mock data:**
   ```typescript
   // Check src/services/AIProvider.ts
   // Should return mock responses when demo mode is true
   ```

---

### Issue: Mock data not realistic

**Symptoms:**
Demo mode shows unrealistic portfolio values.

**Solution:**
1. **Update mock data:**
   ```typescript
   // Edit src/autonomous/PortfolioAnalyzer.ts
   // Update MOCK_PORTFOLIO constant
   // Use realistic values
   ```

2. **Seed with real data:**
   ```typescript
   // Copy real portfolio structure
   // Replace addresses/amounts
   // Keep realistic proportions
   ```

---

## General Troubleshooting Steps

### Step 1: Check Logs
```bash
# Run app with logs
npx expo start

# Look for errors in terminal
# Red text = errors
# Yellow text = warnings
```

### Step 2: Clear Everything
```bash
# Nuclear option - clears all caches
rm -rf node_modules
rm -rf .expo
rm -rf android/app/build
rm package-lock.json
npm cache clean --force
npm install
npx expo start --clear
```

### Step 3: Verify Installation
```bash
# Run verification script
bash PRE_DEMO_VERIFICATION.sh

# Should pass 17/17 checks
# If not, fix failed checks
```

### Step 4: Check Documentation
```bash
# Read relevant docs
cat README.md          # General overview
cat QUICK_START.md     # Setup guide
cat TESTING.md         # Testing guide
cat FAQ.md             # Common questions
```

### Step 5: Ask for Help
```bash
# GitHub Issues
# Open issue at: github.com/ExpertVagabond/solana-ai-companion/issues

# Include:
# - Error message (full stack trace)
# - Steps to reproduce
# - Expected vs actual behavior
# - Environment (OS, Node version, etc.)
```

---

## Error Code Reference

### E001: API Key Invalid
**Cause:** AI provider API key is wrong or expired
**Fix:** Re-enter API key in Settings

### E002: Network Timeout
**Cause:** RPC endpoint not responding
**Fix:** Use different RPC provider or check internet connection

### E003: Wallet Not Found
**Cause:** No Solana wallet app installed
**Fix:** Install Phantom or Backpack from app store

### E004: Transaction Failed
**Cause:** Transaction simulation failed or was rejected
**Fix:** Check balance, gas fees, and transaction parameters

### E005: Consensus Timeout
**Cause:** AI providers taking too long to respond
**Fix:** Increase timeout or use demo mode

### E006: Invalid Quote
**Cause:** Jupiter couldn't find swap route
**Fix:** Try different amount or token pair

### E007: Rate Limit
**Cause:** Too many API requests
**Fix:** Wait 60 seconds or use demo mode

### E008: Memory Error
**Cause:** App running out of memory
**Fix:** Restart app, clear cache

### E009: Storage Full
**Cause:** Device storage full
**Fix:** Clear app data or free up device storage

### E010: Module Not Found
**Cause:** Missing dependency
**Fix:** Run `npm install` again

---

## Debug Mode

### Enable Debug Logging
```typescript
// In src/utils/logger.ts (create if doesn't exist)
export const DEBUG = true;

// Then in any file:
if (DEBUG) {
  console.log('[DEBUG]', ...args);
}
```

### Useful Debug Commands
```bash
# View all logs
npx expo start --dev-client

# View only errors
npx expo start 2>&1 | grep "ERROR"

# Save logs to file
npx expo start > logs.txt 2>&1
```

### React Native Debugger
```bash
# Install
npm install -g react-devtools

# Run
react-devtools

# In app: Shake device > "Debug"
```

---

## Still Having Issues?

### Before Reporting
1. ✅ Read this troubleshooting guide
2. ✅ Check FAQ.md for your question
3. ✅ Search GitHub issues
4. ✅ Try the "nuclear option" (clear everything)
5. ✅ Test with demo mode

### How to Report
1. **GitHub Issue:**
   - Go to: github.com/ExpertVagabond/solana-ai-companion/issues
   - Click "New Issue"
   - Use template if available

2. **Include:**
   - Clear description of problem
   - Steps to reproduce
   - Expected vs actual behavior
   - Error messages (full text)
   - Environment details:
     ```
     OS: macOS / Windows / Linux
     Node: 18.x.x
     npm: 9.x.x
     Expo: 52.x.x
     Device: iPhone 14 / Android 13
     ```

3. **Logs:**
   ```bash
   # Include full logs
   npx expo start > logs.txt 2>&1
   # Attach logs.txt to issue
   ```

---

## Quick Fixes Checklist

```
[ ] Restarted app
[ ] Cleared cache (npx expo start --clear)
[ ] Reinstalled dependencies (rm -rf node_modules && npm install)
[ ] Checked API keys in Settings
[ ] Tried demo mode
[ ] Verified network connection
[ ] Updated to latest code (git pull)
[ ] Read error message carefully
[ ] Checked this guide
[ ] Searched GitHub issues
```

---

## Emergency Contacts

**For Critical Issues:**
- GitHub Issues (fastest response)
- Twitter: @expertvagabond (check DMs)

**For Judges:**
- If app isn't working during demo evaluation
- Use demo mode (Settings > Demo Mode ON)
- Watch recorded demo video instead
- Check DEMO_SCRIPT.md for feature walkthrough

---

## Appendix: Useful Commands

### Development
```bash
npm start          # Start development server
npm run android    # Run on Android
npm run ios        # Run on iOS (Mac only)
npm run web        # Run in web browser
npm test           # Run tests
```

### Debugging
```bash
npx expo start --clear              # Clear cache
npx tsc --noEmit                    # Check TypeScript
npx eslint . --ext .ts,.tsx         # Check linting
npm run verify                      # Run verification script
```

### Building
```bash
eas build --platform android        # Build Android APK
eas build --platform ios            # Build iOS IPA
eas submit --platform android       # Submit to Play Store
```

### Git
```bash
git status                          # Check status
git pull origin main                # Get latest code
git reset --hard HEAD               # Discard all changes
git clean -fdx                      # Remove untracked files
```

---

**Last Updated:** February 2, 2026
**Version:** 1.0
**Status:** Ready for Demo

**Having issues? Don't panic! Most problems have simple solutions.** 🔧✨
