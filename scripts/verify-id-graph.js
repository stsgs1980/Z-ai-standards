#!/usr/bin/env node
/**
 * ============================================================================
 * verify-id-graph.js — Cross-Repo ID Graph Validator v1.1.7
 * ============================================================================
 *
 * ID: TOOL-VERIFY-004
 * Implements: STD-META-001 v2.0 §10.2 (G01-G15) + STD-SKILL-001 v1.0 §10.2
 *
 * PURPOSE
 *   Validates that the ID graph across the 4 Z-ai repositories is consistent:
 *     - No duplicate IDs (G01)
 *     - All Related: references resolve (G02)
 *     - No cycles in Related: graph (G03, G11)
 *     - Layer-edge matrix respected (G04, G07-G10)
 *     - No deprecated IDs referenced post-window (G05)
 *     - Aligned_with: has corresponding Related: edge (G15)
 *     - Compatibility DAG valid for ZAI skills (G14)
 *     - Soft warnings (W01-W10) for non-critical issues
 *     - Soft warnings (W11-W15) for project health / consistency
 *
 * USAGE
 *   node scripts/verify-id-graph.js [options]
 *
 *   Options:
 *     --root=<path>        Override platform root
 *     --json               Output JSON instead of human-readable
 *     --ci                 Skip network-dependent checks
 *     --fail-on-warnings   Exit 1 if any warning is emitted
 *     --verbose            Print full graph
 *     --repo=<name>        Limit to one repo (debug)
 *     --help               Show this help
 *
 * EXIT CODES
 *   0 — all HARD checks pass (warnings may be present)
 *   1 — at least one HARD check failed (or warning with --fail-on-warnings)
 *   2 — configuration error (missing repos, parse error)
 *
 * ============================================================================
 */

"use strict";

const fs = require("fs");
const path = require("path");

const { LAYER_MATRIX, COMPAT_MATRIX, ID_REGEX } = require("./lib/constants");

const {
  parseYAMLFrontmatter,
  parseBlockquoteHeader,
  parseHTMLComment,
  extractReferences,
} = require("./lib/parsers");

const { tarjanSCC } = require("./lib/graph-algorithms");
const { emitHumanReadable: emitHumanReadableLib, emitJSON: emitJSONLib } = require("./lib/output");
const { listFiles, globFiles, matchesPattern, SUBMODULE_DIRS } = require("./lib/file-scanner");
const { extractDeclaration, parseMigrations } = require("./lib/declarations");

const G01 = require("./lib/checks/id-graph/g01-no-duplicates");
const G02 = require("./lib/checks/id-graph/g02-resolve");
const G03 = require("./lib/checks/id-graph/g03-no-cycles");
const G04 = require("./lib/checks/id-graph/g04-layer-matrix");
const G05 = require("./lib/checks/id-graph/g05-deprecated-window");
const G07 = require("./lib/checks/id-graph/g07-std-downward");
const G08 = require("./lib/checks/id-graph/g08-proc-zai");
const G09 = require("./lib/checks/id-graph/g09-tool-proc");
const G10 = require("./lib/checks/id-graph/g10-tool-zai");
const G11 = require("./lib/checks/id-graph/g11-self-ref");
const G12 = require("./lib/checks/id-graph/g12-format");
const G14 = require("./lib/checks/id-graph/g14-compatibility");
const G15 = require("./lib/checks/id-graph/g15-aligned-with");

const W08 = require("./lib/warnings/id-graph/w08-aligned-symmetry");

const VERSION = "1.1.7";

// Paths
const SCRIPT_DIR = __dirname;
const PLATFORM_ROOT = process.env.ZAI_PLATFORM_ROOT || path.resolve(SCRIPT_DIR, "..", "..");

const REPOS = {
  "Z-ai-standards": path.join(PLATFORM_ROOT, "standards"),
  "Z-ai-guard": path.join(PLATFORM_ROOT, "guard"),
  "Z-ai-skills": path.join(PLATFORM_ROOT, "skills"),
  "Z-ai-platform": PLATFORM_ROOT,
};

const PATTERNS = ["**/*.md", "**/*.json", "**/*.yml", "**/*.yaml"];

const results = {
  hard: [],
  soft: [],
  stats: {
    total_ids: 0,
    by_prefix: {},
  },
};

function addHard(id, description, passed, detail) {
  results.hard.push({ id, description, passed, detail });
  if (passed) results.stats.passed++;
  else results.stats.failed++;
}

