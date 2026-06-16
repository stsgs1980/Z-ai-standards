/**
 * ============================================================================
 * CASCADE TASK PLAN — Standards Integration & Verification v2.0
 * ============================================================================
 *
 * Based on: Re-extracted standards.zip (2026-06-16)
 * Key findings:
 *   - STD-DESIGN-001 v3.0.0 NOW EXISTS (was missing before)
 *   - STD-FE-001 updated from v1.5 to v2.3 (many L5 tasks already resolved)
 *   - STD-DOC-003 unchanged at v2.2
 *   - STD-ENV-002 unchanged at v1.1 (L1 fixes still needed)
 *   - STD-META-001 not yet updated with STD-DESIGN-001
 *
 * RESOLVED by new standards (removed from cascade):
 *   - L5-001: useState conflict — RESOLVED (v2.3: limit is now 2)
 *   - L5-002: New thresholds — PARTIALLY RESOLVED (ceilings added, but
 *     function limit, useEffect deps, inline sub-sections still absent)
 *   - L5-003: Skill reference in STD-ARCH-001 — STILL NEEDED
 *   - Design System delegation from STD-FE-001 — RESOLVED (Section 11)
 *
 * NEW tasks added:
 *   - STD-DESIGN-001 registry in STD-META-001
 *   - STD-DESIGN-001 cross-refs in other standards
 *   - Remaining L5 thresholds not yet in STD-FE-001
 *   - L1-004: Permanent verification script (scripts/verify-standards.js)
 *     to be updated whenever any standard changes
 *
 * ============================================================================
 */

