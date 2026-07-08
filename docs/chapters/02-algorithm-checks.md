# verify-id-graph.js — Chapter 2: Algorithm & Check Catalog

> **Part of:** TOOL-VERIFY-004 Specification v1.0
> **Covers:** Sections 4–5 of the full spec

---

## 4. Algorithm

### 4.1. Phase 1: Extract IDs (parallel per repo)

For each repo, run the unified extractor (STD-META-001 §5.4) on every
matching file. The extractor handles three header formats:

**Format A — YAML frontmatter** (used by ZAI- skills):

```yaml
---
name: skill-name
id: ZAI-ARCH-002
version: 1.0
compatibility: both
trigger: keyword1, keyword2
---

# Skill: <Name> v<Version>

> ID: ZAI-ARCH-002
> Version: 1.0
> Related: STD-FE-001, STD-DESIGN-001
> Aligned_with: STD-FE-001, STD-DESIGN-001
```

Extractor reads:

- Frontmatter: `id`, `version`, `compatibility`, `trigger`, `author`
- Blockquote below H1: `Related:`, `Aligned_with:`, `Last Updated:`

**Format B — Blockquote** (used by STD-* standards and top-level guard docs):

```markdown
# Standard: <Name> v<Version> (<Language>)

> ID: STD-FE-001
> Version: 2.5
> Level: **[C] Critical**
> Last Updated: 2026-06
> Related: STD-ARCH-001, STD-DOC-002
> Aligned_with: ZAI-ARCH-002
> verified_by: scripts/verify-standards.js#V01
```

**Format C — HTML-comment** (used by rules inside AGENT_RULES.md):

```markdown
<!-- ID: RULE-ENV-008 | ver:1.0 | Level: C | Related: STD-ENV-001,STD-ENV-002 | Aligned_with: -->
```

### 4.2. Phase 1 Output: Declaration Records

Each declaration produces a record:

```js
{
  id: "RULE-ENV-008",
  prefix: "RULE",
  domain: "ENV",
  number: 8,
  version: "1.0",
  level: "C",            // null for ZAI- skills (no level)
  related: ["STD-ENV-001", "STD-ENV-002"],
  aligned_with: [],      // empty if not declared
  compatibility: null,   // only for ZAI- skills: "both" | "sandbox" | "ade"
  trigger: null,         // only for ZAI- skills: string[]
  file: "guard/AGENT_RULES.md",
  line: 142,
  repo: "guard",
  header_format: "html-comment"  // "yaml" | "blockquote" | "html-comment"
}
```

### 4.3. Phase 2: Build the ID Catalog

Concatenate all declarations. Detect duplicate IDs across repos (G01).
A duplicate is any ID appearing in more than one declaration. The only
exception: an ID marked `[DEPRECATED]` or `[SUPERSEDED]` in one repo and
`[ACTIVE]` in another is treated as the active one; the deprecated entry
is recorded as a tombstone.

### 4.4. Phase 3: Build the Edge Lists

Two separate edge lists are built:

**Directed edges (`Related:`):**

For each declaration `D` with `related: [R1, R2, ...]`, create edges:

- `D.id -> R1`
- `D.id -> R2`
- ...

Each edge carries:

- `source`: declaring ID
- `target`: referenced ID
- `source_file`, `source_line`: where the declaration lives
- `kind`: `STD->STD`, `RULE->STD`, `PROC->ZAI`, etc. (computed from prefixes)

**Undirected edges (`Aligned_with:`):**

For each declaration `D` with `aligned_with: [A1, A2, ...]`, create edges:

- `D.id <-> A1`
- `D.id <-> A2`
- ...

Each edge carries:

- `left`, `right`: the two IDs (lexicographically ordered for dedup)
- `declared_by`: which side declared it (D.id)
- `reciprocated`: boolean — true if the other side also declares `Aligned_with:` back

### 4.5. Phase 4: Validate References (G02, G05, G12)

For every directed edge `S -> T`:

- If `T` exists in the catalog: OK.
- If `T` is a deprecated/superseded ID with `superseded_by` in `MIGRATIONS.md`:
  - If the migration window is still open (per repo version): warning W01.
  - If the migration window has closed: hard error G05.
- If `T` matches the ID format but no such ID exists anywhere: hard error G02.
- If `T` does not even match the ID format (typo like `STD-ENVIROMENT-001`): hard error G12.

### 4.6. Phase 5: Validate Layer Edges (G04–G10)

For every directed edge `S -> T`, look up the allowed-edge matrix
(STD-META-001 §6.1). If the edge kind is forbidden, emit the corresponding
G-check failure:

