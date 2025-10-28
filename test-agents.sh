#!/bin/bash

# Test Multi-Agent API Setup
# This script tests all agents to verify they're working correctly

echo "🧪 Testing Multi-Agent API Setup"
echo "=================================="
echo ""

API_URL="http://localhost:3000/api/chat"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to test an agent
test_agent() {
  local agent_name=$1
  local test_message=$2
  local agent_emoji=$3

  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${YELLOW}Testing: ${agent_emoji} ${agent_name}${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "Message: \"${test_message}\""
  echo ""

  # Make request
  response=$(curl -s -X POST "$API_URL" \
    -H "Content-Type: application/json" \
    -d "{
      \"agentName\": \"${agent_name}\",
      \"messages\": [{\"role\": \"user\", \"content\": \"${test_message}\"}]
    }" 2>&1)

  # Check if request succeeded
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Agent responded successfully${NC}"
    echo ""
  else
    echo -e "${RED}✗ Request failed${NC}"
    echo "Error: $response"
    echo ""
    return 1
  fi
}

echo -e "${YELLOW}Make sure the dev server is running: bun run dev${NC}"
echo ""
read -p "Press Enter to start testing..."
echo ""

# Test 1: Chef Agent (Default)
test_agent "chefAgent" "I have chicken and rice, what can I cook?" "👨‍🍳"

# Test 2: Nutrition Expert
test_agent "nutritionExpert" "How many calories are in a Caesar salad?" "🥗"

# Test 3: Meal Planner
test_agent "mealPlanner" "Help me plan meals for the week" "📅"

# Test 4: Sommelier
test_agent "sommelier" "What wine pairs well with salmon?" "🍷"

# Test 5: Orchestrator
test_agent "orchestrator" "I need cooking help" "🎯"

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✓ All agent tests completed!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "💡 Next steps:"
echo "  1. Check the console logs in your dev server"
echo "  2. Verify you see different agents being used"
echo "  3. Test in the browser UI at http://localhost:3000"
echo ""