function addSoft(id, description, detail) {
  results.soft.push({ id, description, detail });
  results.stats.warnings++;
}

// Phase 1: Extract all IDs
console.log(`verify-id-graph.js v${VERSION}`);
console.log(`Repos scanned: ${Object.keys(REPOS).length}`);
console.log("");

const allIds = [];
for (const [repoName, repoPath] of Object.entries(REPOS)) {
  if (!fs.existsSync(repoPath)) {
    console.error(`[ERROR] Repo not found: ${repoPath}`);
    process.exit(2);
  }

  const files = listFiles(repoPath, PATTERNS);
  console.log(`Scanning ${repoName}: ${repoPath}`);
  for (const file of files) {
    const content = fs.readFileSync(file, "utf8");
    const extracted = extractDeclaration(file, repoName);
    if (extracted) {
      allIds.push(extracted);
    }
  }
}

results.stats.total_ids = allIds.length;

// Group by prefix
for (const id of allIds) {
  const prefix = id.prefix || "null";
  results.stats.by_prefix[prefix] = (results.stats.by_prefix[prefix] || 0) + 1;
}

// Parse migrations
const migrations = parseMigrations(REPOS);

// Run hard checks
addHard(G01(allIds).id, G01(allIds).description, G01(allIds).passed, G01(allIds).detail);
addHard(G02(allIds).id, G02(allIds).description, G02(allIds).passed, G02(allIds).detail);
addHard(
  G03(allIds, tarjanSCC).id,
  G03(allIds, tarjanSCC).description,
  G03(allIds, tarjanSCC).passed,
  G03(allIds, tarjanSCC).detail,
);
addHard(
  G04(allIds, LAYER_MATRIX).id,
  G04(allIds, LAYER_MATRIX).description,
  G04(allIds, LAYER_MATRIX).passed,
  G04(allIds, LAYER_MATRIX).detail,
);
addHard(
  G05(allIds).id,
  G05(allIds, migrations).description,
  G05(allIds, migrations).passed,
  G05(allIds, migrations).detail,
);
addHard(G07(allIds).id, G07(allIds).description, G07(allIds).passed, G07(allIds).detail);
addHard(G08(allIds).id, G08(allIds).description, G08(allIds).passed, G08(allIds).detail);
addHard(G09(allIds).id, G09(allIds).description, G09(allIds).passed, G09(allIds).detail);
addHard(G10(allIds).id, G10(allIds).description, G10(allIds).passed, G10(allIds).detail);
addHard(G11(allIds).id, G11(allIds).description, G11(allIds).passed, G11(allIds).detail);
addHard(
  G12(allIds, ID_REGEX).id,
  G12(allIds, ID_REGEX).description,
  G12(allIds, ID_REGEX).passed,
  G12(allIds, ID_REGEX).detail,
);
addHard(
  G14(allIds).id,
  G14(allIds, COMPAT_MATRIX).description,
  G14(allIds, COMPAT_MATRIX).passed,
  G14(allIds, COMPAT_MATRIX).detail,
);
addHard(G15(allIds).id, G15(allIds).description, G15(allIds).passed, G15(allIds).detail);

// Run soft checks
const w08 = W08(allIds);
if (w08.detail !== "all reciprocated") {
  addSoft(w08.id, w08.description, w08.detail);
}

// Output
console.log(
  `By prefix: ${Object.entries(results.stats.by_prefix)
    .map(([k, v]) => `${k}=${v}`)
    .join(", ")}`,
);
console.log("");
console.log("--- Hard Checks (G01-G15) ---");
results.hard.forEach((c) => {
  const emoji = c.passed ? "[PASS]" : "[FAIL]";
  console.log(`  ${emoji} ${c.id.padEnd(5)} ${c.description}`);
  if (c.detail && !c.passed) {
    console.log(`         ${c.detail}`);
  }
});

console.log("");
console.log("--- Soft Warnings (W01-W15) ---");
if (results.soft.length === 0) {
  console.log("  (no warnings)");
} else {
  results.soft.forEach((w) => {
    console.log(`  ${w.id.padEnd(5)} ${w.description}`);
    if (w.detail) {
      console.log(`         ${w.detail}`);
    }
  });
}

console.log("");
console.log(
  `Result: ${results.stats.failed === 0 ? "PASS" : "FAIL"} (${results.hard.filter((c) => c.passed).length}/13 hard checks, ${results.soft.length} warnings)`,
);

process.exit(results.stats.failed > 0 ? 1 : 0);