| Edge kind                   | Check |
| --------------------------- | ----- |
| STD -> (RULE/PROC/TOOL/ZAI) | G07   |
| PROC -> ZAI                 | G08   |
| TOOL -> PROC                | G09   |
| TOOL -> ZAI                 | G10   |

### 4.7. Phase 6: Detect Cycles in `Related:` Graph (G03, G11)

Run Tarjan's SCC algorithm on the directed `Related:` graph. Any SCC of
size > 1 is a cycle (G03). Any self-loop `S -> S` is G11.

The undirected `Aligned_with:` graph is **not** subject to cycle checks
(STD-META-001 §6.3 rule 3). Bidirectional alignments may form cycles
without violating any invariant.

### 4.8. Phase 7: Validate `Aligned_with:` Symmetry (G15, W08)

For every undirected `Aligned_with:` edge `A <-> B`:

**G15 check:** Is there a corresponding `Related:` edge in either direction?

- Acceptable: `A -> B` exists in directed edges
- Acceptable: `B -> A` exists in directed edges
- Acceptable: both exist (rare but valid)
- Fail G15 if neither direction exists in `Related:` edges.

Rationale (STD-META-001 §6.3 rule 5): alignment is a synchronization
mechanism on top of an existing dependency, not a substitute for one.

**W08 check:** Did both sides declare `Aligned_with:`?

- If A declares `Aligned_with: B` AND B declares `Aligned_with: A`: OK.
- If A declares `Aligned_with: B` but B does NOT declare `Aligned_with: A`:
  warning W08 (non-reciprocal declaration; should add for human readability).
- If both declare but with different additional IDs (A declares `B,C` and
  B declares `A,D`): each individual edge is checked separately. The
  asymmetry of additional IDs is not a warning.

### 4.9. Phase 8: Compatibility DAG Validation (G14)

This phase applies only to `ZAI-` skills (those with non-null
`compatibility` field in their declaration).

Build a subgraph containing only `ZAI -> ZAI` directed edges.

For each edge `ZAI-A -> ZAI-B`:

- Look up `compatA = A.compatibility` and `compatB = B.compatibility`.
- Check the compatibility matrix (STD-SKILL-001 §7.2):

| Source    | May depend on     |
| --------- | ----------------- |
| `both`    | `both` only       |
| `sandbox` | `both`, `sandbox` |
| `ade`     | `both`, `ade`     |

- If the pair is not in the allowed table: hard error G14.

Example failure:

```text
G14: ZAI-DEV-001 (compatibility=sandbox) depends on ZAI-STS-005 (compatibility=both)
  -> OK (sandbox may depend on both)

G14: ZAI-STS-005 (compatibility=both) depends on ZAI-DEV-001 (compatibility=sandbox)
  -> FAIL (both may only depend on both)
```

The compatibility DAG is independent of the layer DAG. A ZAI skill may
pass G04–G10 (layer matrix) but fail G14 (compatibility matrix). Both
must pass.

### 4.10. Phase 9: Frontmatter/Blockquote Consistency (W07)

For every declaration with `header_format: "yaml"`:

- Compare frontmatter `id` with blockquote `ID:`. If different: W07.
- Compare frontmatter `version` with blockquote `Version:`. If different: W07.

(W07 is a soft warning. Hard failures on this are caught by
`verify-standards.js` V14a/V14b, which run per-repo before
`verify-id-graph.js`.)

### 4.11. Phase 10: Orphan & Dead-Code Warnings (W02–W06)

- For every RULE with `related: []`: warning W02 (possibly orphan).
- For every STD that is **not** the target of any `Related:` edge AND not
  the endpoint of any `Aligned_with:` edge: warning W03 (possibly dead
  standard).
- For every ZAI skill with `related: []` AND `aligned_with: []`: warning
  W04 (possibly rogue skill).
- For every PROC with `related: []`: warning W05 (orphan procedure).
- For every TOOL with `related: []`: warning W06 (orphan tool).

### 4.12. Phase 11: Emit Results

Produce a report listing each G-check and W-warning with:

- check id (G01, G02, ..., W01, W02, ...)
- status (PASS/FAIL/WARN)
- description
- offending edge(s) or node(s), with `file:line` references

---

## 5. Check Catalog

### 5.1. Hard Errors (exit 1 if any fail)

These checks ALWAYS apply to STD/RULE/PROC/TOOL artifacts (which require IDs).
For ZAI skills, they apply only when the skill has an `id` field.

