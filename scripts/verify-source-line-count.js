#!/usr/bin/env node
/**
 * ============================================================================
 * verify-source-line-count.js — Anti-monolith Source File Verifier v1.0.0
 * ============================================================================
 *
 * ID: TOOL-VERIFY-SRC-001
 * Implements: RULE-MONOLITH-012 section 4.18.1 (file size by category)
 *
 * PURPOSE
 *   Enforces line-count limits per file category defined in RULE-MONOLITH-012.
 *   Scans the entire project (with exclusions) and fails if any file exceeds
 *   its category's hard limit.
 *
 * EXIT CODES
 *   0 — all files within limits (or --soft mode)
 *   1 — at least one file exceeds its limit
 *   2 — configuration error
 *
 * USAGE
 *   node standards/scripts/verify-source-line-count.js             # human-readable
 *   node standards/scripts/verify-source-line-count.js --json      # CI-friendly
 *   node standards/scripts/verify-source-line-count.js --soft      # warn-only
 *   node standards/scripts/verify-source-line-count.js --help      # show help
 *
 * ============================================================================
 */

"use strict";

const fs = require("fs");
const path = require("path");

const VERSION = "1.0.0";
const EFFECTIVE_DATE = "2026-07-08";

// ============================================================================
// CLI PARSING
// ============================================================================

function parseArgs(argv) {
  const opts = { json: false, help: false, root: null, soft: false };
  for (const arg of argv.slice(2)) {
    if (arg === "--help" || arg === "-h") opts.help = true;
    else if (arg === "--json") opts.json = true;
    else if (arg === "--soft") opts.soft = true;
    else if (arg.startsWith("--root=")) opts.root = arg.slice(7);
    else {
      console.error(`Unknown argument: ${arg}`);
      process.exit(2);
    }
  }
  return opts;
}

function showHelp() {
  console.log(`
verify-source-line-count.js v${VERSION} — Anti-monolith Source File Verifier

Usage:
  node standards/scripts/verify-source-line-count.js [options]

Options:
  --json         Output JSON (for CI)
  --soft         Warn-only mode (exit 0 even on violations)
  --root=<path>  Override project root (auto-detected otherwise)
  --help, -h     Show this help

Implements: RULE-MONOLITH-012 section 4.18.1 (file size by category)

Exit codes:
  0 — all files within limits (or soft mode)
  1 — at least one file exceeds its limit
  2 — configuration error
`);
}

// ============================================================================
// PROJECT ROOT DISCOVERY
// ============================================================================

function discoverProjectRoot() {
  if (process.env.ZAI_PLATFORM_ROOT && fs.existsSync(process.env.ZAI_PLATFORM_ROOT)) {
    return process.env.ZAI_PLATFORM_ROOT;
  }
  let dir = __dirname;
  for (let i = 0; i < 10; i++) {
    if (fs.existsSync(path.join(dir, "package.json"))) {
      return dir;
    }
    dir = path.dirname(dir);
  }
  return null;
}

// ============================================================================
// MAIN
// ============================================================================

function main() {
  const opts = parseArgs(process.argv);
  if (opts.help) {
    showHelp();
    process.exit(0);
  }

  const projectRoot = opts.root || discoverProjectRoot();
  if (!projectRoot) {
    console.error("[verify-source-line-count] Could not discover project root.");
    console.error("[verify-source-line-count] Set ZAI_PLATFORM_ROOT or use --root=<path>.");
    process.exit(2);
  }

  // TODO: Implement checks in subsequent tasks
  console.log(`Project root: ${projectRoot}`);
  console.log(`Mode: ${opts.soft ? "soft" : "hard"}`);
  console.log(`JSON: ${opts.json}`);
}

main();
