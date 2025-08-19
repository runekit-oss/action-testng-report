#!/bin/bash
set -e

# Default version bump
BUMP_TYPE="minor"

# Check for flag
if [ ! -z "$1" ]; then
  if [ "$1" == "major" ] || [ "$1" == "minor" ] || [ "$1" == "patch" ]; then
    BUMP_TYPE="$1"
  else
    echo "Invalid version bump type: $1. Use 'major', 'minor', or 'patch'."
    exit 1
  fi
}

echo "--- Bumping version ($BUMP_TYPE) ---"
npm version $BUMP_TYPE -m "Release v%s"

echo "--- Installing Dependencies ---"
npm install

echo "--- Linting (Fixing) ---"
npm run lint:fix

echo "--- Linting ---"
npm run lint

echo "--- Testing ---"
npm run test

echo "--- Building ---"
npm run build

echo "--- Bundling ---"
npm run bundle

echo "--- Tagging and Pushing Tags ---"

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

echo "--- Release prepared successfully ---"
echo "Please publish the release on GitHub."
