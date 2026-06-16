# Z.ai Sandbox — Complete Guide

> This guide is based on real-world experience. All errors and solutions are real.
> verified_by: scripts/verify-standards.js#V04 (no emoji/Unicode graphic chars), scripts/verify-standards.js#V08 (code fences have language tag), scripts/verify-standards.js#V09 (English-only)

---

## Table of Contents

1. [Quick Start (Clean Install)](#1-quick-start-clean-install)
2. [Everything Installed, But Nothing Works](#2-everything-installed-but-nothing-works)
3. [Cloning a Third-Party Project into the Sandbox](#3-cloning-a-third-party-project-into-the-sandbox)
4. [Dev Server Won't Start](#4-dev-server-wont-start)
5. [Port 3000 Already in Use (EADDRINUSE)](#5-port-3000-already-in-use-eaddrinuse)
6. [HMR Crashed — Page Returns 500](#6-hmr-crashed-page-returns-500)
7. [Module Not Found](#7-module-not-found)
8. [Adding a Git Submodule](#8-adding-a-git-submodule)
9. [Updating a Submodule](#9-updating-a-submodule)
10. [Useful Commands](#10-useful-commands)
11. [Common Errors and Solutions](#11-common-errors-and-solutions)

---

## 1. Quick Start (Clean Install)

### Clean Start — Correct Sequence

```bash
# Step 1: Initialize the sandbox (ALWAYS the first command)
curl https://z-cdn.chatglm.cn/fullstack/init-fullstack_1775040338514.sh | bash
```

This command:
- Creates the Next.js 16 project structure
- Installs base dependencies
- Configures TypeScript, Tailwind CSS, shadcn/ui
- **Automatically starts the dev server** in the background via `.zscripts/dev.sh`
- Writes logs to `/home/z/my-project/.zscripts/dev.log`

```bash
# Step 2: Install additional dependencies
cd /home/z/my-project && bun add <package-name>

# Example:
bun add framer-motion
bun add three @react-three/fiber @react-three/drei
```

```bash
# Step 3: Verify everything works
cat /home/z/my-project/.zscripts/dev.log | tail -20
# Expected: "GET / 200 in ..."
```

### What NOT to Do

```bash
# [FAIL] DO NOT start the dev server manually
npm run dev
bun run dev
next dev
npx next dev

# [FAIL] DO NOT create projects from scratch
npx create-next-app

# [FAIL] DO NOT clone into subfolders (see Section 3)
git clone ... && cd subdir && npm install
```

> **Why:** The sandbox manages the dev server itself via `.zscripts/dev.sh`. Manual startup breaks the Preview Panel — the preview stops updating and becomes unusable.

---

## 2. Everything Installed, But Nothing Works

### Scenario: "I did something, and the sandbox stopped showing the preview"

**What we did wrong (real case):**

1. Cloned a repository into a **subfolder** `/home/z/my-project/Rust-performance-optimization/`
2. Ran the dev server **manually** via `npx next dev`
3. Dev server periodically crashed during HMR; preview did not work

**How to fix:**

```bash
# Step 1: Kill ALL manually started processes
pkill -f "next dev"
pkill -f "bun run dev"

# Step 2: Ensure ports are freed
lsof -i :3000  # should be empty

# Step 3: Copy code from the subfolder into the project ROOT
# If you cloned into a subfolder — move the files:
rsync -av --exclude='node_modules' --exclude='.next' \
  /home/z/my-project/ subdir/ /home/z/my-project/

# Step 4: Reinstall dependencies in the root
cd /home/z/my-project && bun install

# Step 5: Reinitialize the sandbox
curl https://z-cdn.chatglm.cn/fullstack/init-fullstack_1775040338514.sh | bash

# Step 6: Check the logs
cat /home/z/my-project/.zscripts/dev.log | tail -20
# Expected: "GET / 200 in ..."
```

### Other Causes of a Broken Preview

| Symptom | Cause | Solution |
|---|---|---|
| Page returns 500 | Compilation error in code | `cat .zscripts/dev.log \| tail -30` — look for the error |
| White screen | Dev server crashed | Reinitialize the sandbox |
| Preview shows stale content | HMR is broken | Reinitialize the sandbox |
| "Connection refused" | No process on port 3000 | Reinitialize the sandbox |
| Module not found | Forgot `bun add` | `bun add <package>` |

---

## 3. Cloning a Third-Party Project into the Sandbox

### Correct Way (Code Goes into the Project Root)

```bash
# Step 1: Initialize the sandbox (creates the Next.js scaffold)
curl https://z-cdn.chatglm.cn/fullstack/init-fullstack_1775040338514.sh | bash

# Step 2: Clone TEMPORARILY into a separate folder
cd /tmp && git clone https://github.com/user/project.git

# Step 3: Copy project files into the sandbox ROOT
rsync -av --exclude='node_modules' --exclude='.next' \
  /tmp/project/ /home/z/my-project/

# Step 4: Install dependencies IN THE sandbox root
cd /home/z/my-project && bun install

# Step 5: Reinitialize (will restart the dev server)
curl https://z-cdn.chatglm.cn/fullstack/init-fullstack_1775040338514.sh | bash

# Step 6: Verify
cat /home/z/my-project/.zscripts/dev.log | tail -20
```

### Wrong Way (DO NOT DO THIS)

```bash
# [FAIL] DO NOT clone directly into a project subfolder
cd /home/z/my-project
git clone https://github.com/user/project.git my-project
cd my-project && npm install && npm run dev  # Will break the sandbox!
```

> **Why this does not work:** The sandbox dev server runs in `/home/z/my-project/` and expects the code there. If the code is in a subfolder, the preview shows the default placeholder instead of your project.

### If You Need a Database (Prisma)

```bash
# After copying files into the root:
cd /home/z/my-project

# Apply the schema
bunx prisma db push

# Generate the client
bunx prisma generate
```

---

## 4. Dev Server Won't Start

### Symptoms

```bash
cat .zscripts/dev.log | tail -30
# Shows: EADDRINUSE, Connection refused, or simply empty
```

### Solution: Full Reinitialization

```bash
# Step 1: Kill everything
pkill -f "next"
pkill -f "node"
pkill -f "bun"

# Step 2: Remove the cache
rm -rf /home/z/my-project/.next

# Step 3: Reinitialize
curl https://z-cdn.chatglm.cn/fullstack/init-fullstack_1775040338514.sh | bash

# Step 4: Wait 10-15 seconds
sleep 15

# Step 5: Verify
cat /home/z/my-project/.zscripts/dev.log | tail -20
```

### If Reinitialization Does Not Help

```bash
# Check that the log file is being written at all
ls -la /home/z/my-project/.zscripts/dev.log
ls -la /home/z/my-project/.zscripts/dev.pid

# If dev.pid exists but the server is dead:
kill $(cat /home/z/my-project/.zscripts/dev.pid)
curl https://z-cdn.chatglm.cn/fullstack/init-fullstack_1775040338514.sh | bash
```

---

## 5. Port 3000 Already in Use (EADDRINUSE)

### Real Case

```text
Error: listen EADDRINUSE: address already in use :::3000
```

This means: a dev server is already running (possibly started manually in a previous session).

### Solution

```bash
# Step 1: DO NOT start it manually! The sandbox will start the server itself.

# Step 2: If a restart is needed:
pkill -f "next dev"
pkill -f "bun run dev"

# Step 3: Reinitialize
curl https://z-cdn.chatglm.cn/fullstack/init-fullstack_1775040338514.sh | bash
```

> **Important:** In the sandbox, NEVER run `npm run dev`, `bun run dev`, or `next dev`. The server starts automatically via `.zscripts/dev.sh`.

---

## 6. HMR Crashed — Page Returns 500

### Symptoms

```text
GET / 500 in 942ms (compile: 852ms, render: 90ms)
```

### Cause

You changed/deleted files that Turbopack (HMR) was trying to reload. For example:
- Deleted a component that is imported in `page.tsx`
- Renamed a folder
- Added a submodule (delete + recreate folder)

### Solution

```bash
# HMR does not recover on its own after file deletions.
# A full restart is required:

pkill -f "next dev"
rm -rf /home/z/my-project/.next
curl https://z-cdn.chatglm.cn/fullstack/init-fullstack_1775040338514.sh | bash
sleep 15
cat /home/z/my-project/.zscripts/dev.log | tail -10
# Expected: GET / 200
```

---

## 7. Module Not Found

### Symptoms

```text
Module not found: Can't resolve '@/lib/guided-tour/src'
```

### Causes and Solutions

| Cause | Solution |
|---|---|
| Package not installed | `cd /home/z/my-project && bun add <package>` |
| Wrong import path | Verify the path: the file must exist at the specified location |
| Path ends at a file instead of a folder | Use `@/lib/guided-tour` instead of `@/lib/guided-tour/index` |
| Deleted file but kept the import | Update the import in `page.tsx` |
| Submodule not downloaded | `git submodule update --init --recursive` |

### How to Verify

```bash
# Verify the file exists
ls /home/z/my-project/src/lib/guided-tour/index.ts

# Check the alias path (should be @/ -> src/)
cat /home/z/my-project/tsconfig.json | grep -A3 "paths"

# Run the linter
cd /home/z/my-project && bun run lint
```

---

## 8. Adding a Git Submodule

### Example: adding GuidedTour as a submodule

```bash
# Step 1: Prepare the folder for the submodule
mkdir -p /home/z/my-project/src/lib/guided-tour

# Step 2: Add the submodule
cd /home/z/my-project
git submodule add https://github.com/user/GuidedTour.git src/lib/guided-tour

# Step 3: Verify
cat .gitmodules
# Expected:
# [submodule "src/lib/guided-tour"]
#     path = src/lib/guided-tour
#     url = https://github.com/user/GuidedTour.git

ls src/lib/guided-tour/
# Component files should be present

# Step 4: Update imports in code
# Before: import { X } from "@/components/ui/guided-tour"
# After:  import { X } from "@/lib/guided-tour"

# Step 5: Reinitialize the sandbox (HMR may crash)
curl https://z-cdn.chatglm.cn/fullstack/init-fullstack_1775040338514.sh | bash
```

### If the Submodule Cannot Be Pushed (Protected Branch)

```bash
# Push to a separate branch, then open a PR via the GitHub UI:
git checkout -b feature/my-changes
git push origin feature/my-changes

# Open the PR: https://github.com/user/repo/pull/new/feature/my-changes
```

---

## 9. Updating a Submodule

### Quick Update

```bash
git submodule update --remote src/lib/guided-tour
```

### Full Cycle (Update + Commit)

```bash
# 1. Pull changes from upstream
git submodule update --remote src/lib/guided-tour

# 2. Inspect what changed
git diff src/lib/guided-tour

# 3. Commit the new version
git add src/lib/guided-tour
git commit -m "chore: update GuidedTour submodule"

# 4. Reinitialize the sandbox (if dependencies are needed)
curl https://z-cdn.chatglm.cn/fullstack/init-fullstack_1775040338514.sh | bash
```

### Check the Current Submodule Version

```bash
git submodule status src/lib/guided-tour
```

### What Changed Since the Last Update

```bash
cd src/lib/guided-tour && git log --oneline HEAD..origin/main && cd -
```

### Roll Back if It Broke

```bash
cd src/lib/guided-tour
git checkout <commit-hash>
cd ..
git add src/lib/guided-tour
git commit -m "chore: pin GuidedTour to <commit-hash>"
```

---

## 10. Useful Commands

### Sandbox State Checks

```bash
# Dev server logs
cat /home/z/my-project/.zscripts/dev.log | tail -30

# Dev server PID
cat /home/z/my-project/.zscripts/dev.pid

# Process info by PID
cat /home/z/my-project/.zscripts/dev.pid | xargs ps -p
```

### Code Checks

```bash
# Linter
cd /home/z/my-project && bun run lint

# TypeScript errors
bunx tsc --noEmit
```

### Database (Prisma)

```bash
cd /home/z/my-project

# Apply the schema
bunx prisma db push

# Generate the client
bunx prisma generate

# Reset the database
bunx prisma migrate reset
```

### Sandbox Restart

```bash
# Standard reinitialization
curl https://z-cdn.chatglm.cn/fullstack/init-fullstack_1775040338514.sh | bash

# Hard restart (if standard reinit does not help)
pkill -f "next dev"
rm -rf /home/z/my-project/.next
curl https://z-cdn.chatglm.cn/fullstack/init-fullstack_1775040338514.sh | bash
```

### Preview URL

```bash
# Find the container ID
echo $FC_CONTAINER_ID
# or
hostname

# Preview URL:
# https://preview-<container-id>.space-z.ai/
```

---

## 11. Common Errors and Solutions

| # | Error | Cause | Solution |
|---|---|---|---|
| 1 | `Module not found` | Package not installed | `bun add <package>` |
| 2 | `EADDRINUSE` | Server already running | `pkill -f next` + reinit |
| 3 | `GET / 500` | Code error | Check `.zscripts/dev.log` |
| 4 | `GET / 200` but white screen | HMR is broken | Reinit the sandbox |
| 5 | `Connection refused` | Server not running | Reinit the sandbox |
| 6 | Preview not updating | Dev server crashed | `cat .zscripts/dev.log` + reinit |
| 7 | Submodule folder empty | Forgot `--recurse-submodules` | `git submodule update --init --recursive` |
| 8 | TypeScript errors | Wrong types | `bunx tsc --noEmit` |
| 9 | Imports do not work | Wrong path | Use the `@/` alias |
| 10 | Turbopack panic | Deleted files while server was running | Reinit the sandbox |

---

## Project Structure

```text
/home/z/my-project/
├── src/
│   ├── app/
│   │   ├── page.tsx          # MAIN FILE — all UI lives here
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/               # shadcn/ui components
│   │   ├── sections/         # Page sections
│   │   ├── features/         # Stateful components
│   │   └── perf/             # Specialized components
│   └── lib/
│       ├── guided-tour/      # Git submodule (GuidedTour)
│       ├── perf-data.ts
│       ├── db.ts
│       └── utils.ts
├── prisma/
│   └── schema.prisma
├── public/
├── .zscripts/
│   ├── dev.sh               # Dev server startup script (DO NOT EDIT)
│   ├── dev.pid              # Process PID
│   └── dev.log              # LOGS (read from here on errors)
├── .gitmodules              # Submodule configuration
├── package.json
├── tsconfig.json
└── next.config.ts
```

---

## Golden Rules of the Sandbox

1. **ALWAYS** start with `curl ... init-fullstack ... | bash`
2. **NEVER** start the dev server manually (`npm run dev`, `bun run dev`, `next dev`)
3. **ALL CODE** is written in `/home/z/my-project/` (project root, not subfolders)
4. **LOGS** are always here: `cat /home/z/my-project/.zscripts/dev.log | tail -30`
5. **DEPENDENCIES** are installed via: `cd /home/z/my-project && bun add <package>`
6. **RESTART** = reinitialization: `curl ... init-fullstack ... | bash`
7. **IF BROKEN** — do not fix manually, reinitialize
