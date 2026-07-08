"use strict";

const CHANGE_HISTORY_RE = /^##\s+\d+\.?\s*(Version History|Change History|Changelog)\s*$/im;

function stripChangeHistory(txt) {
  const lines = txt.split("\n");
  const out = [];
  let skipping = false;
  for (const line of lines) {
    if (skipping) {
      if (/^##\s/.test(line)) {
        skipping = false;
        out.push(line);
      }
    } else {
      out.push(line);
      if (CHANGE_HISTORY_RE.test(line)) {
        skipping = true;
      }
    }
  }
  return out.join("\n");
}

const VALID_DOMAINS = new Set([
  "META",
  "ARCH",
  "DOC",
  "SKILL",
  "ENV",
  "GIT",
  "DESIGN",
  "FE",
  "A11Y",
  "ERR",
  "SEC",
  "TEST",
  "AGENT",
]);

module.exports = { stripChangeHistory, VALID_DOMAINS };
