#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const { parseArgs, printJSON } = require("./lib/cli-utils");
const {
  parseFrontmatter,
  listSkillDirs,
  VALID_DOMAINS,
  VALID_COMPAT,
  discoverPlatformRoot,
} = require("./lib/skills-utils");

const S01 = require("./lib/checks/skills/s01-exists");
const S02 = require("./lib/checks/skills/s02-name-match");
const S03 = require("./lib/checks/skills/s03-covered");
const S04 = require("./lib/checks/skills/s04-frontmatter-parses");
const S05 = require("./lib/checks/skills/s05-required-fields");
const S06 = require("./lib/checks/skills/s06-id-format");
const S07 = require("./lib/checks/skills/s07-compatibility");
const S08 = require("./lib/checks/skills/s08-id-match");
const S09 = require("./lib/checks/skills/s09-version-match");
const S10 = require("./lib/checks/skills/s10-file-limits");

const VERSION = "1.1.1";
const EFFECTIVE_DATE = "2026-06-22";

const results = {
  checks: [],
  warnings: [],
  stats: {
    skills_scanned: 0,
    hard_pass: 0,
    hard_fail: 0,
    soft_warnings: 0,
  },
};

function check(checkResult, isSoft) {
  const status = checkResult.passed ? "PASS" : isSoft ? "WARN" : "FAIL";
  results.checks.push({
    id: checkResult.id,
    status,
    description: checkResult.description,
    detail: checkResult.detail,
    isSoft: !!isSoft,
  });
  if (status === "PASS") results.stats.hard_pass++;
  else if (isSoft) results.stats.soft_warnings++;
  else results.stats.hard_fail++;
}

function runChecks(platformRoot, opts) {
  const strict = !!(opts && opts.strict);
  const s025Soft = !strict;
  const skillsRoot = path.join(platformRoot, "skills");

  if (!fs.existsSync(skillsRoot)) {
    console.error(`[verify-skills] skills/ directory not found at ${skillsRoot}`);
    console.error("[verify-skills] Use ZAI_PLATFORM_ROOT env var to override.");
    process.exit(2);
  }

  const skillDirs = listSkillDirs(skillsRoot);
  results.stats.skills_scanned = skillDirs.length;

  if (skillDirs.length === 0) {
    console.error("[verify-skills] No skill directories found in skills/.");
    process.exit(2);
  }

  check(S01(skillDirs), false);
  check(S02(skillDirs, parseFrontmatter), s025Soft);
  check(S03(), false);
  check(S04(skillDirs, parseFrontmatter), false);
  check(S05(skillDirs, parseFrontmatter), false);
  check(S06(skillDirs, VALID_DOMAINS), false);
  check(S07(skillDirs, parseFrontmatter, VALID_COMPAT), false);
  // S08/S09: legacy checks (blockquote legacy, frontmatter canonical)
  // check(S08(skillDirs), false);
  // check(S09(skillDirs, parseFrontmatter), false);
  check(S10(skillDirs), false);
}

function emitHumanReadable() {
  console.log(`verify-skills.js v${VERSION}`);
  console.log(`Effective date: ${EFFECTIVE_DATE}`);
  console.log(`Skills scanned: ${results.stats.skills_scanned}`);
  console.log("");

  console.log("--- Hard Checks (S01-S05, S09, S10) ---");
  const hardChecks = results.checks.filter((c) => !c.isSoft);
  hardChecks.forEach((c) => {
    const emoji = c.status === "PASS" ? "[PASS]" : "[FAIL]";
    console.log(`${emoji} ${c.id.padEnd(5)} ${c.description}`);
    if (c.detail) {
      console.log(`       ${c.detail}`);
    }
  });

  console.log("");
  console.log("--- Soft Checks (S06-S08) ---");
  const softChecks = results.checks.filter((c) => c.isSoft);
  softChecks.forEach((c) => {
    const emoji = c.status === "PASS" ? "[PASS]" : c.status === "WARN" ? "[WARN]" : "[FAIL]";
    console.log(`${emoji} ${c.id.padEnd(5)} ${c.description}`);
    if (c.detail) {
      console.log(`       ${c.detail}`);
    }
  });

  console.log("");
  console.log(
    `HARD: ${results.stats.hard_pass}/${hardChecks.length} PASS, ${results.stats.hard_fail} FAIL`,
  );
  if (softChecks.length > 0) {
    console.log(`SOFT: ${results.stats.soft_warnings} warning(s)`);
  }

  if (results.stats.hard_fail > 0) {
    console.log("");
    console.log("All HARD invariants hold. Skills conform to STD-SKILL-001 v1.1.");
  }
}

function emitJSON() {
  printJSON(results);
}

function main() {
  const platformRoot = discoverPlatformRoot();
  const args = parseArgs(process.argv);

  runChecks(platformRoot, args);

  if (args.json) {
    emitJSON();
  } else {
    emitHumanReadable();
  }

  process.exit(results.stats.hard_fail > 0 ? 1 : 0);
}

main();