const tasks = {

  // =========================================================================
  // LEVEL 1 — CRITICAL FIXES (still needed, unchanged in new zip)
  // =========================================================================

  "L1-001": {
    id: "L1-001",
    level: 1,
    title: "Fix STD-ENV-002 Section 5: Dev Server Protocol",
    description:
      "STD-ENV-002 v1.1 still instructs `npx next dev` manually, " +
      "which BREAKS Preview Panel. New zip did NOT update this file.",
    document: "STD-ENV-002",
    section: "5.1, 5.2",
    priority: "CRITICAL",
    status: "pending",

    actions: [
      "Replace Section 5.1 startup command with: `curl https://z-cdn.chatglm.cn/fullstack/init-fullstack_1775040338514.sh | bash`",
      "Replace Section 5.2 rules: add `NEVER run dev server manually — sandbox manages it via .zscripts/dev.sh`",
      "Add rule: `Always check logs via cat /home/z/my-project/.zscripts/dev.log | tail -30`",
      "Add rule: `Always use 127.0.0.1:3000 for health checks`",
    ],

    dependencies: [],

    verification: [
      { check: "Section 5 does NOT contain 'npx next dev'", type: "content_absent", target: "STD-ENV-002", pattern: /npx next dev/ },
      { check: "Section 5 contains '.zscripts/dev.sh' or 'init-fullstack'", type: "content_present", target: "STD-ENV-002", pattern: /\.zscripts\/dev\.sh|init-fullstack/ },
    ],

    rollback: "Revert Section 5 to v1.1 original",
  },

  "L1-002": {
    id: "L1-002",
    level: 1,
    title: "Fix STD-ENV-002: Dev log path",
    description:
      "STD-ENV-002 references /tmp/zdev.log. Real sandbox uses " +
      "/home/z/my-project/.zscripts/dev.log. New zip did NOT update this.",
    document: "STD-ENV-002",
    section: "5.1, 3",
    priority: "CRITICAL",
    status: "pending",

    actions: [
      "Replace all /tmp/zdev.log with /home/z/my-project/.zscripts/dev.log",
      "Add .zscripts/ entries to Section 3.1 Absolute Path Exception table",
    ],

    dependencies: [],

    verification: [
      { check: "No /tmp/zdev.log references", type: "content_absent", target: "STD-ENV-002", pattern: /\/tmp\/zdev\.log/ },
      { check: "References .zscripts/dev.log", type: "content_present", target: "STD-ENV-002", pattern: /\.zscripts\/dev\.log/ },
    ],

    rollback: "Revert path changes",
  },

  "L1-003": {
    id: "L1-003",
    level: 1,
    title: "Add Zod validation to Hooks Guide API Routes",
    description:
      "STD-FE-001 v2.3 Section 10.3 still mandates Zod. " +
      "Hooks Guide API routes lack Zod validation.",
    document: "Hooks Guide",
    section: "API Routes",
    priority: "CRITICAL",
    status: "pending",

    actions: [
      "Add Zod schema for /api/ai/chat: prompt (string, required, max 4000), history, systemPrompt, temperature, maxTokens",
      "Add Zod schema for /api/ai/image: prompt, size (enum)",
      "Return STD-FE-001 compliant error: { success: false, error: { code, message } }",
    ],

    dependencies: [],

    verification: [
      { check: "API route uses Zod safeParse", type: "content_present", target: "hooks-guide", pattern: /safeParse|z\.object/ },
      { check: "Error response follows { success: false, error: { code, message } }", type: "content_present", target: "hooks-guide", pattern: /success:\s*false.*error.*code/i },
    ],

    rollback: "Remove Zod schemas, restore raw body parsing",
  },

  "L1-004": {
    id: "L1-004",
    level: 1,
    title: "Create permanent verify-standards.js — invariants for future changes",
    description:
      "The cascade verification (verify-cascade.js) is a one-shot script tied to the 16 cascade tasks. " +
      "Future standard changes need a PERMANENT invariant checker that lives at scripts/verify-standards.js " +
      "and is updated whenever ANY standard is modified. Each .md standard must declare `verified_by` " +
      "pointing to a specific check function, so changing a standard mechanically requires updating the verifier.",
    document: "scripts/verify-standards.js + all standards (verified_by headers)",
    section: "All",
    priority: "CRITICAL",
    status: "pending",

    actions: [
      "Create /home/z/my-project/scripts/verify-standards.js with 7 invariant checks:",
      "  V01 — STD-ENV-002 §5: no 'npx next dev' as startup command (sandbox manages dev server)",
      "  V02 — STD-ENV-002: no '/tmp/zdev.log' references (use .zscripts/dev.log)",
      "  V03 — Hooks Guide API routes: Zod safeParse present",
      "  V04 — All .md files in standards/: no emoji/Unicode graphic chars (STD-DOC-003)",
      "  V05 — STD-META-001 registry: STD-DESIGN-001, STD-FE-001 v2.5+ registered",
      "  V06 — STD-FE-001 §11/§12: delegates to STD-DESIGN-001 (no hardcoded color tokens)",
      "  V07 — STD-FE-001 §2.1/§2.3: function 50/80, useEffect 3+/4+ thresholds present",
      "Add `verified_by` field to each standard's header pointing to the relevant check ID(s)",
      "Wire verify-standards.js into cascade-tasks.js --verify mode (alongside verify-cascade.js)",
      "Document the rule: 'Whenever a .md standard changes, the corresponding V## check MUST be reviewed'"
    ],

    dependencies: ["L1-001", "L1-002", "L1-003"],

    verification: [
      { check: "scripts/verify-standards.js exists", type: "file_exists", target: "scripts/verify-standards.js" },
      { check: "verify-standards.js exits 0 when run", type: "command_exit_zero", target: "node scripts/verify-standards.js" },
      { check: "All 7 V## checks are defined", type: "content_present", target: "scripts/verify-standards.js", pattern: /V07/ },
      { check: "At least one .md standard declares verified_by", type: "content_present_glob", target: "standards/*.md", pattern: /verified_by:/i }
    ],

    rollback: "Delete scripts/verify-standards.js and remove verified_by headers",
  },

  // =========================================================================
  // LEVEL 2 — UNICODE COMPLIANCE (unchanged)
  // =========================================================================

  "L2-001": {
    id: "L2-001",
    level: 2,
    title: "Clean Hooks Guide from Unicode violations (STD-DOC-003)",
    description:
      "Hooks Guide contains emoji/Unicode that violate STD-DOC-003 [C].",
    document: "Hooks Guide",
    section: "All",
    priority: "HIGH",
    status: "pending",

    actions: [
      "Replace all Unicode graphic chars with text markers: [OK], [FAIL], [PASS], [FORBIDDEN]",
      "Add (ref) marker if character must appear as object of description",
    ],

    dependencies: ["L1-001", "L1-002", "L1-003"],

    verification: [
      { check: "No emoji in Hooks Guide", type: "regex_absent", target: "hooks-guide", pattern: /[\u{1F300}-\u{1F9FF}\u{2702}\u{2714}\u{2716}\u{274C}\u{274E}\u{2753}\u{2757}\u{2795}-\u{2797}\u{2B05}-\u{2B07}\u{2B1B}\u{2B1C}\u{2B50}\u{2B55}]/u },
    ],

    rollback: "Restore original from git",
  },

  "L2-002": {
    id: "L2-002",
    level: 2,
    title: "Clean Sandbox Guide from Unicode violations (STD-DOC-003)",
    description: "Sandbox Guide contains Unicode graphics that violate STD-DOC-003 [C].",
    document: "Sandbox Guide",
    section: "All",
    priority: "HIGH",
    status: "pending",

    actions: ["Replace all Unicode graphic chars with text equivalents"],

    dependencies: ["L1-001", "L1-002", "L1-003"],

    verification: [
      { check: "No Unicode graphics in Sandbox Guide", type: "regex_absent", target: "sandbox-guide", pattern: /[\u{1F300}-\u{1F9FF}\u{2702}\u{2714}\u{2716}\u{274C}\u{274E}\u{2753}\u{2757}\u{2795}-\u{2797}\u{2B05}-\u{2B07}\u{2B1B}\u{2B1C}\u{2B50}\u{2B55}]/u },
    ],

    rollback: "Restore from git",
  },

  // =========================================================================
  // LEVEL 3 — CONTENT INTEGRATION
  // =========================================================================

  "L3-001": {
    id: "L3-001",
    level: 3,
    title: "Add AI Hook Patterns section to STD-FE-001 v2.3",
    description:
      "STD-FE-001 v2.3 does NOT have Section 14 yet. " +
      "Need to add AI Hook Patterns (useAI, useChat, useImage) as normative examples.",
    document: "STD-FE-001",
    section: "New Section 14",
    priority: "HIGH",
    status: "pending",

    actions: [
      "Add Section 14: AI Hook Patterns",
      "14.1: useAI — single-turn text generation (reference from Hooks Guide, Zod-validated)",
      "14.2: useChat — multi-turn conversation",
      "14.3: useImage — image generation hook",
      "14.4: Hook composition rules — follow Layer Separation (Section 3.3)",
      "14.5: Error handling — use ApplicationError (STD-ERR-001)",
      "14.6: Token integration — hooks may import from tokens/ layer only (Section 11.2)",
      "Add cross-refs: STD-ENV-002 Section 9, STD-ERR-001 Section 5.2",
      "Update Version History to v2.4",
      "Update Cross-References",
    ],

    dependencies: ["L1-003", "L2-001"],

    verification: [
      { check: "STD-FE-001 contains Section 14 AI Hook Patterns", type: "content_present", target: "STD-FE-001", pattern: /14\..*AI\s+Hook\s+Patterns/i },
      { check: "Section 14 references useAI, useChat, useImage", type: "content_present", target: "STD-FE-001", pattern: /useAI|useChat|useImage/ },
    ],

    rollback: "Remove Section 14",
  },

  "L3-002": {
    id: "L3-002",
    level: 3,
    title: "Add Sandbox Troubleshooting section to STD-ENV-002",
    description: "STD-ENV-002 still lacks diagnostic table. New zip did NOT update this file.",
    document: "STD-ENV-002",
    section: "New Section 12",
    priority: "HIGH",
    status: "pending",

    actions: [
      "Add Section 12: Sandbox Troubleshooting (diagnostic table from Sandbox Guide)",
      "Add Section 12.1: Recovery procedures",
      "Add Section 12.2: Health check codes (200/000/500)",
      "Update Version History",
    ],

    dependencies: ["L1-001", "L1-002", "L2-002"],

    verification: [
      { check: "STD-ENV-002 has Section 12 Troubleshooting", type: "content_present", target: "STD-ENV-002", pattern: /12\..*(Sandbox\s+)?Troubleshooting/i },
    ],

    rollback: "Remove Section 12",
  },

  "L3-003": {
    id: "L3-003",
    level: 3,
    title: "Add Submodule Workflow section to STD-ENV-002",
    description: "Submodule workflow still not in any standard.",
    document: "STD-ENV-002",
    section: "New Section 13",
    priority: "MEDIUM",
    status: "pending",

    actions: [
      "Add Section 13: Git Submodule Integration in Sandbox",
      "13.1: Adding (clone to /tmp, rsync to root, reinit)",
      "13.2: Updating submodule",
      "13.3: Rollback",
      "13.4: Prohibited patterns (clone directly into project subdirectory)",
      "Cross-ref STD-GIT-002",
    ],

    dependencies: ["L1-001", "L2-002"],

    verification: [
      { check: "STD-ENV-002 has Section 13 Submodule", type: "content_present", target: "STD-ENV-002", pattern: /13\..*(Git\s+)?Submodule/i },
    ],

    rollback: "Remove Section 13",
  },

  "L3-004": {
    id: "L3-004",
    level: 3,
    title: "Update STD-ENV-002 Section 9: SDK Integration with hook pattern",
    description: "Add canonical useAI hook example showing client → API route → SDK flow.",
    document: "STD-ENV-002",
    section: "9",
    priority: "MEDIUM",
    status: "pending",

    actions: [
      "Add subsection: Canonical Client-Side Pattern — useAI hook example",
      "Show: hook → fetch('/api/ai/chat') → API Route → SDK → chat.z.ai",
      "Emphasize: hook NEVER imports SDK directly",
      "Add error handling example using ApplicationError (STD-ERR-001)",
    ],

    dependencies: ["L1-003", "L2-001"],

    verification: [
      { check: "Section 9 contains useAI or canonical client pattern", type: "content_present", target: "STD-ENV-002", pattern: /useAI|canonical.*client.*pattern/i },
    ],

    rollback: "Remove added subsection",
  },

  // =========================================================================
  // LEVEL 4 — REGISTRY & CROSS-REFERENCES
  // =========================================================================

  "L4-001": {
    id: "L4-001",
    level: 4,
    title: "Register STD-DESIGN-001 in STD-META-001 and update registry",
    description:
      "STD-DESIGN-001 v3.0.0 exists but is NOT in STD-META-001 registry. " +
      "Also need to update STD-FE-001 version (now v2.3) and add new domain DESIGN.",
    document: "STD-META-001",
    section: "4 (ID Registry), 3 (Reserved Domains)",
    priority: "HIGH",
    status: "pending",

    actions: [
      "Add domain DESIGN to Reserved Domains table (Section 3): `DESIGN | Design System | Token system, typography, color, spacing, card archetypes`",
      "Add Section 4.12: Design (DESIGN) with STD-DESIGN-001 v3.0.0 [C]+[W] ACTIVE",
      "Update Section 4.1: STD-FE-001 version from 1.5 to 2.3",
      "Update Section 4.4: STD-DOC-003 version from 2.1.3 to 2.2.0",
      "Decide on new entries: STD-FE-002 (AI Hooks) or keep in STD-FE-001 Section 14",
      "Decide on new entries: STD-ENV-003 (Sandbox Ops) or keep in STD-ENV-002 Sections 12-13",
    ],

    dependencies: ["L3-001", "L3-002", "L3-003", "L3-004"],

    verification: [
      { check: "STD-META-001 has DESIGN domain", type: "content_present", target: "STD-META-001", pattern: /DESIGN.*Design System|STD-DESIGN-001/ },
      { check: "STD-FE-001 version is 2.3 in registry", type: "content_present", target: "STD-META-001", pattern: /STD-FE-001.*2\.3/ },
    ],

    rollback: "Remove registry entries",
  },

  "L4-002": {
    id: "L4-002",
    level: 4,
    title: "Add cross-references to STD-DESIGN-001 in affected standards",
    description:
      "STD-DESIGN-001 is new but several standards mention 'design system' or " +
      "'design tokens' without referencing it. Need bidirectional cross-refs.",
    document: "Multiple",
    section: "Cross-References",
    priority: "MEDIUM",
    status: "pending",

    actions: [
      "STD-DOC-003: Add STD-DESIGN-001 to Cross-References (Section 16) — 'design system icon/token rules'",
      "STD-ARCH-001: Add STD-DESIGN-001 to Cross-References (Section 7) — 'design token setup at Step 3'",
      "STD-ARCH-001: Add anti-monolith skill (ZAI-ARCH-002) reference in Path B",
      "Verify STD-FE-001 already has STD-DESIGN-001 cross-ref (it does, Section 13)",
    ],

    dependencies: ["L4-001"],

    verification: [
      { check: "STD-DOC-003 cross-refs STD-DESIGN-001", type: "content_present", target: "STD-DOC-003", pattern: /STD-DESIGN-001/ },
      { check: "STD-ARCH-001 cross-refs STD-DESIGN-001", type: "content_present", target: "STD-ARCH-001", pattern: /STD-DESIGN-001/ },
    ],

    rollback: "Remove added cross-refs",
  },

  "L4-003": {
    id: "L4-003",
    level: 4,
    title: "Add remaining anti-monolith thresholds to STD-FE-001",
    description:
      "STD-FE-001 v2.3 resolved useState conflict (now 2) and added exception ceilings, " +
      "BUT three thresholds from the anti-monolith skill are still absent: " +
      "(1) function > 50 lines [I], (2) useEffect 3+ deps [I], (3) 4+ inline sub-sections [W].",
    document: "STD-FE-001",
    section: "2.1, 2.2",
    priority: "MEDIUM",
    status: "pending",

    actions: [
      "Add to Section 2.1: Function (non-component) — Recommended 50, Hard 80 lines",
      "Add to Section 2.2: useEffect with 3+ dependencies — [I] Info (review for refactor)",
      "Add to Section 2.1: Component renders 4+ sub-sections inline — [W] Warning (decompose)",
      "Add cross-ref: 'For decomposition procedure, see anti-monolith skill (ZAI-ARCH-002)'",
      "Update Version History to v2.4 (or v2.3.1 if minor)",
    ],

    dependencies: ["L3-001"],

    verification: [
      { check: "Section 2.1 has function size limit", type: "content_present", target: "STD-FE-001", pattern: /function.*50.*80/i },
      { check: "useEffect dependency threshold exists", type: "content_present", target: "STD-FE-001", pattern: /useEffect.*3\+.*dep/i },
    ],

    rollback: "Remove added thresholds",
  },

  "L4-004": {
    id: "L4-004",
    level: 4,
    title: "Unify terminology: 'uniform severity principle' across STD-DOC-002/003",
    description: "Terminology gap between STD-DOC-002 and STD-DOC-003 still exists.",
    document: "STD-DOC-002, STD-DOC-003",
    section: "Various",
    priority: "LOW",
    status: "pending",

    actions: [
      "Standardize 'uniform severity principle' in both documents",
      "Add lint-md.js reference to STD-DOC-003 Tools section",
      "Add husky/lint-staged pipeline reference or cross-ref in STD-DOC-003",
    ],

    dependencies: ["L3-001", "L3-002"],

    verification: [
      { check: "Both docs use identical term", type: "content_present", target: "STD-DOC-003", pattern: /uniform severity principle/i },
      { check: "STD-DOC-003 mentions lint-md.js", type: "content_present", target: "STD-DOC-003", pattern: /lint-md\.js/ },
    ],

    rollback: "Revert terminology",
  },

  // =========================================================================
  // LEVEL 5 — FINAL VERIFICATION
  // =========================================================================

  "L5-001": {
    id: "L5-001",
    level: 5,
    title: "Verify skill-to-standard bidirectional consistency",
    description:
      "After all changes, verify that anti-monolith skill (ZAI-ARCH-002) " +
      "auto-activation conditions match STD-FE-001 v2.3 thresholds, " +
      "and both reference each other correctly.",
    document: "SKILL.md + STD-FE-001",
    section: "Cross-validation",
    priority: "HIGH",
    status: "pending",

    actions: [
      "Create threshold comparison matrix: skill vs STD-FE-001 v2.3",
      "Verify: useState 2 = match (skill: 3+ → hook, STD-FE-001: 3 → hook)",
      "Verify: file 250 lines = match",
      "Verify: component 200 lines = match",
      "Verify: upward imports = match",
      "Verify: skill references STD-FE-001 with correct version (2.3)",
      "Verify: STD-FE-001 Section 13 references ZAI-ARCH-002",
      "Flag any orphan rules (skill-only without standard backing)",
    ],

    dependencies: ["L4-003"],

    verification: [
      { check: "Every auto-activation condition has matching STD-FE-001 rule", type: "manual", description: "Cross-check 8 conditions" },
      { check: "Skill Related Standards references STD-FE-001", type: "content_present", target: "SKILL.md", pattern: /STD-FE-001/ },
    ],

    rollback: "N/A — verification task",
  },

  "L5-002": {
    id: "L5-002",
    level: 5,
    title: "Verify STD-DESIGN-001 integration completeness",
    description:
      "Verify that STD-DESIGN-001 is properly integrated: " +
      "all standards that mention design system/tokens reference it, " +
      "Profile system is understood, no orphan design rules remain in other standards.",
    document: "STD-DESIGN-001 + All",
    section: "Cross-validation",
    priority: "HIGH",
    status: "pending",

    actions: [
      "Verify STD-FE-001 Section 11 delegates to STD-DESIGN-001 (already done in v2.3)",
      "Verify STD-DOC-003 Section 7 (Icon Standard) references STD-DESIGN-001 Section 8",
      "Verify no hardcoded color/spacing rules remain in STD-FE-001 (moved to STD-DESIGN-001)",
      "Verify STD-DESIGN-001 Cross-References (Section 28) are complete",
      "Verify STD-META-001 registry includes STD-DESIGN-001",
    ],

    dependencies: ["L4-001", "L4-002"],

    verification: [
      { check: "STD-FE-001 Section 11 mentions STD-DESIGN-001", type: "content_present", target: "STD-FE-001", pattern: /STD-DESIGN-001/ },
      { check: "STD-DOC-003 cross-refs STD-DESIGN-001", type: "content_present", target: "STD-DOC-003", pattern: /STD-DESIGN-001/ },
    ],

    rollback: "N/A — verification task",
  },

  "L5-003": {
    id: "L5-003",
    level: 5,
    title: "Final full cross-test of all standards",
    description: "Run complete cross-test after all changes.",
    document: "All",
    section: "N/A",
    priority: "HIGH",
    status: "pending",

    actions: [
      "Run ESLint no-unicode-policy against ALL .md files",
      "Verify all STD-* cross-references resolve",
      "Verify all version numbers consistent",
      "Verify no circular dependencies",
      "Generate final cross-test report",
    ],

    dependencies: ["L5-001", "L5-002"],

    verification: [
      { check: "0 critical issues in cross-test", type: "manual", description: "Generate and review report" },
    ],

    rollback: "N/A — verification task",
  },
};

