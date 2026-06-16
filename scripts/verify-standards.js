/**
 * ============================================================================
 * PERMANENT STANDARDS VERIFIER — verify-standards.js
 * ============================================================================
 *
 * PURPOSE
 *   Unlike verify-cascade.js (one-shot check of the 16 cascade tasks), this
 *   script is a PERMANENT invariant checker that lives at:
 *     /home/z/my-project/scripts/verify-standards.js
 *
 *   It is updated whenever ANY standard changes. The contract is:
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

const fs = require('fs');
const path = require('path');

// ---------------------------------------------------------------------------
// Paths — RELATIVE to this script's location so the corpus works:
//   - standalone:     /home/z/my-project/scripts/verify-standards.js
//   - as a submodule: <host-repo>/standards/scripts/verify-standards.js
//   - in CI:          any checkout path GitHub Actions uses
//
// Layout assumption: <repo-root>/upload/ and <repo-root>/scripts/
// ---------------------------------------------------------------------------
const SCRIPT_DIR    = __dirname;
const REPO_ROOT     = path.resolve(SCRIPT_DIR, '..');
const STANDARDS_DIR = path.join(REPO_ROOT, 'upload', 'standards-v2', 'standards');
const UPLOAD_DIR    = path.join(REPO_ROOT, 'upload');

const PATHS = {
  STD_ENV_002:  path.join(STANDARDS_DIR, 'ZAI_INTEGRATION_STANDARD.md'),
  STD_FE_001:   path.join(STANDARDS_DIR, 'FRONTEND_STANDARD.md'),
  STD_META_001: path.join(STANDARDS_DIR, 'STANDARD_ID_SYSTEM.md'),
  STD_DESIGN_001: path.join(STANDARDS_DIR, 'DESIGN_SYSTEM_STANDARD.md'),
  STD_DOC_003:  path.join(STANDARDS_DIR, 'UNICODE_POLICY.md'),
  STD_ARCH_001: path.join(STANDARDS_DIR, 'IMPLEMENTATION_ORDER.md'),
  HOOKS_GUIDE:  path.join(UPLOAD_DIR, 'Hooks-in-Z.ai-Guide.md'),
  SANDBOX_GUIDE: path.join(UPLOAD_DIR, 'Z.ai-Sandbox-Guide.md'),
};

// ---------------------------------------------------------------------------
// Results accumulator
// ---------------------------------------------------------------------------
const results = {
  passed: 0,
  failed: 0,
  checks: [],
};

function check(id, description, condition, detail) {
  const status = condition ? 'PASS' : 'FAIL';
  results.checks.push({ id, description, status, detail: detail || '' });
  if (condition) results.passed++;
  else results.failed++;
}

function readSafe(filePath) {
  if (!fs.existsSync(filePath)) return null;
  return fs.readFileSync(filePath, 'utf-8');
}

/**
 * Extract a numbered section from a markdown file.
 * Returns the section's text including the heading line, up to the next
 * heading of the same or higher level. Skips fenced code blocks so that
 * shell comments like `# Check if dev server is running` inside ```bash
 * blocks are NOT mistaken for markdown headings.
 */
function extractSection(content, sectionNumber) {
  if (!content) return '';
  // Match `## 5. Title` or `### 5.1 Title` etc.
  const pattern = new RegExp(
    `(^|\\n)(#{2,4})\\s*${sectionNumber.replace(/\./g, '\\.')}[^\\n]*\\n`,
    'm'
  );
  const match = content.match(pattern);
  if (!match) return '';
  const startIdx = match.index + match[1].length;
  const headingLevel = match[2].length;
  const afterStart = content.slice(startIdx);
  const lines = afterStart.split('\n');

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
  return lines.slice(0, endLineIdx).join('\n');
}

