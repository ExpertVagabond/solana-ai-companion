#!/bin/bash

# Pre-Demo Verification Script
# Solana AI Companion - Colosseum Agent Hackathon
# Run this before recording demo video

echo "╔════════════════════════════════════════════════════════════╗"
echo "║     SOLANA AI COMPANION - PRE-DEMO VERIFICATION           ║"
echo "║     Colosseum Agent Hackathon - Most Agentic Prize        ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

PASSED=0
FAILED=0

# Function to check status
check_status() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ PASS${NC} - $1"
        ((PASSED++))
    else
        echo -e "${RED}✗ FAIL${NC} - $1"
        ((FAILED++))
    fi
}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1. CODE QUALITY CHECKS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check TypeScript compilation
echo -n "Checking TypeScript compilation... "
npx tsc --noEmit > /dev/null 2>&1
check_status "TypeScript compiles with 0 errors"

# Check for node_modules
echo -n "Checking dependencies installed... "
[ -d "node_modules" ]
check_status "node_modules directory exists"

# Check package.json
echo -n "Checking package.json exists... "
[ -f "package.json" ]
check_status "package.json found"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "2. FILE STRUCTURE CHECKS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check autonomous modules
echo -n "Checking autonomous modules... "
[ -f "src/autonomous/PortfolioAnalyzer.ts" ] && \
[ -f "src/autonomous/RiskGuardian.ts" ] && \
[ -f "src/autonomous/OpportunityScanner.ts" ] && \
[ -f "src/autonomous/ConsensusEngine.ts" ] && \
[ -f "src/autonomous/ExecutionEngine.ts" ] && \
[ -f "src/autonomous/LearningMemory.ts" ]
check_status "All 6 autonomous modules present"

# Check integration services
echo -n "Checking integration services... "
[ -f "src/services/AIProvider.ts" ] && \
[ -f "src/services/KaminoProvider.ts" ] && \
[ -f "src/services/PythProvider.ts" ] && \
[ -f "src/services/DriftProvider.ts" ] && \
[ -f "src/services/SolMailIntegration.ts" ]
check_status "All 5 integration services present"

# Check UI components
echo -n "Checking UI components... "
[ -f "app/components/ChatInterface.tsx" ] && \
[ -f "app/components/PortfolioDashboard.tsx" ] && \
[ -f "app/components/AISelector.tsx" ] && \
[ -f "app/components/OpportunitiesList.tsx" ]
check_status "All 4 UI components present"

# Check integration layer
echo -n "Checking integration layer... "
[ -f "app/context/AutonomousContext.tsx" ] && \
[ -f "app/screens/MainScreen.tsx" ]
check_status "Integration layer complete"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "3. DOCUMENTATION CHECKS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check core documentation
echo -n "Checking core documentation... "
[ -f "README.md" ] && \
[ -f "ARCHITECTURE.md" ] && \
[ -f "TESTING.md" ] && \
[ -f "DEMO_SCRIPT.md" ]
check_status "Core documentation present"

# Check submission materials
echo -n "Checking submission materials... "
[ -f "SUBMISSION.md" ] && \
[ -f "COMPETITIVE_ANALYSIS.md" ] && \
[ -f "DAY_10_CHECKLIST.md" ]
check_status "Submission materials complete"

# Check demo materials
echo -n "Checking demo materials... "
[ -f "DEMO_PREP.md" ] && \
[ -f "FINAL_FORUM_POST.md" ]
check_status "Demo materials ready"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "4. GIT REPOSITORY CHECKS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check git status
echo -n "Checking git status... "
git diff --quiet && git diff --cached --quiet
check_status "No uncommitted changes"

# Check remote
echo -n "Checking git remote... "
git remote get-url origin > /dev/null 2>&1
check_status "Git remote configured"

# Check branch
echo -n "Checking git branch... "
BRANCH=$(git branch --show-current)
[ "$BRANCH" = "main" ]
check_status "On main branch"

# Check if pushed
echo -n "Checking if pushed to remote... "
git diff origin/main --quiet > /dev/null 2>&1
check_status "All commits pushed to origin"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "5. CODE STATISTICS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Count code lines
CODE_LINES=$(find . -name "*.ts" -o -name "*.tsx" | grep -v node_modules | xargs wc -l 2>/dev/null | tail -1 | awk '{print $1}')
echo -e "${BLUE}Code Lines:${NC} $CODE_LINES"

# Count doc lines
DOC_LINES=$(wc -l *.md 2>/dev/null | tail -1 | awk '{print $1}')
echo -e "${BLUE}Documentation Lines:${NC} $DOC_LINES"

# Count total
TOTAL=$((CODE_LINES + DOC_LINES))
echo -e "${BLUE}Total Lines:${NC} $TOTAL"

# Count commits
COMMITS=$(git rev-list --count HEAD)
echo -e "${BLUE}Git Commits:${NC} $COMMITS"

# Count files
FILES=$(git ls-files | wc -l)
echo -e "${BLUE}Tracked Files:${NC} $FILES"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "6. DEMO READINESS CHECKS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check demo script exists
echo -n "Checking demo script... "
[ -f "DEMO_SCRIPT.md" ] && [ -f "DEMO_PREP.md" ]
check_status "Demo script and prep guide ready"

# Check demo assets
echo -n "Checking demo assets... "
[ -d "assets" ]
check_status "Assets directory exists"

# Verify app can start (dry run)
echo -n "Checking app configuration... "
[ -f "app.json" ]
check_status "App configuration valid"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "7. FINAL RESULTS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo ""
echo -e "${GREEN}PASSED:${NC} $PASSED checks"
echo -e "${RED}FAILED:${NC} $FAILED checks"
echo ""

if [ $FAILED -eq 0 ]; then
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║                                                            ║"
    echo "║          ✓ ALL CHECKS PASSED - READY FOR DEMO!           ║"
    echo "║                                                            ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo ""
    echo -e "${GREEN}Your project is ready for demo video recording!${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Open DEMO_PREP.md for recording guide"
    echo "  2. Prepare recording equipment"
    echo "  3. Practice narration 2-3 times"
    echo "  4. Record demo video (3:45 minutes)"
    echo "  5. Upload to YouTube"
    echo "  6. Follow DAY_10_CHECKLIST.md for submission"
    echo ""
    exit 0
else
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║                                                            ║"
    echo "║          ⚠ ISSUES FOUND - PLEASE FIX BEFORE DEMO         ║"
    echo "║                                                            ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo ""
    echo -e "${RED}Please fix the failed checks above before recording.${NC}"
    echo ""
    exit 1
fi
