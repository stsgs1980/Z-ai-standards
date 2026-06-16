# Standards — Maintenance Protocol

This repository hosts the Z.ai standards corpus (`upload/standards-v2/`) and
two permanent invariant verifiers (`scripts/verify-*.js`). The corpus is
protected by a two-layer CI gate:

| Layer | Where | When | What |
|-------|-------|------|------|
| Pre-commit hook | `.githooks/pre-commit` | local, before each `git commit` | Runs `verify-standards.js` if any `.md` or `verify-*.js` is staged |
| GitHub Action | `.github/workflows/standards.yml` | remote, on every push to main + every PR | Runs both `verify-standards.js` and `verify-cascade.js` |

Both layers MUST stay green. Disabling either is forbidden.

## One-time setup after `git clone`

```bash
bash scripts/install-hooks.sh
```

This sets `core.hooksPath = .githooks` and marks hooks executable. The hook
will run automatically on every commit that touches `.md` or `verify-*.js`.

## Maintenance protocol

When you intentionally change a standard's invariant:

1. Read `scripts/verify-standards.js` and find the V## check(s) covering that
   standard. The standard's header line `verified_by:` declares the binding.
2. Update the V## check to reflect the new invariant.
3. If a brand-new invariant was introduced, add a new V## block (next free
   number) and update the standard's `verified_by:` header.
4. Run `node scripts/verify-standards.js` locally — must exit 0.
5. Commit. The pre-commit hook will re-run it; the GitHub Action will run it
   again on push.

## Bypassing the hook (last resort)

```bash
git commit --no-verify
```

This is **strongly discouraged** — it skips the local check, but the GitHub
Action on push will still fail if the invariant is broken. Use only when you
have a verified-good reason AND you have manually confirmed the verifier
passes locally.

## Verifier inventory

| Script | Checks | Trigger |
|--------|--------|---------|
| `scripts/verify-standards.js` | V01-V10 (permanent invariants) | pre-commit + GitHub Action |
| `scripts/verify-cascade.js` | 47 checks (L1-L5 cascade integration) | GitHub Action only |

`verify-standards.js` is the primary gate; `verify-cascade.js` is the
secondary, history-only check (it confirms the original 17 cascade tasks are
still integrated). The pre-commit hook runs only the primary gate for speed.

## Files of interest

```
VERSION                               Single-line semver (e.g. "2.2.0")
CHANGELOG.md                          Version history (Keep a Changelog format)
upload/standards-v2/standards/*.md   20 standards files (canonical)
upload/*.md                          5 top-level docs (Hooks guide, Sandbox guide, SKILL, etc.)
scripts/verify-standards.js          Permanent invariants V01-V10 (paths relative to __dirname)
scripts/verify-cascade.js            Cascade integration verifier (47 checks, paths relative to __dirname)
scripts/check-updates.sh             Host helper: compare local VERSION to upstream's latest tag
scripts/install-hooks.sh             One-time hook bootstrap
.githooks/pre-commit                 Local pre-commit hook
.github/workflows/standards.yml      Remote CI gate (corpus repo itself)
host-project-templates/              Ready-to-copy CI workflow for host projects
worklog.md                           Append-only multi-agent work log
```

## Versioning

The corpus follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html):

| Bump type | When | Example |
|-----------|------|---------|
| **MAJOR** (x.0.0) | An invariant is removed or its semantics change in a backwards-incompatible way. Host projects pinned to the previous major must update their verifiers. | V11 added that requires a new file in host projects. |
| **MINOR** (1.x.0) | A new invariant is added, or a standard gains a new section. Existing host pins still pass — they just don't get the new protection until they bump. | V10 added (badges mandatory). |
| **PATCH** (1.1.x) | Documentation fixes, typo fixes, no new invariants. | CHANGELOG wording, README cross-reference fix. |

### Where the version lives

- `VERSION` file at corpus root: single line, semver string (e.g. `2.2.0`).
- `CHANGELOG.md`: human-readable history of every release.
- Git tags: each release is tagged as `vX.Y.Z` (e.g. `v2.2.0`). Host projects pin to tags.

### Release procedure (corpus maintainer)

