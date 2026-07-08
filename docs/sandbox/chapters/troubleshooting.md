# Chapter 3: Troubleshooting

## 7. Dev Server Won't Start

### Symptoms

```bash
cat .zscripts/dev.log | tail -30
# Shows: EADDRINUSE, Connection refused, or just empty
```

### Solution: Full Reinitialization

```bash
# Step 1: Kill everything
pkill -f "next"
pkill -f "node"
pkill -f "bun"

# Step 2: Remove cache
rm -rf /home/z/my-project/.next

# Step 3: Reinitialize
curl https://z-cdn.chatglm.cn/fullstack/init-fullstack_1775040338514.sh | bash

# Step 4: Wait 10-15 seconds
sleep 15

# Step 5: Verify
cat /home/z/my-project/.zscripts/dev.log | tail -20
```

### If Reinitialization Doesn't Help

```bash
# Check if log file is being written at all
ls -la /home/z/my-project/.zscripts/dev.log
ls -la /home/z/my-project/.zscripts/dev.pid

# If dev.pid exists but server is dead:
kill $(cat /home/z/my-project/.zscripts/dev.pid)
curl https://z-cdn.chatglm.cn/fullstack/init-fullstack_1775040338514.sh | bash
```

---

## 8. Port 3000 Busy (EADDRINUSE)

### Real Case

```text
Error: listen EADDRINUSE: address already in use :::3000
```

This means: the dev server is already running (possibly manually started in a previous session).

### Solution

```bash
# Step 1: Do NOT start manually! The sandbox will start the server itself.

# Step 2: If a restart is needed:
pkill -f "next dev"
pkill -f "bun run dev"

# Step 3: Reinitialize
curl https://z-cdn.chatglm.cn/fullstack/init-fullstack_1775040338514.sh | bash
```

> **Important:** In the sandbox NEVER run `npm run dev`, `bun run dev`, `next dev`. The server starts automatically via `.zscripts/dev.sh`.

---

## 9. HMR Crashed - Page Returns 500

### Symptoms

```text
GET / 500 in 942ms (compile: 852ms, render: 90ms)
```

### Cause

You changed/deleted files that Turbopack (HMR) tried to reload. For example:

- Deleted a component that is imported in `page.tsx`
- Renamed a folder
- Added a submodule (deleted and recreated a folder)

### Solution

```bash
# HMR does not recover on its own after file deletion.
# A full restart is needed:

pkill -f "next dev"
rm -rf /home/z/my-project/.next
curl https://z-cdn.chatglm.cn/fullstack/init-fullstack_1775040338514.sh | bash
sleep 15
cat /home/z/my-project/.zscripts/dev.log | tail -10
# Expected: GET / 200
```

---

## 10. Modules Not Found (Module not found)

### Symptoms

```text
Module not found: Can't resolve '@/lib/guided-tour/src'
```

### Causes and Solutions

| Cause                               | Solution                                                 |
| ----------------------------------- | -------------------------------------------------------- |
| Package not installed               | `cd /home/z/my-project && bun add <package>`             |
| Wrong import path                   | Check path: file must exist at the specified path        |
| Path ends with a file, not a folder | `@/lib/guided-tour` instead of `@/lib/guided-tour/index` |
| Deleted file but import remains     | Update import in `page.tsx`                              |
| Submodule not downloaded            | `git submodule update --init --recursive`                |

### How to Verify

```bash
# Check that the file exists
ls /home/z/my-project/src/lib/guided-tour/index.ts

# Check alias path (should be @/ -> src/)
cat /home/z/my-project/tsconfig.json | grep -A3 "paths"

# Check linter
cd /home/z/my-project && bun run lint
```

---

## 11. Git Submodule

### Adding a Submodule

```bash
# Step 1: Prepare the submodule folder
mkdir -p /home/z/my-project/src/lib/guided-tour

# Step 2: Add submodule
cd /home/z/my-project
git submodule add https://github.com/user/GuidedTour.git src/lib/guided-tour

# Step 3: Verify
cat .gitmodules
# Should show:
# [submodule "src/lib/guided-tour"]
#     path = src/lib/guided-tour
#     url = https://github.com/user/GuidedTour.git

ls src/lib/guided-tour/
# Should show component files

# Step 4: Update imports in code
# Was: import { X } from "@/components/ui/guided-tour"
# Now: import { X } from "@/lib/guided-tour"

# Step 5: Reinitialize sandbox (HMR may crash)
curl https://z-cdn.chatglm.cn/fullstack/init-fullstack_1775040338514.sh | bash
```

### If Submodule Won't Push (Protected Branch)

```bash
# Push to a separate branch, then PR through GitHub UI:
git checkout -b feature/my-changes
git push origin feature/my-changes

# Create PR: https://github.com/user/repo/pull/new/feature/my-changes
```

### Updating a Submodule

```bash
# Quick update
git submodule update --remote src/lib/guided-tour
```

**Full cycle (update + commit):**

```bash
# 1. Pull changes from upstream
git submodule update --remote src/lib/guided-tour

# 2. See what changed
git diff src/lib/guided-tour

# 3. Commit the new version
git add src/lib/guided-tour
git commit -m "chore: update GuidedTour submodule"

# 4. Reinitialize sandbox (if dependencies are needed)
curl https://z-cdn.chatglm.cn/fullstack/init-fullstack_1775040338514.sh | bash
```

**Check current submodule version:**

```bash
git submodule status src/lib/guided-tour
```

**What's new since last update:**

```bash
cd src/lib/guided-tour && git log --oneline HEAD..origin/main && cd -
```

**Rollback if broken:**

```bash
cd src/lib/guided-tour
git checkout <commit-hash>
cd ..
git add src/lib/guided-tour
git commit -m "chore: pin GuidedTour to <commit-hash>"
```

---

## 12. Common Errors and Solutions

| N   | Error                        | Cause                              | Solution                                     |
| --- | ---------------------------- | ---------------------------------- | -------------------------------------------- |
| 1   | `Module not found`           | Package not installed              | `bun add <package>`                          |
| 2   | `EADDRINUSE`                 | Server already running             | `pkill -f next` + reinitialize               |
| 3   | `GET / 500`                  | Code error                         | Check `.zscripts/dev.log`                    |
| 4   | `GET / 200` but white screen | HMR broken                         | Reinitialize sandbox                         |
| 5   | `Connection refused`         | Server not running                 | Reinitialize sandbox                         |
| 6   | Preview doesn't update       | Dev server crashed                 | `cat .zscripts/dev.log` + reinitialize       |
| 7   | Submodule folder empty       | Forgot `--recurse-submodules`      | `git submodule update --init --recursive`    |
| 8   | TypeScript errors            | Wrong types                        | `bunx tsc --noEmit`                          |
| 9   | Imports not working          | Wrong path                         | Use `@/` alias                               |
| 10  | Turbopack panic              | File deletion while server running | Reinitialize sandbox                         |
| 11  | Cannot find module           | Package not installed              | `cd /home/z/my-project && bun add <package>` |
| 12  | Port 3000 already in use     | Dev server already running         | Do NOT start server manually                 |
| 13  | "sandbox is inactive"        | Dev server killed on idle          | See section 17.1                             |
