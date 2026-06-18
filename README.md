# Z-ai-standards

> Layer: L1 — Standards
> Owning standard: STD-META-001 v2.0
> Last Updated: 2026-06-18

This repository hosts the **normative standards**, **templates**, and **guides**
for the Z-ai ecosystem. Standards describe **what is true** in a domain —
they are slower-moving, more stable, and may be referenced by rules, procedures,
tools, and skills in lower layers.

## Repository Layout

```
Z-ai-standards/
├── README.md                              # This file — start here
├── MIGRATIONS.md                          # ID migration log (read by verify-id-graph.js)
│
├── standards/                             # Normative standards (STD-* IDs)
│   ├── architecture/                      # STD-ARCH — repo layout, install order
│   ├── documentation/                     # STD-DOC — markdown, unicode policy
│   ├── design/                            # STD-DESIGN — design system
│   ├── frontend/                          # STD-FE — React/Next.js frontend
│   ├── accessibility/                     # STD-A11Y — WCAG 2.1 AA
│   ├── errors/                            # STD-ERR — handling + recovery
│   ├── security/                          # STD-SEC — core + extended
│   ├── github/                            # STD-GIT — production + sandbox
│   ├── testing/                           # STD-TEST — coverage, gates
│   ├── agents/                            # STD-AGENT — subagent + orchestration
│   ├── environment/                       # STD-ENV — reproducibility + Z.ai integration
│   ├── meta/                              # STD-META — standard ID system
│   └── skills/                            # STD-SKILL — skill format
│
├── templates/                             # Copy-and-fill-in artifacts (NOT standards)
│   └── README_TEMPLATE.md                 # STD-DOC-004 — README template
│
├── guides/                                # How-to instructions (NOT normative)
│   └── CODE_EXAMPLES_GUIDE.md             # STD-DOC-005 — code block formatting guide
│
├── scripts/                               # Verification tools (TOOL-* IDs)
│   ├── verify-standards.js                # TOOL-VERIFY-002 — V01-V10 per-repo invariants
│   ├── verify-cascade.js                  # TOOL-VERIFY-003 — historical cascade checks
│   ├── verify-id-graph.js                 # TOOL-VERIFY-004 — cross-repo ID graph (G01-G15)
│   └── cross-doc-consistency-check.js     # Block 1.2 inter-draft check
│
└── docs/                                  # Specifications for tools
    └── verify-id-graph-spec-v1.0.md
```

## Standards Index

Each domain folder in `standards/` contains both **formalized** files
(named `STD-<DOMAIN>-<NNN>-v<X.Y>.md` per STD-META-001 v2.0) and **working drafts**
(named by semantic convention, e.g. `MARKDOWN_STANDARD.md`). Working drafts are
the authoritative source of content; formalized files are the canonical ID anchors.

### STD-ARCH — Architecture & Repo Layout

| File | ID | Version | Status |
|---|---|---|---|
| `architecture/STD-ARCH-001-v1.0.md` | STD-ARCH-001 | 1.0.0 | APPROVED |
| `architecture/IMPLEMENTATION_ORDER.md` | STD-ARCH-001 | (legacy form) | Working draft |

### STD-DOC — Documentation Format

| File | ID | Version | Status |
|---|---|---|---|
| `documentation/STD-DOC-002-v0.1.md` | STD-DOC-002 | 0.1.0 | STUB |
| `documentation/MARKDOWN_STANDARD.md` | STD-DOC-002 | 2.3.1 | Working draft (full content) |
| `documentation/UNICODE_POLICY.md` | STD-DOC-003 | 2.3.0 | Working draft (no formalized counterpart yet) |
| `templates/README_TEMPLATE.md` | STD-DOC-004 | 2.2.0 | Template (not a normative file) |
| `guides/CODE_EXAMPLES_GUIDE.md` | STD-DOC-005 | 1.3.0 | Guide (not a normative file) |

### STD-DESIGN — Design System

| File | ID | Version | Status |
|---|---|---|---|
| `design/DESIGN_SYSTEM_STANDARD.md` | STD-DESIGN-001 | 3.0.1 | Working draft (no formalized counterpart yet) |

### STD-FE — Frontend Development

| File | ID | Version | Status |
|---|---|---|---|
| `frontend/FRONTEND_STANDARD.md` | STD-FE-001 | 2.4.0 | Working draft (no formalized counterpart yet) |

### STD-A11Y — Accessibility

| File | ID | Version | Status |
|---|---|---|---|
| `accessibility/WCAG_2.1_AA_STANDARD.md` | STD-A11Y-001 | 1.2.0 | Working draft (no formalized counterpart yet) |

### STD-ERR — Error Handling & Recovery

| File | ID | Version | Status |
|---|---|---|---|
| `errors/ERROR_HANDLING_STANDARD.md` | STD-ERR-001 | 2.1.0 | Working draft (no formalized counterpart yet) |
| `errors/ERROR_RECOVERY_STANDARD.md` | STD-ERR-002 | 1.1.0 | Working draft (no formalized counterpart yet) |

### STD-SEC — Security

| File | ID | Version | Status |
|---|---|---|---|
| `security/SECURITY_STANDARD.md` | STD-SEC-001 | 2.1.0 | Working draft (no formalized counterpart yet) |
| `security/SECURITY_EXTENDED_STANDARD.md` | STD-SEC-002 | 1.1.0 | Working draft (no formalized counterpart yet) |

### STD-GIT — GitHub Workflow

