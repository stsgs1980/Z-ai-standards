# Standard: Standard ID System v2.0 (EN)

> ID: STD-META-001
> Version: 2.0.1
> Previous: 1.2 (single-layer, STD- only)
> Level: **[C] Critical**
> Last Updated: 2026-06-19
> Effective Date: 2026-06-19
> Status: **APPROVED**
> verified_by: scripts/verify-standards.js#V05, scripts/verify-id-graph.js#G01-G14
> Related: (none — META is foundational)

> **Status: APPROVED.** This revision supersedes draft v1 (which
> proposed `SKILL-` prefix and a conflicting domain list). v2 preserves the
> existing `ZAI-` skill prefix from toolkit v2.0.5, consolidates the
> divergent domain lists from ZAI-META-001 and ZAI-META-002 into one
> authoritative source, and introduces a fourth header format (YAML
> frontmatter) for skills.
>
> **Key principle:** IDs are **MANDATORY** for STD/RULE/PROC/TOOL
> (institutional layer) and **OPTIONAL** for ZAI skills. A skill needs an ID
> only when referenced by ID from another artifact. Most personal skills do
> not need an ID. The runtime sandbox matches skills by `name:`, not by ID.
>
> All 20 existing `STD-*` IDs from v1.2 and all 24 existing `ZAI-*` IDs
> from toolkit v2.0.5 are preserved unchanged.

---

## 0. What Changed From v1.2

| Aspect | v1.2 | v2.0 |
|---|---|---|
| Prefixes covered | `STD-` only | `STD-`, `RULE-`, `PROC-`, `TOOL-`, `ZAI-` |
| Layers | implicit (one) | explicit (L1/L2/L3/meta) per prefix |
| Direction rules | none | DAG matrix (§6) + bidirectional `Aligned_with:` |
| Header formats | blockquote only | blockquote OR HTML-comment OR YAML frontmatter |
| Registry | one section (§4) | five subsections (4.13–4.17) added |
| Cross-layer references | undefined | §7 |
| Migration protocol | undefined | §8 |
| Compatibility DAG | undefined | §6.4 (G14) |
| Validator | `verify-standards.js` | + `verify-id-graph.js` (cross-layer DAG) |
| **ID requirement for skills** | **N/A** | **Optional (required only when referenced externally)** |

**No breaking changes.** Every ID valid under v1.2 remains valid under v2.0.
Every existing `ZAI-*` ID from toolkit v2.0.5 remains valid under v2.0.

---

## 1. Purpose

The ID system assigns a permanent, unambiguous identifier to every normative
artifact in the four repositories of the Z-ai ecosystem. An artifact is
normative if any of the following is true:

- It declares a standard that other artifacts may reference.
- It declares a rule that an agent or human must follow.
- It declares a procedure that an agent or human must execute under defined conditions.
- It declares a tool that other artifacts reference by ID.
- It declares a reusable skill that other artifacts may invoke by ID **(skills without external references do not need an ID — see STD-SKILL-001 §4.2)**.

The ID solves five problems:

| Problem | Example |
|---|---|
| Unambiguous reference in discussions | "Violation of STD-FE-001 §2.1" |
| Reference in AI prompts | "Follow RULE-ENV-008 for sandbox verification" |
| Cross-repo dependency tracking | "RULE-ENV-008 enforces STD-ENV-001, STD-ENV-002" |
| Bidirectional alignment tracking | "STD-FE-001 is aligned with ZAI-ARCH-002" |
| CI/CD mechanical checks | `verify-id-graph.js` builds the ID graph, fails the build on cycle / forbidden edge |

---

## 2. ID Format

```text
<PREFIX>-<DOMAIN>-<NUMBER>
```

| Component | Description |
|---|---|
| `<PREFIX>` | Layer identifier: `STD`, `RULE`, `PROC`, `TOOL`, `ZAI` |
| `<DOMAIN>` | Domain code (2–6 letters, see §3) |
| `<NUMBER>` | Sequential number in prefix+domain (3 digits, 001–999) |

**Examples:**
- `STD-FE-001` — Frontend Development Standard (Layer 1)
- `RULE-ENV-008` — Sandbox verification rule (Layer 2)
- `PROC-SETUP-001` — Project installer procedure (Layer 2)
- `TOOL-VERIFY-001` — verify-docs tool (Layer 2)
- `ZAI-ARCH-002` — Anti-monolith skill (Layer 3)

> **Note on prefix choice for skills.** v2.0 preserves the existing `ZAI-`
> prefix from toolkit v2.0.5 (ZAI-META-001). An earlier draft proposed
> `SKILL-` as the prefix; that proposal is withdrawn. Renaming 24 existing
> IDs (`ZAI-ARCH-002` → `SKILL-ARCH-002`, etc.) would break every existing
> reference in standards, rules, and consumer projects for no architectural
> benefit. The `ZAI-` prefix is treated as a Layer 3 identifier semantically
> equivalent to `SKILL-` in the abstract model.

### 2.1 Prefix Authority

| Prefix | Layer | Owning repo | ID Required? | May be assigned by |
|---|---|---|---|---|
| `STD-` | L1 Standards | Z-ai-standards | **Yes (always)** | Maintainer of Z-ai-standards |
| `RULE-` | L2 Rules | Z-ai-guard | **Yes (always)** | Maintainer of Z-ai-guard |
| `PROC-` | L2 Procedures | Z-ai-guard | **Yes (always)** | Maintainer of Z-ai-guard |
| `TOOL-` | L2 Tools | Z-ai-guard | **Yes (always)** | Maintainer of Z-ai-guard |
| `ZAI-` | L3 Skills | Z-ai-skills | **Optional** (required only when referenced externally; see STD-SKILL-001 §4.2) | Maintainer of Z-ai-skills |

> **Note:** `PROC-` and `TOOL-` live in Z-ai-guard (not Z-ai-skills) because
> procedures and tools in this ecosystem are enforcement mechanisms for
> rules, not user-callable capabilities. A procedure (`PROC-`) is "what runs
> when Rule X fires"; a tool (`TOOL-`) is "the script that rule calls". Both
> are inseparable from the rules that drive them. User-callable capabilities
> live in Z-ai-skills as `ZAI-`.

---

## 3. Reserved Domains

Domains are shared across the five prefixes wherever the same code appears
in both tables below. A domain code means the same thing regardless of
which prefix uses it.

### 3.1. Core Domains (used by STD/RULE/PROC/TOOL)

