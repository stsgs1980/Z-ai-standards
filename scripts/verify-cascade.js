/**
 * CASCADE VERIFICATION SCRIPT (L5-001, L5-002, L5-003)
 * Verifies all cascade task changes are in place and consistent.
 */

const fs = require('fs');
const path = require('path');

// RELATIVE paths — works standalone, as submodule, or in CI.
// Layout assumption: <repo-root>/upload/ and <repo-root>/scripts/
const REPO_ROOT     = path.resolve(__dirname, '..');
const STANDARDS_DIR = path.join(REPO_ROOT, 'upload', 'standards-v2', 'standards');
const UPLOAD_DIR    = path.join(REPO_ROOT, 'upload');

const results = {
  passed: 0,
  failed: 0,
  checks: []
};

function check(id, description, condition, detail) {
  const status = condition ? 'PASS' : 'FAIL';
  results.checks.push({ id, description, status, detail: detail || '' });
  if (condition) results.passed++;
  else results.failed++;
}

function readFile(relPath) {
  const fullPath = path.join(STANDARDS_DIR, relPath);
  if (!fs.existsSync(fullPath)) return null;
  return fs.readFileSync(fullPath, 'utf-8');
}

function readFileAbs(absPath) {
  if (!fs.existsSync(absPath)) return null;
  return fs.readFileSync(absPath, 'utf-8');
}

// ============================================================================
// L1-001: STD-ENV-002 Section 5 — no 'npx next dev' in startup command
// (Forbidden mentions in narrative are allowed — they explain what NOT to do)
// ============================================================================
const env002 = readFile('ZAI_INTEGRATION_STANDARD.md');
// Extract Section 5 only
const env002Section5Match = env002 && env002.match(/## 5\. Dev Server Protocol[\s\S]*?(?=## 6\.)/);
const env002Section5 = env002Section5Match ? env002Section5Match[0] : '';
check('L1-001-a', 'STD-ENV-002 Section 5 startup command does NOT use "npx next dev"',
  env002Section5 && !/cd \/home\/z\/my-project && npx next dev/.test(env002Section5),
  'Startup command must not be `npx next dev` (forbidden mentions in narrative are OK)');
check('L1-001-b', 'STD-ENV-002 Section 5 contains "init-fullstack"',
  env002Section5 && /init-fullstack/.test(env002Section5),
  'init-fullstack script URL must be present');
check('L1-001-c', 'STD-ENV-002 Section 5 mentions ".zscripts/dev.sh"',
  env002Section5 && /\.zscripts\/dev\.sh/.test(env002Section5),
  'Must reference sandbox-managed dev.sh');

// ============================================================================
// L1-002: STD-ENV-002 log path — Section 3 (path table) uses new path
// (Version History may reference old path as part of change description)
// ============================================================================
const env002Section3Match = env002 && env002.match(/## 3\. Project Directory[\s\S]*?(?=## 4\.)/);
const env002Section3 = env002Section3Match ? env002Section3Match[0] : '';
check('L1-002-a', 'STD-ENV-002 Section 3 does NOT use "/tmp/zdev.log" as the active path',
  env002Section3 && !/Dev server logs go to `\/tmp\/zdev\.log`/.test(env002Section3) && !/\| `\/tmp\/zdev\.log` \| Allowed/.test(env002Section3),
  'Old log path must not be the active path in Section 3');
check('L1-002-b', 'STD-ENV-002 references ".zscripts/dev.log"',
  env002 && /\.zscripts\/dev\.log/.test(env002),
  'New log path must be present');
check('L1-002-c', 'STD-ENV-002 path exception table includes ".zscripts/"',
  env002Section3 && /\.zscripts\/.*Allowed/.test(env002Section3),
  'Path exception table must include .zscripts/');

// ============================================================================
// L1-003: Hooks Guide — Zod validation in API routes
// ============================================================================
const hooksGuide = readFileAbs(path.join(UPLOAD_DIR, 'Hooks-in-Z.ai-Guide.md'));
check('L1-003-a', 'Hooks Guide chat route uses Zod safeParse',
  hooksGuide && /safeParse/.test(hooksGuide) && /ChatRequestSchema/.test(hooksGuide),
  'Chat API must use Zod');
check('L1-003-b', 'Hooks Guide image route uses Zod safeParse',
  hooksGuide && /ImageRequestSchema/.test(hooksGuide),
  'Image API must use Zod');
check('L1-003-c', 'Hooks Guide search route uses Zod safeParse',
  hooksGuide && /SearchRequestSchema/.test(hooksGuide),
  'Search API must use Zod');
check('L1-003-d', 'Hooks Guide API responses follow { success, data/error } format',
  hooksGuide && /success:\s*false.*error.*code/i.test(hooksGuide) && /success:\s*true.*data/i.test(hooksGuide),
  'Must follow STD-FE-001 Section 10.2 response format');

// ============================================================================
// L2-001 & L2-002: Unicode compliance
// ============================================================================
const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2702}\u{2714}\u{2716}\u{274C}\u{274E}\u{2753}\u{2757}\u{2795}-\u{2797}\u{2B05}-\u{2B07}\u{2B1B}\u{2B1C}\u{2B50}\u{2B55}\u{26A0}\u{2705}]/u;
check('L2-001', 'Hooks Guide is free of Unicode violations',
  hooksGuide && !emojiRegex.test(hooksGuide),
  'No emoji/Unicode graphics allowed');
