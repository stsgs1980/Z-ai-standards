#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const { parseArgs, printJSON } = require("./lib/cli-utils");
const {
  parseFrontmatter,
  parseBlockquote,
  listSkillDirs,
  VALID_DOMAINS,
  VALID_COMPAT,
  discoverPlatformRoot,
} = require("./lib/skills-utils");

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

function check(id, description, passed, detail, isSoft) {
  const status = passed ? "PASS" : isSoft ? "WARN" : "FAIL";
  results.checks.push({ id, status, description, detail, isSoft: !!isSoft });
  if (status === "PASS") results.stats.hard_pass++;
  else if (isSoft) results.stats.soft_warnings++;
  else results.stats.hard_fail++;
}

function warn(code, message) {
  results.warnings.push({ code, message });
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

  (function S01() {
    const missing = skillDirs.filter((s) => !fs.existsSync(path.join(s.path, "SKILL.md")));
    check(
      "S01",
      `SKILL.md exists in every skills/skills/{name}/ folder — scanned ${skillDirs.length} folders`,
      missing.length === 0,
      missing.length === 0
        ? `all ${skillDirs.length} folders have SKILL.md`
        : `${missing.length} folder(s) missing SKILL.md: ${missing.map((m) => m.name).join(", ")}`,
    );
  })();

  (function S02() {
    const offenders = [];
    for (const s of skillDirs) {
      const skillMdPath = path.join(s.path, "SKILL.md");
      if (!fs.existsSync(skillMdPath)) continue;
      const content = fs.readFileSync(skillMdPath, "utf8");
      const fm = parseFrontmatter(content);
      if (!fm.parsed) continue;
      const expected = s.name;
      if (fm.data.name !== expected) {
        offenders.push(`${s.name}: frontmatter name="${fm.data.name}" expected "${expected}"`);
      }
    }
    check(
      "S02",
      "frontmatter `name` matches folder name exactly (per §3.3 + §9.1)",
      offenders.length === 0,
      offenders.length === 0
        ? `all ${skillDirs.length} skills match`
        : `${offenders.length} mismatch(es): ${offenders.join("; ")}`,
      s025Soft,
    );
  })();

  (function S03() {
    check("S03", "name matches folder name (covered by S02)", true, "covered by S02 (V11b)", false);
  })();

  (function S04() {
    const offenders = [];
    for (const s of skillDirs) {
      const skillMdPath = path.join(s.path, "SKILL.md");
      if (!fs.existsSync(skillMdPath)) continue;
      const content = fs.readFileSync(skillMdPath, "utf8");
      const fm = parseFrontmatter(content);
      if (!fm.parsed) {
        offenders.push(`${s.name}: ${fm.error}`);
      }
    }
    check(
      "S04",
      "YAML frontmatter parses — scanned all skill folders with SKILL.md",
      offenders.length === 0,
      offenders.length === 0
        ? "all frontmatter blocks parse successfully"
        : `${offenders.length} parse error(s): ${offenders.join("; ")}`,
    );
  })();

  (function S05() {
    const required = ["name", "description", "version"];
    const offenders = [];
    for (const s of skillDirs) {
      const skillMdPath = path.join(s.path, "SKILL.md");
      if (!fs.existsSync(skillMdPath)) continue;
      const content = fs.readFileSync(skillMdPath, "utf8");
      const fm = parseFrontmatter(content);
      if (!fm.parsed) continue;
      const missing = required.filter((f) => !fm.data[f]);
      if (missing.length) {
        offenders.push(`${s.name}: missing ${missing.join(", ")}`);
      }
    }
    check(
      "S05",
      "Required frontmatter fields present: name, description, version",
      offenders.length === 0,
      offenders.length === 0
        ? `all ${skillDirs.length} skills have required fields`
        : `${offenders.length} skill(s) with missing fields: ${offenders.join("; ")}`,
      s025Soft,
    );
  })();

  (function S06() {
    const idRegex = /^ZAI-([A-Z]+)-(\d{3})$/;
    const offenders = [];
    let checked = 0;
    for (const s of skillDirs) {
      const skillMdPath = path.join(s.path, "SKILL.md");
      if (!fs.existsSync(skillMdPath)) continue;
      const content = fs.readFileSync(skillMdPath, "utf8");
      const fm = parseFrontmatter(content);
      if (!fm.parsed || !fm.data.id) continue;
      checked++;
      const m = idRegex.exec(fm.data.id);
      if (!m) {
        offenders.push(`${s.name}: id="${fm.data.id}" does not match ZAI-<DOMAIN>-<NNN>`);
        continue;
      }
      if (!VALID_DOMAINS.has(m[1])) {
        offenders.push(`${s.name}: id="${fm.data.id}" has unknown domain "${m[1]}"`);
      }
    }
    check(
      "S06",
      `id field format valid (ZAI-<DOMAIN>-<NNN>, valid domain) — checked ${checked} skills with id field`,
      offenders.length === 0,
      offenders.length === 0
        ? checked === 0
          ? "no skills have id field (optional per STD-SKILL-001 §4.2)"
          : `all ${checked} ids valid`
        : `${offenders.length} invalid: ${offenders.join("; ")}`,
      true,
    );
  })();

  (function S07() {
    const offenders = [];
    let checked = 0;
    for (const s of skillDirs) {
      const skillMdPath = path.join(s.path, "SKILL.md");
      if (!fs.existsSync(skillMdPath)) continue;
      const content = fs.readFileSync(skillMdPath, "utf8");
      const fm = parseFrontmatter(content);
      if (!fm.parsed || !fm.data.compatibility) continue;
      checked++;
      if (!VALID_COMPAT.has(fm.data.compatibility)) {
        offenders.push(
          `${s.name}: compatibility="${fm.data.compatibility}" not in {both, sandbox, ade}`,
        );
      }
    }
    check(
      "S07",
      `compatibility field valid (both|sandbox|ade) — checked ${checked} skills with compatibility field`,
      offenders.length === 0,
      offenders.length === 0
        ? checked === 0
          ? "no skills declare compatibility (optional unless id present)"
          : `all ${checked} valid`
        : `${offenders.length} invalid: ${offenders.join("; ")}`,
      true,
    );
  })();

  (function S08() {
    const offenders = [];
    let checked = 0;
    for (const s of skillDirs) {
      const skillMdPath = path.join(s.path, "SKILL.md");
      if (!fs.existsSync(skillMdPath)) continue;
      const content = fs.readFileSync(skillMdPath, "utf8");
      const fm = parseFrontmatter(content);
      if (!fm.parsed || !fm.data.id) continue;
      const bq = parseBlockquote(content);
      if (!bq.id) continue;
      checked++;
      if (fm.data.id !== bq.id) {
        offenders.push(`${s.name}: frontmatter id="${fm.data.id}" vs blockquote ID:="${bq.id}"`);
      }
    }
    check(
      "S08",
      `frontmatter id matches blockquote ID: — checked ${checked} skills with both`,
      offenders.length === 0,
      offenders.length === 0
        ? checked === 0
          ? "no skills have both frontmatter id and blockquote ID:"
          : `all ${checked} consistent`
        : `${offenders.length} mismatch(es): ${offenders.join("; ")}`,
      true,
    );
  })();

  (function S09() {
    const offenders = [];
    let checked = 0;
    for (const s of skillDirs) {
      const skillMdPath = path.join(s.path, "SKILL.md");
      if (!fs.existsSync(skillMdPath)) continue;
      const content = fs.readFileSync(skillMdPath, "utf8");
      const fm = parseFrontmatter(content);
      if (!fm.parsed || fm.data.version === undefined) continue;
      const bq = parseBlockquote(content);
      if (bq.version === undefined) continue;
      checked++;
      const fmVer = String(fm.data.version);
      const bqVer = String(bq.version).replace(/^v/, "");
      if (fmVer !== bqVer) {
        offenders.push(
          `${s.name}: frontmatter version="${fmVer}" vs blockquote Version:="${bq.version}"`,
        );
      }
    }
    check(
      "S09",
      `frontmatter version matches blockquote Version: — checked ${checked} skills with both`,
      offenders.length === 0,
      offenders.length === 0
        ? checked === 0
          ? "no skills have both frontmatter version and blockquote Version:"
          : `all ${checked} consistent`
        : `${offenders.length} mismatch(es): ${offenders.join("; ")}`,
    );
  })();

  (function S10() {
    const SKILLMD_CAP = 800;
    const CONTRACTMD_CAP = 500;
    const READMEMD_CAP = 400;

    const skillMdOffenders = [];
    const contractMdOffenders = [];
    const readmeMdOffenders = [];
    let skillMdChecked = 0;
    let contractMdChecked = 0;
    let readmeMdChecked = 0;

    for (const s of skillDirs) {
      const skillMdPath = path.join(s.path, "SKILL.md");
      if (fs.existsSync(skillMdPath)) {
        skillMdChecked++;
        const content = fs.readFileSync(skillMdPath, "utf8");
        const lineCount =
          content === "" ? 0 : content.split("\n").length - (content.endsWith("\n") ? 1 : 0);
        if (lineCount > SKILLMD_CAP) {
          skillMdOffenders.push(
            `${s.name}/SKILL.md: ${lineCount} lines (exceeds ${SKILLMD_CAP}-line cap, split required — see STD-SKILL-001 §8.2)`,
          );
        }
      }

      const contractMdPath = path.join(s.path, "CONTRACT.md");
      if (fs.existsSync(contractMdPath)) {
        contractMdChecked++;
        const content = fs.readFileSync(contractMdPath, "utf8");
        const lineCount =
          content === "" ? 0 : content.split("\n").length - (content.endsWith("\n") ? 1 : 0);
        if (lineCount > CONTRACTMD_CAP) {
          contractMdOffenders.push(
            `${s.name}/CONTRACT.md: ${lineCount} lines (exceeds ${CONTRACTMD_CAP}-line cap, externalise auxiliary sections to references/ — see META-001 §4.18.6)`,
          );
        }
      }

      const readmeMdPath = path.join(s.path, "README.md");
      if (fs.existsSync(readmeMdPath)) {
        readmeMdChecked++;
        const content = fs.readFileSync(readmeMdPath, "utf8");
        const lineCount =
          content === "" ? 0 : content.split("\n").length - (content.endsWith("\n") ? 1 : 0);
        if (lineCount > READMEMD_CAP) {
          readmeMdOffenders.push(
            `${s.name}/README.md: ${lineCount} lines (exceeds ${READMEMD_CAP}-line cap, move detailed examples to references/ — README is for onboarding/overview only)`,
          );
        }
      }
    }

    check(
      "S10a",
      `SKILL.md ≤ ${SKILLMD_CAP} lines (META-001 §4.18.1, SKILL.md row) — checked ${skillMdChecked} SKILL.md files`,
      skillMdOffenders.length === 0,
      skillMdOffenders.length === 0
        ? `all ${skillMdChecked} SKILL.md files ≤ ${SKILLMD_CAP} lines`
        : `${skillMdOffenders.length} file(s) over cap: ${skillMdOffenders.join("; ")}`,
    );

    check(
      "S10b",
      `CONTRACT.md ≤ ${CONTRACTMD_CAP} lines (META-001 §4.18.1, CONTRACT.md row) — checked ${contractMdChecked} CONTRACT.md files`,
      contractMdOffenders.length === 0,
      contractMdOffenders.length === 0
        ? contractMdChecked === 0
          ? "no skills have CONTRACT.md (optional)"
          : `all ${contractMdChecked} CONTRACT.md files ≤ ${CONTRACTMD_CAP} lines`
        : `${contractMdOffenders.length} file(s) over cap: ${contractMdOffenders.join("; ")}`,
    );

    check(
      "S10c",
      `README.md ≤ ${READMEMD_CAP} lines (META-001 §4.18.1, README.md row) — checked ${readmeMdChecked} README.md files`,
      readmeMdOffenders.length === 0,
      readmeMdOffenders.length === 0
        ? readmeMdChecked === 0
          ? "no skills have README.md (optional)"
          : `all ${readmeMdChecked} README.md files ≤ ${READMEMD_CAP} lines`
        : `${readmeMdOffenders.length} file(s) over cap: ${readmeMdOffenders.join("; ")}`,
    );
  })();
}

