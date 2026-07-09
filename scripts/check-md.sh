#!/usr/bin/env bash
# ============================================================================
# check-md.sh — Markdown linter entry point for STD-DOC-002 v2.4.1
# ============================================================================
#
# Purpose:
#   Single-command check that one or more .md files comply with the
#   Markdown Formatting Standard (STD-DOC-002 v2.4.1) and the No-Unicode
#   Policy (STD-DOC-003 v2.3). Runs three layers:
#
#     1. Static checks (pure bash, no dependencies)
#        - Bare fenced code blocks (``` without language) — STD-DOC-002 §5.4
#        - `*` or `+` as unordered-list markers — §5.2
#        - Closing `#` on ATX headings — §5.1
#        - Multiple H1 headings in a single document — §5.1
#        - Table pseudographics outside code blocks — §3
#
#     2. ESLint (auto-detected via npx) — §10
#        - markdown/* rules via eslint-plugin-markdown
#        - Custom unicode-policy rules (error severity, §10.6)
#        - Skipped silently if npx or eslint-plugin-markdown is missing
#
#     3. lint-md.js (custom Node linter) — §10.7
#        - Runs `node lint-md.js --level=C <path>` if the script is present
#          at the repo root or under scripts/, otherwise skipped with notice
#
# Usage:
#   bash scripts/check-md.sh                       # check all .md in repo
#   bash scripts/check-md.sh path/to/file.md       # check one file
#   bash scripts/check-md.sh docs/                 # check a directory
#   bash scripts/check-md.sh file1.md file2.md     # check multiple paths
#   bash scripts/check-md.sh --quiet path/to/dir   # only print failures
#   bash scripts/check-md.sh --help                # show this help
#
# Exit codes:
#   0 — all checks passed (skipped checks do not count as failures)
#   1 — at least one violation found
#   2 — invalid invocation
#
# Wiring:
#   This script is the canonical entry point referenced by STD-DOC-002 §0
#   (TL;DR) and §13 (Pre-merge checklist). It is intentionally bash-only
#   so it works in any checkout without requiring `npm install` first.
#   Once dependencies are installed, layers 2 and 3 add coverage on top.
#
# ============================================================================

set -euo pipefail

# ---- Colors (disabled if not a TTY) ---------------------------------------
if [ -t 1 ]; then
  C_RED=$'\033[31m'
  C_GRN=$'\033[32m'
  C_YLW=$'\033[33m'
  C_BLU=$'\033[34m'
  C_RST=$'\033[0m'
else
  C_RED=""
  C_GRN=""
  C_YLW=""
  C_BLU=""
  C_RST=""
fi

# ---- Globals ---------------------------------------------------------------
SCRIPT_NAME="$(basename "$0")"
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
QUIET=0
SHOW_HELP=0
TARGETS=()

# Counters
PASS_COUNT=0
FAIL_COUNT=0
SKIP_COUNT=0
TOTAL_FILES=0

# ---- Helpers ---------------------------------------------------------------
log()  { printf '%s[check-md]%s %s\n' "$C_BLU" "$C_RST" "$*"; }
ok()   { if [ "$QUIET" -eq 0 ]; then printf '%s[ok]%s    %s\n'  "$C_GRN" "$C_RST" "$*"; fi; PASS_COUNT=$((PASS_COUNT+1)); }
fail() { printf '%s[FAIL]%s  %s\n' "$C_RED" "$C_RST" "$*"; FAIL_COUNT=$((FAIL_COUNT+1)); }
skip() { if [ "$QUIET" -eq 0 ]; then printf '%s[skip]%s  %s\n' "$C_YLW" "$C_RST" "$*"; fi; SKIP_COUNT=$((SKIP_COUNT+1)); }
note() { if [ "$QUIET" -eq 0 ]; then printf '         %s\n' "$*"; fi; }

die() {
  printf '%s[check-md]%s %s%s%s\n' "$C_RED" "$C_RST" "$C_RED" "$*" "$C_RST" >&2
  exit 2
}