| Domain | Expansion | Scope | Used by prefixes |
|---|---|---|---|
| `META` | Meta | Standards/rules about the system itself | STD, RULE |
| `FE` | Frontend | React, Next.js, UI components, FSD | STD, RULE |
| `GIT` | Git / GitHub | Commits, branches, push policy | STD, RULE, PROC |
| `A11Y` | Accessibility | WCAG, ARIA, contrast, keyboard | STD, RULE |
| `DOC` | Documentation | Markdown, Unicode, code examples | STD, RULE, TOOL |
| `ARCH` | Architecture | Implementation order, dependencies | STD, RULE |
| `API` | API Design | REST, GraphQL, tRPC | STD (reserved) |
| `TEST` | Testing | Unit, E2E, integration | STD, RULE |
| `ERR` | Error Handling | Error types, logging, recovery | STD, RULE |
| `SEC` | Security | OWASP, secrets, authentication | STD, RULE |
| `DB` | Database | Prisma, migrations, schemas | STD (reserved) |
| `ENV` | Environment | Infrastructure, reproducibility, sandbox | STD, RULE, PROC |
| `AGENT` | Agents | Subagents, orchestration | STD, RULE |
| `DESIGN` | Design System | Tokens, typography, color, spacing | STD, RULE |
| `VERIFY` | Verification | Generic verification tools | TOOL |
| `SETUP` | Setup | Project bootstrap procedures | PROC |
| `WORKFLOW` | Workflow | CI/CD pipeline procedures | PROC |
| `SKILL` | Skill System | Standards about the skill layer itself | STD |

### 3.2. Skill Domains (used by ZAI- only)

These domains are exclusive to `ZAI-` IDs and do not appear in `STD-` /
`RULE-` / `PROC-` / `TOOL-` registries. The complete authoritative list is
maintained in **STD-SKILL-001** (new standard in Z-ai-standards). This
section is a summary; STD-SKILL-001 is the source of truth.

> **Note.** Domains are only relevant for skills that HAVE an ID. A skill
> without an ID does not need a domain. Most personal `_sts` skills may be
> created without an ID and without a domain.

| Domain | Expansion | Scope |
|---|---|---|
| `MEM` | Memory | Store, query, delete, export memory records |
| `FS` | File System | Folder indexing, file scanning |
| `SESSION` | Session Management | Session logging, context consolidation, handoff |
| `DEV` | Development | Project clone, commit workflow, DB schema design |
| `ARCH` | Architecture | Mermaid diagrams, C4, anti-monolith (shared with core ARCH) |
| `QA` | Quality Assurance | Test planning |
| `REQ` | Requirements | Clarity, PRD generation |
| `META` | Meta-skills | skill-creator, ID system (shared with core META) |
| `STS` | User-Created (signature) | Skills created by STS (user signature namespace) |
| `SDK` | SDK Integration | z-ai-web-dev-sdk wrapper skills |
| `DOC` | Documentation | PDF, DOCX, PPT generation (shared with core DOC) |
| `HEALTH` | Health Monitoring | API health, retry, fallback |
| `CHART` | Charts | Visualization skills (matplotlib, ECharts, etc.) |

> **Adding a new domain** requires a PR to STD-META-001 §3 (for core domains)
> or STD-SKILL-001 §3 (for skill-only domains). Domains cannot be added
> unilaterally by guard/skills maintainers — the registry is centralized.

---

## 4. ID Registry

> **Status**: `ACTIVE` = maintained; `FROZEN` = kept for reference;
> `DEPRECATED` = obsolete, do not reference in new content.

### 4.1 – 4.12. Standards (STD-)

> Unchanged from v1.2 §4.1–4.12. The 20 STD-* IDs listed in v1.2 are
> preserved verbatim. See v1.2 for the full table.

### 4.13. Rules (RULE-)

| ID | Document | Version | Level | Status | File |
|---|---|---|---|---|---|
| RULE-ANSWER-001 | Answer Before Act | 1.0 | [C] | ACTIVE | Z-ai-guard/AGENT_RULES.md |
| RULE-WORKLOG-002 | Worklog before/after | 1.0 | [C] | ACTIVE | Z-ai-guard/AGENT_RULES.md |
| RULE-READ-003 | Read before write | 1.0 | [C] | ACTIVE | Z-ai-guard/AGENT_RULES.md |
| RULE-COMMIT-004 | One logical block per commit | 1.0 | [C] | ACTIVE | Z-ai-guard/AGENT_RULES.md |
| RULE-LOOPS-005 | No loops | 1.0 | [C] | ACTIVE | Z-ai-guard/AGENT_RULES.md |
| RULE-HONEST-006 | Honest reporting | 1.0 | [C] | ACTIVE | Z-ai-guard/AGENT_RULES.md |
| RULE-STRUCT-007 | Work structure | 1.0 | [W] | ACTIVE | Z-ai-guard/AGENT_RULES.md |
| RULE-ENV-008 | Sandbox verification | 1.0 | [C] | ACTIVE | Z-ai-guard/AGENT_RULES.md |
| RULE-AGENT-009 | Session start protocol | 1.0 | [C] | ACTIVE | Z-ai-guard/AGENT_RULES.md |
| RULE-DOC-010 | Documentation sync | 1.0 | [C] | ACTIVE | Z-ai-guard/AGENT_RULES.md |
| RULE-INTEGRITY-011 | Integrity protection | 1.0 | [C] | ACTIVE | Z-ai-guard/AGENT_RULES.md |
| RULE-MONOLITH-012 | Anti-monolith (250 lines) | 1.1 | [C] | ACTIVE | Z-ai-guard/AGENT_RULES.md |
| RULE-VERSION-013 | Use verify-docs bump | 1.1 | [C] | ACTIVE | Z-ai-guard/AGENT_RULES.md |
| RULE-COMMIT-014 | Pre-commit checklist | 1.1 | [C] | ACTIVE | Z-ai-guard/AGENT_RULES.md |
| RULE-DOC-015 | No Unicode graphics | 1.0 | [W] | ACTIVE | Z-ai-guard/AGENT_RULES.md |
| RULE-ARCH-016 | Submodule immutability | 1.0 | [C] | ACTIVE | Z-ai-guard/AGENT_RULES.md |
| RULE-ARCH-017 | Upstream write protection | 1.0 | [C] | ACTIVE | Z-ai-guard/AGENT_RULES.md |

> The RULE-<DOMAIN>-NNN format replaces the legacy RULE-001..RULE-017
> numbering from AHG v2.5.0. Legacy numbers are migrated per §8. The
> legacy numbering is preserved as an alias for one release cycle
> (Z-ai-guard v3.0.0 → v3.1.0), then removed in v3.1.0.

### 4.14. Procedures (PROC-)

