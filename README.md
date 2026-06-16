# Z-ai-standards

> Layer: L1 — Standards
> Owning standard: STD-META-001 v2.0
> Last Updated: 2026-06-17

This repository hosts the **normative standards** for the Z-ai ecosystem.
Standards describe **what is true** in a domain — they are slower-moving,
more stable, and may be referenced by rules, procedures, tools, and skills
in lower layers.

## Repository Layout

```
Z-ai-standards/
├── standards/                # The standards themselves (STD-* IDs)
│   ├── STD-META-001-v2.0.md  # Standard ID System (umbrella)
│   └── STD-SKILL-001-v1.0.md # Skill Format & Identification
├── scripts/                  # Verification tools (TOOL-* IDs)
│   ├── verify-standards.js   # TOOL-VERIFY-002 — V01-V10 per-repo invariants
│   ├── verify-cascade.js     # TOOL-VERIFY-003 — historical cascade checks
│   ├── verify-id-graph.js    # TOOL-VERIFY-004 — cross-repo ID graph (G01-G15)
│   └── cross-doc-consistency-check.js  # Block 1.2 inter-draft check
├── docs/                     # Specifications for tools
│   └── verify-id-graph-spec-v1.0.md
├── MIGRATIONS.md             # ID migration log (read by verify-id-graph.js)
└── README.md                 # This file
```

## Currently Released Standards

| ID | Name | Version | Effective Date | Level |
|---|---|---|---|---|
| STD-META-001 | Standard ID System | 2.0.0 | 2026-06-17 | [C] Critical |
| STD-SKILL-001 | Skill Format & Identification | 1.0.0 | 2026-06-17 | [B] Recommended |

## Verification

Every PR that touches a `.md` file in this repo MUST pass:

```bash
node scripts/verify-standards.js   # V01-V10 per-repo invariants
node scripts/verify-id-graph.js    # G01-G15 cross-repo invariants (when other repos available)
```

The pre-commit hook (installed via `Z-ai-platform/install-hooks.sh`) runs
`verify-standards.js` automatically. Cross-repo checks run in CI.

## Adding a New Standard

1. Pick the next available ID in the appropriate domain (see STD-META-001 §4)
2. Create `standards/STD-<DOMAIN>-<NNN>-v1.0.md` with proper header
3. Add entry to "Currently Released Standards" above
4. Run `node scripts/verify-standards.js` — must pass
5. Commit with message: `feat(std): STD-<DOMAIN>-<NNN> v1.0 <name>`

## Migration Window

Active migrations are tracked in `MIGRATIONS.md`. The current window:

- **M001**: `ZAI-META-001` → `STD-SKILL-001` (superseded) — window open until Z-ai-skills v2.0.0
- **M002**: `RULE-001..RULE-017` → `RULE-<DOMAIN>-NNN` (renamed) — window NOT YET OPEN (pending Z-ai-guard creation)