1. Update `VERSION` file to the new semver.
2. Add a `## [X.Y.Z] - YYYY-MM-DD` section to `CHANGELOG.md` with Added/Changed/Removed/Fixed subsections.
3. Commit: `git commit -m "Release vX.Y.Z"`.
4. Tag: `git tag -a vX.Y.Z -m "Release vX.Y.Z"`.
5. Push: `git push origin main --tags`.
6. The GitHub Action on the corpus repo re-runs V01-V10 + cascade as a final sanity check.

## Host project: checking for updates

### Manual check

From the host project root:

```bash
bash standards/scripts/check-updates.sh
```

Output example (up-to-date):

```
[check-updates] Local corpus version: v2.2.0
[check-updates] Upstream URL: git@github.com:owner/z-ai-standards.git
[check-updates] Fetching tags from upstream...
[check-updates] Latest upstream version: v2.2.0

[check-updates] OK: host is up-to-date with upstream (v2.2.0).
```

Output example (behind):

```
[check-updates] Local corpus version: v2.1.0
[check-updates] Latest upstream version: v2.2.0

[check-updates] WARNING: host is BEHIND upstream.
[check-updates]   local:    v2.1.0
[check-updates]   upstream: v2.2.0

[check-updates] To update:
  cd standards
  git fetch origin
  git checkout v2.2.0
  cd ..
  git add standards
  git commit -m "Bump z-ai-standards submodule to v2.2.0"

[check-updates] Then review CHANGELOG.md for breaking changes:
  cat standards/CHANGELOG.md

[check-updates] Failing CI. Set STANDARDS_BEHIND_OK=1 to make this non-blocking.
```

Exit codes:

| Code | Meaning |
|------|---------|
| 0 | Up-to-date or ahead of upstream |
| 1 | Behind upstream (newer version available) |
| 2 | Could not determine versions (network error, no tags) |

### Automatic check in CI

Copy `host-project-templates/.github/workflows/standards-version-check.yml` into your host project's `.github/workflows/` directory. It runs:

- On every push to `main` that touches `standards/**`
- Weekly (Monday 09:00 UTC by default)
- Manually via the GitHub Actions UI

The workflow:
1. Runs `verify-standards.js` (V01-V10) — must pass
2. Runs `verify-cascade.js` (47 checks) — must pass
3. Runs `check-updates.sh` — fails if host is behind upstream

To make the freshness check **advisory-only** (workflow stays green even when behind), set `STANDARDS_BEHIND_OK: "1"` in the workflow's env block. This is useful during corpus migration periods where you intentionally want to lag behind upstream.

## Host project: update playbook

### When to update

- **MAJOR bumps** — update within 1 week of release. They indicate a breaking change; your host may have already started failing the new invariants.
- **MINOR bumps** — update within 1 month. New invariants only protect you; no urgency but no reason to delay either.
- **PATCH bumps** — update at your convenience. Documentation-only changes; no behavioral impact.

### How to update (safe procedure)

```bash
# 1. From the host project root, create a dedicated branch
git checkout -b chore/bump-standards-v2.2.0

# 2. Fetch upstream tags
cd standards
git fetch origin --tags

# 3. Checkout the target version
git checkout v2.2.0

# 4. Run verifiers locally to confirm the new pin passes
node scripts/verify-standards.js
node scripts/verify-cascade.js

# 5. Read the CHANGELOG for breaking changes
cat CHANGELOG.md | head -100

# 6. If all green, return to host root and commit
cd ..
git add standards
git commit -m "chore(standards): bump to v2.2.0

See standards/CHANGELOG.md for what changed."

# 7. Push and open a PR
git push -u origin chore/bump-standards-v2.2.0
# Open PR; CI will re-run all invariants on the new pin.

# 8. After merge, clean up
git checkout main
git pull
git branch -d chore/bump-standards-v2.2.0
```

### How to roll back

If a bump breaks something in the host project:

```bash
# 1. Identify the previous working version (e.g. v2.1.0)
cd standards
git checkout v2.1.0
cd ..
git add standards
git commit -m "revert(standards): roll back to v2.1.0

v2.2.0 caused <specific issue>. Will re-attempt after fix in v2.2.1."
git push

# 2. Open an issue in the corpus repo describing what broke
#    so the maintainer can fix it in the next patch release.
```