| ID | File | Version | Level | Status |
|---|---|---|---|---|
| PROC-SETUP-001 | Z-ai-guard/setup.sh | 2.0 | [C] | ACTIVE |
| PROC-UPDATE-002 | Z-ai-guard/update.sh | 2.1 | [C] | ACTIVE |
| PROC-COCHANGE-003 | Z-ai-guard/scripts/co-change-check.sh | 1.0 | [C] | ACTIVE |
| PROC-LINECOUNT-004 | Z-ai-guard/scripts/line-count-check.sh | 1.0 | [C] | ACTIVE |
| PROC-PLATFORM-INSTALL-005 | Z-ai-platform/install.sh | 1.0 | [C] | ACTIVE (planned) |
| PROC-PLATFORM-UPDATE-006 | Z-ai-platform/update.sh | 1.0 | [C] | ACTIVE (planned) |
| PROC-PLATFORM-DOCTOR-007 | Z-ai-platform/doctor.sh | 1.0 | [C] | ACTIVE (planned) |

### 4.15. Tools (TOOL-)

| ID | File | Version | Level | Status |
|---|---|---|---|---|
| TOOL-VERIFY-001 | Z-ai-guard/tools/verify-docs/ | 2.1 | [C] | ACTIVE |
| TOOL-VERIFY-002 | Z-ai-standards/scripts/verify-standards.js | 2.2.0 | [C] | ACTIVE |
| TOOL-VERIFY-003 | Z-ai-standards/scripts/verify-cascade.js | 2.2.0 | [C] | RETIRED 2026-06-18 (one-shot v1.0 cascade check; superseded by TOOL-VERIFY-002 + TOOL-VERIFY-004) |
| TOOL-VERIFY-004 | Z-ai-standards/scripts/verify-id-graph.js | 1.0.0 | [C] | ACTIVE (planned) |
| TOOL-BUMP-005 | Z-ai-guard/tools/verify-docs/src/bump.ts | 2.1 | [C] | ACTIVE |
| TOOL-CHECKUPDATES-006 | Z-ai-standards/scripts/check-updates.sh | 2.2.0 | [W] | ACTIVE |

### 4.16. Skills (ZAI-)

> **Full registry lives in STD-SKILL-001.** This section is a summary;
> conflicts are resolved in favor of STD-SKILL-001.

#### 4.16.1. Memory (MEM)

| ID | Skill | Version | Status |
|---|---|---|---|
| ZAI-MEM-001 | memory-store | 1.0 | ACTIVE |
| ZAI-MEM-002 | memory-query | 1.0 | ACTIVE |
| ZAI-MEM-003 | memory-delete | 1.0 | ACTIVE |
| ZAI-MEM-004 | memory-export | 1.0 | ACTIVE |

#### 4.16.2. File System (FS)

| ID | Skill | Version | Status |
|---|---|---|---|
| ZAI-FS-001 | folder-indexer | 1.0 | ACTIVE |

#### 4.16.3. Session (SESSION)

| ID | Skill | Version | Status |
|---|---|---|---|
| ZAI-SESSION-001 | session-log | 1.1 | ACTIVE |
| ZAI-SESSION-002 | context-consolidation | 1.0 | ACTIVE |
| ZAI-SESSION-003 | session-experience | 4.0 | ACTIVE |

#### 4.16.4. Development (DEV)

| ID | Skill | Version | Status |
|---|---|---|---|
| ZAI-DEV-001 | project-clone | 1.0 | ACTIVE |
| ZAI-DEV-002 | commit-work | 1.0 | ACTIVE |
| ZAI-DEV-003 | database-schema-designer | 1.0 | ACTIVE |

#### 4.16.5. Architecture (ARCH)

| ID | Skill | Version | Status |
|---|---|---|---|
| ZAI-ARCH-001 | mermaid-diagrams | 1.0 | ACTIVE |
| ZAI-ARCH-002 | anti-monolith | 1.0 | ACTIVE |

#### 4.16.6. Quality Assurance (QA)

| ID | Skill | Version | Status |
|---|---|---|---|
| ZAI-QA-001 | qa-test-planner | 1.0 | ACTIVE |

#### 4.16.7. Requirements (REQ)

| ID | Skill | Version | Status |
|---|---|---|---|
| ZAI-REQ-001 | requirements-clarity | 1.0 | ACTIVE |

#### 4.16.8. Meta-skills (META)

| ID | Skill | Version | Status | Note |
|---|---|---|---|---|
| ZAI-META-001 | skill-id-system | 1.0 | ACTIVE → SUPERSEDED | Content migrated to STD-SKILL-001 in v2.0; skill itself becomes a thin pointer |
| ZAI-META-002 | skill-creator | 1.1 | ACTIVE | Reads STD-SKILL-001 for ID system; no longer defines its own domains |

#### 4.16.9. User-Created (STS)

| ID | Skill | Version | Status |
|---|---|---|---|
| ZAI-STS-001 | prompt-engineering_sts | 1.1 | ACTIVE |
| ZAI-STS-002 | sync-toolkit_sts | 1.0 | ACTIVE |
| ZAI-STS-003 | performance-code-generator_sts | 1.0 | ACTIVE |
| ZAI-STS-004 | frontend-styling-expert_sts | 1.0 | ACTIVE |
| ZAI-STS-005 | phi-layout_sts | 3.0 | ACTIVE |
| ZAI-STS-006 | zai-ui-composer_sts | 1.1.2 | ACTIVE |
| ZAI-STS-007 | workflow-discipline_sts | 2.0 | ACTIVE |

#### 4.16.10. Sandbox System Skills (NO ZAI- PREFIX)

Per ZAI-META-001 §4 (preserved in STD-SKILL-001 §6), the following skills
live in the Z.ai sandbox at `/home/z/my-project/skills/` and do **not**
receive ZAI- prefix IDs. They are tracked by folder name only. The list
below is informational; the canonical list is maintained in STD-SKILL-001
§6. They include: `api-retry`, `dev-watchdog`, `fallback`, `gepetto`,
`health-check`, `humanizer`, `phi-layout`, `react-dev`, `reducing-entropy`,
`session-handoff`, `z-ai-web-dev-sdk`, plus sandbox-native skills such as
`fullstack-dev`, `docx`, `pdf`, `xlsx`, `pptx`, `charts`, etc.

### 4.17. Skill System Standard (STD-SKILL-001)

| ID | Document | Version | Level | Status |
|---|---|---|---|---|
| STD-SKILL-001 | Skill ID System Standard | 1.0.0 | [C] | ACTIVE (new in v2.0) |

> New standard hosted at `Z-ai-standards/standards/SKILL_ID_SYSTEM_STANDARD.md`.
> Supersedes the content of ZAI-META-001 (which becomes a thin pointer).
> See §8 for the migration map.

---

## 5. Header Format

