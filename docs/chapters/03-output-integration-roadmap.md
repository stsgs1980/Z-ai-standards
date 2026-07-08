# verify-id-graph.js — Chapter 3: Output, Integration & Roadmap

> **Part of:** TOOL-VERIFY-004 Specification v1.0
> **Covers:** Sections 6–10 of the full spec

---

## 6. Output Format

### 6.1. Human-Readable (default)

```text
verify-id-graph.js v1.0.0
Platform root: /home/user/Z-ai-platform
Repos scanned: 4 (standards, guard, skills, platform)
IDs extracted: 73 (20 STD, 17 RULE, 7 PROC, 6 TOOL, 24 ZAI [incl. 1 SUPERSEDED])
Related: edges: 142
Aligned_with: edges: 8 (6 reciprocated, 2 non-reciprocal)

Phase 1:  Extract IDs ..................... PASS (73 IDs, 3 header formats)
Phase 2:  Catalog .......................... PASS (no duplicates)
Phase 3:  Build edges ...................... PASS (142 Related, 8 Aligned_with)
Phase 4:  Validate references .............. PASS (all resolve)
Phase 5:  Validate layer edges ............. PASS (matrix OK)
Phase 6:  Cycle detection (Related) ........ PASS (DAG confirmed)
Phase 7:  Aligned_with symmetry ............ PASS (G15) + 2 warnings (W08)
Phase 8:  Compatibility DAG ................ PASS (G14, ZAI->ZAI only)
Phase 9:  Frontmatter consistency .......... PASS (no W07)
Phase 10: Orphan & dead-code warnings ...... WARN (3 warnings)

Checks:
  G01 No duplicate IDs ............... PASS
  G02 References resolve .............. PASS
  G03 No cycles ........................ PASS
  G04 Layer matrix .................... PASS
  G05 Migration windows ............... PASS
  G07 No STD->lower edges .............. PASS
  G08 No PROC->ZAI ..................... PASS
  G09 No TOOL->PROC .................... PASS
  G10 No TOOL->ZAI ..................... PASS
  G11 No self-references .............. PASS
  G12 No typo-IDs ..................... PASS
  G14 Compatibility DAG ............... PASS
  G15 Aligned_with has Related ........ PASS

Warnings:
  W01 ZAI-META-001 referenced by 3 files; migration window open until Z-ai-skills v2.0.0
  W02 RULE-FOO-001 has empty Related:  guard/AGENT_RULES.md:142
  W03 STD-DOC-004 is not referenced by any RULE/ZAI
  W08 ZAI-ARCH-002 declares Aligned_with STD-DESIGN-001; STD-DESIGN-001 does not reciprocate
  W08 STD-FE-001 declares Aligned_with ZAI-ARCH-002; ZAI-ARCH-002 does not reciprocate (file: skills/anti-monolith/SKILL.md:7)

Result: PASS (13/13 hard checks, 5 warnings)
```

### 6.2. JSON (`--json`)

```json
{
  "version": "1.0.0",
  "platform_root": "/home/user/Z-ai-platform",
  "repos_scanned": ["standards", "guard", "skills", "platform"],
  "summary": {
    "ids_extracted": 73,
    "related_edges": 142,
    "aligned_with_edges": 8,
    "hard_pass": 13,
    "hard_fail": 0,
    "warnings": 5
  },
  "checks": [
    { "id": "G01", "status": "PASS", "description": "No duplicate IDs" },
    { "id": "G02", "status": "PASS", "description": "References resolve" },
    { "id": "G14", "status": "PASS", "description": "Compatibility DAG valid" },
    { "id": "G15", "status": "PASS", "description": "Aligned_with has Related" },
    ...
  ],
  "warnings": [
    {
      "id": "W01",
      "referenced_id": "ZAI-META-001",
      "message": "Referenced by 3 files; migration window open until Z-ai-skills v2.0.0",
      "referencing_files": ["standards/STANDARDS.md", "guard/AGENT_RULES.md", "skills/skill-creator/SKILL.md"]
    },
    {
      "id": "W08",
      "left": "ZAI-ARCH-002",
      "right": "STD-DESIGN-001",
      "declared_by": "ZAI-ARCH-002",
      "message": "ZAI-ARCH-002 declares Aligned_with STD-DESIGN-001; STD-DESIGN-001 does not reciprocate",
      "file": "skills/anti-monolith/SKILL.md",
      "line": 7
    },
    ...
  ],
  "failures": []
}
```

