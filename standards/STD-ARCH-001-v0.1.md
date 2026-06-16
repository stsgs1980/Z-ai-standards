# Standard: Architecture & Repo Layout v0.1 (EN) — STUB

> ID: STD-ARCH-001
> Version: 0.1.0 (stub)
> Level: **[B] Recommended**
> Last Updated: 2026-06-17
> Effective Date: 2026-06-17
> Status: **STUB (placeholder — full standard TBD)**
> verified_by: scripts/verify-id-graph.js#G01,G02 (presence only)
> Related: STD-META-001

> **Status: STUB.** This file exists only to anchor the `STD-ARCH-001`
> identifier so that downstream artifacts (e.g. STD-META-001) can reference
> it without breaking the ID graph. The full architectural standard —
> covering 4-repo split (Z-ai-platform / standards / guard / skills),
> submodule layout, layer separation L0–L3, and cross-repo pathing — will
> be authored in v1.0.

---

## 1. Scope (intended)

This standard is intended to govern:

1. **Repository topology** — the canonical 4-repository split for the
   Z-ai platform (orchestrator + 3 submodules: standards, guard, skills).
2. **Layer assignment** — which artifacts live at which layer
   (L0 orchestrator, L1 standards, L2 guard/rules, L3 skills).
3. **Submodule conventions** — `.gitmodules` URL hygiene (no PATs),
   pointer-update protocol, recursive clone expectations.
4. **Cross-repo path references** — how scripts in one repo may reference
   files in another (e.g. `Z-ai-platform/standards/scripts/...`).

This stub does not yet enforce any of the above. It only reserves the ID.

---

## 2. Related Artifacts

- **STD-META-001** — ID system this stub depends on for its identifier.
- **Z-ai-platform/README.md** — current de-facto architecture description
  (to be formalized here in v1.0).

---

## 3. Forward Plan

v1.0 will be authored when:

- The 4-repo split is stable on GitHub (no further topology changes
  anticipated).
- The submodule pointer-update protocol has been exercised end-to-end at
  least once after a non-trivial rule/skill migration.
- Cross-repo CI (GitHub Actions) is in place to enforce this standard.

Until v1.0, treat `Z-ai-platform/README.md` as the authoritative
architecture description.
