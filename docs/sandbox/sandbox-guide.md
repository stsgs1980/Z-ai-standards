# Z.ai Sandbox - Complete Guide

> This guide is based on real hands-on experience. All errors and solutions are real.

---

## Table of Contents

| Chapter                                                   | Description                                                           |
| --------------------------------------------------------- | --------------------------------------------------------------------- |
| [1. Getting Started](chapters/getting-started.md)         | Quick start, project structure, development rules, dependencies       |
| [2. Preview and Cloning](chapters/preview-and-cloning.md) | Preview panel, cloning third-party projects                           |
| [3. Troubleshooting](chapters/troubleshooting.md)         | Dev server issues, ports, HMR, modules, git submodules, common errors |
| [4. Reference](chapters/reference.md)                     | Commands, checklist, workflow, golden rules, infrastructure issues    |

---

## Quick Reference

### Initialization

```bash
# ALWAYS the first command
curl https://z-cdn.chatglm.cn/fullstack/init-fullstack_1775040338514.sh | bash
```

### Install Packages

```bash
cd /home/z/my-project && bun add <package>
```

### Check Logs

```bash
cat /home/z/my-project/.zscripts/dev.log | tail -30
```

### Restart Sandbox

```bash
curl https://z-cdn.chatglm.cn/fullstack/init-fullstack_1775040338514.sh | bash
```

---

## Golden Rules

1. **ALWAYS** start with `curl ... init-fullstack ... | bash`
2. **NEVER** start the dev server manually (`npm run dev`, `bun run dev`, `next dev`)
3. **ALL CODE** goes in `/home/z/my-project/` (project root, not subfolders)
4. **LOGS** are always here: `cat /home/z/my-project/.zscripts/dev.log | tail -30`
5. **DEPENDENCIES** are installed via: `cd /home/z/my-project && bun add <package>`
6. **RESTART** = reinitialize: `curl ... init-fullstack ... | bash`
7. **BROKEN** - don't fix manually, reinitialize

**Main rule:**

> Write code in `/home/z/my-project/src/app/page.tsx`, install dependencies via `bun add`, and the preview will appear on the right by itself.

---

Built with: Next.js 16 + TypeScript + Tailwind CSS