// ---------------------------------------------------------------------------
// CASCADE ENGINE (unchanged)
// ---------------------------------------------------------------------------

function getTasksByLevel(level) {
  return Object.values(tasks).filter((t) => t.level === level);
}

function getLevels() {
  const levels = new Set(Object.values(tasks).map((t) => t.level));
  return [...levels].sort();
}

function canStart(taskId) {
  const task = tasks[taskId];
  if (!task) return false;
  if (task.dependencies.length === 0) return true;
  return task.dependencies.every((depId) => tasks[depId]?.status === "done");
}

function getCascadeStatus() {
  const summary = { total: 0, pending: 0, in_progress: 0, done: 0, blocked: 0, failed: 0 };
  for (const task of Object.values(tasks)) {
    summary.total++;
    if (task.status === "pending" && !canStart(task.id)) {
      summary.blocked++;
    } else {
      summary[task.status]++;
    }
  }
  return summary;
}

function isLevelComplete(level) {
  return getTasksByLevel(level).every((t) => t.status === "done");
}

function canLevelStart(level) {
  if (level === 1) return true;
  return isLevelComplete(level - 1);
}

// ---------------------------------------------------------------------------
// OUTPUT FORMATTERS
// ---------------------------------------------------------------------------

function formatTaskCompact(task) {
  const canStartStr = canStart(task.id) ? " " : "B";
  const statusIcon = {
    pending: "[ ]", in_progress: "[>]", done: "[x]", blocked: "[!]", failed: "[X]",
  }[task.status] || "[?]";
  return `${statusIcon} ${task.id} L${task.level}${canStartStr} | ${task.priority.padEnd(8)} | ${task.title}`;
}