### How to pin to a specific version (production)

For production-critical host projects, pin to a **tag** (not `main`):

```bash
cd standards
git fetch --tags
git checkout v2.2.0
cd ..
git add standards
git commit -m "pin(standards): v2.2.0 for production stability"
```

This guarantees that `git submodule update --remote` will NOT silently advance to a newer commit. The only way to bump is an explicit `git checkout v2.3.0` followed by a commit — a deliberate human action.

## Using as a submodule

This corpus is designed to be consumed by host projects as a **git submodule**.
All paths inside `scripts/verify-*.js` and `scripts/scan-plain-fences.py` are
**relative to the script file** (not hardcoded), so the corpus works at any
filesystem location — standalone, submodule, or CI checkout.

### Adding to a new host project

```bash
cd my-app
git submodule add git@github.com:<owner>/z-ai-standards.git standards
git commit -m "Add z-ai-standards corpus as submodule"
```

### Adding to an existing project

The submodule lives in its own directory (`standards/`), so it does not
conflict with existing files (README.md, .gitignore, package.json, etc.) of
the host project.

```bash
cd existing-project
git submodule add git@github.com:<owner>/z-ai-standards.git standards
git commit -m "Integrate z-ai-standards corpus as submodule"
```

### Cloning a host project that uses this submodule

```bash
git clone --recurse-submodules git@github.com:<owner>/my-app.git
# or, if already cloned without submodules:
cd my-app && git submodule update --init --recursive
```

### Running verifiers from the host project

```bash
cd my-app/standards
node scripts/verify-standards.js   # V01-V10
node scripts/verify-cascade.js     # 47 cascade checks
```

Both scripts auto-resolve paths relative to their own `__dirname`, so they
work from any host-repo path.

### Wiring the host project's CI to the submodule's invariants

Add this step to the host project's GitHub Action:

```yaml
- name: Verify standards submodule invariants
  working-directory: standards
  run: |
    node scripts/verify-standards.js
    node scripts/verify-cascade.js
```

This way, every push to the host repo also re-checks that the pinned
submodule commit still satisfies all invariants.

### Updating the submodule in a host project

```bash
cd my-app/standards
git fetch origin
git checkout main
git pull
cd ..
git add standards
git commit -m "Bump z-ai-standards submodule to latest"
```

### Pinning to a specific release

For production host projects, pin to a tag instead of `main`:

```bash
cd my-app/standards
git fetch --tags
git checkout v2.2.0   # or whatever release tag exists
cd ..
git add standards
git commit -m "Pin z-ai-standards to v2.2.0"
```

## Protection: preventing host projects from pushing back

Three layers prevent accidental pushes from a host project into the corpus repo:

### Layer 1: GitHub branch protection (configure on corpus repo)

Settings → Branches → Add rule for `main`:
- Require a pull request before merging
- Require status checks to pass (select `verify` job)
- Restrict who can push to matching branches (only corpus maintainers)

This blocks ALL direct pushes to `main`, regardless of who tries.

### Layer 2: Submodule design (default git behavior)

By default, `git push` in a host project pushes only the host's history —
NOT the submodule's contents. To push into the corpus repo, a developer
must explicitly:

```bash
cd standards/
git add . && git commit -m "..."
git push origin main   # requires write access to corpus repo
```

If the developer has no write access, this fails with `403 Forbidden`.

### Layer 3: CI on the corpus repo (already active)

`.github/workflows/standards.yml` runs on every PR to the corpus repo. Even
if a maintainer accidentally weakens an invariant (e.g. sets Badges back to
Optional), V10 fails and Layer 1 blocks the merge.

### Escape hatch for host project developers

If a developer in a host project needs to fix a bug in the corpus:

1. Fork the corpus repo
2. Create a branch, push to the fork
3. Open a PR against the upstream corpus repo
4. CI runs (V01-V10 + cascade)
5. Corpus maintainer reviews and merges
6. Host project bumps the submodule pointer to the new commit

---

Built with: Standards corpus + Node.js 20 + GitHub Actions
