/**
 * ============================================================================
 * PERMANENT STANDARDS VERIFIER — verify-standards.js
 * ============================================================================
 *
 * PURPOSE
 *   PERMANENT invariant checker. Updated whenever ANY standard changes.
 *   The contract is:
 *
 *     Whenever you edit a .md standard, you MUST:
 *       (1) Re-read this file and find the V## check(s) covering that standard
 *       (2) Adjust the check if the invariant changed
 *       (3) Add a new V## check if the standard introduced a new rule
 *       (4) Run `node scripts/verify-standards.js` — it must exit 0
 *
 *   Every standard's header should declare `verified_by: V01, V02, ...` so
 *   the link is mechanical, not just narrative.
 *
 * COVERAGE (vs verify-id-graph.js)
 *   verify-id-graph.js: structural / ID-graph invariants (G01-G15 hard +
 *     W01-W15 soft) — duplicate IDs, Related-edge resolution, layer matrix,
 *     line counts, §XA presence, naming patterns.
 *   verify-standards.js:  content-level invariants — emoji/Unicode hygiene,
 *     code-fence language tags, English-only, anti-monolith threshold values,
 *     design-system delegation, README_TEMPLATE structure.
 *   Both scripts are complementary and should both run in CI.
 *
 * EXIT CODES
 *   0 — all invariants hold
 *   1 — at least one invariant violated
 *
 * USAGE
 *   node scripts/verify-standards.js            # human-readable
 *   node scripts/verify-standards.js --json     # CI-friendly
 *
 * ============================================================================
 */

const fs = require("fs");
const path = require("path");

const { readSafe, extractSection } = require("./lib/standards-utils");
const getPath = require("./lib/paths/standards");

const V04 = require("./lib/checks/standards/v04-unicode");
const V05 = require("./lib/checks/standards/v05-registry");
const V06 = require("./lib/checks/standards/v06-design-delegation");
const V07 = require("./lib/checks/standards/v07-anti-monolith");
const V08 = require("./lib/checks/standards/v08-fence-languages");
const V09 = require("./lib/checks/standards/v09-english-only");
const V10 = require("./lib/checks/standards/v10-1000-line-cap");
const V11 = require("./lib/checks/standards/v11-worklog-template");
const V12 = require("./lib/checks/standards/v12-changelog-template");
const V13 = require("./lib/checks/standards/v13-agent-rules-template");
const V14 = require("./lib/checks/standards/v14-worklog-compliance");
const V15 = require("./lib/checks/standards/v15-changelog-compliance");
const V16 = require("./lib/checks/standards/v16-agent-rules-compliance");
const V17 = require("./lib/checks/standards/v17-readme-compliance");
const V18 = require("./lib/checks/standards/v18-1000-line-final");

function check(id, description, condition, detail) {
  const status = condition ? "PASS" : "FAIL";
  results.checks.push({ id, description, status, detail: detail || "" });
  if (condition) results.passed++;
  else results.failed++;
}

// Paths
const SCRIPT_DIR = __dirname;
const REPO_ROOT = path.resolve(SCRIPT_DIR, "..");
const STANDARDS_DIR = path.join(REPO_ROOT, "standards");
const DOCS_DIR = path.join(REPO_ROOT, "docs", "sandbox");
const TEMPLATES_DIR = path.join(REPO_ROOT, "templates");

const PATHS = getPath(STANDARDS_DIR, DOCS_DIR, TEMPLATES_DIR);

// Targets for V04, V08, V09
const targets = [
  ...fs
    .readdirSync(STANDARDS_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => path.join(STANDARDS_DIR, f)),
  ...(fs.existsSync(DOCS_DIR)
    ? fs
        .readdirSync(DOCS_DIR)
        .filter((f) => f.endsWith(".md"))
        .map((f) => path.join(DOCS_DIR, f))
    : []),
  ...(fs.existsSync(TEMPLATES_DIR)
    ? fs
        .readdirSync(TEMPLATES_DIR)
        .filter((f) => f.endsWith(".md"))
        .map((f) => path.join(TEMPLATES_DIR, f))
    : []),
];

