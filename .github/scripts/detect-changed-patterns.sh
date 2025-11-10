#!/bin/bash

###############################################################################
# Script: detect-changed-patterns.sh
# Description: Detects pattern directories that have been modified in a PR
# Usage: ./detect-changed-patterns.sh
###############################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}🔍 Detecting Changed Patterns${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Get the base branch (usually main or master)
BASE_BRANCH="${GITHUB_BASE_REF:-main}"
echo -e "${BLUE}ℹ️  Base branch: ${BASE_BRANCH}${NC}"

# Fetch the base branch
git fetch origin "${BASE_BRANCH}" --depth=1

# Get all changed files between base and current branch
CHANGED_FILES=$(git diff --name-only "origin/${BASE_BRANCH}...HEAD")

echo -e "\n${BLUE}📝 Changed files:${NC}"
echo "$CHANGED_FILES"

# Extract unique pattern directories (exclude special directories and root files)
PATTERN_DIRS=$(echo "$CHANGED_FILES" | \
  grep -v '^\.github/' | \
  grep -v '^schemas/' | \
  grep -v '^categories\.config\.json$' | \
  grep -v '^pattern-template/' | \
  grep -v '^README\.md$' | \
  grep -v '^LICENSE' | \
  grep -v '^\.' | \
  cut -d'/' -f1 | \
  sort -u | \
  grep -v '^$' || true)

if [ -z "$PATTERN_DIRS" ]; then
  echo -e "\n${YELLOW}⚠️  No pattern directories detected in this PR${NC}"
  echo "changed_patterns=" >> $GITHUB_OUTPUT
  echo "pattern_count=0" >> $GITHUB_OUTPUT
  exit 0
fi

# Verify these are actual directories
VALID_PATTERN_DIRS=""
for dir in $PATTERN_DIRS; do
  if [ -d "$dir" ] && [ "$dir" != "." ]; then
    VALID_PATTERN_DIRS="${VALID_PATTERN_DIRS}${dir} "
    echo -e "${GREEN}✅ Pattern directory: ${dir}${NC}"
  fi
done

VALID_PATTERN_DIRS=$(echo "$VALID_PATTERN_DIRS" | xargs)

if [ -z "$VALID_PATTERN_DIRS" ]; then
  echo -e "\n${YELLOW}⚠️  No valid pattern directories found${NC}"
  echo "changed_patterns=" >> $GITHUB_OUTPUT
  echo "pattern_count=0" >> $GITHUB_OUTPUT
  exit 0
fi

# Count patterns
PATTERN_COUNT=$(echo "$VALID_PATTERN_DIRS" | wc -w)

echo -e "\n${GREEN}✅ Found ${PATTERN_COUNT} pattern(s) to validate${NC}"
echo -e "${BLUE}Patterns: ${VALID_PATTERN_DIRS}${NC}\n"

# Output for GitHub Actions
echo "changed_patterns=${VALID_PATTERN_DIRS}" >> $GITHUB_OUTPUT
echo "pattern_count=${PATTERN_COUNT}" >> $GITHUB_OUTPUT

# Also create a JSON array for easier processing
PATTERN_JSON=$(echo "$VALID_PATTERN_DIRS" | tr ' ' '\n' | jq -R . | jq -s .)
echo "patterns_json=${PATTERN_JSON}" >> $GITHUB_OUTPUT

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ Detection Complete${NC}"
echo -e "${GREEN}========================================${NC}"
