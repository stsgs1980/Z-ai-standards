# Standard: Implementation Order v2.4

> ID: STD-ARCH-002
> Version: 2.4
> Previous: 2.3 (was incorrectly labeled STD-ARCH-001)
> Level: **[C] Critical**
> Last Updated: 2026-06-18
> Effective Date: 2026-06-18
> Status: **APPROVED**
> verified_by: scripts/verify-id-graph.js#G01,G02
> Related: STD-META-001 (ID system), STD-ARCH-001 (architecture), all other standards (this standard governs their install order)

This standard defines two distinct ordering concerns:

1. **Standards Installation Order** (§1) — the order in which the 20 normative standards MUST be read and accepted when onboarding a new project or agent. Each standard depends on concepts introduced by earlier standards.

2. **Project Setup Sequence** (§2-§6) — the 6-step sequence for assembling a project (read standards → deploy worklog → reproducibility → unicode policy → markdown → README). This sequence governs how the standards are *applied* to a codebase, not how they are *learned*.

Violating either order leads to rework.

---

## 1. Standards Installation Order

The 20 normative standards below MUST be installed (read, understood, and accepted) in this order. Each row cites the prerequisite standards whose concepts the current standard depends on.

| # | ID | File | Prerequisites | Why this position |
|---|---|---|---|---|
| 1 | STD-META-001 | `META-001-standard-id-system.md` | — | Defines the ID system. Every other standard is referenced by its `STD-*` ID, so the ID system must be accepted first. |
| 2 | STD-ARCH-001 | `ARCH-001-architecture-and-repo-layout.md` | META-001 | Defines the 4-repo split (platform + standards + guard + skills). Needed before any cross-repo work. |
| 3 | STD-ARCH-002 | `ARCH-002-implementation-order.md` (this file) | META-001, ARCH-001 | Defines the order in which all remaining standards are installed. You are reading it. |
| 4 | STD-DOC-002 | `DOC-002-markdown-standard.md` | META-001, ARCH-002 | Governs how every `.md` file (including other standards) is formatted. Must be accepted before reading standards whose formatting depends on it. |
| 5 | STD-DOC-003 | `DOC-003-unicode-policy.md` | DOC-002 | Defines character rules (no emoji, no box-drawing, etc.). Pairs with DOC-002 — must be accepted alongside it. |
| 6 | STD-SKILL-001 | `SKILL-001-skill-format.md` | META-001, DOC-002 | Defines skill format. Needed before any skill is authored or consumed. |
| 7 | STD-ENV-001 | `ENV-001-reproducibility.md` | ARCH-001, DOC-002 | Defines L1-L4 reproducibility layers (env, code, delivery, process). Foundation for everything that runs. |
| 8 | STD-ENV-002 | `ENV-002-zai-integration.md` | ENV-001 | Sandbox-specific rules. Builds on ENV-001 — assumes reproducibility baseline. |
| 9 | STD-GIT-001 | `GIT-001-github.md` | ENV-001, DOC-002 | Commit/branch/push policy for production repos. Needed before any commit. |
| 10 | STD-GIT-002 | `GIT-002-github-sandbox.md` | GIT-001, ENV-002 | Sandbox-specific git rules (deadlock prevention). Builds on GIT-001. |
| 11 | STD-DESIGN-001 | `DESIGN-001-design-system.md` | DOC-002, DOC-003 | Design tokens (color, typography, spacing). Must be defined before frontend consumes them. |
| 12 | STD-FE-001 | `FE-001-frontend.md` | ENV-001, DOC-002, DESIGN-001 | Frontend code rules. Consumes design tokens — requires DESIGN-001 first. |
| 13 | STD-A11Y-001 | `A11Y-001-wcag-2-1-aa.md` | FE-001, DESIGN-001 | WCAG 2.1 AA compliance. Verified against frontend components — requires FE-001. |
| 14 | STD-ERR-001 | `ERR-001-error-handling.md` | FE-001, DOC-002 | Error classification, try-catch, logging. Applied in API routes and frontend boundaries. |
| 15 | STD-ERR-002 | `ERR-002-error-recovery.md` | ERR-001 | Retry, circuit breaker, fallback. Builds on error handling concepts. |
| 16 | STD-SEC-001 | `SEC-001-security-core.md` | ENV-001, GIT-001, DOC-002 | OWASP Top 10, secrets, validation. Needs env + git for context. |
| 17 | STD-SEC-002 | `SEC-002-security-extended.md` | SEC-001 | Auth, RBAC, rate limiting. Extended threats — builds on core security. |
| 18 | STD-TEST-001 | `TEST-001-testing.md` | FE-001, ERR-001, DOC-002 | Coverage gates, test isolation. Tests verify everything else — installed late. |
| 19 | STD-AGENT-001 | `AGENT-001-subagent.md` | ENV-001, GIT-001, DOC-002 | Subagent contracts. Assumes env + git + doc format already accepted. |
| 20 | STD-AGENT-002 | `AGENT-002-orchestration.md` | AGENT-001, ERR-001 | Multi-agent patterns. Builds on subagent contracts + error propagation. |

