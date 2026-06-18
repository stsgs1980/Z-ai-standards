#!/usr/bin/env bash
# install-hooks.sh — one-time bootstrap for git hooks in Z-ai-standards submodule
#
# Usage:  bash install-hooks.sh
#
# What it does:
#   1. Tells git to look for hooks in .githooks/ instead of .git/hooks/
#   2. Marks all hooks in .githooks/ as executable
#   3. Verifies the setup by listing the active hook path
#
# This mirrors Z-ai-platform/install-hooks.sh but for standalone use of
# the standards submodule (e.g. when editing standards directly without
# the parent orchestrator checked out).
#
# The pre-commit hook runs verify-standards.js (content-level invariants
# V04-V10). Cross-repo ID-graph checks (G01-G15) run in CI and in the
# parent Z-ai-platform pre-commit hook.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

if [ ! -d .git ]; then
  echo "[install-hooks] Not a git repository: $REPO_ROOT"
  echo "[install-hooks] Run 'git init' first, then re-run this script."
  exit 1
fi

echo "[install-hooks] Setting core.hooksPath to .githooks"
git config core.hooksPath .githooks

echo "[install-hooks] Marking hooks executable"
chmod +x .githooks/* 2>/dev/null || true

echo "[install-hooks] Active hook path:"
git config --get core.hooksPath

echo ""
echo "[install-hooks] Done. Hooks now active:"
ls -1 .githooks/ 2>/dev/null | sed 's/^/  - /'
echo ""
echo "[install-hooks] To bypass a hook for ONE commit (not recommended):"
echo "  git commit --no-verify"