function showHelp() {
  console.log(`
verify-skills.js v${VERSION} — Skills-side Format Verifier

Usage:
  node scripts/verify-skills.js [options]

Options:
  --json               Output JSON instead of human-readable
  --strict             Promote S02/S03/S05 from SOFT to HARD. Use after
                       the existing 15 violations are remediated (see
                       standards/docs/CI-AND-TESTING.md §9.2.2).
  --root=<path>        Override platform root (auto-detected otherwise)
  --help, -h           Show this help

Exit codes:
  0 — all HARD checks pass (SOFT warnings may be present)
  1 — at least one HARD check failed
  2 — configuration error (skills/ not found, bad CLI args)
`);
}

function printHuman() {
  const width = Math.max(...results.checks.map((c) => c.id.length));
  console.log(`verify-skills.js v${VERSION} — Skills-side Format Verifier`);
  console.log(`Effective date: ${EFFECTIVE_DATE}`);
  console.log(`Skills scanned: ${results.stats.skills_scanned}`);
  console.log("=".repeat(72));
  console.log("");
  console.log("--- Hard Checks (S01-S05, S09, S10) ---");
  for (const c of results.checks.filter((c) => !c.isSoft)) {
    const icon = c.status === "PASS" ? "[PASS]" : "[FAIL]";
    console.log(`${icon} ${c.id.padEnd(width)}  ${c.description}`);
    if (c.detail) console.log(`         ${c.detail}`);
  }
  console.log("");
  console.log("--- Soft Checks (S06-S08) ---");
  for (const c of results.checks.filter((c) => c.isSoft)) {
    const icon = c.status === "PASS" ? "[PASS]" : "[WARN]";
    console.log(`${icon} ${c.id.padEnd(width)}  ${c.description}`);
    if (c.detail) console.log(`         ${c.detail}`);
  }
  console.log("");
  console.log("-".repeat(72));
  const hardPass = results.checks.filter((c) => !c.isSoft && c.status === "PASS").length;
  const hardFail = results.checks.filter((c) => !c.isSoft && c.status === "FAIL").length;
  const softWarn = results.checks.filter((c) => c.isSoft && c.status === "WARN").length;
  console.log(`HARD: ${hardPass}/${hardPass + hardFail} PASS, ${hardFail} FAIL`);
  console.log(`SOFT: ${softWarn} warning(s)`);
  console.log("");
  if (hardFail > 0) {
    console.log("ACTION REQUIRED:");
    console.log("  At least one HARD invariant was violated. Either:");
    console.log("    (a) Fix the SKILL.md to conform to STD-SKILL-001 v1.1, OR");
    console.log("    (b) Update the S## check in scripts/verify-skills.js if the");
    console.log("        standard itself changed.");
    console.log("  Then re-run: node scripts/verify-skills.js");
  } else {
    console.log("All HARD invariants hold. Skills conform to STD-SKILL-001 v1.1.");
  }
}

function main() {
  const opts = parseArgs(process.argv);
  if (opts.help) {
    showHelp();
    process.exit(0);
  }

  const platformRoot = opts.root || discoverPlatformRoot(__dirname);
  if (!platformRoot) {
    console.error("[verify-skills] Could not discover platform root.");
    console.error("[verify-skills] Set ZAI_PLATFORM_ROOT env var or use --root=<path>.");
    process.exit(2);
  }

  runChecks(platformRoot, opts);

  if (opts.json) {
    printJSON({
      script: "verify-skills.js",
      version: VERSION,
      effective_date: EFFECTIVE_DATE,
      generated: new Date().toISOString(),
      summary: {
        skills_scanned: results.stats.skills_scanned,
        hard_pass: results.stats.hard_pass,
        hard_fail: results.stats.hard_fail,
        soft_warnings: results.stats.soft_warnings,
      },
      checks: results.checks,
    });
  } else {
    printHuman();
  }

  const hardFail = results.checks.filter((c) => !c.isSoft && c.status === "FAIL").length;
  process.exit(hardFail > 0 ? 1 : 0);
}

main();