### Non-normative companions (not in install order)

These two artifacts are NOT standards — they are applied as needed during project setup (§2-§6):

| ID | File | Purpose |
|---|---|---|
| STD-DOC-004 | `templates/README_TEMPLATE.md` | Copy-and-fill-in template for project `README.md` |
| STD-DOC-005 | `guides/CODE_EXAMPLES_GUIDE.md` | How-to guide for formatting code blocks in documentation |

### Why this order — key invariants

1. **META before everything.** Without an ID system, you cannot reference any other standard.
2. **ARCH-001 before ARCH-002.** The implementation order assumes the 4-repo architecture is already understood.
3. **DOC-002 + DOC-003 before content-heavy standards.** Every standard's `.md` file must comply with markdown + unicode rules.
4. **ENV before GIT.** Git workflow depends on environment stability (no hardcoded paths, no leaked secrets).
5. **DESIGN before FE.** Frontend consumes design tokens — tokens must exist first.
6. **FE before A11Y.** Accessibility is verified against frontend components.
7. **ERR-001 before ERR-002.** Recovery builds on classification.
8. **SEC-001 before SEC-002.** Extended threats extend core security.
9. **TEST after ERR + FE.** Tests verify error handling and frontend behavior.
10. **AGENT-001 before AGENT-002.** Orchestration coordinates subagents — subagent contract must exist first.

### Dependency graph

```text
META-001 (1)
  └── ARCH-001 (2)
        └── ARCH-002 (3) [this file]
              ├── DOC-002 (4)
              │     └── DOC-003 (5)
              ├── SKILL-001 (6)
              ├── ENV-001 (7)
              │     └── ENV-002 (8)
              ├── GIT-001 (9)  ← needs ENV-001
              │     └── GIT-002 (10)  ← needs ENV-002
              ├── DESIGN-001 (11)  ← needs DOC-002, DOC-003
              │     └── FE-001 (12)  ← needs ENV-001, DESIGN-001
              │           └── A11Y-001 (13)
              ├── ERR-001 (14)  ← needs FE-001
              │     └── ERR-002 (15)
              ├── SEC-001 (16)  ← needs ENV-001, GIT-001
              │     └── SEC-002 (17)
              ├── TEST-001 (18)  ← needs FE-001, ERR-001
              └── AGENT-001 (19)  ← needs ENV-001, GIT-001
                    └── AGENT-002 (20)  ← needs AGENT-001, ERR-001
```

---

## 2. Project Documents

### Group B: Standards (governance)

Define rules. Not modified when starting a new project — only read and accepted.

**ID System:** All standards have a unique ID (e.g., `STD-FE-001`). See **STD-META-001** for the ID registry and assignment rules.

