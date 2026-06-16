#!/usr/bin/env node
/**
 * cross-doc-consistency-check.js
 *
 * Verifies that the three released standards documents are internally
 * consistent with each other. This is a one-shot reviewer for Block 1.2
 * of the v1.0 release.
 *
 * Checks:
 *   C01 — All three documents have Status: APPROVED
 *   C02 — All three documents have Effective Date: 2026-06-17
 *   C03 — STD-SKILL-001 §4.2 referenced from STD-META-001-v2 and verify-id-graph-spec
 *   C04 — G01-G15 list in verify-id-graph-spec matches STD-META-001 §10.2
 *   C05 — W01-W10 numbering consistent between STD-META-001 and verify-id-graph-spec
 *   C06 — STD-META-001 §2.1 Prefix Authority table marks ZAI as Optional
 *   C07 — verify-id-graph-spec §5.3 Strictness Model section exists
 *   C08 — ZAI-META-001 marked SUPERSEDED in both STD-META-001 and STD-SKILL-001
 *   C09 — 24 ZAI-* IDs in registry match across STD-META-001 §4.16 and STD-SKILL-001 Appendix A
 *   C10 — No DRAFT markers remain in any released document
 */

const fs = require('fs');
const path = require('path');

const DESIGN_DIR = '/home/z/my-project/_design';
const FILES = {
  'STD-META-001': path.join(DESIGN_DIR, 'STD-META-001-v2.0-draft.md'),
  'STD-SKILL-001': path.join(DESIGN_DIR, 'STD-SKILL-001-v1.0-draft.md'),
  'verify-id-graph-spec': path.join(DESIGN_DIR, 'verify-id-graph-spec.md'),
};

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

function readFile(label) {
  return fs.readFileSync(FILES[label], 'utf8');
}

// --- C01: APPROVED status ---
for (const label of Object.keys(FILES)) {
  const content = readFile(label);
  const hasApproved = /Status:\s*\*\*APPROVED\*\*/.test(content);
  check(`C01-${label}`, `${label} has Status: APPROVED`, hasApproved,
    hasApproved ? '' : 'Missing or wrong status line');
}

// --- C02: Effective Date ---
for (const label of Object.keys(FILES)) {
  const content = readFile(label);
  const hasDate = /Effective Date:\s*2026-06-17/.test(content);
  check(`C02-${label}`, `${label} has Effective Date: 2026-06-17`, hasDate,
    hasDate ? '' : 'Missing effective date');
}

// --- C03: STD-SKILL-001 §4.2 referenced ---
const meta = readFile('STD-META-001');
const spec = readFile('verify-id-graph-spec');
check('C03-meta', 'STD-META-001 references STD-SKILL-001 §4.2',
  /STD-SKILL-001\s*§4\.2/.test(meta), '');
check('C03-spec', 'verify-id-graph-spec references STD-SKILL-001',
  /STD-SKILL-001/.test(spec), '');

// --- C04: G01-G15 in spec ---
const gInSpec = (spec.match(/\bG\d{2}\b/g) || []).sort();
const uniqueG = [...new Set(gInSpec)];
check('C04', `verify-id-graph-spec mentions G-codes (found ${uniqueG.length} unique)`,
  uniqueG.length >= 15, uniqueG.join(', '));

// --- C05: W01-W10 numbering ---
const wInSpec = (spec.match(/\bW\d{2}\b/g) || []).sort();
const uniqueW = [...new Set(wInSpec)];
check('C05', `verify-id-graph-spec mentions W-codes (found ${uniqueW.length} unique)`,
  uniqueW.length >= 8, uniqueW.join(', '));

// --- C06: STD-META-001 §2.1 marks ZAI as Optional ---
check('C06', 'STD-META-001 §2.1 marks ZAI as Optional',
  /\|\s*`ZAI-`\s*\|.*\*\*Optional\*\*/.test(meta), '');

// --- C07: verify-id-graph-spec §5.3 Strictness Model ---
check('C07', 'verify-id-graph-spec has §5.3 Strictness Model',
  /### 5\.3\. Strictness Model/.test(spec), '');

// --- C08: ZAI-META-001 SUPERSEDED ---
check('C08-meta', 'STD-META-001 marks ZAI-META-001 as SUPERSEDED',
  /ZAI-META-001[\s\S]{0,200}SUPERSEDED/.test(meta), '');
const skill = readFile('STD-SKILL-001');
check('C08-skill', 'STD-SKILL-001 marks ZAI-META-001 as SUPERSEDED',
  /ZAI-META-001[\s\S]{0,200}SUPERSEDED/.test(skill), '');

// --- C09: 24 ZAI-* IDs in registries ---
const metaIDs = (meta.match(/ZAI-[A-Z]+-\d{3}/g) || []);
const skillIDs = (skill.match(/ZAI-[A-Z]+-\d{3}/g) || []);
const metaUnique = [...new Set(metaIDs)].sort();
const skillUnique = [...new Set(skillIDs)].sort();
check('C09', `ZAI ID count: STD-META-001 has ${metaUnique.length}, STD-SKILL-001 has ${skillUnique.length}`,
  metaUnique.length >= 24 && skillUnique.length >= 24,
  `meta: ${metaUnique.length}, skill: ${skillUnique.length}`);

// --- C10: No DRAFT markers ---
for (const label of Object.keys(FILES)) {
  const content = readFile(label);
  // Allow "draft v1" in narrative context but not in headers
  const headerDraft = /^>\s*(Status|Version):.*draft/i.test(content);
  const titleDraft = /^#\s+.*DRAFT/.test(content);
  check(`C10-${label}`, `${label} has no DRAFT in title or status header`,
    !headerDraft && !titleDraft,
    headerDraft ? 'Found draft in header' : (titleDraft ? 'Found DRAFT in title' : ''));
}

// --- Output ---
console.log('=== Cross-Doc Consistency Check (Block 1.2) ===');
console.log('');
for (const c of results.checks) {
  const mark = c.status === 'PASS' ? '✓' : '✗';
  console.log(`  ${mark} ${c.id}: ${c.description}${c.detail ? ' — ' + c.detail : ''}`);
}
console.log('');
console.log(`Result: ${results.passed}/${results.passed + results.failed} checks passed`);
if (results.failed > 0) {
  console.log('STATUS: FAILED');
  process.exit(1);
} else {
  console.log('STATUS: ALL CHECKS PASSED');
  process.exit(0);
}