function formatTaskFull(task) {
  const depStr = task.dependencies.length > 0 ? task.dependencies.join(", ") : "(none)";
  return [
    `${task.id} [L${task.level}] ${task.title}`,
    `  Document:  ${task.document} (Section ${task.section})`,
    `  Priority:  ${task.priority}   Status: ${task.status}`,
    `  Depends:   ${depStr}   Can start: ${canStart(task.id) ? "YES" : "NO"}`,
    ``,
    `  ${task.description}`,
    ``,
    `  Actions (${task.actions.length}):`,
    ...task.actions.map((a, i) => `    ${i + 1}. ${a}`),
    ``,
    `  Verification (${task.verification.length}):`,
    ...task.verification.map((v, i) => `    ${i + 1}. [${v.type}] ${v.check}`),
    `${"─".repeat(72)}`,
  ].join("\n");
}

function formatCascadeOverview() {
  const levels = getLevels();
  const lines = ["CASCADE OVERVIEW v2.0", `${"=".repeat(72)}`];
  for (const level of levels) {
    const levelTasks = getTasksByLevel(level);
    const doneCount = levelTasks.filter((t) => t.status === "done").length;
    const canStart = canLevelStart(level);
    lines.push("");
    lines.push(`LEVEL ${level} ${canStart ? "(UNLOCKED)" : "(LOCKED)"}`);
    lines.push(`  Progress: ${doneCount}/${levelTasks.length} tasks done`);
    lines.push(`${"─".repeat(40)}`);
    for (const task of levelTasks) {
      lines.push("  " + formatTaskCompact(task));
    }
  }
  const status = getCascadeStatus();
  lines.push("");
  lines.push(`TOTAL: ${status.total} tasks | Done: ${status.done} | Pending: ${status.pending} | Blocked: ${status.blocked} | Failed: ${status.failed}`);
  return lines.join("\n");
}