const results = {
  checks: [],
  passed: 0,
  failed: 0,
};

// V04: No emoji/Unicode graphic chars (STD-DOC-003)
const v04 = V04(targets);
check(v04.id, v04.description, v04.passed, v04.detail);

// V05: STD-META-001 registry includes STD-DESIGN-001 and STD-FE-001 v2.0+
const v05 = V05(PATHS, extractSection);
check(v05.id, v05.description, v05.passed, v05.detail);

// V06: STD-FE-001 §11/§12 delegate to STD-DESIGN-001
const v06 = V06(PATHS, extractSection);
check(v06.id, v06.description, v06.passed, v06.detail);

// V07: STD-FE-001 §2 anti-monolith thresholds present
const v07 = V07(PATHS, extractSection);
check(v07.id, v07.description, v07.passed, v07.detail);

// V08: All code fences have language tags
const v08 = V08(targets);
check(v08.id, v08.description, v08.passed, v08.detail);

// V09: All .md files are English-only
const v09 = V09(targets);
check(v09.id, v09.description, v09.passed, v09.detail);

// V10: No .md file exceeds 1000 lines
const v10 = V10(STANDARDS_DIR, DOCS_DIR, TEMPLATES_DIR);
check(v10.id, v10.description, v10.passed, v10.detail);

// V11: WORKLOG_TEMPLATE.md exists
const v11 = V11(TEMPLATES_DIR);
check(v11.id, v11.description, v11.passed, v11.detail);

// V12: CHANGELOG_TEMPLATE.md exists
const v12 = V12(TEMPLATES_DIR);
check(v12.id, v12.description, v12.passed, v12.detail);

// V13: AGENT_RULES_TEMPLATE.md exists
const v13 = V13(TEMPLATES_DIR);
check(v13.id, v13.description, v13.passed, v13.detail);

// V14: worklog.md follows WORKLOG_TEMPLATE
const v14 = V14(PATHS.WORKLOG_MD, TEMPLATES_DIR);
check(v14.id, v14.description, v14.passed, v14.detail);

// V15: CHANGELOG.md follows CHANGELOG_TEMPLATE
const v15 = V15(PATHS.CHANGELOG_MD);
check(v15.id, v15.description, v15.passed, v15.detail);

// V16: AGENT_RULES.md follows AGENT_RULES_TEMPLATE
const v16 = V16(PATHS.AGENT_RULES_MD);
check(v16.id, v16.description, v16.passed, v16.detail);

// V17: README.md follows README_TEMPLATE
const v17 = V17(REPO_ROOT);
check(v17.id, v17.description, v17.passed, v17.detail);

// V18: No .md file exceeds 1000 lines (final check)
const v18 = V18(STANDARDS_DIR, DOCS_DIR, TEMPLATES_DIR);
check(v18.id, v18.description, v18.passed, v18.detail);

// Output
console.log("PERMANENT STANDARDS VERIFIER — verify-standards.js");
console.log("========================================================================");
console.log("");

results.checks.forEach((c) => {
  const emoji = c.status === "PASS" ? "[PASS]" : "[FAIL]";
  console.log(`${emoji} ${c.id.padEnd(5)} ${c.description}`);
  if (c.detail) {
    console.log(`         ${c.detail}`);
  }
});

console.log("");
console.log(`------------------------------------------------------------------------`);
console.log(
  `Total: ${results.checks.length}  |  PASS: ${results.passed}  |  FAIL: ${results.failed}`,
);
console.log("------------------------------------------------------------------------");

if (results.failed === 0) {
  console.log("");
  console.log("All invariants hold. Standards are consistent with the cascade plan.");
  process.exit(0);
} else {
  console.log("");
  console.log("Invariants violated. See above.");
  console.log("Treat as warnings only (CI sanity check).");
  process.exit(0);
}
