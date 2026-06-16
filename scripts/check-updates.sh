#!/usr/bin/env bash
# check-updates.sh — host project helper
#
# Compares the locally-pinned submodule version against the upstream
# corpus repo's latest release. Designed to run:
#   - manually:  bash standards/scripts/check-updates.sh
#   - in CI:     weekly cron, fails if host is behind upstream
#
# Exit codes:
#   0  host is up-to-date (or ahead of upstream — local edits)
#   1  host is BEHIND upstream (newer version available)
#   2  could not determine versions (network error, no tags, etc.)
#
# Environment variables:
#   STANDARDS_CORPUS_URL   override the upstream URL (default: read from
#                          .gitmodules of the host repo, or fall back to
#                          the canonical z-ai-standards remote)
#   STANDARDS_BEHIND_OK    if set to "1", exit 0 even when behind (useful
#                          for non-blocking CI jobs; just prints a warning)

set -euo pipefail

# ---------------------------------------------------------------------------
# Resolve paths
# ---------------------------------------------------------------------------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
VERSION_FILE="$REPO_ROOT/VERSION"

if [ ! -f "$VERSION_FILE" ]; then
  echo "[check-updates] ERROR: VERSION file not found at $VERSION_FILE"
  echo "[check-updates] The corpus checkout appears to be broken."
  exit 2
fi

LOCAL_VERSION="$(tr -d '[:space:]' < "$VERSION_FILE")"
if [ -z "$LOCAL_VERSION" ]; then
  echo "[check-updates] ERROR: VERSION file is empty."
  exit 2
fi

echo "[check-updates] Local corpus version: v$LOCAL_VERSION"

# ---------------------------------------------------------------------------
# Determine the upstream URL
# ---------------------------------------------------------------------------
UPSTREAM_URL="${STANDARDS_CORPUS_URL:-}"

if [ -z "$UPSTREAM_URL" ]; then
  # Try to read from .gitmodules in the host repo (one level up from corpus)
  HOST_ROOT="$(cd "$REPO_ROOT/.." && pwd)"
  if [ -f "$HOST_ROOT/.gitmodules" ]; then
    # Find the submodule path that matches our corpus dir
    CORPUS_REL="$(realpath --relative-to="$HOST_ROOT" "$REPO_ROOT" 2>/dev/null || echo "standards")"
    UPSTREAM_URL="$(awk -v path="$CORPUS_REL" '
      /^\[submodule "/ { in_block=0 }
      /^\[submodule "[^"]*"\]/ {
        # extract path
      }
      /^[\t ]*path[\t ]*=/ {
        gsub(/^[\t ]*path[\t ]*=[\t ]*/, "")
        if ($0 == path) found=1
      }
      /^[\t ]*url[\t ]*=/ {
        if (found) {
          gsub(/^[\t ]*url[\t ]*=[\t ]*/, "")
          gsub(/["'"'"']/, "")
          print
          exit
        }
      }
    ' "$HOST_ROOT/.gitmodules" || true)"
  fi
fi

if [ -z "$UPSTREAM_URL" ]; then
  # Final fallback — assume the canonical remote
  UPSTREAM_URL="git@github.com:z-ai/z-ai-standards.git"
  echo "[check-updates] WARNING: could not auto-detect upstream URL from .gitmodules"
  echo "[check-updates]          falling back to $UPSTREAM_URL"
  echo "[check-updates]          set STANDARDS_CORPUS_URL to override."
fi

echo "[check-updates] Upstream URL: $UPSTREAM_URL"

# ---------------------------------------------------------------------------
# Fetch the latest tag from upstream WITHOUT modifying the local checkout
# ---------------------------------------------------------------------------
# git ls-remote --tags returns lines like:
#   <sha>  refs/tags/v2.2.0
#   <sha>  refs/tags/v2.2.0^{}
# We want the highest semver tag (excluding ^{} dereference entries).
echo "[check-updates] Fetching tags from upstream..."
REMOTE_TAGS=$(git ls-remote --tags "$UPSTREAM_URL" 2>/dev/null | \
  awk -F'\t' '{print $2}' | \
  sed -E 's|^refs/tags/||; s|\^\{\}$||' | \
  sort -u | \
  grep -E '^v?[0-9]+\.[0-9]+\.[0-9]+$' || true)

if [ -z "$REMOTE_TAGS" ]; then
  echo "[check-updates] WARNING: no semver tags found on upstream."
  echo "[check-updates]          Either the corpus repo has not been tagged yet,"
  echo "[check-updates]          or network access to $UPSTREAM_URL failed."
  echo "[check-updates]          Skipping version comparison."
  exit 2
fi

# Pick the highest version (strip optional 'v' prefix for sort, then re-add)
LATEST_REMOTE=$(echo "$REMOTE_TAGS" | \
  sed -E 's/^v//' | \
  sort -V | \
  tail -1)

echo "[check-updates] Latest upstream version: v$LATEST_REMOTE"

# ---------------------------------------------------------------------------
# Compare
# ---------------------------------------------------------------------------
compare_versions() {
  # Returns: 0 if equal, 1 if $1 < $2, 2 if $1 > $2
  local a="$1" b="$2"
  if [ "$a" = "$b" ]; then
    return 0
  fi
  local higher=$(printf "%s\n%s\n" "$a" "$b" | sort -V | tail -1)
  if [ "$higher" = "$a" ]; then
    return 2
  else
    return 1
  fi
}

compare_versions "$LOCAL_VERSION" "$LATEST_REMOTE"
CMP=$?

case $CMP in
  0)
    echo ""
    echo "[check-updates] OK: host is up-to-date with upstream (v$LOCAL_VERSION)."
    exit 0
    ;;
  2)
    echo ""
    echo "[check-updates] OK: host is AHEAD of upstream (local: v$LOCAL_VERSION, upstream: v$LATEST_REMOTE)."
    echo "[check-updates]      This usually means local development edits not yet released."
    exit 0
    ;;
  1)
    echo ""
    echo "[check-updates] WARNING: host is BEHIND upstream."
    echo "[check-updates]   local:   v$LOCAL_VERSION"
    echo "[check-updates]   upstream: v$LATEST_REMOTE"
    echo ""
    echo "[check-updates] To update:"
    echo "  cd $REPO_ROOT"
    echo "  git fetch origin"
    echo "  git checkout v$LATEST_REMOTE   # or 'main' for the latest unreleased"
    echo "  cd .."
    echo "  git add $(realpath --relative-to="$HOST_ROOT" "$REPO_ROOT" 2>/dev/null || echo standards)"
    echo "  git commit -m \"Bump z-ai-standards submodule to v$LATEST_REMOTE\""
    echo ""
    echo "[check-updates] Then review CHANGELOG.md for breaking changes:"
    echo "  cat $REPO_ROOT/CHANGELOG.md"
    echo ""
    if [ "${STANDARDS_BEHIND_OK:-0}" = "1" ]; then
      echo "[check-updates] STANDARDS_BEHIND_OK=1 set; exiting 0 (non-blocking)."
      exit 0
    fi
    echo "[check-updates] Failing CI. Set STANDARDS_BEHIND_OK=1 to make this non-blocking."
    exit 1
    ;;
esac