Every normative artifact MUST carry a machine-readable header. v2.0 accepts
**three** header styles; all three are parsed by a single extractor (§5.4).

### 5.1. Blockquote Style (standards, top-level guard docs)

```markdown
# Standard: <Name> v<Version> (<Language>)

> ID: STD-<DOMAIN>-<NUMBER>
> Version: <Version>
> Level: **[<Level>] <Level Name>**
> Last Updated: <YYYY-MM>
> Related: <comma-separated IDs> (optional)
> Aligned_with: <comma-separated IDs> (optional, bidirectional)
> verified_by: <script path>#<check id> (optional)
```

### 5.2. HTML-Comment Style (rules inside AGENT_RULES.md, procedures, tools)

```markdown
<!-- ID: RULE-<DOMAIN>-<NUMBER> | ver:<version> | Level: <C|W|I> | Related: <comma-separated IDs> | Aligned_with: <comma-separated IDs> -->
```

The HTML-comment style is used inside `AGENT_RULES.md` and similar files
where the rule text needs to render as prose without a header blockquote
above each rule. The comment is invisible in rendered Markdown but trivial
to extract via regex. The `Aligned_with` field is optional and may be omitted.

### 5.3. YAML Frontmatter Style (skills, `SKILL.md` files)

```markdown
---
name: skill-name
description: Short description with trigger phrases
id: ZAI-<DOMAIN>-<NUMBER>
version: <Version>
compatibility: both | sandbox | ade
trigger: keyword1, keyword2, keyword3
author: <signature> (optional, for STS skills)
license: <license> (optional)
---

# Skill: <Name> v<Version>

> ID: ZAI-<DOMAIN>-<NUMBER>
> Version: <Version>
> Last Updated: <YYYY-MM>
> Related: <comma-separated IDs> (optional)
> Aligned_with: <comma-separated IDs> (optional)
```

The YAML frontmatter is the **canonical** declaration for skills; the
blockquote below the H1 heading is a redundant copy for human readability
and MUST match the frontmatter. The extractor (§5.4) reads frontmatter
preferentially; if frontmatter and blockquote disagree, the frontmatter
wins and the inconsistency is reported as warning W07.

#### 5.3.1. Required vs Optional Fields

| Field | Required | Notes |
|---|---|---|
| `name` | yes | Must match folder name (without `_sts` suffix for STS skills) |
| `description` | yes | Primary trigger; full sentences with context |
| `id` | yes | Must conform to §2 format |
| `version` | yes | SemVer |
| `compatibility` | yes | One of `both` / `sandbox` / `ade` (see §6.4) |
| `trigger` | recommended | Comma-separated keywords, 5–15 items |
| `author` | optional | Required for `STS` domain skills |
| `license` | optional | Default: MIT |

### 5.4. Unified Extractor Specification

`verify-id-graph.js` and `verify-standards.js` use a single extractor
function `extractIds(filePath)` that:

1. Reads the file as UTF-8.
2. Detects YAML frontmatter (delimited by `---\n` at start of file). If present:
   - Parses the frontmatter as YAML.
   - Extracts `id`, `version`, `compatibility`, `trigger`, `author`.
   - Looks for `Related:` and `Aligned_with:` in the blockquote immediately
     following the H1 heading.
3. Scans for blockquote headers: lines matching `^>\s*ID:\s*([A-Z]+-[A-Z]+-\d+)`.
4. Scans for HTML-comment headers: comments matching
   `<!--\s*ID:\s*([A-Z]+-[A-Z]+-\d+)\s*\|\s*ver:\s*([\d.]+)\s*\|\s*Level:\s*([CWI])\s*(?:\|\s*Related:\s*([^|]*))?\s*(?:\|\s*Aligned_with:\s*([^>]*))?\s*-->`.
5. Returns an array of `{ id, prefix, domain, number, version, level, related: string[], aligned_with: string[], compatibility, file, line }`.
6. Skips code-fenced regions (so example headers inside ``` ``` are ignored).

> A file MAY declare multiple IDs (e.g. `AGENT_RULES.md` declares 17 RULE-*
> IDs, one per rule; `SKILL.md` declares one ZAI- ID). The extractor returns
> all of them.

---

## 6. Layered Dependency Rules

The ID graph is a directed graph. There are **two** kinds of edges:

- **`Related:`** — directed dependency ("I depend on X"). Subject to DAG rules (§6.1).
- **`Aligned_with:`** — bidirectional peer alignment ("X and I are kept in sync"). Subject to symmetry rules (§6.3).

Both are checked by `verify-id-graph.js`.

### 6.1. `Related:` DAG Matrix

The source row may declare `Related:` to the target column:

| Source ↓ \ Target → | STD | RULE | PROC | TOOL | ZAI |
|---|---|---|---|---|---|
| **STD** | ✓ | ✗ | ✗ | ✗ | ✗ |
| **RULE** | ✓ | ✓ | ✓ | ✓ | ✓ |
| **PROC** | ✓ | ✓ | ✓ | ✓ | ✗ |
| **TOOL** | ✓ | ✓ | ✗ | ✓ | ✗ |
| **ZAI** | ✓ | ✓ | ✗ | ✓ | ✓ |

Reading the matrix:
- **STD → STD only.** A standard may reference other standards but nothing
  in lower layers. Standards describe what is true; they do not prescribe
  behavior, invoke procedures, or call tools/skills.
- **RULE → anything.** A rule may enforce a standard, reference another
  rule, invoke a procedure, call a tool, or delegate to a skill.
- **PROC → STD, RULE, PROC, TOOL.** A procedure may implement a rule,
  invoke another procedure, call a tool, or check against a standard. A
  procedure MUST NOT depend on a skill.
- **TOOL → STD, RULE, TOOL.** A tool may validate a standard, be invoked
  by a rule, or compose with another tool. A tool MUST NOT invoke a
  procedure or a skill.
- **ZAI → STD, RULE, TOOL, ZAI.** A skill may follow a standard, obey
  a rule, use a tool, or compose with another skill. A skill MUST NOT
  invoke a procedure (procedures are infrastructural, not user-callable).

### 6.2. Forbidden `Related:` Patterns (hard errors)

| ID | Pattern | Why forbidden |
|---|---|---|
| G07 | STD → (RULE/PROC/TOOL/ZAI) | Standards must be self-contained. |
| G08 | PROC → ZAI | Procedures are infrastructural; skills are user-facing. |
| G09 | TOOL → PROC | Tools are leaf nodes; procedures orchestrate tools, not vice versa. |
| G10 | TOOL → ZAI | Tools must not call skills (skills are higher-level compositions). |
| G11 | Any cycle (e.g. RULE-X → RULE-Y → RULE-X) | DAG invariant. |
| G12 | Self-reference (RULE-X → RULE-X) | Trivial cycle. |