function formatImpactMap() {
  const impactIndex = {};
  for (const task of Object.values(tasks)) {
    const doc = task.document;
    if (!impactIndex[doc]) impactIndex[doc] = [];
    impactIndex[doc].push({ id: task.id, title: task.title, priority: task.priority, level: task.level, status: task.status, section: task.section });
  }
  const lines = ["IMPACT MAP v2.0", `${"=".repeat(72)}`, ""];
  for (const std of Object.keys(impactIndex).sort()) {
    lines.push(`${std}`);
    lines.push(`${"─".repeat(50)}`);
    for (const t of impactIndex[std]) {
      const s = { pending: "[ ]", in_progress: "[>]", done: "[x]", blocked: "[!]", failed: "[X]" }[t.status] || "[?]";
      lines.push(`  ${s} ${t.id} L${t.level} ${t.priority.padEnd(8)} Section ${t.section}`);
      lines.push(`       ${t.title}`);
    }
    lines.push("");
  }
  lines.push("ALREADY RESOLVED by new standards (removed from cascade):");
  lines.push(`${"─".repeat(50)}`);
  lines.push("  useState conflict (2 vs 3)       — STD-FE-001 v2.3 now uses 2");
  lines.push("  Design System delegation          — STD-FE-001 v2.3 Section 11 → STD-DESIGN-001");
  lines.push("  Exception ceilings                — STD-FE-001 v2.3 Section 9 added");
  lines.push("  DESIGN-EXCEPTION format           — STD-FE-001 v2.3 Section 9 added");
  lines.push("  Pattern D (CSS-in-JS)             — STD-FE-001 v2.3 Section 11.3 added");
  lines.push("  ZAI-ARCH-002 in Related/Cross-Ref — STD-FE-001 v2.3 Section 13 added");
  lines.push("");
  lines.push("STILL NEEDED (not in new standards):");
  lines.push(`${"─".repeat(50)}`);
  lines.push("  STD-ENV-002 dev server fix        — NOT updated in new zip");
  lines.push("  STD-ENV-002 log path fix          — NOT updated in new zip");
  lines.push("  Hooks Guide Zod validation        — NOT in any standard");
  lines.push("  Unicode cleanup (L2)              — compliance check needed");
  lines.push("  AI Hook Patterns (Section 14)     — NOT in STD-FE-001 v2.3");
  lines.push("  Sandbox Troubleshooting           — NOT in STD-ENV-002");
  lines.push("  Submodule Workflow                 — NOT in STD-ENV-002");
  lines.push("  Function size / useEffect / inline thresholds — NOT in STD-FE-001 v2.3");
  lines.push("  STD-DESIGN-001 in STD-META-001    — Registry NOT updated");
  lines.push("  STD-DESIGN-001 cross-refs          — NOT in STD-DOC-003, STD-ARCH-001");
  return lines.join("\n");
}

