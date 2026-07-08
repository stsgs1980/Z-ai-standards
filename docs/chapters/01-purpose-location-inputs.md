# verify-id-graph.js — Chapter 1: Purpose, Location & Inputs

> **Part of:** TOOL-VERIFY-004 Specification v1.0
> **Covers:** Sections 1–3 of the full spec

---

## 1. Purpose

`verify-id-graph.js` is the cross-repository invariant checker for the ID
system defined in STD-META-001 v2.0 and STD-SKILL-001 v1.0. Where
`verify-standards.js` checks the format and internal consistency of a
single repo, `verify-id-graph.js` checks the **dependency graph** spanning
all four repositories of the Z-ai ecosystem:

```text
Z-ai-platform  (meta — no IDs declared, scanned for references only)
Z-ai-standards (L1: STD-*)
Z-ai-guard     (L2: RULE-*, PROC-*, TOOL-*)
Z-ai-skills    (L3: ZAI-*)
```

It builds a directed graph of `<ID> -> <ID>` edges from the `Related:`
fields of every artifact's header, plus an undirected graph of
`<ID> <-> <ID>` edges from the `Aligned_with:` fields, then validates that:

1. The `Related:` graph has no duplicate IDs across repos (G01)
2. All `Related:` references resolve (G02)
3. The `Related:` graph is acyclic (G03, G11)
4. All `Related:` edges conform to the layer-dependency matrix (G04–G10)
5. No deprecated ID referenced outside migration window (G05)
6. No orphan rules or dead standards (G06, G13, warnings)
7. `Aligned_with:` declarations have a corresponding `Related:` edge (G15)
8. `Aligned_with:` declarations are reciprocated (W08)
9. ZAI- skills' `compatibility` field forms a valid DAG (G14)
10. ZAI- skills' YAML frontmatter agrees with their blockquote (W07)

---

## 2. Location & Invocation

### 2.1. File Location

```text
Z-ai-standards/scripts/verify-id-graph.js
```

Lives in Z-ai-standards (Layer 1) because it validates standards
(STD-META-001 v2.0 and STD-SKILL-001 v1.0). Although it scans all 4
repos, it is itself owned by the standards repo — same as
`verify-standards.js`.

### 2.2. Invocation

```bash
# From Z-ai-platform root (where all 4 submodules are checked out):
node standards/scripts/verify-id-graph.js

# CI mode (skips network checks, fails fast):
node standards/scripts/verify-id-graph.js --ci

# JSON output for CI integration:
node standards/scripts/verify-id-graph.js --json

# Verbose (prints full graph):
node standards/scripts/verify-id-graph.js --verbose

# Limit to specific repos (debug):
node standards/scripts/verify-id-graph.js --only=standards,guard

# Fail on warnings too:
node standards/scripts/verify-id-graph.js --fail-on-warnings
```

### 2.3. Exit Codes

| Code | Meaning                                                                    |
| ---- | -------------------------------------------------------------------------- |
| 0    | All G01–G15 pass. W01–W08 may be present (unless `--fail-on-warnings`).    |
| 1    | At least one G-check failed.                                               |
| 2    | Configuration error (missing repos, missing `MIGRATIONS.md`, parse error). |

---

## 3. Inputs

### 3.1. Repository Discovery

The script discovers the four repos via the following priority order:

1. **`--root=<path>`** CLI argument (overrides everything)
2. **`ZAI_PLATFORM_ROOT`** environment variable
3. **Auto-detect from script location**: walk up from `__dirname` until a
   `.gitmodules` file is found containing entries for `Z-ai-standards`,
   `Z-ai-guard`, `Z-ai-skills`. That directory is the platform root.
4. **Fallback**: assume the script lives at
   `<platform>/standards/scripts/verify-id-graph.js` and the other repos
   are at `<platform>/guard/` and `<platform>/skills/`.

If discovery fails, exit 2 with a diagnostic.

### 3.2. Files Scanned Per Repo

| Repo           | Glob patterns                                                                                                 | What's extracted                                                    |
| -------------- | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| Z-ai-standards | `standards/**/*.md`, `STANDARDS.md`, `*.md` (root)                                                            | All `STD-*` IDs + headers                                           |
| Z-ai-guard     | `AGENT_RULES.md`, `rules/**/*.md`, `instructions/**/*.md`, `scripts/**/*.{sh,js,ts}`, `tools/**/*.{md,ts,js}` | All `RULE-*`, `PROC-*`, `TOOL-*` IDs                                |
| Z-ai-skills    | `skills/**/SKILL.md`, `skills/**/*.md`                                                                        | All `ZAI-*` IDs (from YAML frontmatter + blockquote)                |
| Z-ai-platform  | `*.md`, `docs/**/*.md`, `templates/**/*.md`                                                                   | No IDs declared (platform is meta); scanned for **references** only |

### 3.3. Migrations File

Each repo MAY have a `MIGRATIONS.md` at its root. The format is defined
in STD-META-001 §8.3. The script parses it to resolve references to
deprecated IDs during the migration window.

### 3.4. Configuration File (optional)

`<platform>/.verify-id-graph.json` (optional, all fields have defaults):

```json
{
  "repos": {
    "standards": "standards/",
    "guard": "guard/",
    "skills": "skills/"
  },
  "fail_on_warnings": false,
  "skip_checks": [],
  "extra_globs": {
    "guard": ["wiki/**/*.md"]
  }
}
```