// ============================================================================
// V01 — STD-ENV-002 §5.1 startup command must NOT be `npx next dev`
//       (sandbox-managed `init-fullstack` is the only allowed startup)
// ============================================================================
(function V01() {
  const env = readSafe(PATHS.STD_ENV_002);
  if (!env) {
    check('V01', 'STD-ENV-002 §5.1 startup uses init-fullstack, not npx next dev',
      false, 'STD-ENV-002 file not found');
    return;
  }
  const section5 = extractSection(env, '5') || '';
  if (!section5) {
    check('V01', 'STD-ENV-002 §5.1 startup uses init-fullstack, not npx next dev',
      false, 'Section 5 not found');
    return;
  }
  // Pull bash code blocks out of section 5
  const bashBlocks = [...section5.matchAll(/```bash\n([\s\S]*?)```/g)]
    .map(m => m[1]);
  const bashText = bashBlocks.join('\n');
  // FORBIDDEN: bash block whose actual command is `npx next dev` (alone or as primary)
  // ALLOWED:   `init-fullstack` in bash block (sandbox-managed startup)
  // ALLOWED:   `npx next dev` in narrative prose (warning "do NOT run")
  const hasInitFullstack = /init-fullstack/.test(bashText);
  const hasManualNpxDev = /^[\s]*npx next dev\b/m.test(bashText);
  check('V01',
    'STD-ENV-002 §5.1 startup uses init-fullstack, not npx next dev',
    hasInitFullstack && !hasManualNpxDev,
    `bash block: init-fullstack=${hasInitFullstack}, manual npx next dev=${hasManualNpxDev}`);
})();

// ============================================================================
// V02 — STD-ENV-002 must NOT use /tmp/zdev.log as the canonical log path
//       (must use /home/z/my-project/.zscripts/dev.log)
// ============================================================================
(function V02() {
  const env = readSafe(PATHS.STD_ENV_002);
  if (!env) {
    check('V02', 'STD-ENV-002 uses .zscripts/dev.log, not /tmp/zdev.log',
      false, 'STD-ENV-002 file not found');
    return;
  }
  // Allowed: /tmp/zdev.log appears only in version history / "deprecated" warnings
  // Forbidden: appears as the actual log path in §5.1 or §3 rules
  const section3 = extractSection(env, '3') || '';
  const section5 = extractSection(env, '5') || '';
  const rulesText = section3 + '\n' + section5;
  const hasForbiddenPath = /\/tmp\/zdev\.log/.test(rulesText);
  const hasCorrectPath    = /\.zscripts\/dev\.log/.test(rulesText);
  check('V02',
    'STD-ENV-002 §3+§5 use .zscripts/dev.log, not /tmp/zdev.log',
    !hasForbiddenPath && hasCorrectPath,
    `§3+§5: /tmp/zdev.log present=${hasForbiddenPath}, .zscripts/dev.log present=${hasCorrectPath}`);
})();

// ============================================================================
// V03 — Hooks Guide API routes must use Zod safeParse (STD-FE-001 §10.3)
// ============================================================================
(function V03() {
  const hooks = readSafe(PATHS.HOOKS_GUIDE);
  if (!hooks) {
    check('V03', 'Hooks Guide API routes use Zod safeParse',
      false, 'Hooks Guide file not found');
    return;
  }
  const hasZod       = /\bz\.object\b/.test(hooks);
  const hasSafeParse = /safeParse/.test(hooks);
  check('V03',
    'Hooks Guide API routes use Zod safeParse',
    hasZod && hasSafeParse,
    `z.object=${hasZod}, safeParse=${hasSafeParse}`);
})();

// ============================================================================
// V04 — All .md standards + guides: no emoji/Unicode graphic chars (STD-DOC-003)
// ============================================================================
(function V04() {
  const targets = [
    ...fs.readdirSync(STANDARDS_DIR)
      .filter(f => f.endsWith('.md'))
      .map(f => path.join(STANDARDS_DIR, f)),
    PATHS.HOOKS_GUIDE,
    PATHS.SANDBOX_GUIDE,
  ].filter(Boolean);

  // STD-DOC-003 forbidden range: pictographs, dingbats, arrows, geometric shapes
  const forbidden = /[\u{1F300}-\u{1F9FF}\u{2702}\u{2714}\u{2716}\u{274C}\u{274E}\u{2753}\u{2757}\u{2795}-\u{2797}\u{2B05}-\u{2B07}\u{2B1B}\u{2B1C}\u{2B50}\u{2B55}]/u;

  const offenders = [];
  for (const file of targets) {
    const content = readSafe(file) || '';
    if (forbidden.test(content)) {
      const matches = content.match(new RegExp(forbidden.source, 'u')) || [];
      offenders.push(`${path.basename(file)} (${matches.length} match(es))`);
    }
  }
  check('V04',
    `No emoji/Unicode graphic chars in ${targets.length} .md files (STD-DOC-003)`,
    offenders.length === 0,
    offenders.length === 0
      ? 'all clean'
      : `offenders: ${offenders.join('; ')}`);
})();

