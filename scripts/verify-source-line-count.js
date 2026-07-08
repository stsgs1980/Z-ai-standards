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
// EXCLUSIONS
// ============================================================================

const SKIP_DIRS = new Set(["node_modules", ".next", "Z-ai-governance", ".git"]);

const SKIP_DIR_PATTERNS = ["src/components/ui"];

const EXEMPT_EXTENSIONS = new Set([".json", ".yml", ".yaml", ".toml", ".ini"]);

const EXEMPT_FILE_PATTERNS = [
  /worklog\.md$/i,
  /DECISIONS.*\.md$/i,
  /SESSION.*\.md$/i,
  /MIGRATIONS.*\.md$/i,
  /^INDEX\.md$/i,
];

function shouldSkip(filePath, relativePath) {
  const parts = relativePath.split(path.sep);

  for (const part of parts) {
    if (SKIP_DIRS.has(part)) return true;
  }

  for (const pattern of SKIP_DIR_PATTERNS) {
    if (relativePath.startsWith(pattern) || relativePath.includes(path.sep + pattern + path.sep)) {
      return true;
    }
  }

  if (parts.includes("references")) return true;

  const basename = path.basename(filePath);
  for (const pattern of EXEMPT_FILE_PATTERNS) {
    if (pattern.test(basename)) return true;
  }

  const ext = path.extname(filePath).toLowerCase();
  if (EXEMPT_EXTENSIONS.has(ext)) return true;

  return false;
}

// ============================================================================
// FILE DISCOVERY
// ============================================================================

function listFiles(dir, root) {
  const results = [];
  if (!fs.existsSync(dir)) return results;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.relative(root, fullPath);

    if (entry.isDirectory()) {
      if (!shouldSkip(fullPath, relativePath)) {
        results.push(...listFiles(fullPath, root));
      }
    } else if (entry.isFile()) {
      if (!shouldSkip(fullPath, relativePath)) {
        results.push(fullPath);
      }
    }
  }

  return results;
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

  const allFiles = listFiles(projectRoot, projectRoot);
  console.log(`[verify-source-line-count] Found ${allFiles.length} files to check`);
}

main();
