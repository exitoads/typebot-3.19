#!/bin/bash
set -euo pipefail

VERSION="${1:-3.19}"
BRANCH="${2:-main}"
TYPEBOT_PATH="${3:-/home/celso/code/typebot-3.19}"
IMAGE_PREFIX="${4:-exitoads/typebot}"

echo "----------------------------------------"
echo "Starting Typebot build (single image for builder + viewer)"
echo "Version: $VERSION"
echo "Branch: $BRANCH"
echo "Project: $TYPEBOT_PATH"
echo "Image: ${IMAGE_PREFIX}:${VERSION}"
echo "----------------------------------------"

cd "$TYPEBOT_PATH" || {
  echo "Error: Path not found: $TYPEBOT_PATH"
  exit 1
}

if [ ! -f "Dockerfile" ]; then
  echo "Error: Dockerfile not found in $TYPEBOT_PATH"
  exit 1
fi

echo "--> Fetching latest updates from origin..."
git fetch --all --prune

echo "--> Checking out branch: $BRANCH..."
git checkout "$BRANCH" 2>/dev/null || git checkout -b "$BRANCH" "origin/$BRANCH"

echo "--> Updating local branch with remote state..."
git pull --ff-only origin "$BRANCH"

echo "----------------------------------------"
echo "LAST COMMIT INFO:"
git log -1 --format="Commit: %h%nAuthor: %an%nDate:   %ad%nMessage: %s"
echo "----------------------------------------"

IMAGE_TAG="${IMAGE_PREFIX}:${VERSION}"
echo "--> Building Typebot image (runs as builder or viewer depending on the entrypoint override, see docker-compose.build.yml)..."
docker build \
  --tag "$IMAGE_TAG" \
  .
echo "Built: $IMAGE_TAG"

echo "----------------------------------------"
echo "Docker push command:"
echo "docker push ${IMAGE_TAG}"
echo "----------------------------------------"
echo "Typebot build finished successfully."
