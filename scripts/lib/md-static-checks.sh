#!/usr/bin/env bash
# ============================================================================
# lib/md-static-checks.sh — Static markdown checks for check-md.sh
# ============================================================================
#
# Extracted from check-md.sh (was inline function, 92 lines).
# Contains static_check_file() — pure bash, no dependencies.
#
# STD-DOC-002 v2.4.1 checks:
#   - Bare fenced code blocks (``` without language) — §5.4
#   - `*` or `+` as unordered-list markers — §5.2
#   - Closing `#` on ATX headings — §5.1
#   - Multiple H1 headings in a single document — §5.1
#   - Table pseudographics outside code blocks — §3
#
# Usage:
#   source lib/md-static-checks.sh
#   static_check_file "path/to/file.md"
#
# Requires: log, ok, fail, skip functions from check-md.sh
#
# ============================================================================

static_check_file() {
  local file="$1"
  local had_issue=0

  local in_fence=0
  local fence_lang=""
  local fence_len_open=0
  local h1_count=0
  local lineno=0

  while IFS= read -r line || [ -n "$line" ]; do
    lineno=$((lineno+1))

    # Detect opening / closing fence: 3+ backticks optionally followed by language.
    if [[ "$line" =~ ^(\`\`\`+)([A-Za-z0-9_+-]*) ]]; then
      local fence_len="${#BASH_REMATCH[1]}"
      local lang="${BASH_REMATCH[2]}"
      if [ "$in_fence" -eq 0 ]; then
        in_fence=1
        fence_lang="$lang"
        fence_len_open="$fence_len"
        if [ -z "$lang" ]; then
          fail "$file:$lineno  bare code fence (missing language) - STD-DOC-002 §5.4"
          had_issue=1
        fi
      else
        # Closing fence: must have >= opening fence length
        if [ "$fence_len" -ge "$fence_len_open" ]; then
          in_fence=0
          fence_lang=""
          fence_len_open=0
        fi
      fi
      continue
    fi

    # Inside a fence — skip static checks
    if [ "$in_fence" -eq 1 ]; then
      continue
    fi

    # ATX heading detection
    if [[ "$line" =~ ^(#{1,6})[[:space:]]+(.*)$ ]]; then
      local hashes="${BASH_REMATCH[1]}"
      local heading_text="${BASH_REMATCH[2]}"
      # Closing hash?
      if [[ "$heading_text" =~ [[:space:]]+#+[[:space:]]*$ ]]; then
        fail "$file:$lineno  closing '#' on heading - STD-DOC-002 §5.1"
        had_issue=1
      fi
      # Multiple H1?
      if [ "${#hashes}" -eq 1 ]; then
        h1_count=$((h1_count+1))
        if [ "$h1_count" -gt 1 ]; then
          fail "$file:$lineno  multiple H1 headings in document - STD-DOC-002 §5.1"
          had_issue=1
        fi
      fi
    fi

    # Unordered list with `*` or `+`?
    if [[ "$line" =~ ^[[:space:]]*[\*+][[:space:]]+ ]]; then
      fail "$file:$lineno  '*' or '+' as unordered list marker (use '-') - STD-DOC-002 §5.2"
      had_issue=1
    fi

    # Table pseudographics OUTSIDE code blocks?
    if [ "${#line}" -gt 5 ] \
       && [[ "$line" =~ ^[[:space:]]*[+|\ -]+$ ]] \
       && [[ "$line" == *"+"* ]] \
       && [[ "$line" == *"-"* ]]; then
      fail "$file:$lineno  table pseudographics outside code block - STD-DOC-002 §3 (wrap in a fenced 'text' block)"
      had_issue=1
    fi

  done < "$file"

  if [ "$had_issue" -eq 0 ]; then
    ok "$file  (static checks PASS)"
  fi
}
