#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const { VERSION, parseArgs, printJSON } = require("./lib/cli-utils");
const { listFiles, countLines, discoverProjectRoot } = require("./lib/file-utils");
const { CATEGORIES, categorizeFile } = require("./lib/category-utils");
const { createResults, addCheck } = require("./lib/check-utils");

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

function printHuman(results) {
  const w = Math.max(...results.checks.map((c) => c.id.length));
  console.log(`verify-source-line-count.js v${VERSION}`);
  console.log("=".repeat(72));
  for (const c of results.checks) {
    const icon = c.status === "PASS" ? "[PASS]" : "[FAIL]";
    console.log(`${icon} ${c.id.padEnd(w)}  ${c.description}`);
    if (c.detail) console.log(`         ${c.detail}`);
  }
  console.log("-".repeat(72));
  console.log(
    `HARD: ${results.stats.hard_pass}/${results.stats.hard_pass + results.stats.hard_fail} PASS, ${results.stats.hard_fail} FAIL`,
  );
}

function runChecks(projectRoot) {
  const results = createResults();
  const files = listFiles(projectRoot, projectRoot);
  results.stats.files_scanned = files.length;

  const byCategory = {};
  for (const file of files) {
    const cat = categorizeFile(file);
    if (cat) {
      if (!byCategory[cat]) byCategory[cat] = [];
      byCategory[cat].push(file);
    }
  }

  for (const [catName, catDef] of Object.entries(CATEGORIES)) {
    const catFiles = byCategory[catName] || [];
    if (catFiles.length === 0) continue;

    const offenders = [];
    for (const file of catFiles) {
      const content = fs.readFileSync(file, "utf8");
      const lineCount = countLines(content);
      if (lineCount > catDef.hard) {
        offenders.push({
          file: path.relative(projectRoot, file),
          lines: lineCount,
          limit: catDef.hard,
          excess: lineCount - catDef.hard,
        });
      }
    }

    const catDesc = catDef.pattern ? catDef.pattern.source : catDef.extensions.join(",");
    const detail =
      offenders.length === 0
        ? `all ${catFiles.length} files within limit`
        : offenders
            .map((o) => `${o.file}: ${o.lines} lines (exceeds ${o.limit}, excess: ${o.excess})`)
            .join("; ");

    addCheck(
      results,
      catName,
      offenders.length === 0 ? "PASS" : "FAIL",
      `${catDesc} <= ${catDef.hard} lines`,
      detail,
    );
  }

  return results;
}

function main() {
  const opts = parseArgs(process.argv);
  if (opts.help) {
    showHelp();
    process.exit(0);
  }

  const root = opts.root || discoverProjectRoot(__dirname);
  if (!root) {
    console.error("[verify-source-line-count] Could not discover project root.");
    console.error("[verify-source-line-count] Set ZAI_PLATFORM_ROOT or use --root=<path>.");
    process.exit(2);
  }

  const results = runChecks(root);

  if (opts.json) {
    printJSON({
      script: "verify-source-line-count.js",
      version: VERSION,
      generated: new Date().toISOString(),
      summary: results.stats,
      checks: results.checks,
    });
  } else {
    printHuman(results);
  }

  const fail = results.checks.filter((c) => c.status === "FAIL").length;
  process.exit(fail > 0 && !opts.soft ? 1 : 0);
}

main();