| ID | Document | Level | Scope |
|----|----------|-------|-------|
| STD-ENV-001 | ENV-001-reproducibility.md | [C] | Infrastructure, env, DB |
| STD-FE-001 | FE-001-frontend.md | [C] | React, Next.js, FSD |
| STD-DESIGN-001 | DESIGN-001-design-system.md | [C]+[W] | Design tokens, typography, color, spacing, card archetypes |
| STD-GIT-001 | GIT-001-github.md | [C] | Commits, branches, push policy |
| STD-GIT-002 | GIT-002-github-sandbox.md | [C] | Sandbox deadlock, recovery, network failures |
| STD-A11Y-001 | A11Y-001-wcag-2-1-aa.md | [C] | WCAG, ARIA, contrast |
| STD-TEST-001 | TEST-001-testing.md | [C] | Unit, integration, E2E testing |
| STD-ERR-001 | ERR-001-error-handling.md | [C] | Error types, logging, response patterns |
| STD-ERR-002 | ERR-002-error-recovery.md | [C] | Retry, circuit breaker, fallback, monitoring |
| STD-SEC-001 | SEC-001-security-core.md | [C] | Core security: secrets, validation, headers |
| STD-SEC-002 | SEC-002-security-extended.md | [C] | Extended: auth, RBAC, rate limiting, compliance |
| STD-DOC-001 | (RU version, not shipped) | [W] | [DEPRECATED — file not shipped] Use STD-DOC-002 |
| STD-DOC-002 | DOC-002-markdown-standard.md | [W] | README, project documentation |
| STD-DOC-003 | DOC-003-unicode-policy.md | [C]+[W]+[I] | UI, production code, AI-chat |
| STD-DOC-004 | templates/README_TEMPLATE.md | [W] | README.md structure (non-normative template) |
| STD-DOC-005 | guides/CODE_EXAMPLES_GUIDE.md | [W] | Code examples in documentation (non-normative guide) |
| STD-ARCH-001 | ARCH-001-architecture-and-repo-layout.md | [C] | 4-repo split, submodule topology, layer model |
| STD-ARCH-002 | ARCH-002-implementation-order.md | [C] | Standards installation order (this file) |
| STD-META-001 | META-001-standard-id-system.md | [C] | Standard ID system |
| STD-ENV-002 | ENV-002-zai-integration.md | [C] | Z.ai sandbox integration |
| STD-AGENT-001 | AGENT-001-subagent.md | [C] | Subagent types, contract, lifecycle, constraints |
| STD-AGENT-002 | AGENT-002-orchestration.md | [C] | Multi-agent coordination, dependencies, state |

### Group A: Operational System (worklog)

Work tools. Copied into the project and used from day one.

| Document | Purpose |
|----------|---------|
| README_WORKLOG.md | Worklog system guide |
| TASK_TEMPLATE.md | Prompt templates for sub-agents |
| WORKLOG.md | Agent work journal (live file) |

### Relationship Between Groups

- Group A submits to Group B (all .md files must comply with MARKDOWN_STANDARD and No-Unicode Policy)
- Group B does not know about Group A (standards do not mention worklog)
- Group A references Group B (README_WORKLOG mentions standards)

---

## 2. Full Sequence (6 Steps)

### Step 1: Accept Standards (Group B)

**What is done:**

- Copy all Group B files to project folder (e.g., `docs/standards/`)
- Read each standard completely
- Ensure team understands levels [C], [W], [I]
- Define stack signature for project (format: `Built with: <technologies>`, default: see README_TEMPLATE)

**Why first:** Standards are the foundation. Everything else must comply with them. If you start work without understanding the rules, you will have to redo.

**Risk:** Without this step, each project participant will format code and documentation differently.

---

### Step 2: Deploy Worklog System (Group A)

**What is done:**

- Copy README_WORKLOG.md to project (guide)
- Copy TASK_TEMPLATE.md to project (prompt templates)
- Create WORKLOG.md from template (empty journal with header)
- Verify all three files comply with MARKDOWN_STANDARD (stack signature, code block languages, list markers)

