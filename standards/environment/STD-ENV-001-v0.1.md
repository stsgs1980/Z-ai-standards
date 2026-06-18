# Standard: Environment & Sandbox Layout v0.1 (EN) — STUB

> ID: STD-ENV-001
> Version: 0.1.0 (stub)
> Level: **[C] Critical**
> Last Updated: 2026-06-17
> Effective Date: 2026-06-17
> Status: **STUB (placeholder — full standard TBD)**
> verified_by: scripts/verify-id-graph.js#G01,G02 (presence only)
> Related: STD-META-001, STD-ENV-002

> **Status: STUB.** This file exists only to anchor the `STD-ENV-001`
> identifier so that downstream artifacts (e.g. RULE-MONOLITH-008 —
> Sandbox verification) can reference it without breaking the ID graph.
> The full environment/sandbox standard will be authored in v1.0.

---

## 1. Scope (intended)

This standard is intended to govern:

1. **Canonical sandbox paths** — `/home/z/my-project/` as the served root,
   why `/tmp/` and arbitrary subfolders are NOT served by the dev server.
2. **Dev-server lifecycle** — managed by sandbox via `.zscripts/dev.sh`,
   not by manual `next dev`. Re-init protocol via the canonical
   fullstack init script.
3. **HMR / 500 semantics** — what HTTP 200 vs 500 from `127.0.0.1:3000`
   means and how to verify the server is actually healthy.
4. **File-editing location rule** — code MUST be edited under
   `/home/z/my-project/` to have any visible effect in the preview.
5. **Re-init / recovery** — when and how to re-run the init script
   without losing uncommitted work.

This stub does not yet enforce any of the above. It only reserves the ID.
The de-facto rules currently live in `RULE-MONOLITH-008` (Sandbox
verification) and will be promoted to this standard in v1.0.

---

## 2. Related Artifacts

- **STD-META-001** — ID system this stub depends on.
- **STD-ENV-002** — companion standard for environment variables and
  secrets (also a stub).
- **RULE-MONOLITH-008** — the rule that currently enforces the de-facto
  sandbox-verification checks; will be re-grounded on this standard
  in v1.0.

---

## 3. Forward Plan

v1.0 will be authored when:

- The sandbox re-init protocol has been exercised at least 3 times
  without data loss.
- The HMR/500 verification command is stable across at least 2 Next.js
  versions.

Until v1.0, treat `RULE-MONOLITH-008` as the authoritative source on
sandbox verification.
