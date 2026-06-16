# Standard: Environment Variables & Secrets v0.1 (EN) — STUB

> ID: STD-ENV-002
> Version: 0.1.0 (stub)
> Level: **[C] Critical**
> Last Updated: 2026-06-17
> Effective Date: 2026-06-17
> Status: **STUB (placeholder — full standard TBD)**
> verified_by: scripts/verify-id-graph.js#G01,G02 (presence only)
> Related: STD-META-001

> **Status: STUB.** This file exists only to anchor the `STD-ENV-002`
> identifier so that downstream artifacts (e.g. RULE-MONOLITH-008 —
> Sandbox verification) can reference it without breaking the ID graph.
> The full environment-variables standard will be authored in v1.0.

---

## 1. Scope (intended)

This standard is intended to govern:

1. **Where secrets MUST live** — `.env` (mode 600) at the project root,
   `~/.git-credentials` (mode 600) for git PATs. Secrets MUST NOT be
   embedded in URLs, in `.git/config`, in `.gitmodules`, or in any
   tracked file.
2. **What counts as a secret** — PATs, API tokens, passwords, private
   keys, connection strings with credentials. The literal prefix
   `ghp_` is treated as a GitHub PAT and triggers a hard FAIL if found
   in any tracked file.
3. **Secret-scanning protocol** — `git ls-files | xargs grep -l "ghp_"`
   (and equivalent for other known prefixes) MUST return empty before
   any commit is allowed.
4. **Rotation protocol** — when a PAT is revoked by GitHub, the
   replacement MUST be written to `.env` and `~/.git-credentials` only;
   never to `.git/config` or `.gitmodules`.
5. **`.env.example` convention** — non-secret env var names SHOULD be
   documented in `.env.example`, with placeholder values.

This stub does not yet enforce any of the above. It only reserves the ID.
The de-facto rules currently live in the project's hard-won operational
experience (one PAT leak via `.gitmodules` already happened and was
fixed; see `worklog.md` history).

---

## 2. Related Artifacts

- **STD-META-001** — ID system this stub depends on.
- **STD-ENV-001** — companion standard for sandbox paths and dev-server
  lifecycle (also a stub).
- **RULE-MONOLITH-008** — the rule that currently enforces de-facto
  sandbox-verification checks, including the file-location rule that
  intersects with this standard.

---

## 3. Forward Plan

v1.0 will be authored when:

- The `.env` and `~/.git-credentials` convention has been used for at
  least 3 PAT rotations without any leak.
- A pre-commit secret-scanning hook (TBD) is in place.

Until v1.0, treat the project's `worklog.md` and the existing
`.env` / `~/.git-credentials` setup as the authoritative source.
