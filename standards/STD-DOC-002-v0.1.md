# Standard: Documentation Format v0.1 (EN) — STUB

> ID: STD-DOC-002
> Version: 0.1.0 (stub)
> Level: **[B] Recommended**
> Last Updated: 2026-06-17
> Effective Date: 2026-06-17
> Status: **STUB (placeholder — full standard TBD)**
> verified_by: scripts/verify-id-graph.js#G01,G02 (presence only)
> Related: STD-META-001

> **Status: STUB.** This file exists only to anchor the `STD-DOC-002`
> identifier so that downstream artifacts (e.g. STD-META-001,
> STD-SKILL-001) can reference it without breaking the ID graph.
> The full documentation-format standard will be authored in v1.0.

---

## 1. Scope (intended)

This standard is intended to govern:

1. **Header formats** for standards/rules/skills — blockquote, HTML-comment,
   and YAML-frontmatter conventions, and when each is appropriate.
2. **Section conventions** — required sections (`Purpose`, `Scope`,
   `Related`, `Status`), recommended sections (`Examples`,
   `Non-Normative Notes`), forbidden sections.
3. **Cross-reference syntax** — `Related:`, `Aligned_with:`,
   `verified_by:` field conventions, including the bidirectional
   reciprocation rule for `Aligned_with:`.
4. **ID declaration placement** — where in a file the `ID:` line MUST
   appear for each header format.
5. **Markdown hygiene** — line length, list indentation, code fence
   language tags, table column alignment.

This stub does not yet enforce any of the above. It only reserves the ID.

---

## 2. Related Artifacts

- **STD-META-001** — defines the ID system this standard references.
- **STD-SKILL-001** — defines the skill-specific format that builds on
  this standard's general documentation rules.

---

## 3. Forward Plan

v1.0 will be authored when:

- The four header formats (blockquote, HTML-comment, YAML frontmatter,
  and any future format) have been exercised on at least one real
  artifact each.
- The `verify-standards.js` script has a check (V-level TBD) that
  enforces the chosen format per artifact type.

Until v1.0, treat the existing format in `STD-META-001-v2.0.md` and
`STD-SKILL-001-v1.0.md` as the de-facto documentation format.