const sandboxGuide = readFileAbs(path.join(UPLOAD_DIR, 'Z.ai-Sandbox-Guide.md'));
check('L2-002', 'Sandbox Guide is free of Unicode violations',
  sandboxGuide && !emojiRegex.test(sandboxGuide),
  'No emoji/Unicode graphics allowed');

// ============================================================================
// L3-001: STD-FE-001 Section 12 (AI Hook Patterns)
// ============================================================================
const fe001 = readFile('FRONTEND_STANDARD.md');
check('L3-001-a', 'STD-FE-001 has Section 12 (AI Hook Patterns)',
  fe001 && /## 12\.\s+AI\s+Hook\s+Patterns/i.test(fe001),
  'Section 12 must exist');
check('L3-001-b', 'STD-FE-001 Section 12 references useAI, useChat, useImage',
  fe001 && /useAI/.test(fe001) && /useChat/.test(fe001) && /useImage/.test(fe001),
  'All three hooks must be documented');
check('L3-001-c', 'STD-FE-001 Section 12 has pre-merge checklist',
  fe001 && /Pre-merge Checklist for AI Hooks/.test(fe001),
  'Checklist section must exist');
check('L3-001-d', 'STD-FE-001 version is 2.5',
  fe001 && /> Version: 2\.5/.test(fe001),
  'Version must be 2.5');

// ============================================================================
// L3-002: STD-ENV-002 Section 12 (Troubleshooting)
// ============================================================================
check('L3-002-a', 'STD-ENV-002 has Section 12 (Sandbox Troubleshooting)',
  env002 && /## 12\.\s+Sandbox\s+Troubleshooting/i.test(env002),
  'Section 12 must exist');
check('L3-002-b', 'STD-ENV-002 Section 12 has diagnostic table',
  env002 && /Diagnostic Table/.test(env002),
  'Diagnostic table must exist');
check('L3-002-c', 'STD-ENV-002 Section 12 has recovery procedures',
  env002 && /Recovery Procedures/.test(env002) && /Level 1/.test(env002) && /Level 2/.test(env002) && /Level 3/.test(env002),
  'Three-level recovery must exist');

// ============================================================================
// L3-003: STD-ENV-002 Section 13 (Submodule Workflow)
// ============================================================================
check('L3-003-a', 'STD-ENV-002 has Section 13 (Git Submodule Integration)',
  env002 && /## 13\.\s+Git\s+Submodule\s+Integration/i.test(env002),
  'Section 13 must exist');
check('L3-003-b', 'STD-ENV-002 Section 13 covers adding, updating, rollback',
  env002 && /Adding a Submodule/.test(env002) && /Updating a Submodule/.test(env002) && /Rollback a Submodule/.test(env002),
  'All three operations must be documented');