function formatDependencyGraph() {
  const lines = ["DEPENDENCY GRAPH", `${"=".repeat(72)}`, ""];
  for (const task of Object.values(tasks)) {
    const deps = task.dependencies.length > 0 ? task.dependencies.join(" + ") : "(root)";
    const arrow = canStart(task.id) ? "==>>" : "-->  [BLOCKED]";
    lines.push(`${deps} ${arrow} ${task.id} (${task.title})`);
  }
  return lines.join("\n");
}

function formatJSON() {
  return JSON.stringify({
    meta: { generated: new Date().toISOString(), totalTasks: Object.keys(tasks).length, levels: getLevels(), cascadeStatus: getCascadeStatus() },
    tasks,
  }, null, 2);
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

function main() {
  const args = process.argv.slice(2);
  const mode = args[0] || "overview";
  switch (mode) {
    case "--json": console.log(formatJSON()); break;
    case "--level": {
      const level = parseInt(args[1], 10);
      if (!level || !getLevels().includes(level)) { console.error(`Invalid level. Available: ${getLevels().join(", ")}`); process.exit(1); }
      for (const task of getTasksByLevel(level)) console.log(formatTaskFull(task));
      break;
    }
    case "--task": {
      const taskId = args[1];
      if (!taskId || !tasks[taskId]) { console.error(`Task not found. Available: ${Object.keys(tasks).join(", ")}`); process.exit(1); }
      console.log(formatTaskFull(tasks[taskId]));
      break;
    }
    case "--graph": console.log(formatDependencyGraph()); break;
    case "--impact": console.log(formatImpactMap()); break;
    default: console.log(formatCascadeOverview()); break;
  }
}

main();
