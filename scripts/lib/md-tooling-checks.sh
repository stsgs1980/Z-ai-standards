#!/usr/bin/env bash
# ============================================================================
# lib/md-tooling-checks.sh — ESLint and lint-md.js runners for check-md.sh
# ============================================================================
#
# Extracted from check-md.sh to keep main script under 250 lines.
# Contains run_eslint() and run_lint_md_js() — requires globals from check-md.sh:
#   REPO_ROOT, ALL_FILES, TOTAL_FILES, PASS_COUNT, FAIL_COUNT, SKIP_COUNT
#
# Requires: log, ok, fail, skip functions from check-md.sh
#
# ============================================================================

# ---- Layer 2: ESLint (if available) ----------------------------------------
run_eslint() {
  if ! command -v npx >/dev/null 2>&1; then
    skip "eslint: npx not found in PATH"
    return 0
  fi

  local has_eslint=0
  if [ -x "$REPO_ROOT/node_modules/.bin/eslint" ]; then
    has_eslint=1
  elif npx --no-install eslint --version >/dev/null 2>&1; then
    has_eslint=1
  fi
  if [ "$has_eslint" -eq 0 ]; then
    skip "eslint: not installed (run 'npm install --save-dev eslint eslint-plugin-markdown')"
    return 0
  fi

  log "eslint: linting $TOTAL_FILES file(s)"
  local eslint_bin
  if [ -x "$REPO_ROOT/node_modules/.bin/eslint" ]; then
    eslint_bin="$REPO_ROOT/node_modules/.bin/eslint"
  else
    eslint_bin="npx --no-install eslint"
  fi

  # Use eval to handle paths with spaces
  if eval "\"$eslint_bin\" --max-warnings=0 --plugin markdown \"${ALL_FILES[@]}\""; then
    ok "eslint: PASS"
  else
    fail "eslint: violations reported above (see STD-DOC-002 §10 for config)"
  fi
}

# ---- Layer 3: lint-md.js (custom linter, if present) -----------------------
run_lint_md_js() {
  local script=""
  for candidate in \
      "$REPO_ROOT/lint-md.js" \
      "$REPO_ROOT/scripts/lint-md.js"; do
    if [ -f "$candidate" ]; then
      script="$candidate"
      break
    fi
  done

  if [ -z "$script" ]; then
    skip "lint-md.js: not present at repo root (optional - see STD-DOC-002 §10.7)"
    return 0
  fi

  if ! command -v node >/dev/null 2>&1; then
    skip "lint-md.js: node not found in PATH"
    return 0
  fi

  log "lint-md.js: linting $TOTAL_FILES file(s) at --level=C"
  if node "$script" --level=C "${ALL_FILES[@]}"; then
    ok "lint-md.js: PASS"
  else
    fail "lint-md.js: violations reported above"
  fi
}