// ============================================================================
// L3-004: STD-ENV-002 Section 9.2 (Canonical useAI pattern)
// ============================================================================
check('L3-004-a', 'STD-ENV-002 Section 9.2 documents canonical useAI hook pattern',
  env002 && /### 9\.2\.\s+Canonical Client-Side Pattern/.test(env002),
  'Section 9.2 must exist');
check('L3-004-b', 'STD-ENV-002 Section 9.2 shows hook -> API route -> SDK flow',
  env002 && /hooks\//.test(env002) && /api\/ai\/chat/.test(env002) && /chat\.z\.ai/.test(env002),
  'Full flow must be documented');
check('L3-004-c', 'STD-ENV-002 version is 1.3',
  env002 && /> Version: 1\.3/.test(env002),
  'Version must be 1.3');

// ============================================================================
// L4-001: STD-META-001 registry updated
// ============================================================================
const meta001 = readFile('STANDARD_ID_SYSTEM.md');
check('L4-001-a', 'STD-META-001 has DESIGN domain in Reserved Domains',
  meta001 && /DESIGN.*Design System/.test(meta001),
  'DESIGN domain must be registered');
check('L4-001-b', 'STD-META-001 has Section 4.12 (Design)',
  meta001 && /### 4\.12\.\s+Design\s+\(DESIGN\)/.test(meta001),
  'Section 4.12 must exist');
check('L4-001-c', 'STD-META-001 registers STD-DESIGN-001 v3.0.0',
  meta001 && /STD-DESIGN-001.*Design System Standard.*3\.0\.0/.test(meta001),
  'STD-DESIGN-001 must be in registry');
check('L4-001-d', 'STD-META-001 STD-FE-001 version is 2.5',
  meta001 && /STD-FE-001.*2\.5/.test(meta001),
  'STD-FE-001 version must be 2.5');
check('L4-001-e', 'STD-META-001 STD-ENV-002 version is 1.3',
  meta001 && /STD-ENV-002.*1\.3/.test(meta001),
  'STD-ENV-002 version must be 1.3');
check('L4-001-f', 'STD-META-001 STD-DOC-003 version is 2.2.0',
  meta001 && /STD-DOC-003.*2\.2\.0/.test(meta001),
  'STD-DOC-003 version must be 2.2.0');
check('L4-001-g', 'STD-META-001 version is 1.2',
  meta001 && /> Version: 1\.2/.test(meta001),
  'STD-META-001 version must be 1.2');

// ============================================================================
// L4-002: Cross-references to STD-DESIGN-001
// ============================================================================
const doc003 = readFile('UNICODE_POLICY.md');
check('L4-002-a', 'STD-DOC-003 cross-references STD-DESIGN-001',
  doc003 && /STD-DESIGN-001/.test(doc003),
  'Cross-reference must exist in STD-DOC-003');
const arch001 = readFile('IMPLEMENTATION_ORDER.md');
check('L4-002-b', 'STD-ARCH-001 cross-references STD-DESIGN-001',
  arch001 && /STD-DESIGN-001/.test(arch001),
  'Cross-reference must exist in STD-ARCH-001');
check('L4-002-c', 'STD-ARCH-001 cross-references ZAI-ARCH-002 (anti-monolith skill)',
  arch001 && /ZAI-ARCH-002/.test(arch001),
  'Anti-monolith skill reference must exist');
check('L4-002-d', 'STD-FE-001 cross-references STD-ENV-002',
  fe001 && /STD-ENV-002/.test(fe001),
  'Cross-reference to STD-ENV-002 must exist');

// ============================================================================
// L4-003: Anti-monolith thresholds in STD-FE-001
// ============================================================================
check('L4-003-a', 'STD-FE-001 has function size limit (50/80)',
  fe001 && /Function \(non-component\).*50.*80/.test(fe001),
  'Function limit row must exist in Section 2.1');
check('L4-003-b', 'STD-FE-001 has 4+ inline sub-sections threshold',
  fe001 && /4\+ inline sub-sections/.test(fe001),
  'Inline sub-sections threshold must exist');