// ============================================================================
// V05 — STD-META-001 registry must include STD-DESIGN-001 and STD-FE-001 v2.5+
// ============================================================================
(function V05() {
  const meta = readSafe(PATHS.STD_META_001);
  if (!meta) {
    check('V05', 'STD-META-001 registry includes STD-DESIGN-001 and STD-FE-001 v2.5+',
      false, 'STD-META-001 file not found');
    return;
  }
  const hasDesign    = /STD-DESIGN-001/.test(meta);
  const hasFE25      = /STD-FE-001[^\n]*2\.(5|[6-9]|\d{2,})/.test(meta);
  check('V05',
    'STD-META-001 registry includes STD-DESIGN-001 and STD-FE-001 v2.5+',
    hasDesign && hasFE25,
    `STD-DESIGN-001=${hasDesign}, STD-FE-001 v2.5+=${hasFE25}`);
})();

// ============================================================================
// V06 — STD-FE-001 §11/§12 delegate to STD-DESIGN-001 (no hardcoded color tokens)
// ============================================================================
(function V06() {
  const fe = readSafe(PATHS.STD_FE_001);
  if (!fe) {
    check('V06', 'STD-FE-001 §11/§12 delegate to STD-DESIGN-001',
      false, 'STD-FE-001 file not found');
    return;
  }
  const section11 = extractSection(fe, '11') || '';
  const section12 = extractSection(fe, '12') || '';
  const combined  = section11 + '\n' + section12;
  const hasDelegation = /STD-DESIGN-001/.test(combined);
  // Forbidden: hardcoded hex colors as design tokens (allowed in code samples / examples)
  const hasHardcodedHex = /(?:background|color|border):\s*#[0-9a-fA-F]{3,8}\b/.test(combined);
  check('V06',
    'STD-FE-001 §11/§12 delegate to STD-DESIGN-001 (no hardcoded hex tokens)',
    hasDelegation && !hasHardcodedHex,
    `STD-DESIGN-001 ref=${hasDelegation}, hardcoded hex=${hasHardcodedHex}`);
})();

