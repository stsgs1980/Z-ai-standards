# Host Project Templates

This directory contains ready-to-copy templates for projects that consume
the z-ai-standards corpus as a git submodule.

## Files

| File | Purpose |
|------|---------|
| `.github/workflows/standards-version-check.yml` | Weekly CI job that runs corpus invariants + checks if the host's pinned submodule version is behind upstream. Copy into your host project's `.github/workflows/`. |

## Usage

1. Add the corpus as a submodule to your host project:

   ```bash
   cd my-app
   git submodule add git@github.com:<owner>/z-ai-standards.git standards
   git commit -m "Add z-ai-standards corpus as submodule"
   ```

2. Copy the workflow template into your host project:

   ```bash
   cp standards/host-project-templates/.github/workflows/standards-version-check.yml \
      .github/workflows/
   ```

3. Edit the copied file:
   - Replace `<owner>` in `STANDARDS_CORPUS_URL` with your GitHub org/username.
   - Optionally set `STANDARDS_BEHIND_OK: "1"` to make the freshness check
     advisory-only (workflow stays green even when behind upstream).

4. Commit:

   ```bash
   git add .github/workflows/standards-version-check.yml
   git commit -m "Add standards submodule freshness check"
   git push
   ```

After push, the workflow runs:
- On every push to `main` that touches `standards/**`
- Weekly (Monday 09:00 UTC by default)
- Manually via the GitHub Actions UI ("Run workflow" button)

## What the workflow does

1. Checks out your host project with submodules (`actions/checkout@v4` with `submodules: recursive`)
2. Runs `verify-standards.js` (V01-V10) — must pass
3. Runs `verify-cascade.js` (47 checks) — must pass
4. Runs `check-updates.sh` — compares local VERSION to upstream's latest semver tag
5. Writes a GitHub Step Summary with version info

If any step fails, the workflow is red. Branch protection rules on your host repo's `main` branch can then block merges that would push a broken or outdated corpus pin.

## See also

- `../STANDARDS.md` — full maintenance protocol including "Using as a submodule" and "Protection" sections
- `../CHANGELOG.md` — version history of the corpus
- `../VERSION` — current corpus version