# ---- Argument parsing ------------------------------------------------------
usage() {
  # Print the leading comment block (everything from line 3 up to but not
  # including the `set -euo pipefail` line), with the `# ` prefix stripped.
  # Line 1 is the shebang, line 2 is the top `# ====` rule — both skipped.
  awk '
    /^set -euo pipefail/ { exit }
    NR >= 3 { sub(/^# ?/, ""); print }
  ' "$0"
  exit 0
}

while [ $# -gt 0 ]; do
  case "$1" in
    -h|--help)    usage ;;
    --quiet|-q)   QUIET=1; shift ;;
    --)           shift; break ;;
    -*)           die "unknown option: $1 (try --help)" ;;
    *)            TARGETS+=("$1"); shift ;;
  esac
done

# Pick up positional args after `--`
while [ $# -gt 0 ]; do
  TARGETS+=("$1"); shift
done

# Default target: repo root (excluding node_modules / .git / .next / dist)
if [ ${#TARGETS[@]} -eq 0 ]; then
  TARGETS=("$REPO_ROOT")
fi

# ---- Collect .md files -----------------------------------------------------
collect_md_files() {
  local target="$1"
  if [ -f "$target" ]; then
    # Single file — include only if extension is .md
    case "$target" in
      *.md) printf '%s\n' "$target" ;;
    esac
  elif [ -d "$target" ]; then
    # find with prune patterns for performance and noise reduction
    find "$target" \
      \( -name node_modules -o -name .git -o -name .next \
         -o -name dist -o -name build -o -name coverage \) -prune \
      -o -type f -name '*.md' -print 2>/dev/null || true
  fi
}

# Collect unique .md files from all targets
declare -a ALL_FILES=()
declare -A SEEN=()
for t in "${TARGETS[@]}"; do
  if [ ! -e "$t" ]; then
    fail "target does not exist: $t"
    continue
  fi
  while IFS= read -r f; do
    [ -z "$f" ] && continue
    if [ -z "${SEEN[$f]:-}" ]; then
      SEEN[$f]=1
      ALL_FILES+=("$f")
    fi
  done < <(collect_md_files "$t")
done

TOTAL_FILES=${#ALL_FILES[@]}
if [ "$TOTAL_FILES" -eq 0 ]; then
  log "no .md files found in: ${TARGETS[*]}"
  exit 0
fi

log "checking $TOTAL_FILES file(s) against STD-DOC-002 v2.4.1"

# ---- Layer 1: Static checks (bash only) ------------------------------------
# Extracted to lib/md-static-checks.sh (92 lines)
source "${SCRIPT_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)}/lib/md-static-checks.sh"

# ---- Layer 2 + 3: ESLint and lint-md.js ------------------------------------
# Extracted to lib/md-tooling-checks.sh (60 lines)
source "${SCRIPT_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)}/lib/md-tooling-checks.sh"

# ---- Run all layers --------------------------------------------------------
# Layer 1: per-file static checks (always run)
for f in "${ALL_FILES[@]}"; do
  static_check_file "$f"
done

# Layer 2 + 3: project-wide tooling (if available)
run_eslint
run_lint_md_js

# ---- Summary ---------------------------------------------------------------
echo ""
log "summary: $PASS_COUNT passed, $FAIL_COUNT failed, $SKIP_COUNT skipped ($TOTAL_FILES files)"

if [ "$FAIL_COUNT" -gt 0 ]; then
  echo "${C_RED}[check-md] FAIL: $FAIL_COUNT violation(s) found.${C_RST}"
  echo "         See STD-DOC-002 §0 (TL;DR), §3 (Prohibited), §5 (Formatting),"
  echo "         §10 (ESLint), §13 (Pre-merge checklist) for details."
  exit 1
fi

echo "${C_GRN}[check-md] OK: all checks passed.${C_RST}"
exit 0