// ============================================================================
// V07 — STD-FE-001 §2.1/§2.3 anti-monolith thresholds present
//       (Function 50/80, useEffect 3+/4+, 4+ inline sub-sections)
// ============================================================================
(function V07() {
  const fe = readSafe(PATHS.STD_FE_001);
  if (!fe) {
    check('V07', 'STD-FE-001 §2.1/§2.3 anti-monolith thresholds present',
      false, 'STD-FE-001 file not found');
    return;
  }
  const section2 = extractSection(fe, '2') || '';
  // Function threshold: a single line containing "Function" + "50" + "80" + "lines"
  const hasFunction5080 = /Function[^\n]*50[^\n]*80[^\n]*lines/i.test(section2);
  // useEffect 3+: either "useEffect ... 3+ deps/dependencies" or table row "| 3 | ... |" near useEffect
  const hasUseEffect3plus = /useEffect[^\n]*3\+/i.test(section2)
    || (/useEffect/i.test(section2) && /\|\s*3\s*\|[^|]*\[/i.test(section2));
  // useEffect 4+: either "useEffect ... 4+ deps" or table row "| 4+ | ... ["
  const hasUseEffect4plus = /useEffect[^\n]*4\+/i.test(section2)
    || (/\|\s*4\+\s*\|[^|]*\[W\]/i.test(section2));
  // 4+ inline sub-sections: must mention "inline" or "sub-sections" with "4+"
  const hasInline4plus = /4\+\s+inline/i.test(section2)
    || /inline[^\n]*4\+/i.test(section2)
    || /sub-?sections?[^\n]*4\+/i.test(section2);
  const ok = hasFunction5080 && hasUseEffect3plus && hasUseEffect4plus && hasInline4plus;
  check('V07',
    'STD-FE-001 §2 anti-monolith thresholds present (50/80, 3+, 4+, inline 4+)',
    ok,
    `50/80=${hasFunction5080}, useEffect 3+=${hasUseEffect3plus}, useEffect 4+=${hasUseEffect4plus}, inline 4+=${hasInline4plus}`);
})();

// ============================================================================
// V08 — Every 3-backtick code fence opening MUST have a language tag
//       (STD-DOC-002 §4.3 + §5.4 "Unknown Languages Rule")
//
// CommonMark fence rules:
//   - A fence is a line starting with >= 3 backticks.
//   - A fence of N backticks is closed by a line with >= N backticks.
//   - Inside a fence of N backticks, lines with < N backticks are CONTENT,
//     not fence openings (so a ``` inside a ```` is just text).
//
// Violation = opening fence with EXACTLY 3 backticks and no language tag.
// 4+ backtick fences (containers for nested examples) are NOT violations.
// ============================================================================
(function V08() {
  const targets = [
    ...fs.readdirSync(STANDARDS_DIR)
      .filter(f => f.endsWith('.md'))
      .map(f => path.join(STANDARDS_DIR, f)),
    PATHS.HOOKS_GUIDE,
    PATHS.SANDBOX_GUIDE,
  ].filter(Boolean);

  const FENCE_RE = /^(`{3,})(.*?)\s*$/;
  const offenders = [];

  for (const file of targets) {
    const content = readSafe(file) || '';
    const lines = content.split('\n');
    let currentBackticks = 0;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const m = line.match(FENCE_RE);
      if (!m) continue;
      const count = m[1].length;
      const rest = m[2];

      if (currentBackticks === 0) {
        // Opening fence
        if (count === 3 && rest.trim() === '') {
          offenders.push(`${path.basename(file)}:L${i + 1}`);
        }
        currentBackticks = count;
      } else {
        // Inside a fence. Is this a closing fence?
        // Closing fence: count >= currentBackticks AND rest is empty/whitespace
        if (count >= currentBackticks && rest.trim() === '') {
          currentBackticks = 0;
        }
        // else: content line, skip
      }
    }
  }

  check('V08',
    `All 3-backtick code fences have a language tag (STD-DOC-002 §4.3) — scanned ${targets.length} files`,
    offenders.length === 0,
    offenders.length === 0
      ? 'all fences specify a language'
      : `${offenders.length} plain fence(s): ${offenders.slice(0, 8).join(', ')}${offenders.length > 8 ? ` +${offenders.length - 8} more` : ''}`);
})();

// ============================================================================
// V09 — All .md files in upload/ (standards + guides) are English-only
//       (agent-friendly: unified language for RAG, search, prompts, CI)
//
// Threshold: Cyrillic characters must be < 2% of all letters in each file.
// 2% tolerates incidental occurrences (e.g. proper names, citations) while
// catching any real translation backsliding. Latin-only code blocks do NOT
// count toward either side.
// ============================================================================
(function V09() {
  const targets = [
    ...fs.readdirSync(STANDARDS_DIR)
      .filter(f => f.endsWith('.md'))
      .map(f => path.join(STANDARDS_DIR, f)),
    PATHS.HOOKS_GUIDE,
    PATHS.SANDBOX_GUIDE,
    path.join(UPLOAD_DIR, 'SKILL.md'),
    path.join(UPLOAD_DIR, 'MARKDOWN_STANDARD.md'),
    path.join(UPLOAD_DIR, 'UNICODE_POLICY.md'),
  ].filter(Boolean);

  const THRESHOLD_PCT = 2.0; // percent
  const offenders = [];

  for (const file of targets) {
    const content = readSafe(file) || '';
    // Strip fenced code blocks so that code samples do not skew the ratio
    const stripped = content.replace(/```[\s\S]*?```/g, '');
    const cyrCount = (stripped.match(/[\u0400-\u04FF]/g) || []).length;
    const latCount = (stripped.match(/[A-Za-z]/g) || []).length;
    const total = cyrCount + latCount;
    if (total === 0) continue;
    const cyrPct = (cyrCount / total) * 100;
    if (cyrPct >= THRESHOLD_PCT) {
      offenders.push(`${path.basename(file)} (${cyrPct.toFixed(1)}% cyr)`);
    }
  }

  check('V09',
    `All ${targets.length} .md files in upload/ are English-only (< ${THRESHOLD_PCT}% Cyrillic)`,
    offenders.length === 0,
    offenders.length === 0
      ? 'all files English-only'
      : `${offenders.length} file(s) over threshold: ${offenders.join(', ')}`);
})();

// ============================================================================
// V10 - STD-DOC-004 (README_TEMPLATE.md) mandates badges for public repos
//
// Three sub-checks:
//   (a) §1 mandatory-sections table marks Badges as "Yes" (not "Optional")
//   (b) §2 template block contains >= 3 shields.io badge URLs
//   (c) §3 checklist contains a badge verification item
//
// Together these guarantee that any agent using STD-DOC-004 to scaffold a
// README will produce a GitHub-ready file with badges from day one.
// ============================================================================
(function V10() {
  const readme = readSafe(path.join(STANDARDS_DIR, 'README_TEMPLATE.md'));
  if (!readme) {
    check('V10',
      'STD-DOC-004 v2.2+ mandates badges for public repos (§1 + §2 + §3)',
      false, 'README_TEMPLATE.md file not found');
    return;
  }

  // (a) §1 marks Badges as Required (not Optional)
  // Look at the §1 table row for "Badges" — must NOT contain "Optional"
  // and MUST contain "Yes".
  const section1 = extractSection(readme, '1') || '';
  const badgeRow = section1.split('\n').find(l => /\|\s*2\s*\|\s*Badges\s*\|/i.test(l)) || '';
  const hasYesPublic    = /Yes/i.test(badgeRow);
  const isNotOptional   = !/Optional/i.test(badgeRow);

  // (b) §2 template has >= 3 shields.io badge URLs
  // We slice the file from `## 2. Template` to the next `## N.` heading
  // (using a line-anchored regex) and extract the 4-backtick markdown block.
  // We do NOT use extractSection() here because that function's fence
  // tracking is boolean (not depth-aware) and mis-handles nested fences
  // (the ```bash block inside the ````markdown template would prematurely
  // toggle the "outside fence" state).
  const startIdx2 = readme.search(/^## 2\.\s/m);
  const endIdx2   = readme.search(/^## 3\.\s/m);
  let section2 = '';
  if (startIdx2 !== -1 && endIdx2 !== -1 && endIdx2 > startIdx2) {
    section2 = readme.slice(startIdx2, endIdx2);
  }
  // Extract the fenced markdown template (4-backtick fence)
  const templateBlock = (section2.match(/````markdown\n([\s\S]*?)\n````/) || [])[1] || '';
  const badgeUrls = (templateBlock.match(/!\[[^\]]*\]\(https:\/\/img\.shields\.io\/[^)]+\)/g) || []);
  const has3Badges = badgeUrls.length >= 3;

  // (c) §3 checklist has a badge verification item
  const section3 = extractSection(readme, '3') || '';
  const checklistHasBadges = /badge/i.test(section3) && /public\s*repos/i.test(section3);

  check('V10',
    'STD-DOC-004 v2.2+ mandates badges for public repos (§1 Yes + §2 ≥3 badges + §3 checklist)',
    hasYesPublic && isNotOptional && has3Badges && checklistHasBadges,
    `§1 Badges=Yes=${hasYesPublic}, not-Optional=${isNotOptional}; §2 shields.io badges=${badgeUrls.length} (≥3=${has3Badges}); §3 checklist badge item=${checklistHasBadges}`);
})();

// ============================================================================
// Output
// ============================================================================
function printHuman() {
  const width = Math.max(...results.checks.map(c => c.id.length));
  console.log('PERMANENT STANDARDS VERIFIER — verify-standards.js');
  console.log('='.repeat(72));
  console.log('');
  for (const c of results.checks) {
    const icon = c.status === 'PASS' ? '[PASS]' : '[FAIL]';
    console.log(`${icon} ${c.id.padEnd(width)}  ${c.description}`);
    if (c.detail) console.log(`         ${c.detail}`);
  }
  console.log('');
  console.log('-'.repeat(72));
  console.log(`Total: ${results.checks.length}  |  PASS: ${results.passed}  |  FAIL: ${results.failed}`);
  console.log('');
  if (results.failed > 0) {
    console.log('ACTION REQUIRED:');
    console.log('  At least one invariant was violated. Either:');
    console.log('    (a) Revert the standard change that broke the invariant, OR');
    console.log('    (b) Update the V## check in scripts/verify-standards.js to reflect');
    console.log('        an intentional change to the invariant.');
    console.log('  Then re-run: node scripts/verify-standards.js');
  } else {
    console.log('All invariants hold. Standards are consistent with the cascade plan.');
  }
}

function printJSON() {
  console.log(JSON.stringify({
    script: 'verify-standards.js',
    generated: new Date().toISOString(),
    passed: results.passed,
    failed: results.failed,
    total: results.checks.length,
    checks: results.checks,
  }, null, 2));
}

const mode = process.argv[2] || '';
if (mode === '--json') printJSON();
else printHuman();

process.exit(results.failed > 0 ? 1 : 0);