check('L4-003-c', 'STD-FE-001 has Section 2.3 (useEffect dependency threshold)',
  fe001 && /### 2\.3\.\s+useEffect\s+Dependency\s+Threshold/.test(fe001),
  'Section 2.3 must exist');
check('L4-003-d', 'STD-FE-001 references ZAI-ARCH-002 for decomposition procedure',
  fe001 && /Anti-Monolith Skill.*ZAI-ARCH-002.*7-step/.test(fe001),
  'Cross-ref to anti-monolith skill must exist');

// ============================================================================
// L4-004: Uniform severity principle terminology
// ============================================================================
check('L4-004-a', 'STD-DOC-003 contains "uniform severity principle"',
  doc003 && /uniform severity principle/i.test(doc003),
  'Phrase must be present in STD-DOC-003');
check('L4-004-b', 'STD-DOC-003 mentions lint-md.js',
  doc003 && /lint-md\.js/.test(doc003),
  'lint-md.js reference must exist');

// ============================================================================
// L5-001: Skill-to-standard bidirectional consistency
// ============================================================================
// The skill file (relative path — corpus works standalone or as submodule)
const skillPath = path.join(UPLOAD_DIR, 'SKILL.md');
let skill = null;
if (fs.existsSync(skillPath)) {
  skill = fs.readFileSync(skillPath, 'utf-8');
} else {
  // Try alternative locations (only inside the corpus repo, never absolute)
  const altPaths = [
    path.join(REPO_ROOT, 'skills', 'SKILL.md'),
    path.join(REPO_ROOT, 'skills', 'anti-monolith', 'SKILL.md'),
  ];
  for (const p of altPaths) {
    if (fs.existsSync(p)) {
      skill = fs.readFileSync(p, 'utf-8');
      break;
    }
  }
}
check('L5-001-a', 'STD-FE-001 Section 13/14 Cross-References mentions ZAI-ARCH-002',
  fe001 && /ZAI-ARCH-002/.test(fe001),
  'Cross-reference to anti-monolith skill must exist');

// ============================================================================
// L5-002: STD-DESIGN-001 integration completeness
// ============================================================================
const design001 = readFile('DESIGN_SYSTEM_STANDARD.md');
check('L5-002-a', 'STD-DESIGN-001 exists and is v3.0.0',
  design001 && /> Version: 3\.0\.0/.test(design001),
  'STD-DESIGN-001 must be v3.0.0');
check('L5-002-b', 'STD-DESIGN-001 cross-references STD-FE-001',
  design001 && /STD-FE-001/.test(design001),
  'Bidirectional cross-ref must exist');
check('L5-002-c', 'STD-DESIGN-001 cross-references ZAI-ARCH-002',
  design001 && /ZAI-ARCH-002/.test(design001),
  'Anti-monolith skill cross-ref must exist');
check('L5-002-d', 'STD-FE-001 Section 11 delegates to STD-DESIGN-001',
  fe001 && /STD-DESIGN-001/.test(fe001),
  'Delegation must exist');
check('L5-002-e', 'STD-FE-001 Section 12.6 references animation/breakpoint tokens (P12/P13)',
  fe001 && /P12/.test(fe001) && /P13/.test(fe001),
  'AI hooks section must reference design tokens');

// ============================================================================
// Output report
// ============================================================================
console.log('='.repeat(72));
console.log('CASCADE VERIFICATION REPORT');
console.log('='.repeat(72));
console.log('');

for (const c of results.checks) {
  const icon = c.status === 'PASS' ? '[OK]' : '[FAIL]';
  console.log(`${icon} ${c.id}: ${c.description}`);
  if (c.status === 'FAIL') {
    console.log(`       Detail: ${c.detail}`);
  }
}

console.log('');
console.log('-'.repeat(72));
console.log(`TOTAL: ${results.checks.length} checks | PASS: ${results.passed} | FAIL: ${results.failed}`);
console.log('');

if (results.failed === 0) {
  console.log('[OK] ALL CHECKS PASSED — cascade integration complete');
  process.exit(0);
} else {
  console.log(`[FAIL] ${results.failed} check(s) failed — review details above`);
  process.exit(1);
}
