# Z-ai-standards

> Layer: L1 — Standards
> Owning standard: STD-META-001 v2.0
> Last Updated: 2026-06-18

This repository hosts the **normative standards**, **templates**, and **guides**
for the Z-ai ecosystem. Standards describe **what is true** in a domain —
they are slower-moving, more stable, and may be referenced by rules, procedures,
tools, and skills in lower layers.


[![Next.js](https://img.shields.io/badge/Next.js-black?style=flat-square)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-61DAFB?style=flat-square)](https://react.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)


## Table of Contents

- [Repository Layout](#repository-layout)
- [Standards Installation Order](#standards-installation-order)
- [Currently Released Standards](#currently-released-standards)
- [Cross-Domain Navigation](#cross-domain-navigation)
- [Verification](#verification)
- [Adding a New Standard](#adding-a-new-standard)
- [Migration Window](#migration-window)
- [Changelog](#changelog)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [License](#license)

## Repository Layout

```text
Z-ai-standards/
├── README.md                              # This file — start here
├── MIGRATIONS.md                          # ID migration log (read by verify-id-graph.js)
│
├── standards/                             # 20 normative standards, flat layout
│   # Naming convention: <DOMAIN>-<NNN>-<name>.md
│   # Sorted alphabetically = grouped by domain automatically
│   │
│   # Architecture (install first)
│   ├── META-001-standard-id-system.md         # 1. ID system (foundation)
│   ├── ARCH-001-architecture-and-repo-layout.md  # 2. 4-repo split
│   ├── ARCH-002-implementation-order.md       # 3. THIS defines install order for all 20
│   │
│   # Documentation
│   ├── DOC-002-markdown-standard.md           # 4. Markdown formatting
│   ├── DOC-003-unicode-policy.md              # 5. No-emoji / no-box-drawing
│   │
│   # Skills
│   ├── SKILL-001-skill-format.md              # 6. Skill file format
│   │
│   # Environment
│   ├── ENV-001-reproducibility.md             # 7. L1-L4 reproducibility
│   ├── ENV-002-zai-integration.md             # 8. Z.ai sandbox integration
│   │
│   # GitHub
│   ├── GIT-001-github.md                      # 9. Production git workflow
│   ├── GIT-002-github-sandbox.md              # 10. Sandbox git rules
│   │
│   # Design + Frontend + Accessibility
│   ├── DESIGN-001-design-system.md            # 11. Design tokens
│   ├── FE-001-frontend.md                     # 12. React/Next.js frontend
│   ├── A11Y-001-wcag-2-1-aa.md                # 13. WCAG 2.1 AA
│   │
│   # Errors
│   ├── ERR-001-error-handling.md              # 14. Error classification
│   ├── ERR-002-error-recovery.md              # 15. Retry, circuit breaker
│   │
│   # Security
│   ├── SEC-001-security-core.md               # 16. OWASP Top 10, secrets
│   ├── SEC-002-security-extended.md           # 17. Auth, RBAC, rate limiting
│   │
│   # Testing
│   ├── TEST-001-testing.md                    # 18. Coverage gates
│   │
│   # Agents
│   ├── AGENT-001-subagent.md                  # 19. Subagent contracts
│   └── AGENT-002-orchestration.md             # 20. Multi-agent patterns
│
├── templates/                             # Non-normative copy-and-fill-in artifacts
│   └── templates/README_TEMPLATE.md                     # STD-DOC-004 — README template
│
├── guides/                                # Non-normative how-to guides
│   └── guides/CODE_EXAMPLES_GUIDE.md                 # STD-DOC-005 — code block formatting
│
├── scripts/                               # Verification tools (TOOL-* IDs)
│   ├── verify-standards.js                    # V01-V10 per-repo invariants
│   └── verify-id-graph.js                     # G01-G15 cross-repo ID graph
│
└── docs/                                  # Specifications for tools
    └── verify-id-graph-spec-v1.0.md
```

## Standards Installation Order

When onboarding a new project or agent, install (read + accept) the 20 standards
in this exact order. Each standard depends on concepts introduced by earlier
standards. The authoritative spec is **`standards/ARCH-002-implementation-order.md`**.

| # | ID | File | Prerequisites |
|---|---|---|---|
| 1 | STD-META-001 | `META-001-standard-id-system.md` | — |
| 2 | STD-ARCH-001 | `ARCH-001-architecture-and-repo-layout.md` | META-001 |
| 3 | STD-ARCH-002 | `ARCH-002-implementation-order.md` | META-001, ARCH-001 |
| 4 | STD-DOC-002 | `DOC-002-markdown-standard.md` | META-001, ARCH-002 |
| 5 | STD-DOC-003 | `DOC-003-unicode-policy.md` | DOC-002 |
| 6 | STD-SKILL-001 | `SKILL-001-skill-format.md` | META-001, DOC-002 |
| 7 | STD-ENV-001 | `ENV-001-reproducibility.md` | ARCH-001, DOC-002 |
| 8 | STD-ENV-002 | `ENV-002-zai-integration.md` | ENV-001 |
| 9 | STD-GIT-001 | `GIT-001-github.md` | ENV-001, DOC-002 |
| 10 | STD-GIT-002 | `GIT-002-github-sandbox.md` | GIT-001, ENV-002 |
| 11 | STD-DESIGN-001 | `DESIGN-001-design-system.md` | DOC-002, DOC-003 |
| 12 | STD-FE-001 | `FE-001-frontend.md` | ENV-001, DOC-002, DESIGN-001 |
| 13 | STD-A11Y-001 | `A11Y-001-wcag-2-1-aa.md` | FE-001, DESIGN-001 |
| 14 | STD-ERR-001 | `ERR-001-error-handling.md` | FE-001, DOC-002 |
| 15 | STD-ERR-002 | `ERR-002-error-recovery.md` | ERR-001 |
| 16 | STD-SEC-001 | `SEC-001-security-core.md` | ENV-001, GIT-001, DOC-002 |
| 17 | STD-SEC-002 | `SEC-002-security-extended.md` | SEC-001 |
| 18 | STD-TEST-001 | `TEST-001-testing.md` | FE-001, ERR-001, DOC-002 |
| 19 | STD-AGENT-001 | `AGENT-001-subagent.md` | ENV-001, GIT-001, DOC-002 |
| 20 | STD-AGENT-002 | `AGENT-002-orchestration.md` | AGENT-001, ERR-001 |

### Non-normative companions (not in install order)

| ID | File | Purpose |
|---|---|---|
| STD-DOC-004 | `templates/README_TEMPLATE.md` | README template — applied during project setup step 6 |
| STD-DOC-005 | `guides/CODE_EXAMPLES_GUIDE.md` | Code block formatting guide — applied throughout steps 3-6 |

## Currently Released Standards

| ID | Name | Version | Effective Date | Level |
|---|---|---|---|---|
| STD-META-001 | Standard ID System | 2.0.0 | 2026-06-17 | [C] Critical |
| STD-ARCH-001 | Architecture & Repo Layout | 1.0.0 | 2026-06-17 | [C] Critical |
| STD-ARCH-002 | Implementation Order | 2.4.0 | 2026-06-18 | [C] Critical |
| STD-SKILL-001 | Skill Format & Identification | 1.0.0 | 2026-06-17 | [B] Recommended |
| STD-DOC-002 | Markdown Formatting | 2.3.1 | 2026-06-18 | [W] Warning |
| STD-DOC-003 | No-Unicode Policy | 2.3.0 | 2026-06-18 | [C]+[W]+[I] |
| STD-DOC-004 | README Template | 2.2.0 | 2026-06-18 | [W] (non-normative) |
| STD-DOC-005 | Code Examples Guide | 1.3.0 | 2026-06-18 | [W] (non-normative) |
| STD-ENV-001 | Reproducibility | 2.1.0 | 2026-06-18 | [C] Critical |
| STD-ENV-002 | Z.ai Integration | 1.2.0 | 2026-06-18 | [C] Critical |
| STD-GIT-001 | GitHub Core | 2.1.0 | 2026-06-18 | [C] Critical |
| STD-GIT-002 | GitHub Sandbox | 1.1.0 | 2026-06-18 | [C] Critical |
| STD-DESIGN-001 | Design System | 3.0.1 | 2026-06-18 | [C]+[W] |
| STD-FE-001 | Frontend Development | 2.4.0 | 2026-06-18 | [C] Critical |
| STD-A11Y-001 | WCAG 2.1 AA Accessibility | 1.2.0 | 2026-06-18 | [C] Critical |
| STD-ERR-001 | Error Handling Core | 2.1.0 | 2026-06-18 | [C] Critical |
| STD-ERR-002 | Error Recovery | 1.1.0 | 2026-06-18 | [C] Critical |
| STD-SEC-001 | Security Core | 2.1.0 | 2026-06-18 | [C] Critical |
| STD-SEC-002 | Security Extended | 1.1.0 | 2026-06-18 | [C] Critical |
| STD-TEST-001 | Testing | 1.2.0 | 2026-06-18 | [C] Critical |
| STD-AGENT-001 | Subagent | 1.1.0 | 2026-06-18 | [C] Critical |
| STD-AGENT-002 | Orchestration | 1.1.0 | 2026-06-18 | [C] Critical |

## Cross-Domain Navigation

Use this map to find related standards when working in one domain:

| When working on... | Also check... |
|---|---|
| **Frontend** (`FE-001`) | `A11Y-001` (WCAG), `DESIGN-001` (tokens), `ERR-001` (boundary patterns) |
| **Errors** (`ERR-001`, `ERR-002`) | `AGENT-002` (error propagation), `FE-001` (Error Boundary) |
| **Security** (`SEC-001`, `SEC-002`) | `ENV-001` (secrets, env), `GIT-001` (push protection) |
| **GitHub** (`GIT-001`, `GIT-002`) | `TEST-001` (CI gates), `ENV-002` (sandbox git rules) |
| **Documentation** (`DOC-002`, `DOC-003`) | `templates/`, `guides/` — apply rules via these artifacts |
| **Design** (`DESIGN-001`) | `FE-001` (token consumption), `A11Y-001` (contrast) |
| **Agents** (`AGENT-001`, `AGENT-002`) | `ERR-001` (recovery), `TEST-001` (subagent test isolation) |
| **Environment** (`ENV-001`, `ENV-002`) | `GIT-001` (sandbox git ops), `SEC-001` (secrets) |
| **Meta** (`META-001`) | Every other file — meta defines the ID system all use |
| **Architecture** (`ARCH-001`, `ARCH-002`) | Every other file — `ARCH-002` defines the install order |

## Verification

Every PR that touches a `.md` file in this repo MUST pass:

```bash
node scripts/verify-standards.js   # V04-V10 per-repo invariants
node scripts/verify-id-graph.js    # G01-G15 cross-repo invariants (when other repos available)
```

The pre-commit hook (installed via `Z-ai-platform/install-hooks.sh` in the
parent repo, or `bash install-hooks.sh` in this submodule when working
standalone) runs `verify-standards.js` automatically. Cross-repo checks
run in CI and in the parent repo's pre-commit hook (which runs both
verifiers).

## Adding a New Standard

1. Pick the next available ID in the appropriate domain (see STD-META-001 §4)
2. Determine install position from ARCH-002-implementation-order.md §1
3. Create `standards/<DOMAIN>-<NNN>-<name>.md` with proper header (ID, Version, Level, Status, verified_by, Related)
4. Add entry to the "Standards Installation Order" table above
5. Add entry to the "Currently Released Standards" table above
6. Run `node scripts/verify-standards.js` — must pass
7. Commit with message: `feat(std): STD-<DOMAIN>-<NNN> v1.0 <name>`

## Migration Window

Active migrations are tracked in `MIGRATIONS.md`. The current window:

- **M001**: `ZAI-META-001` → `STD-SKILL-001` (superseded) — window open until Z-ai-skills v2.0.0
- **M002**: `RULE-001..RULE-017` → `RULE-<DOMAIN>-NNN` (renamed) — window NOT YET OPEN (pending Z-ai-guard creation)
- **M003**: `legacy/` flat layout → `standards/` flat layout with `<DOMAIN>-<NNN>-<name>.md` naming — completed 2026-06-18
- **M004**: `ARCH-002-implementation-order.md` (was STD-ARCH-001) → `ARCH-002-implementation-order.md` (new ID STD-ARCH-002) — completed 2026-06-18

## Changelog

| Version | Date | Change |
|---|---|---|
| 2.1.0 | 2026-06-18 | Flat layout: renamed all 20 standards to `<DOMAIN>-<NNN>-<name>.md` convention. Merged 3 STUBs (DOC-002, ENV-001, ENV-002) with their working drafts — full content now in formalized file. Merged `META-001-standard-id-system.md` (v1.2 working draft) into `META-001-standard-id-system.md` (v2.0 formalized) — §XA Known Issues preserved. Split ARCH into ARCH-001 (architecture) + ARCH-002 (implementation order, new ID). Updated README with install order table for all 20 standards. |
| 2.0.1 | 2026-06-18 | Restructured `standards/` into per-domain subfolders. Moved `templates/README_TEMPLATE.md` to `templates/`. Moved `guides/CODE_EXAMPLES_GUIDE.md` to `guides/`. Removed `legacy/` subfolder. |
| 2.0.0 | 2026-06-17 | Initial formalized release. 6 standards formalized as `STD-*-vX.Y.md`. |


## Features

- Feature 1 - description
- Feature 2 - description


## Tech Stack

- **Framework** - Next.js
- **Tools** - React


## Getting Started

### Prerequisites

- Node.js 20+ or Bun

### Installation

```bash
git clone https://github.com/stsgs1980/Z-ai-standards.git
cd Z-ai-standards
bun install
```

### Run

```bash
bun run dev
```

## License

[MIT](LICENSE)