| File | ID | Version | Status |
|---|---|---|---|
| `github/GITHUB_STANDARD.md` | STD-GIT-001 | 2.1.0 | Working draft (no formalized counterpart yet) |
| `github/GITHUB_SANDBOX_STANDARD.md` | STD-GIT-002 | 1.1.0 | Working draft (no formalized counterpart yet) |

### STD-TEST — Testing

| File | ID | Version | Status |
|---|---|---|---|
| `testing/TESTING_STANDARD.md` | STD-TEST-001 | 1.2.0 | Working draft (no formalized counterpart yet) |

### STD-AGENT — Multi-Agent Coordination

| File | ID | Version | Status |
|---|---|---|---|
| `agents/SUBAGENT_STANDARD.md` | STD-AGENT-001 | 1.1.0 | Working draft (no formalized counterpart yet) |
| `agents/ORCHESTRATION_STANDARD.md` | STD-AGENT-002 | 1.1.0 | Working draft (no formalized counterpart yet) |

### STD-ENV — Environment & Reproducibility

| File | ID | Version | Status |
|---|---|---|---|
| `environment/STD-ENV-001-v0.1.md` | STD-ENV-001 | 0.1.0 | STUB |
| `environment/REPRODUCIBILITY_STANDARD.md` | STD-ENV-001 | 2.1.0 | Working draft (full content) |
| `environment/STD-ENV-002-v0.1.md` | STD-ENV-002 | 0.1.0 | STUB |
| `environment/ZAI_INTEGRATION_STANDARD.md` | STD-ENV-002 | 1.2.0 | Working draft (full content) |

### STD-META — Meta (Standards About Standards)

| File | ID | Version | Status |
|---|---|---|---|
| `meta/STD-META-001-v2.0.md` | STD-META-001 | 2.0.0 | APPROVED |
| `meta/STANDARD_ID_SYSTEM.md` | STD-META-001 | 1.2.0 | Working draft (older form — content partially migrated to v2.0) |

### STD-SKILL — Skill Format

| File | ID | Version | Status |
|---|---|---|---|
| `skills/STD-SKILL-001-v1.0.md` | STD-SKILL-001 | 1.0.0 | APPROVED |

## Cross-Domain Navigation

Use this map to find related standards when working in one domain:

| When working on... | Also check... |
|---|---|
| **Frontend** (`standards/frontend/`) | `accessibility/` (WCAG), `design/` (tokens), `errors/` (boundary patterns) |
| **Errors** (`standards/errors/`) | `agents/` (error propagation in orchestration), `frontend/` (Error Boundary) |
| **Security** (`standards/security/`) | `environment/` (secrets, env), `github/` (push protection) |
| **GitHub** (`standards/github/`) | `testing/` (CI gates), `environment/` (sandbox git rules) |
| **Documentation** (`standards/documentation/`) | `templates/`, `guides/` — apply rules via these artifacts |
| **Design** (`standards/design/`) | `frontend/` (token consumption), `accessibility/` (contrast) |
| **Agents** (`standards/agents/`) | `errors/` (recovery), `testing/` (subagent test isolation) |
| **Environment** (`standards/environment/`) | `github/` (sandbox git ops), `security/` (secrets) |
| **Meta** (`standards/meta/`) | Every other folder — meta defines the ID system all use |

## Verification

Every PR that touches a `.md` file in this repo MUST pass:

```bash
node scripts/verify-standards.js   # V01-V10 per-repo invariants
node scripts/verify-id-graph.js    # G01-G15 cross-repo invariants (when other repos available)
```

The pre-commit hook (installed via `Z-ai-platform/install-hooks.sh`) runs
`verify-standards.js` automatically. Cross-repo checks run in CI.

> **Note:** `verify-standards.js` currently targets the old flat layout
> (`standards/STD-*-vX.Y.md`). After this restructure, paths must be updated to
> `standards/<domain>/STD-*-vX.Y.md`. This is tracked as a follow-up task.

## Adding a New Standard

1. Pick the next available ID in the appropriate domain (see STD-META-001 §4)
2. Identify the target folder: `standards/<domain>/`
3. Create `standards/<domain>/STD-<DOMAIN>-<NNN>-v1.0.md` with proper header
4. Add entry to the relevant domain table in this README
5. Run `node scripts/verify-standards.js` — must pass
6. Commit with message: `feat(std): STD-<DOMAIN>-<NNN> v1.0 <name>`

## Migration Window

Active migrations are tracked in `MIGRATIONS.md`. The current window:

- **M001**: `ZAI-META-001` → `STD-SKILL-001` (superseded) — window open until Z-ai-skills v2.0.0
- **M002**: `RULE-001..RULE-017` → `RULE-<DOMAIN>-NNN` (renamed) — window NOT YET OPEN (pending Z-ai-guard creation)
- **M003**: `legacy/` flat layout → domain-folder layout (this restructure, 2026-06-18) — completed in commit `Restructure standards by domain`

## Changelog

| Version | Date | Change |
|---|---|---|
| 2.0.1 | 2026-06-18 | Restructured `standards/` into per-domain subfolders. Moved `README_TEMPLATE.md` to `templates/`. Moved `CODE_EXAMPLES_GUIDE.md` to `guides/`. Removed `legacy/` subfolder (files integrated into domain folders). Updated README with full standards index and cross-domain navigation. |
| 2.0.0 | 2026-06-17 | Initial formalized release. 6 standards formalized as `STD-*-vX.Y.md`. |