**Why second:** Worklog starts recording work from step 3. Without it — no history, no coordination between agents, no ability to rollback.

**Why after standards:** Group A files must comply with Group B standards from the moment they appear in the project. Verification at step 2 ensures the worklog system does not violate MARKDOWN_STANDARD.

**Risk:** If worklog is deployed before accepting standards — files may not comply with rules, and at step 5 they will need to be redone.

---

### Step 3: REPRODUCIBILITY-STANDARD (Foundation)

**What is done:**

- Create .env.example with all variables and safe defaults
- Configure db.ts: connection_limit=1, mkdirSync, relative paths via process.cwd()
- Remove hardcoded personal paths (environment-constant paths allowed per STD-ENV-002)
- Remove localhost URLs in source code (use relative paths or XTransformPort)
- Verify dependencies (no dead packages)
- Log result to WORKLOG.md (Task ID: 3)

**Note:** Dark theme and color palette configuration is now in FRONTEND_STANDARD (STD-FE-001 §11), applied at Step 3a.

**Why third:** Infrastructure must be stable before code and documentation start relying on it.

**Risk:** If you write UI first and then fix DB paths or environment variables — you will have to retest all code that used these connections.

---

### Step 4: UNICODE_POLICY [C] (UI Code Protection)

**What is done:**

- Add custom ESLint rule no-unicode-policy/no-unicode (error)
- Replace all emoji in UI components with Lucide SVG icons
- Replace unicode statuses with text tags: [OK], [FAIL], [TODO]
- Run bun run lint for verification
- Log result to WORKLOG.md (Task ID: 4)

**Why fourth:** After infrastructure setup (step 3), code must be "frozen" from unicode pollution. ESLint rule blocks all new emoji/unicode in code. .ts/.tsx files are already stable (step 3 done), no repeated cleanup needed.

**Risk:** If No-Unicode is done before Reproducibility — .ts/.tsx files will be changed during DB setup, and cleanup will need to be repeated. If done after Markdown Standard — emoji will remain in .md files, which No-Unicode does not catch.

---

### Step 5: MARKDOWN_STANDARD [W] (Documentation)

**What is done:**

- Remove emoji from all .md files (worklog, README, AGENT_RULES, etc.)
- Replace unicode pseudo-graphics with ASCII
- Verify lists (only `-`, not `*` or `+`)
- Verify code blocks (always with language specified, fallback: `text` or `bash`)
- Add Stack Signature to root files (format: `Built with: <technologies>`)
- Validate Group A files (README_WORKLOG.md, TASK_TEMPLATE.md, WORKLOG.md)
- Log result to WORKLOG.md (Task ID: 5)

**Why fifth:** No-Unicode already cleaned code (step 4), but ESLint rule does not cover .md files. Markdown Standard is final cleanup for documentation, including worklog system files.

**Risk:** If Markdown Standard is done before No-Unicode — you will have to go through .md files again, because both standards prohibit emoji but with different scope.

---

### Step 6: README_TEMPLATE (Final Assembly)

**What is done:**

- README.md is assembled from template (Title, Features, Tech Stack, Getting Started, Configuration, Project Structure, API Reference, Scripts, Development Rules, Agent Rules)
- Stack Signature added at end (specific project stack value)
- Formatting complies with MARKDOWN_STANDARD
- Log result to WORKLOG.md (Task ID: 6)

**Why last:** README.md must comply with MARKDOWN_STANDARD, so template is applied after formatting rules are established (step 5). Tech stack was defined at step 1, infrastructure is stable (step 3), code is clean (step 4).

**Risk:** If README is done first — when Markdown Standard is applied, you will have to reformat lists (`*` to `-`), add language to code blocks, add Stack Signature.

---

## 3. Dependency Diagram

