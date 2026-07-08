/**
 * lib/health-warnings.js — Phase 10 (W11-W15) for verify-id-graph.js
 */

"use strict";

const fs = require("fs");
const path = require("path");

const { W13_WHITELIST } = require("./warnings/whitelist");
const { buildCandidates } = require("./warnings/candidates");
const { stripChangeHistory, VALID_DOMAINS } = require("./warnings/utils");

function phase10_healthWarnings(repos, warnFn) {
  if (!repos.standards) return;
  const standardsTreeRoot = repos.standards;
  const platformRoot = path.dirname(standardsTreeRoot);

  const mdFiles = [];
  function walk(dir, depth) {
    if (depth > 8) return;
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch (e) {
      return;
    }
    for (const entry of entries) {
      if (
        entry.name === "node_modules" ||
        entry.name === ".git" ||
        entry.name === "_design" ||
        entry.name === "legacy"
      )
        continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full, depth + 1);
      else if (entry.name.endsWith(".md")) mdFiles.push(full);
    }
  }
  walk(standardsTreeRoot, 0);

  const refPattern = /`([a-zA-Z0-9_\-\/]+\.(md|sh))`/g;

  for (const filePath of mdFiles) {
    const fileName = path.basename(filePath);
    let content;
    try {
      content = fs.readFileSync(filePath, "utf8");
    } catch (e) {
      continue;
    }
    const lineCount = content.split("\n").length;

    const isCompanion = /^>\s*Companion to:/m.test(content);
    const isNormative =
      filePath.includes(path.join("standards", "standards") + path.sep) && !isCompanion;
    if (isNormative) {
      const nameMatch = fileName.match(/^([A-Z0-9]+)-(\d{3})-(.+)\.md$/);
      if (!nameMatch) {
        if (fileName !== "README.md" && fileName !== "INDEX.md") {
          warnFn("W15", `${fileName}: does not match <DOMAIN>-<NNN>-<name>.md naming convention`);
        }
      } else {
        const domain = nameMatch[1];
        if (!VALID_DOMAINS.has(domain)) {
          warnFn(
            "W15",
            `${fileName}: unknown domain "${domain}" (valid: ${[...VALID_DOMAINS].join(", ")})`,
          );
        }
      }
    }

    if (lineCount > 1500) {
      warnFn(
        "W11",
        `${fileName}: ${lineCount} lines (CRITICAL — exceeds 1500-line cap, split required)`,
      );
    } else if (lineCount > 1000) {
      warnFn(
        "W11",
        `${fileName}: ${lineCount} lines (exceeds 1000-line soft cap, consider splitting)`,
      );
    }

    if (isNormative) {
      const hasKnownIssues = /^\s*##\s+\d*[A-Z]\.?\s*Known\s+Issues/im.test(content);
      if (!hasKnownIssues) {
        warnFn(
          "W12",
          `${fileName}: no §XA Known Issues section (convention per ENV-002 v1.2 §10A)`,
        );
      }
    }

    const openMatches = content.match(/\[OPEN\]/g);
    if (openMatches && openMatches.length > 5) {
      warnFn(
        "W14",
        `${fileName}: ${openMatches.length} OPEN Known Issues (exceeds 5-issue soft cap)`,
      );
    }

    const w13Content = stripChangeHistory(content);
    let m;
    const seen = new Set();
    while ((m = refPattern.exec(w13Content)) !== null) {
      const refPath = m[1];
      if (seen.has(refPath)) continue;
      seen.add(refPath);
      if (refPath.startsWith("http://") || refPath.startsWith("https://")) continue;
      if (
        refPath.startsWith("/home/") ||
        refPath.startsWith("/tmp/") ||
        refPath.startsWith("/usr/") ||
        refPath.startsWith("/etc/")
      )
        continue;
      if (W13_WHITELIST.has(refPath)) continue;
      const candidates = buildCandidates(refPath, standardsTreeRoot, filePath, platformRoot);
      const exists = candidates.some((p) => {
        try {
          return fs.existsSync(p);
        } catch (e) {
          return false;
        }
      });
      if (!exists) {
        warnFn(
          "W13",
          `${fileName}: references "${refPath}" which does not exist in standards/ tree`,
        );
      }
    }
  }
}

module.exports = { phase10_healthWarnings };
