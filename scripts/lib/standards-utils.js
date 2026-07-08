"use strict";

const fs = require("fs");

function readSafe(filePath) {
  if (!fs.existsSync(filePath)) return null;
  return fs.readFileSync(filePath, "utf-8");
}

function extractSection(content, sectionNumber) {
  if (!content) return "";
  const pattern = new RegExp(
    `(^|\\n)(#{2,4})\\s*${sectionNumber.replace(/\./g, "\\.")}[^\\n]*\\n`,
    "m",
  );
  const match = content.match(pattern);
  if (!match) return "";
  const startIdx = match.index + match[1].length;
  const headingLevel = match[2].length;
  const afterStart = content.slice(startIdx);
  const lines = afterStart.split("\n");

  let inCodeFence = false;
  let endLineIdx = -1;
  const headingRe = new RegExp(`^#{1,${headingLevel}}\\s+\\S`);

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (/^```/.test(line)) {
      inCodeFence = !inCodeFence;
      continue;
    }
    if (inCodeFence) continue;
    if (headingRe.test(line)) {
      endLineIdx = i;
      break;
    }
  }

  if (endLineIdx === -1) return afterStart;
  return lines.slice(0, endLineIdx).join("\n");
}

module.exports = { readSafe, extractSection };