```text
Step 1: Standards (Group B)          Read, accept rules
        |
        v
Step 2: Worklog (Group A)            Deploy, verify compliance with B
        |
        v
Step 3: REPRODUCIBILITY              Configure infrastructure (env, db, paths)
        |                            Log to WORKLOG
        v
Step 4: UNICODE_POLICY [C]           ESLint rule + UI code cleanup
        |                            Log to WORKLOG
        v
Step 5: MARKDOWN_STANDARD [W]        Clean .md files (including Group A)
        |                            Log to WORKLOG
        v
Step 6: README_TEMPLATE              Assemble README from template
                                     Log to WORKLOG
```

---

## 4. What Happens When Order is Violated

| Mistake | Consequence |
|---------|-------------|
| Worklog (step 2) before Standards (step 1) | Group A files do not comply with B — re-verification and editing at step 5 |
| No-Unicode before Reproducibility | .ts/.tsx files change during DB setup — repeated cleanup |
| Markdown Standard before No-Unicode | Emoji in .md and code — double pass through files |
| README Template before Markdown Standard | README format does not comply with standard — reformatting |
| Any standard without Reproducibility | Hardcoded personal paths, dead packages — hidden bugs |
| Reproducibility after README | Personal paths in .env and db.ts break deploy — rewriting config and reformatting README |
| Skipping step 2 (worklog) | No work history, no coordination between agents, no rollback possible |

---

## 5. Key Rules

1. **Layers:** Each step is a layer. The lower layer must be stable before laying the next. Otherwise layers will have to be relaid.

2. **Group A submits to Group B:** All worklog system files are verified against standards. This is done twice: during deployment (step 2) and when applying MARKDOWN_STANDARD (step 5).

3. **Worklog records each step:** Starting from step 3, each step is logged to WORKLOG.md. Steps 1-2 are manual (worklog not yet used), steps 3-6 are with logging.

4. **Stack signature defined at step 1:** Format is defined by MARKDOWN_STANDARD, specific value by README_TEMPLATE. When project stack changes, only README_TEMPLATE is updated.

---

## 6. Path B: Existing Project Integration

The 6-step sequence above assumes a project built from scratch. When integrating zai-agent-toolkit into an **existing project**, the order must adapt — you cannot start from nothing when code already exists.

### When to Use Path B

- Adding zai-agent-toolkit to a project that already has source code
- Onboarding onto a project that was developed without standards
- After a git deadlock recovery that requires re-establishing standards

### Audit Phase (Before Step 1)

Before applying any standards, audit the existing project:

```bash
# 1. Scan for absolute paths
grep -rn "/home/" src/ --include="*.ts" --include="*.tsx" | grep -v "node_modules"
grep -rn "http://localhost:" src/ --include="*.ts" --include="*.tsx"

# 2. Check for emoji/Unicode in source
grep -rn "[\x{1F000}-\x{1FFFF}]" src/ --include="*.ts" --include="*.tsx"

# 3. Check .env.example exists
ls .env.example 2>/dev/null || echo "MISSING: .env.example"

# 4. Check .gitignore
grep -q ".env" .gitignore || echo "WARNING: .env not in .gitignore"

# 5. Scan file sizes
find src/ -name "*.tsx" -exec wc -l {} \; | sort -rn | head -10
```

### Adapted Sequence for Existing Projects

| Step | Action | Difference from Path A |
|------|--------|----------------------|
| 1 | Accept Standards | Same — read and understand all standards |
| 2 | Deploy Worklog | Same — copy templates, verify compliance |
| 3 | Fix Critical Issues | Different — audit and fix existing violations (absolute paths, missing .env.example, error leaks) |
| 4 | Apply Unicode Policy | Different — clean existing code + add ESLint rule |
| 5 | Apply Markdown Standard | Different — clean existing .md files |
| 6 | Update README | Different — rewrite existing README to match template |

### Step 3 Detail: Fix Critical Issues

For existing projects, this step becomes a remediation phase:

1. **Replace absolute paths** with `process.cwd()` + relative paths
2. **Create `.env.example`** from existing `.env` (replace secrets with placeholders)
3. **Add `.gitignore` entries** for `.env`, `*.db`, `node_modules/`
4. **Fix error handling** — replace `error.message` leaks with generic messages
5. **Add `connection_limit=1`** to SQLite URL if missing
6. **Remove dead packages** — `npx depcheck`