| ID  | Description                                                                                                         | Phase | Applies to             |
| --- | ------------------------------------------------------------------------------------------------------------------- | ----- | ---------------------- |
| G01 | No duplicate IDs across repos                                                                                       | 2     | All artifacts WITH IDs |
| G02 | All `Related:` references resolve to existing IDs                                                                   | 4     | All artifacts (edges)  |
| G03 | No cycles in the `Related:` ID graph                                                                                | 6     | All artifacts (edges)  |
| G04 | All `Related:` edges conform to §6.1 matrix (umbrella)                                                              | 5     | All artifacts (edges)  |
| G05 | No deprecated ID referenced outside migration window                                                                | 4     | All artifacts (edges)  |
| G06 | (reserved — currently a warning alias for W02)                                                                      | 9     | —                      |
| G07 | No `STD -> (RULE/PROC/TOOL/ZAI)` `Related:` edges                                                                   | 5     | STD sources            |
| G08 | No `PROC -> ZAI` `Related:` edges                                                                                   | 5     | PROC sources           |
| G09 | No `TOOL -> PROC` `Related:` edges                                                                                  | 5     | TOOL sources           |
| G10 | No `TOOL -> ZAI` `Related:` edges                                                                                   | 5     | TOOL sources           |
| G11 | No self-references (`S -> S`)                                                                                       | 6     | All artifacts          |
| G12 | No reference to non-existent ID in any prefix (catches typos like `STD-ENVIROMENT-001`)                             | 4     | All artifacts          |
| G13 | (reserved — currently a warning alias for W03)                                                                      | 9     | —                      |
| G14 | Compatibility DAG valid for ZAI- skills (per STD-SKILL-001 §7.2). Only applies when both endpoints have `id` field. | 8     | ZAI skills WITH IDs    |
| G15 | Every `Aligned_with:` declaration has a corresponding `Related:` edge                                               | 7     | All artifacts          |

### 5.2. Soft Warnings (do not fail the build unless `--fail-on-warnings`)

| ID  | Description                                                                                                             | Phase | Applies to                |
| --- | ----------------------------------------------------------------------------------------------------------------------- | ----- | ------------------------- |
| W01 | Reference to a `[DEPRECATED]` / `[SUPERSEDED]` ID inside migration window                                               | 4     | All artifacts             |
| W02 | RULE with empty `Related:` (orphan)                                                                                     | 9     | RULE                      |
| W03 | STD referenced by zero rules/skills AND zero `Aligned_with:` (dead standard)                                            | 9     | STD                       |
| W04 | ZAI skill (WITH ID) with empty `Related:` AND empty `Aligned_with:` (rogue skill with ID but no graph role)             | 9     | ZAI WITH IDs              |
| W05 | PROC with empty `Related:` (orphan procedure)                                                                           | 9     | PROC                      |
| W06 | TOOL with empty `Related:` (orphan tool)                                                                                | 9     | TOOL                      |
| W07 | ZAI skill's YAML frontmatter disagrees with blockquote (`id` or `version` mismatch) — only when `id` field exists       | 8     | ZAI WITH IDs              |
| W08 | `Aligned_with:` declaration is not reciprocated by the other side                                                       | 7     | All artifacts             |
| W09 | ZAI skill declares `compatibility` field but no `id` field (compatibility is meaningless without ID for graph tracking) | 8     | ZAI WITHOUT IDs           |
| W10 | ZAI skill WITHOUT `id` field is referenced by ID from elsewhere (should add `id` to satisfy the reference)              | 4     | ZAI referenced externally |

### 5.3. Strictness Model

The validator uses a two-level strictness model:

| Level              | Behavior                                                   | Applies to                                                   |
| ------------------ | ---------------------------------------------------------- | ------------------------------------------------------------ |
| **HARD** (G01–G15) | Fails the build (exit 1)                                   | STD/RULE/PROC/TOOL always; ZAI skills only when `id` present |
| **SOFT** (W01–W10) | Reports warning, does not fail unless `--fail-on-warnings` | All artifacts                                                |

**Key principle:** A skill without an ID is valid and passes all HARD
checks. The skill layer is opt-in for ID graph participation.

This means:

- A new personal `_sts` skill with just `name`, `description`, `version`
  passes validation cleanly
- A skill with `id` field triggers additional checks (G14 compatibility
  DAG, W07 frontmatter consistency, W04 orphan-with-ID)
- A skill referenced by ID from a standard/rule but missing its own `id`
  field triggers W10 (should add `id` to satisfy external reference)

### 5.4. Reserved for Future

| ID           | Description                                                           | Target version |
| ------------ | --------------------------------------------------------------------- | -------------- |
| G13 (reused) | Semantic duplicate detection (fuzzy match of rule text under two IDs) | v1.1.0         |