### 6.3. `Aligned_with:` Symmetry Rules

`Aligned_with:` declares that two artifacts are kept in sync — typically a
standard and a skill that implements the same thresholds. This is NOT a
dependency; it is a peer relationship.

**Rules:**

1. `Aligned_with:` is symmetric but declared on one side only. If A declares
   `Aligned_with: B`, the extractor records an undirected edge `A ↔ B`.
   B does not need to reciprocally declare `Aligned_with: A` (but SHOULD,
   for human readability — warning W08 if it doesn't).
2. `Aligned_with:` may cross any layers — STD ↔ ZAI, STD ↔ RULE, etc. There
   is no direction restriction.
3. `Aligned_with:` edges are excluded from the DAG cycle check (G11). They
   form a separate undirected graph.
4. If A declares `Aligned_with: B`, then B's content MUST be consistent
   with A's content per the consistency rules in STD-DOC-002 §4 (numbers,
   names, status fields). `verify-id-graph.js` does not check this directly;
   it is enforced by `verify-docs` (TOOL-VERIFY-001) section 1.
5. An `Aligned_with:` declaration MUST have a corresponding `Related:` edge
   in at least one direction (A → B or B → A). This prevents "alignment
   without dependency" — alignment is a synchronization mechanism on top of
   an existing dependency, not a substitute for one.

### 6.4. Compatibility DAG (ZAI- skills only, when ID is present)

A `ZAI-` skill that declares an `id` field also declares a `compatibility`
field in YAML frontmatter. Skills without an ID MAY omit `compatibility`
(defaults to `both`).

| Value | Meaning |
|---|---|
| `both` | Works in both Z.ai Sandbox and ZCode Desktop ADE |
| `sandbox` | Only works in Z.ai Sandbox (requires z-ai-web-dev-sdk) |
| `ade` | Only works in ZCode ADE |

**Rules:**

| Source `compatibility` | May depend on target `compatibility` |
|---|---|
| `both` | `both` only |
| `sandbox` | `both`, `sandbox` |
| `ade` | `both`, `ade` |

**Hard error:**

| ID | Pattern |
|---|---|
| G14 | ZAI skill A with `compatibility: X` depends (via `Related:`) on ZAI skill B with `compatibility: Y`, where the (X, Y) pair is not in the allowed table above. Only applies when both A and B have IDs. |

> **Soft warning:**
>
>| ID | Pattern |
>|---|---|
>| W09 | ZAI skill with `compatibility` field but no `id` field (compatibility is meaningless without ID for graph tracking) |

The compatibility DAG is orthogonal to the ID DAG (§6.1). A skill may pass
G01–G12 (ID DAG valid) but fail G14 (compatibility DAG invalid). Both must
pass.

---

## 7. Cross-Layer References

### 7.1. In Documentation

```markdown
This procedure implements **RULE-ENV-008** by enforcing the sandbox
constraints declared in **STD-ENV-001** and **STD-ENV-002**.
```

### 7.2. In Code (procedure/tool scripts)

```bash
# PROC-COCHANGE-003 implements RULE-DOC-010 (Documentation sync).
# Validates co-change buddy invariant per STD-ARCH-001 §3.2.
```

### 7.3. In AI Prompts

```text
Follow RULE-ENV-008 for sandbox verification.
Apply STD-FE-001 limits for component size.
Invoke ZAI-ARCH-002 for the anti-monolith decomposition.
```

### 7.4. In Hooks

```bash
# pre-commit hook invokes:
#   PROC-LINECOUNT-004 (implements RULE-MONOLITH-012)
#   PROC-COCHANGE-003 (implements RULE-DOC-010)
# Both procedures call TOOL-VERIFY-002 (verify-standards.js)
# and TOOL-VERIFY-004 (verify-id-graph.js) as sub-checks.
```

### 7.5. Alignment Declarations

```markdown
# In STD-FE-001 (Frontend Development Standard):
> Aligned_with: ZAI-ARCH-002

# In ZAI-ARCH-002 (anti-monolith skill), frontmatter:
> Aligned_with: STD-FE-001, STD-DESIGN-001
```

### 7.6. Reference Syntax

References MUST use the full ID form `<PREFIX>-<DOMAIN>-<NUMBER>` in:
- prose (`RULE-ENV-008`)
- code comments (`# RULE-ENV-008`)
- HTML-comment markers (`Related: RULE-ENV-008,STD-ENV-001`)
- blockquote headers (`> Related: STD-ENV-001`)
- YAML frontmatter is not used for `Related:` / `Aligned_with:` (these go
  in the blockquote below the H1; the frontmatter carries only `id`,
  `version`, `compatibility`, `trigger`, etc.)

References MUST NOT use:
- bare numbers (`Rule 8`) — ambiguous after renumbering
- file paths alone (`see setup.sh`) — paths move, IDs don't
- titles alone (`see Sandbox Verification Rule`) — titles change

---

## 8. ID Migration Protocol

When the system is restructured, IDs MUST be migrated, not deleted.

### 8.1. When Migration Triggers

| Event | Action |
|---|---|
| Rule promoted to standard | Old `RULE-X` → `[DEPRECATED]`; new `STD-Y` created; cross-reference in registry |
| Standard demoted to rule | Old `STD-X` → `[DEPRECATED]`; new `RULE-Y` created |
| Rule merged into another rule | Old `RULE-X` → `[DEPRECATED]` with `superseded_by: RULE-Y`; `RULE-Y.related` updated |
| Skill moved between domains | ID changes from `ZAI-A-NNN` to `ZAI-B-NNN`; old ID `[DEPRECATED]` with `superseded_by` |
| Domain renamed | All IDs in that domain renumbered; old IDs `[DEPRECATED]` with `superseded_by` map published |
| Skill → Standard (content migration) | Old `ZAI-META-X` → `[SUPERSEDED]` with `superseded_by: STD-SKILL-Y`; the skill file becomes a thin pointer; new standard created |

### 8.2. Migration Window

A migrated ID remains resolvable for **one major version cycle** of the
owning repo. During the window:

1. The old ID is marked `[DEPRECATED]` (or `[SUPERSEDED]` for content
   migrations) in the registry, with `superseded_by: <NEW-ID>` field.
2. References to the old ID anywhere in the ecosystem produce a warning
   (not an error) from `verify-id-graph.js`.
3. After the next major version bump, references to the old ID become
   hard errors.

### 8.3. Migration Map Format

Each migration MUST be recorded in a `MIGRATIONS.md` file at the root of
the owning repo:

```markdown
## [3.0.0] - 2026-07-01

### Migrated
- RULE-008 → RULE-ENV-008  (renamed for domain consistency)
- RULE-009 → RULE-AGENT-009
- RULE-010 → RULE-DOC-010
- ...
```

`verify-id-graph.js` reads `MIGRATIONS.md` from each repo to resolve
references to deprecated IDs during the migration window.

### 8.4. Specific Migration: ZAI-META-001 → STD-SKILL-001

This is the largest migration in v2.0. The content of
`Z-ai-skills/skills/skill-id-system/SKILL.md` (ZAI-META-001) is moved
verbatim (with format adaptation) to
`Z-ai-standards/standards/SKILL_ID_SYSTEM_STANDARD.md` (STD-SKILL-001).

**After migration:**

| Artifact | Before | After |
|---|---|---|
| Skill ID System content | `Z-ai-skills/skills/skill-id-system/SKILL.md` (ZAI-META-001 v1.0) | `Z-ai-standards/standards/SKILL_ID_SYSTEM_STANDARD.md` (STD-SKILL-001 v1.0) |
| ZAI-META-001 file | (full skill, ~270 lines) | Thin pointer (~20 lines) — "Content moved to STD-SKILL-001; this skill remains for backward-compat trigger matching only" |
| ZAI-META-002 (skill-creator) | Defines its own domain list (12 domains, divergent from META-001) | Reads STD-SKILL-001; no longer defines domains; `Related: STD-SKILL-001` |
| Cross-references in standards | "see ZAI-META-001" | "see STD-SKILL-001" |
| Cross-references in skills | "see ZAI-META-001" | "see STD-SKILL-001" (ZAI-META-001 itself just redirects) |

**Migration map entry (in `Z-ai-skills/MIGRATIONS.md`):**

```markdown
## [1.0.0] - 2026-07-01

### Superseded
- ZAI-META-001 content → STD-SKILL-001  (skill → standard; skill file remains as thin pointer for backward-compat trigger matching)
```

The migration window is Z-ai-skills v1.x → v2.0.0. References to
`ZAI-META-001` in standards/rules/skills produce warning W01 during v1.x,
hard error G05 starting v2.0.0.

---

## 9. ID Assignment Procedure

### 9.1. Who Assigns

| Role | Authority |
|---|---|
| Z-ai-standards maintainer | New `STD-` IDs, new domains (core or skill), changes to STD-META-001 / STD-SKILL-001 |
| Z-ai-guard maintainer | New `RULE-`, `PROC-`, `TOOL-` IDs (in existing domains) |
| Z-ai-skills maintainer | New `ZAI-` IDs (in existing domains) |
| Any contributor | Propose new ID via Issue/PR to the owning repo |

### 9.2. Process

1. **Open Issue** in the owning repo proposing the new artifact and its
   tentative ID.
2. Maintainer reviews; assigns final ID from registry.
3. PR adds the artifact with the assigned ID in its header.
4. PR updates the registry:
   - `STD-*` IDs → STD-META-001 §4 (this document) or STD-SKILL-001 §4 for skill-system standards
   - `RULE-`/`PROC-`/`TOOL-` IDs → `Z-ai-guard/registry.json`
   - `ZAI-` IDs → STD-SKILL-001 §4 (the authoritative skill registry)
5. CI runs `verify-id-graph.js`; PR cannot merge if G01–G14 fail.

### 9.3. Numbering Rules

