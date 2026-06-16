# Changelog

All notable changes to the Z.ai Standards Corpus are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.2.0] - 2026-06-16

### Added
- **V10 invariant** in `scripts/verify-standards.js`: STD-DOC-004 v2.2+ mandates badges for public repos (>=3 shields.io badge URLs in template + checklist item + §1 marks Badges as "Yes (public repos)").
- **Canonical Badge Set** section (§4) in `upload/standards-v2/standards/README_TEMPLATE.md` declaring 3 mandatory badges (tech, language, license) and 3 recommended (CI status, PRs welcome, secondary tech).
- **Badge Style Convention** subsection: `style=flat-square`, shields.io URLs only, prefer Simple Icons logos, no raster PNGs, no animated badges.
- **README_TEMPLATE.md §3 checklist** item: "At least 3 badges present - required for public repos".
- **6 canonical shields.io badges** in §2 template block: Next.js 16, TypeScript 5.x, Tailwind CSS 4, License MIT, Build Status, PRs Welcome.
- **GitHub Actions workflow** `.github/workflows/standards.yml`: runs both verifiers on push to main + every PR, with concurrency cancellation and step summary.
- **Pre-commit hook** `.githooks/pre-commit`: runs `verify-standards.js` when staged paths include any `.md` / `verify-*.js` / `standards.yml`. Skips silently otherwise for speed.
- **Hook bootstrap** `scripts/install-hooks.sh`: one-time `git config core.hooksPath .githooks` + chmod.
- **STANDARDS.md** maintenance protocol: documents the two-layer CI gate, the 5-step invariant-change procedure, and the bypass policy.
- **REPO-README.md** with quick-start commands and invariant inventory table.
- **`.env.example`** with `DATABASE_URL` placeholder (replaces `.env` in archive distribution).

### Changed
- **README_TEMPLATE.md** (STD-DOC-004): v2.1 -> v2.2.
  - §1 row #2 changed from `Optional | Technology badges (SVG only)` to `Yes (public repos) | Technology badges (SVG only). Mandatory for public repos. Minimum 3 badges: tech stack, license, build/status.`
  - §2 template block: single example badge replaced with 6 canonical shields.io badges.
  - §4 Example Compliance renumbered to §5, §5 Cross-References renumbered to §6.
- **All scripts** (`verify-standards.js`, `verify-cascade.js`, `scan-plain-fences.py`, `cross_test_report.py`): hardcoded `/home/z/my-project/...` paths replaced with `__dirname`-relative paths. Corpus is now portable: works standalone, as git submodule, or in CI checkout.
- **Hooks Guide filename**: `Hooks в Z.ai Полное Руководство.md` (Cyrillic) renamed to `Hooks-in-Z.ai-Guide.md` (English, URL-safe).

### Removed
- **`upload/standards-extracted/`**: obsolete snapshot directory. Missing `DESIGN_SYSTEM_STANDARD.md` (added in cascade L4-001); all 7 modified files were stale pre-cascade versions.

### Fixed
- **V09 invariant** (added in 2.1.0) now properly locks all 25 `.md` files in `upload/` to English-only (<2% Cyrillic), preventing regression to Russian content.
- **CommonMark fence handling** in V08: 4-backtick container fences (used in STD-DOC-002 §5.4) are no longer false-flagged as violations.

## [2.1.0] - 2026-06-16

### Added
- **V09 invariant**: English-only policy enforcement across all 25 `.md` files in `upload/`. Strips fenced code blocks before computing Cyrillic-vs-Latin ratio; fails if any file has >= 2% Cyrillic.
- **V08 invariant**: all 3-backtick code fences must have a language tag (STD-DOC-002 §4.3 + §5.4). CommonMark-aware: handles 4-backtick container fences correctly.
- **English translations** of both guides:
  - `Hooks-in-Z.ai-Guide.md` (was mixed RU/EN, 17% Cyrillic).
  - `Z.ai-Sandbox-Guide.md` (was pure RU, 52% Cyrillic).
- **Permanent verifier** `scripts/verify-standards.js` with V01-V09 invariants.

## [2.0.0] - 2026-06-16

### Added - initial corpus release
- **20 standards** in `upload/standards-v2/standards/`: STD-DOC-001 through STD-DOC-004, STD-FE-001, STD-ENV-001/002, STD-META-001, STD-ARCH-001, STD-DESIGN-001, STD-SEC-001/002, STD-TEST-001, STD-WCAG-001, STD-REPRO-001, STD-ORCH-001, STD-SUB-001, STD-GIT-001/002, STD-ERR-001/002.
- **5 top-level docs** in `upload/`: SKILL.md, MARKDOWN_STANDARD.md, UNICODE_POLICY.md, Hooks-in-Z.ai-Guide.md, Z.ai-Sandbox-Guide.md.
- **17 cascade tasks** (L1-L5) executed across the corpus: STD-ENV-002 startup fix, Zod validation in Hooks Guide, anti-monolith thresholds in STD-FE-001, DESIGN domain addition to STD-META-001, cross-references between all standards.
- **Cascade verifier** `scripts/verify-cascade.js` with 47 checks confirming L1-L5 integration.

### Changed
- STD-ENV-002 (ZAI_INTEGRATION_STANDARD.md): v1.1 -> v1.3 — sandbox-managed startup (`init-fullstack` instead of `npx next dev`), log path `.zscripts/dev.log` (instead of `/tmp/zdev.log`), new §9.2 (canonical client-side pattern), §12 (sandbox troubleshooting), §13 (git submodule integration).
- STD-FE-001 (FRONTEND_STANDARD.md): v2.3 -> v2.5 — §2.1 anti-monolith thresholds (Function 50/80 lines, inline 4+), §2.3 useEffect thresholds (3+ deps [I], 4+ [W]), §12 (AI Hook Patterns with useAI/useChat/useImage).
- STD-META-001 (STANDARD_ID_SYSTEM.md): v1.1 -> v1.2 — added DESIGN domain (§3), added STD-DESIGN-001 v3.0.0 to registry (§4.12).
- STD-DOC-003 (UNICODE_POLICY.md): v2.1 -> v2.2 — cross-reference to STD-DESIGN-001 (§16), unified "uniform severity principle" terminology, lint-md.js reference.

---

For the full work history of every change, see `worklog.md` (append-only multi-agent log).