---

## 7. Integration Points

### 7.1. pre-commit Hook (in Z-ai-platform)

`Z-ai-platform/install-hooks.sh` installs a pre-commit hook that runs:

```bash
# Fast checks first (per-repo):
standards/scripts/verify-standards.js --ci || exit 1
guard/scripts/run-pre-commit.sh || exit 1

# Cross-repo check (slower, only if any .md/.sh/.js/.ts changed):
if git diff --cached --name-only | grep -qE '\.(md|sh|js|ts)$'; then
  standards/scripts/verify-id-graph.js --ci || exit 1
fi
```

The `--ci` flag skips network-dependent checks (e.g. fetching latest
`MIGRATIONS.md` from upstream) and runs only local invariants.

### 7.2. Per-Repo CI (GitHub Actions, in each repo's `.github/workflows/`)

```yaml
- name: verify-id-graph
  run: |
    # Each repo's CI clones the other 3 repos as shallow submodules,
    # then runs the graph checker.
    node ../standards/scripts/verify-id-graph.js --ci --json > result.json
    # Upload result.json as artifact for cross-repo CI to consume.
```

### 7.3. Cross-Repo CI (in Z-ai-platform `.github/workflows/cross-repo.yml`)

Runs nightly at 06:00 UTC. Checks out all four repos at their pinned
versions, runs `verify-id-graph.js` in full mode (not `--ci`), uploads
the JSON result. Opens a GitHub issue if any check fails.

### 7.4. doctor.sh Integration

`Z-ai-platform/doctor.sh` calls `verify-id-graph.js` as part of its
diagnostic suite. If the script exits 2 (config error), doctor reports
"ID graph checker misconfigured"; if exits 1, "ID graph has violations —
see report".

---

## 8. Implementation Notes

### 8.1. Language & Dependencies

- **Language**: Node.js (ESM), no external dependencies. Pure stdlib
  (`fs`, `path`, `readline`).
- **YAML parsing**: hand-rolled mini-parser for the limited subset used
  in skill frontmatter (key: value, no nesting, no anchors). Avoids
  pulling in `js-yaml` for a 50-line parser.
- **Node version**: >= 18 (uses native `fetch` if network mode is ever
  added; v1.0.0 has no network code).
- **Lines of code estimate**: ~750 (extractor ~250, graph builders ~150,
  validators ~250, output formatters ~100).

### 8.2. Extractor Reuse

The unified extractor (STD-META-001 §5.4) is shared with
`verify-standards.js`. Refactor `verify-standards.js` to import the
extractor from `verify-id-graph.js` (or extract to a shared
`lib/id-extractor.js`). This prevents format drift between the two
checkers.

### 8.3. Performance

- Expected ID count across all repos: ~75 (20 STD + 17 RULE + 7 PROC + 6 TOOL + 24 ZAI + 1 STD-SKILL)
- Expected `Related:` edge count: ~150
- Expected `Aligned_with:` edge count: ~10
- Tarjan's SCC on `Related:` graph: <10ms
- Compatibility DAG check: <5ms
- Total runtime: <700ms (excluding file I/O)

No caching needed at v1.0.0.

### 8.4. Testing

Test fixtures live in `Z-ai-standards/tests/verify-id-graph/`:

| Fixture                             | What it tests                                      | Expected                               |
| ----------------------------------- | -------------------------------------------------- | -------------------------------------- |
| `fixtures/valid/`                   | Miniature 4-repo setup, all checks pass            | exit 0, 0 warnings                     |
| `fixtures/cycle/`                   | `Related:` cycle RULE->RULE->RULE                  | G03 fails, exit 1                      |
| `fixtures/forbidden-edge/`          | STD->ZAI `Related:` edge                           | G07 fails, exit 1                      |
| `fixtures/dangling/`                | Reference to non-existent ID                       | G02 fails, exit 1                      |
| `fixtures/deprecated/`              | Reference to deprecated ID in window               | W01, exit 0                            |
| `fixtures/deprecated-closed/`       | Reference to deprecated ID past window             | G05 fails, exit 1                      |
| `fixtures/aligned-without-related/` | `Aligned_with:` without corresponding `Related:`   | G15 fails, exit 1                      |
| `fixtures/aligned-non-reciprocal/`  | One-sided `Aligned_with:`                          | W08, exit 0                            |
| `fixtures/compat-violation/`        | `both` skill depends on `sandbox` skill            | G14 fails, exit 1                      |
| `fixtures/frontmatter-mismatch/`    | YAML frontmatter `id` != blockquote `ID:`          | W07, exit 0                            |
| `fixtures/yaml-only/`               | Skill with YAML frontmatter but missing blockquote | W07 (no blockquote to compare), exit 0 |

Each fixture has an expected `exit-code` and `expected-warnings.json` file.
CI runs the script against each fixture and compares.

---

## 9. Open Questions (to resolve before implementation)

1. **Should Z-ai-platform declare its own IDs?** Currently §3.2 says
   "platform is meta; scanned for references only". But platform has
   `install.sh`, `doctor.sh`, etc. — should those be `PROC-PLATFORM-005`?
   _Resolution (v2): yes, they're already in STD-META-001 §4.14. Platform
   just doesn't have its own prefix; it reuses PROC-_.

2. **Should `MIGRATIONS.md` be machine-readable JSON instead of Markdown?**
   *Resolution (v2): keep Markdown; parse with a simple regex per
   STD-META-001 §8.3 format. Add JSON sidecar `migrations.json` only if
   parsing becomes a bottleneck.

3. **What happens when a repo is missing entirely** (e.g. user installed
   only `core` profile = standards + guard, no skills)?
   *Resolution (v2): `verify-id-graph.js --ci` skips missing repos
   silently and notes "ZAI- checks skipped: skills repo not present" in
   summary. ZAI-specific checks (G14) are skipped. Cross-repo CI
   (full mode) requires all four.

4. **Versioning of the script itself.** It declares `TOOL-VERIFY-004 v1.0.0`.
   *Resolution (v2): SemVer. G-checks added = MINOR. G-checks removed/renamed
   = MAJOR. W-checks added = PATCH.

5. **NEW in v2:** Should `Aligned_with:` be allowed to form cycles?
   *Resolution (v2): yes, per STD-META-001 §6.3 rule 3. `Aligned_with:`
   is undirected and explicitly excluded from cycle checks. Three skills
   may all be `Aligned_with:` each other without violating any invariant.

6. **NEW in v2:** How to handle ZAI-META-001 during the migration window?
   *Resolution (v2): ZAI-META-001 is marked `[SUPERSEDED]` in the catalog.
   References to it produce W01 (during window) or G05 (after window).
   The thin-pointer file in Z-ai-skills continues to declare ZAI-META-001
   so it remains in the catalog as a tombstone until v2.0.0 of Z-ai-skills.

---

## 10. Roadmap

| Version | Target                       | Key changes                                                          |
| ------- | ---------------------------- | -------------------------------------------------------------------- |
| 1.0.0   | Initial implementation       | G01–G15, W01–W08, YAML/blockquote/HTML-comment extractor, basic CLI  |
| 1.1.0   | Semantic duplicate detection | G13 reused for fuzzy match of rule text under two IDs                |
| 1.2.0   | Migration map visualization  | `--dot` flag emits Graphviz output for the ID graph                  |
| 1.3.0   | Partial-repo mode            | `--only=guard,skills` runs only relevant subgraph (faster CI per PR) |
| 2.0.0   | Network mode                 | Fetch upstream `MIGRATIONS.md` from GitHub API                       |

---

_End of verify-id-graph.js specification v1.0 — APPROVED 2026-06-17._