- Numbers go sequentially within `<PREFIX>-<DOMAIN>`: 001, 002, 003...
- Gaps are not allowed (no `RULE-ENV-008` if `RULE-ENV-007` doesn't exist).
- Deleted artifact: ID marked `[DEPRECATED]`, number not reassigned.

---

## 10. Validation

### 10.1. Per-Repo Checks (in each repo's CI)

| Check | Tool | Layer | Strictness |
|---|---|---|---|
| Header format conforms to §5 (STD/RULE/PROC/TOOL) | `verify-standards.js` (V05/V11) | per-repo | **HARD** |
| YAML frontmatter parses (ZAI skills) | `verify-standards.js` (V13a) | per-repo | **HARD** |
| Required fields `name`/`description`/`version` present (ZAI skills) | `verify-standards.js` (V13b) | per-repo | **HARD** |
| Registry in §4 is in sync with file headers (STD/RULE/PROC/TOOL) | `verify-standards.js` (V05 extended) | per-repo | **HARD** |
| Registry sync for ZAI skills (when `id` present) | `verify-standards.js` (V05b) | per-repo | **SOFT** |
| `Related:` references resolve within the repo | `verify-standards.js` (V12) | per-repo | **HARD** |
| YAML frontmatter and blockquote agree (for ZAI- skills with `id`) | `verify-standards.js` (V14) | per-repo | **SOFT** |
| `name` matches folder name (ZAI skills) | `verify-standards.js` (V11b) | per-repo | **HARD** |

### 10.2. Cross-Repo Checks (in Z-ai-platform CI)

| Check | Tool | Layer | Strictness |
|---|---|---|---|
| All IDs across all 4 repos are unique | `verify-id-graph.js` G01 | cross-repo | **SOFT** (only artifacts WITH IDs) |
| All `Related:` references resolve across repos | `verify-id-graph.js` G02 | cross-repo | **HARD** |
| `Related:` DAG has no cycles | `verify-id-graph.js` G03/G11 | cross-repo | **HARD** |
| All `Related:` edges conform to §6.1 matrix | `verify-id-graph.js` G04–G10 | cross-repo | **HARD** |
| No deprecated ID referenced outside migration window | `verify-id-graph.js` G05 | cross-repo | **HARD** |
| Every RULE has at least one Related (no orphans) | `verify-id-graph.js` G06 (warn) | cross-repo | SOFT |
| Every STD is referenced by ≥1 RULE/ZAI (no dead standards) | `verify-id-graph.js` G13 (warn) | cross-repo | SOFT |
| `Aligned_with:` symmetry: B reciprocates A's declaration | `verify-id-graph.js` W08 | cross-repo | SOFT |
| `Aligned_with:` has corresponding `Related:` edge | `verify-id-graph.js` G15 | cross-repo | **HARD** |
| Compatibility DAG valid (ZAI- skills only, when both have IDs) | `verify-id-graph.js` G14 | cross-repo | **SOFT** |

### 10.3. Exit Codes

`verify-id-graph.js` exits:
- `0` — all G01–G15 pass (warnings W01–W08 may be present)
- `1` — at least one G-check failed
- `2` — configuration error (missing repos, missing `MIGRATIONS.md`)

---

## 11. Backward Compatibility

### 11.1. v1.2 → v2.0

- All 20 `STD-*` IDs from v1.2 remain unchanged.
- v1.2 blockquote header format remains valid (§5.1).
- v1.2 `Related:` field semantics unchanged (now supplemented by `Aligned_with:`).
- `verify-standards.js` V05 continues to validate `STD-*` registry.

### 11.2. AHG v2.5.0 → Z-ai-guard v3.0.0

- `RULE-001`..`RULE-017` (legacy flat numbering) → `RULE-<DOMAIN>-NNN`.
- Migration map published in `Z-ai-guard/MIGRATIONS.md`.
- Legacy IDs remain resolvable for one major version (v3.x); removed in v4.0.

### 11.3. Toolkit v2.0.5 → Z-ai-skills v1.0.0

- All 24 `ZAI-*` IDs from toolkit v2.0.5 preserved unchanged.
- ZAI-META-001 content migrated to STD-SKILL-001; ZAI-META-001 becomes a
  thin pointer (still resolvable, marked `[SUPERSEDED]`).
- ZAI-META-002 (skill-creator) updated to read STD-SKILL-001.
- 11 sandbox system skills (api-retry, dev-watchdog, fallback, gepetto,
  health-check, humanizer, phi-layout, react-dev, reducing-entropy,
  session-handoff, z-ai-web-dev-sdk) remain without ZAI- IDs per
  STD-SKILL-001 §6.

### 11.4. Domain List Reconciliation

Before v2.0, two skill-internal documents disagreed on the domain list:
ZAI-META-001 listed 9 domains; ZAI-META-002 listed 12. v2.0 consolidates
to 13 skill domains (§3.2), with STD-SKILL-001 as the single source of
truth. Neither ZAI-META-001 nor ZAI-META-002 defines domains after v2.0.

---

## 12. FAQ

### Q: Why `ZAI-` and not `SKILL-`?

A: `ZAI-` was chosen in toolkit v2.0.5 to distinguish user-toolkit skills
from Z.ai sandbox built-in skills (which have no prefix) and ZCode Desktop
built-ins (which have no prefix). Renaming to `SKILL-` would break 24
existing IDs and every reference to them in standards, rules, and consumer
projects. The semantic role of `ZAI-` is identical to what `SKILL-` would
be; only the literal prefix differs.

### Q: Do all skills need a `ZAI-` ID?

A: **No.** IDs are optional for skills. A skill needs an ID only when
referenced by ID from a standard, rule, procedure, tool, or another
skill's `Related:` field. Most personal `_sts` skills do not need an ID.
The runtime sandbox matches skills by `name:` field in frontmatter, not
by ID. See STD-SKILL-001 §4.2 for the full criteria.

### Q: What about the 24 existing ZAI-* IDs from toolkit v2.0.5?

A: They are preserved unchanged. No migration, no rename. The registry
in §4.16 below is the reference. New skills may be added without IDs.

### Q: Why can't a standard reference a rule?

A: Standards describe what is true in a domain (e.g. "every commit message
has a type prefix"). Rules describe what agents must do about it (e.g.
"before pushing, run the commit-lint procedure"). If a standard could
reference a rule, the rule's lifecycle would constrain the standard's
lifecycle — but standards are meant to be slower-moving and more stable
than rules. The direction must be `RULE → STD`, never the reverse.

### Q: But STD-FE-001 currently references ZAI-ARCH-002 in its prose. Is that wrong?

A: No — that reference is `Aligned_with:`, not `Related:`. STD-FE-001 and
ZAI-ARCH-002 are kept in sync (the standard declares thresholds; the skill
decomposes when thresholds are exceeded). The bidirectional `Aligned_with:`
edge allows this without violating the `Related:` DAG. v2.0 formalizes
this distinction; previously it was implicit and uncheckable.

### Q: Why can't a tool invoke a procedure?

A: Tools are leaf nodes — they do one thing and exit. Procedures are
orchestrators that may call multiple tools. Allowing `TOOL → PROC` would
invert the dependency: a tool would need to know about higher-level
workflow, breaking composability.

### Q: Why can't a procedure invoke a skill?

A: Procedures run automatically (in hooks, CI). Skills are user-callable
capabilities that may require human input (parameter selection, approval).
A procedure invoking a skill would silently trigger user-facing behavior,
which is unsafe.

### Q: What if I need a rule that depends on a skill?

A: That's allowed (`RULE → ZAI` is green in the matrix). The rule says
"when condition X holds, the agent should invoke ZAI-Y". The rule does
not invoke the skill mechanically — it instructs the agent to do so. The
mechanical invocation (if any) would be a PROC, but PROC → ZAI is
forbidden, so any skill invocation is by agent decision, not by hook.

### Q: Can a standard reference another standard in a different repo?

A: Yes — `STD → STD` is allowed regardless of which repo each standard
lives in. All four repos share the same STD-* registry.

### Q: What happens to ZAI-META-001 after v2.0?

A: Its content (the skill ID system specification) moves to STD-SKILL-001
in Z-ai-standards. The ZAI-META-001 file remains in Z-ai-skills as a thin
pointer (~20 lines) that says "Content moved to STD-SKILL-001; this file
exists only so existing trigger phrases (`skill id`, `create skill`)
continue to resolve during the migration window." After Z-ai-skills v2.0.0,
ZAI-META-001 is removed entirely.

---

## 13. Cross-References

| Standard | Relationship |
|---|---|
| STD-ARCH-001 | Implementation Order — references all STD- IDs for project setup sequence |
| STD-DOC-002 | Markdown Standard — header format rules for standard documents (§5 of this standard) |
| STD-ENV-001 | Reproducibility — referenced by RULE-ENV-008 |
| STD-ENV-002 | Z.ai Integration — referenced by RULE-ENV-008 |
| STD-SKILL-001 | Skill ID System — full registry of ZAI- IDs; supersedes ZAI-META-001 content |
| STD-FE-001 | Aligned_with ZAI-ARCH-002 (anti-monolith thresholds) |
| STD-DESIGN-001 | Aligned_with ZAI-ARCH-002 (anti-monolith thresholds) |

---

## 15A. Known Issues and Proposed Solutions

This section documents discovered inconsistencies, missing content, and proposed corrections. Each issue has an ID, status, and proposed action. Issues resolved in the current version are marked `[RESOLVED]`; outstanding issues are marked `[OPEN]`.

### META-001 `[RESOLVED in v1.2]` — Registry out of sync with actual file versions

**Problem:** Prior to v1.2, the registry contained stale version numbers for many standards. The actual file versions (read from each standard's header) did not match the registry entries:

| ID | Registry (old) | File (actual) | Action taken |
|----|----------------|---------------|--------------|
| STD-FE-001 | 1.5 | 2.3 | Updated to 2.3 |
| STD-DOC-002 | 2.2.0 | 2.3.0 | Updated to 2.3.0 |
| STD-DOC-003 | 2.1.3 | 2.3.0 | Updated to 2.3.0 |
| STD-META-001 | 1.1 | 1.2 | Updated to 1.2 (this version) |

**Resolution:** Registry now reflects the actual file versions. Future version bumps in any standard MUST be accompanied by a registry update in the same change set (see §8.3 Synchronization).

### META-002 `[RESOLVED in v1.2]` — `FROZEN` status applied to actively maintained standards

**Problem:** Eight standards were marked `FROZEN` in the registry, but their files showed recent updates (`Last Updated: 2026-05` or later) and active version bumps in their Version History. The `FROZEN` status was therefore inconsistent with the actual maintenance state.

| ID | Old status | New status | Rationale |
|----|-----------|-----------|-----------|
| STD-A11Y-001 | DEPRECATED | ACTIVE | File v1.1 dated 2026-05, no deprecation notice in file |
| STD-DOC-004 | FROZEN | ACTIVE | File v2.1 dated 2026-05, no freeze notice |
| STD-DOC-005 | FROZEN | ACTIVE | File v1.1 dated 2026-05, no freeze notice |
| STD-TEST-001 | FROZEN | ACTIVE | File v1.1 dated 2026-05, no freeze notice |
| STD-ERR-002 | FROZEN | ACTIVE | File v1.0 dated 2026-05, no freeze notice |
| STD-SEC-002 | FROZEN | ACTIVE | File v1.0 dated 2026-05, no freeze notice |
| STD-AGENT-001 | FROZEN | ACTIVE | File v1.0 dated 2026-05, no freeze notice |
| STD-AGENT-002 | FROZEN | ACTIVE | File v1.0 dated 2026-05, no freeze notice |

**Resolution:** All eight entries updated to `ACTIVE`. To mark a standard as `FROZEN` in the future, the file itself MUST contain a `**STATUS: FROZEN**` line in the header, and the registry entry MUST cite the freeze date.

### META-003 `[RESOLVED in v1.2]` — Missing `DESIGN` domain and `STD-DESIGN-001` entry

**Problem:** The `DESIGN` domain was not listed in §3 (Reserved Domains), and `STD-DESIGN-001` (Design System Standard, file `DESIGN-001-design-system.md`, v3.0.0) was absent from §4 (ID Registry) entirely. This meant a shipped, actively-maintained standard had no registered ID.

**Resolution:** Added `DESIGN` to §3 domain table. Added new §4.11 "Design System (DESIGN)" subsection with the `STD-DESIGN-001` entry (v3.0.0, [C]+[W], ACTIVE). Renumbered the META subsection from §4.11 to §4.12.

### META-004 `[OPEN]` — `STD-DOC-001` entry references a file that is not shipped

**Problem:** §4.4 lists `STD-DOC-001 | Markdown Standard (RU) | 2.1.5 | [W] Warning | DEPRECATED`. The file `DOC-002-markdown-standard.md` is not present in the standards directory — only the English version (STD-DOC-002) is shipped. The deprecated entry therefore references a non-existent artifact.

**Proposed solution:** Keep the entry as a historical record (deprecated IDs are not reassigned per §9.2), but the Status column now reads `DEPRECATED (file not shipped; superseded by STD-DOC-002)` to make the artifact's absence explicit. Alternative: remove the entry entirely and rely on git history. Current decision: keep with explicit "file not shipped" note.

### META-005 `[RESOLVED in DOC-002 v2.4.0]` — Level `[C]` vs `[W]` ambiguity for STD-DOC-002

**Problem:** `DOC-002-markdown-standard.md` (STD-DOC-002) header said `Level: **[C] Critical** (unified with STD-DOC-003 — same rule = same severity)`. Its footer said `Document complies with MARKDOWN_STANDARD v2.3 (level [W])`. `ARCH-002-implementation-order.md` §1 Group B table listed it as `[W]`. There was a three-way contradiction.

**Resolution (DOC-002 v2.4.0, 2026-06):** Adopted `[C] Critical` as the authoritative level — matching the v2.3.0 design intent of "same rule = same severity" with STD-DOC-003. All visible contradictions are now closed:

1. DOC-002 header (§0) — was already `[C]`, unchanged.
2. DOC-002 footer — updated from `(level [W])` to `(level [C])`.
3. DOC-002 §9.1 — rewritten from `[W] non-blocking` to `[C] blocking` policy with `eslint-disable` + Tech Lead approval workflow.
4. ARCH-002 §1 Group B table — updated from `[W]` to `[C]`.
5. DOC-002 §10.3 and §10.4 ESLint configs — `no-emoji-in-md` and `no-unicode-graphics-in-md` changed from `"warn"` to `"error"` (closes MD-003 too).
6. META-001 §4.1–4.12 — collapsed table; the historical `[W]` was carried forward from v1.2 but is no longer visible. No literal row to update; the canonical level is now `[C]` per DOC-002 header and ARCH-002 §1 Group B.

See STD-DOC-002 Known Issues entry MD-001 for the cross-reference.

### META-006 `[OPEN]` — No automation to detect registry drift

**Problem:** The registry is maintained manually. There is no script that compares each standard's header version against the registry entry, so drift (as in META-001) recurs silently. The previous drift went undetected for at least one minor-version cycle.

**Proposed solution:** Add a `lint-registry.js` script that:
1. Reads each `*.md` file's header (`Version:` and `Level:` fields).
2. Reads this document's §4 registry tables.
3. Reports any mismatch in version, level, or status.
4. Runs in CI on every push that touches any standard file or this registry.

The script should live in `eslint-rules/` or `scripts/` per the project's tooling convention.

---

---

## 14. Checklist Before Publishing New ID

- [ ] ID assigned from the correct registry section (§4.1–4.17)
- [ ] Header conforms to §5.1 (blockquote), §5.2 (HTML-comment), or §5.3 (YAML frontmatter)
- [ ] All `Related:` references conform to §6.1 DAG matrix
- [ ] All `Aligned_with:` declarations have a corresponding `Related:` edge (§6.3 rule 5)
- [ ] For ZAI- skills: `compatibility` field set; G14 compatibility DAG valid
- [ ] If migration: old ID marked `[DEPRECATED]`/`[SUPERSEDED]` with `superseded_by`; entry in `MIGRATIONS.md`
- [ ] `verify-id-graph.js` exits 0 with the new artifact in place
- [ ] Owning repo's `registry.json` (or STD-META-001 §4, or STD-SKILL-001 §4) updated

---

*End of STD-META-001 v2.0 — APPROVED 2026-06-17.*
