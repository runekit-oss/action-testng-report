#!/bin/bash
set -e

# Color codes
RED='[0;31m'
GREEN='[0;32m'
YELLOW='[0;33m'
BLUE='[0;34m'
MAGENTA='[0;35m'
CYAN='[0;36m'
BOLD='[1m'
NC='[0m' # No Color

# Default values
BUMP_TYPE="minor"
DRY_RUN=false

# Parse arguments
for arg in "$@"; do
  case $arg in
    --dry-run)
      DRY_RUN=true
      shift # Remove --dry-run from processing
      ;;
    major|minor|patch)
      BUMP_TYPE="$arg"
      shift # Remove bump type from processing
      ;;
    *)
      echo "${RED}${BOLD}Unknown argument: $arg${NC}"
      exit 1
      ;;
  esac
done

if [ "$DRY_RUN" == "true" ]; then
  echo "${YELLOW}${BOLD}--- Dry run enabled. No git operations will be performed. ---${NC}"
fi

echo "${CYAN}${BOLD}--- Bumping version ($BUMP_TYPE) ---${NC}"
if [ "$DRY_RUN" == "false" ]; then
  npm version $BUMP_TYPE -m "Release v%s"
else
  echo "Skipping npm version in dry run."
fi

echo "${CYAN}${BOLD}--- Installing Dependencies ---${NC}"
npm install


echo "${CYAN}${BOLD}--- Linting (Fixing) ---${NC}"
npm run lint:fix

echo "${CYAN}${BOLD}--- Linting ---${NC}"
npm run lint

echo "${CYAN}${BOLD}--- Testing ---${NC}"
npm run test

echo "${CYAN}${BOLD}--- Building ---${NC}"
npm run build

echo "${CYAN}${BOLD}--- Bundling ---${NC}"
npm run bundle

echo "${CYAN}${BOLD}--- Tagging and Pushing Tags ---${NC}"

if [ "$DRY_RUN" == "false" ]; then
  # Get the new version from package.json
  NEW_VERSION=$(node -p "require('./package.json').version")
  MAJOR_VERSION=$(echo $NEW_VERSION | cut -d. -f1)

  if [ "$BUMP_TYPE" == "major" ]; then
    # Major version upgrade: create and push v<major> tag
    echo "Creating major version tag: v$MAJOR_VERSION"
    git tag "v$MAJOR_VERSION"
    echo "Pushing major version tag: v$MAJOR_VERSION"
    git push origin "v$MAJOR_VERSION"
    # Explicitly push the new version tag
    echo "Pushing new version tag: v$NEW_VERSION"
    git push origin "v$NEW_VERSION"
  else
    # Minor or Patch version upgrade: force update and push v<major> tag
    echo "Force updating major version tag: v$MAJOR_VERSION"
    git tag -f "v$MAJOR_VERSION"
    echo "Force pushing major version tag: v$MAJOR_VERSION"
    git push -f origin "v$MAJOR_VERSION"
    # Explicitly push the new version tag
    echo "Pushing new version tag: v$NEW_VERSION"
    git push origin "v$NEW_VERSION"
  fi
else
  echo "Skipping git tagging and pushing in dry run."
fi

echo "${GREEN}${BOLD}--- Release prepared successfully ---${NC}"
echo "${BLUE}Please publish the release on GitHub.${NC}"