### Risk Mitigation for Path B

| Risk | Mitigation |
|------|-----------|
| Existing code breaks after fixes | Create git tag before remediation: `git tag pre-standards-audit` |
| Too many violations to fix at once | Prioritize by severity: [C] first, then [W], then [I] |
| Team resistance to standard changes | Apply incrementally, explain reasoning, show CI benefits |
| Large monolith files | Use FRONTEND_STANDARD (STD-FE-001) 150-line limit and FSD decomposition rules |

---

## 7. Cross-References

| Standard | Relationship |
|----------|-------------|
| STD-META-001 | ID system: assigns all STD- identifiers used in this implementation order |
| STD-DESIGN-001 | Design System: design tokens referenced by STD-FE-001 §11; consumed in Step 3 (REPRODUCIBILITY) when `tokens/` layer is registered, and enforced from Step 4 (UNICODE_POLICY) onward |
| STD-FE-001 | Frontend: consumes design tokens (§11) and applies component-size limits during Step 3 |
| STD-DOC-002 | Markdown: Step 5 formatting rules |
| STD-DOC-003 | Unicode Policy: Step 4 character rules (also defines chat-dialogue rules in §8.4) |
| STD-ENV-001 | Reproducibility: Step 3 environment setup |
| STD-ENV-002 | Z.ai Integration: Step 3 sandbox SDK usage |
| STD-GIT-001 | Git Core: invoked after every file-modifying step (commit + push per STD-AGENT-002 §5) |
| STD-GIT-002 | Git Sandbox Safety: Step 3 deadlock prevention |
| STD-A11Y-001 | WCAG: verified during Step 3 (component implementation) and Step 6 (README mentions compliance) |
| STD-ERR-001 | Error Handling Core: applied in Step 3 (API routes, error boundaries) |
| STD-ERR-002 | Error Recovery: applied in Step 3 (retry, circuit breaker for external calls) |
| STD-SEC-001 | Security Core: applied in Step 3 (Zod validation, secrets, headers) |
| STD-SEC-002 | Security Extended: applied in Step 3 if project is user-facing (auth, RBAC, rate limiting) |
| STD-TEST-001 | Testing: applied in Step 3 (unit tests for new code) and verified before Step 6 |
| STD-DOC-004 | README Template: Step 6 final assembly |
| STD-DOC-005 | Code Examples: applied throughout Steps 3-6 for any documentation code blocks |
| STD-AGENT-001 | Subagent Standard: governs any subagent invocations during Steps 3-6 |
| STD-AGENT-002 | Orchestration: governs multi-subagent workflows during Steps 3-6 |

---

## 7A. Known Issues and Proposed Solutions

This section documents discovered inconsistencies, missing content, and proposed corrections. Each issue has an ID, status, and proposed action. Issues resolved in the current version are marked `[RESOLVED]`; outstanding issues are marked `[OPEN]`.

### ARCH-001 `[RESOLVED in v2.3]` — Cross-References referenced 11 steps that did not exist

**Problem:** Prior to v2.3, §7 (Cross-References) cited "Step 7" through "Step 11" for various standards (STD-ERR-001 → Step 7, STD-SEC-001 → Step 8, STD-TEST-001 → Step 9, STD-DOC-005 → Step 10, STD-AGENT-001/002 → Step 11). However, §2 (Full Sequence) defined only 6 steps (Step 1 through Step 6). The Cross-References table was therefore referring to a stale 11-step model that no longer existed in the document.

**Resolution:** Rewrote §7 Cross-References to map each standard to the correct step in the 6-step model. Most standards that were previously "Step 7+" are now applied during Step 3 (REPRODUCIBILITY), because that is when infrastructure, API routes, error handling, security validation, and tests are first established. README Template (STD-DOC-004) is mapped to Step 6. Code Examples (STD-DOC-005) applies throughout Steps 3-6.

