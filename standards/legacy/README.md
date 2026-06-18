# Legacy Standards (Working Drafts)

> Status: ACTIVE — these are the working drafts used during the 2026-06 standards audit.
> Owning standard: STD-META-001 v2.0
> Last Updated: 2026-06-18

This folder contains **20 working-draft standards** maintained in semantic-name
form (e.g. `UNICODE_POLICY.md`) during the 2026-06 audit pass.

## Relationship to `../` (formalized standards)

The parent `standards/` folder uses the formalized naming convention
`STD-<DOMAIN>-<NNN>-v<X.Y>.md` per STD-META-001 v2.0. Six files there are
formalized (STD-ARCH-001, STD-DOC-002, STD-ENV-001, STD-ENV-002, STD-META-001,
STD-SKILL-001). Five of those six are still STUBs (v0.1) — their full content
lives in the corresponding legacy file here.

## Mapping: legacy → formalized

| Legacy file (here) | Formalized ID | Legacy version | Formalized version | Status |
|---|---|---|---|---|
| `IMPLEMENTATION_ORDER.md` | STD-ARCH-001 | — | v1.0 | Content migrated; legacy kept as reference |
| `MARKDOWN_STANDARD.md` | STD-DOC-002 | v2.3.1 | v0.1 STUB | Migration pending |
| `UNICODE_POLICY.md` | STD-DOC-003 | v2.3.0 | (not formalized) | Migration pending |
| `STANDARD_ID_SYSTEM.md` | STD-META-001 | v1.2 | v2.0 | Content migrated; legacy kept as reference |
| `REPRODUCIBILITY_STANDARD.md` | STD-ENV-001 | v2.1 | v0.1 STUB | Migration pending |
| `ZAI_INTEGRATION_STANDARD.md` | STD-ENV-002 | v1.2 | v0.1 STUB | Migration pending |
| `DESIGN_SYSTEM_STANDARD.md` | STD-DESIGN-001 | v3.0.1 | (not formalized) | Migration pending |
| `FRONTEND_STANDARD.md` | STD-FE-001 | v2.4 | (not formalized) | Migration pending |
| `TESTING_STANDARD.md` | STD-TEST-001 | v1.2 | (not formalized) | Migration pending |
| `SECURITY_STANDARD.md` | STD-SEC-001 | v2.1 | (not formalized) | Migration pending |
| `SECURITY_EXTENDED_STANDARD.md` | STD-SEC-002 | v1.1 | (not formalized) | Migration pending |
| `ERROR_HANDLING_STANDARD.md` | STD-ERR-001 | v2.1 | (not formalized) | Migration pending |
| `ERROR_RECOVERY_STANDARD.md` | STD-ERR-002 | v1.1 | (not formalized) | Migration pending |
| `GITHUB_STANDARD.md` | STD-GIT-001 | v2.1 | (not formalized) | Migration pending |
| `GITHUB_SANDBOX_STANDARD.md` | STD-GIT-002 | v1.1 | (not formalized) | Migration pending |
| `SUBAGENT_STANDARD.md` | STD-AGENT-001 | v1.1 | (not formalized) | Migration pending |
| `ORCHESTRATION_STANDARD.md` | STD-AGENT-002 | v1.1 | (not formalized) | Migration pending |
| `WCAG_2.1_AA_STANDARD.md` | STD-A11Y-001 | v1.2 | (not formalized) | Migration pending |
| `CODE_EXAMPLES_GUIDE.md` | STD-DOC-005 | v1.3 | (not formalized) | Migration pending |
| `README_TEMPLATE.md` | STD-DOC-004 | v2.2 | (not formalized) | Migration pending |

## Why both?

The 2026-06 audit pass added an in-place **§XA "Known Issues and Proposed
Solutions"** section to each of these 20 files. These sections document
cross-standard contradictions, version drift, and proposed fixes that were
discovered during the audit. Until each file is migrated to the formalized
naming convention, the legacy file remains the authoritative source for
content + audit findings.

## Verification hooks

The verifier scripts in `../../scripts/` (`verify-standards.js`,
`verify-cascade.js`, `verify-id-graph.js`) currently target the formalized
`standards/*.md` files. They do **not** yet check the `legacy/` folder. A
follow-up task is to extend `verify-standards.js` to also verify invariants
across `legacy/` (see V11..V15 proposed checks in STD-META-001 v1.2 §11A).

## See also

- `../` — formalized standards (STD-* naming)
- `../../MIGRATIONS.md` — ID migration log
- `../../README.md` — repo-level overview