### ARCH-002 `[RESOLVED in v2.3]` — `STD-DESIGN-001` missing from Group B table

**Problem:** Prior to v2.3, the Group B standards table in §1 did not include `STD-DESIGN-001` (Design System Standard). The file `DESIGN_SYSTEM_STANDARD.md` existed and was referenced by STD-FE-001 §11, but IMPLEMENTATION_ORDER did not list it — making it appear as if the standard did not belong to the project's governance set.

**Resolution:** Added a row for STD-DESIGN-001 in the Group B table with Level `[C]+[W]` and scope "Design tokens, typography, color, spacing, card archetypes". Added STD-DESIGN-001 to §7 Cross-References with its mapping to Steps 3-4.

### ARCH-003 `[RESOLVED in v2.3]` — `STD-DOC-004` Level listed as `-` (no level)

**Problem:** The Group B table listed STD-DOC-004 (README Template) with Level `-` (empty), implying it had no strictness level. The actual file header (v2.1) says `Level: **[W] Warning**`. The registry in STD-META-001 §4.4 also lists it as `[W]`.

**Resolution:** Updated the Group B table entry for STD-DOC-004 to `[W]`.

### ARCH-004 `[RESOLVED in v2.3]` — Filename `REPRODUCIBILITY-STANDARD.md` used hyphen

**Problem:** The Group B table referenced `REPRODUCIBILITY-STANDARD.md` (with a hyphen). Every other standard file in the directory uses underscore separators (`GITHUB_STANDARD.md`, `MARKDOWN_STANDARD.md`, etc.). The file has now been renamed to `REPRODUCIBILITY_STANDARD.md`.

**Resolution:** Updated the Group B table entry to `REPRODUCIBILITY_STANDARD.md`. The actual file rename is performed as part of this change set.

### ARCH-005 `[OPEN]` — Step 3 ("REPRODUCIBILITY") is overloaded

**Problem:** After the ARCH-001 fix, Step 3 now bundles REPRODUCIBILITY + Frontend + Design System + Error Handling + Error Recovery + Security Core + Security Extended + Testing + WCAG. This is a lot for one step. In practice, these are sub-steps executed in sequence, but the document presents Step 3 as a single unit.

**Proposed solution:** Either (a) split Step 3 into sub-steps 3a (REPRODUCIBILITY), 3b (Frontend + Design System), 3c (Error + Security), 3d (Testing + WCAG) — with explicit ordering; or (b) add a note under Step 3 that says "Step 3 is composite; sub-steps within it follow the order: env → frontend → error/security → testing". Option (b) is the lighter touch.

### ARCH-006 `[OPEN]` — No explicit "Path B" sub-step mapping for STD-DESIGN-001

**Problem:** §6 (Path B: Existing Project Integration) gives an adapted 6-step sequence for existing projects, but does not mention STD-DESIGN-001. When onboarding an existing project, the team needs to know whether to audit existing design tokens before or after the REPRODUCIBILITY fix.

**Proposed solution:** Add a row to the §6 adapted-sequence table: "3.5 | Audit existing design tokens | Different — map hardcoded colors to semantic tokens per STD-DESIGN-001 §4.4 | aligned with Step 3 fix".

### ARCH-007 `[OPEN]` — Standards directory path is unspecified

**Problem:** §2 Step 1 says "Copy all Group B files to project folder (e.g., `docs/standards/`)". The actual standards in this project live at `/home/z/my-project/Z-ai-standards/standards/`. The example path `docs/standards/` is illustrative but may confuse readers who expect a canonical location.

**Proposed solution:** Either (a) update the example to `Z-ai-standards/standards/` to match the actual project layout, or (b) add a note: "The standards directory path is project-specific; this project uses `Z-ai-standards/standards/`. Substitute your project's path." Option (b) is more flexible.

---

Built with: Next.js 16 + TypeScript + Tailwind CSS
