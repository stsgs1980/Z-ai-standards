# Standard: Z.ai Integration v1.3 (EN)

> ID: STD-ENV-002
> Version: 1.3
> Level: **[C] Critical**
> Related: REPRODUCIBILITY-STANDARD (STD-ENV-001), sandbox-rules.md (instructions/)
> verified_by: scripts/verify-standards.js#V01 (§5.1 startup command), scripts/verify-standards.js#V02 (§3+§5 log path)

---

## 1. Introduction

This standard defines rules and best practices for AI agent operation within the Z.ai sandbox environment. It ensures consistent, safe, and reproducible behavior across all Z.ai chat sessions.

---

## 2. Sandbox Environment Constraints

The Z.ai sandbox has specific characteristics that affect all operations:

| Constraint | Impact | Mitigation |
|-----------|--------|------------|
| Shared filesystem | Files from one chat visible in all chats | Use project-specific directories |
| Chat = Shell process | Processes die when chat ends | Use `disown` for background processes |
| Process mortality | Background processes die after ~5 min inactivity | Watchdog with cron every 5 min |
| No cross-chat process sharing | Cannot control processes from other chats | File-based coordination |
| Git lockup possible | Previous chat may leave git blocked | Recovery protocol defined below |

---

## 3. Project Directory

All projects MUST reside in `/home/z/my-project/`:

- This is the designated sandbox working directory
- Do NOT create project clones in other directories
- All relative paths in configs must resolve from this directory
- Output files go to `/home/z/my-project/download/`
- Dev server logs go to `/home/z/my-project/.zscripts/dev.log`

### 3.1 Absolute Path Exception

`/home/z/my-project/` and related sandbox paths are allowed as environment-constant exceptions in Z.ai sandbox code. All other absolute paths are prohibited by REPRODUCIBILITY-STANDARD (STD-ENV-001 v1.1, L1 Path Rules).

| Path | Status | Reason |
|------|--------|--------|
| `/home/z/my-project/` | Allowed | Designated sandbox working directory |
| `/home/z/my-project/download/` | Allowed | Designated output directory |
| `/home/z/my-project/.zscripts/dev.log` | Allowed | Dev server log (managed by sandbox) |
| `/home/z/my-project/.zscripts/` | Allowed | Sandbox infrastructure scripts directory |
| `/tmp/` (for backups) | Allowed | Temporary backups (not committed) |
| `/home/user/`, `/Users/`, `C:\` | Prohibited | Platform-specific, breaks reproducibility |
| `http://localhost:` in source | Prohibited | Use relative paths or XTransformPort |

Relative paths are preferred when `process.cwd()` resolves to `/home/z/my-project/`. Use `path.resolve(process.cwd(), ...)` for database and file paths.

---

## 4. Git Operations in Sandbox

### 4.1 Backup Before Rewrite

Before any git operation that rewrites history (rebase, merge, pull, reset --hard):

```bash
git stash push -m "pre-op-backup"
cp -r src/ /tmp/src-backup/
git log --oneline -20 > /tmp/git-log-backup.txt
```

### 4.2 Force Push Over Rebase

- `git push --force-with-lease origin main` -- CORRECT
- `git push --force origin main` -- AVOID
- `git pull --rebase` -- FORBIDDEN (blocks sandbox on conflict)

### 4.3 Git Lockup Recovery

If a previous chat left git in a blocked state:

```bash
rm -rf .git/rebase-merge .git/rebase-apply
git reset --hard HEAD
```

This must be done from a NEW chat session.

---

## 5. Dev Server Protocol

### 5.1 Startup

**CRITICAL:** NEVER run the dev server manually. The Z.ai sandbox manages the dev server automatically via `.zscripts/dev.sh`, which is initialized by the `init-fullstack` script.

The dev server starts automatically when the sandbox initializes. If the server is down, use the sandbox's built-in restart mechanism:

```bash
# Check if dev server is running
curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:3000/

# If server is down (000), re-initialize via the init script
curl https://z-cdn.chatglm.cn/fullstack/init-fullstack_1775040338514.sh | bash
```

**FORBIDDEN:** Do NOT run `npx next dev` or `bun run dev` manually. Manual startup BREAKS the Preview Panel and interferes with sandbox infrastructure.

### 5.2 Rules

- NEVER run the dev server manually -- the sandbox manages it via `.zscripts/dev.sh`
- Always check logs via: `cat /home/z/my-project/.zscripts/dev.log | tail -30`
- Always use `127.0.0.1` for health checks (not `localhost`)
- If the dev server is unresponsive, re-run the `init-fullstack` script rather than manually starting `next dev`
- The sandbox automatically handles `disown`, output redirection, and stdin closure

### 5.3 Health Check Response Codes

| Code | Action |
|------|--------|
| 200 | Server running, proceed |
| 000 | Server down, restart |
| 500 | Server error, check logs |

---

## 6. Session Continuity

### 6.1 Context Preservation

When a session is interrupted or context is lost:

1. Read `worklog.md` for previous session history
2. Check git state: `git log --oneline -10` and `git status`
3. Verify dev server status
4. Report current state to user before continuing

### 6.2 Worklog Protocol

- Every agent MUST append work records to `worklog.md`
- Format: Task ID, agent name, work log, stage summary
- NEVER overwrite existing worklog entries
- Use `/home/z/my-project/worklog.md` as the canonical location

---

## 7. File Safety

### 7.1 Auto-Backup

Before any write mutation on critical files:
- Create a backup copy in `/tmp/`
- Log the backup location in worklog.md

### 7.2 Safe Delete

Before deleting any entity:
- Verify with user via confirmation dialog
- Archive instead of hard-delete when possible

---

## 8. API Communication

### 8.1 z-ai-web-dev-sdk

- Use `z-ai-web-dev-sdk` for AI model interactions
- MUST be used in backend code only (never client-side)
- Import: `import ZAI from 'z-ai-web-dev-sdk'`

### 8.2 Retry Strategy

When calling chat.z.ai:
- Exponential backoff: 2s initial, 2x multiplier
- Max 3 retries
- Retryable: 502, 503, 504
- Non-retryable: 401, 403, 404

---

## 9. SDK Integration

### 9.1. SDK Usage Rules

1. **Backend-only**: z-ai-web-dev-sdk MUST only be used in API routes (app/api/), never in client components
2. **Singleton Pattern**: Create a single ZAI instance and reuse it across requests
3. **Error Propagation**: All SDK errors must propagate through the api-retry skill
4. **Health Check**: Verify chat.z.ai availability via health-check skill before SDK calls
5. **Fallback Chain**: When SDK fails, use fallback skill to switch providers
6. **Image Generation**: Use z-ai-generate CLI for website assets (favicon, logo, backgrounds)
7. **Web Search**: Use zai.functions.invoke("web_search", {...}) for real-time data
8. **Type Safety**: Always type API responses with TypeScript interfaces
9. **Timeout**: Set explicit timeouts (30s for chat, 60s for image generation)
10. **Logging**: Log all SDK interactions to worklog.md with request/response metadata

### 9.2. Canonical Client-Side Pattern (useAI Hook)

Client components MUST NOT import `z-ai-web-dev-sdk` directly. Instead, use a custom hook that calls a backend API route. The canonical flow:

```text
Client Component (features/)
  -> useAI hook (hooks/)
    -> fetch('/api/ai/chat')
      -> API Route (app/api/ai/chat/route.ts)
        -> ZAI.create() + zai.chat.completions.create()
          -> chat.z.ai
```

**Canonical `useAI` hook (see STD-FE-001 Section 12.1 for full implementation):**

```typescript
// hooks/useAI.ts
export function useAI(options: UseAIOptions = {}): UseAIReturn {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [response, setResponse] = useState<string>('')

  const generate = useCallback(async (prompt: string): Promise<string> => {
    setLoading(true); setError(null)
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, ...options }),
      })
      if (!res.ok) throw new Error(`API Error: ${res.status}`)
      const data = await res.json()
      setResponse(data.data.content)
      return data.data.content
    } catch (err) {
      setError(err as Error); throw err
    } finally { setLoading(false) }
  }, [options])

  return { generate, loading, error, response, reset: () => { setResponse(''); setError(null); setLoading(false) } }
}
```

**Rules:**
- The hook NEVER imports `z-ai-web-dev-sdk` (backend-only)
- The hook lives in `hooks/` layer (STD-FE-001 Section 3.3)
- The API route MUST use Zod validation (STD-FE-001 Section 10.3) and return `{ success, data? / error? }` format (STD-FE-001 Section 10.2)
- Errors from the hook MUST be handled by the consumer via `ApplicationError` (STD-ERR-001 Section 5.2)
- The hook MUST expose `loading`, `error`, and the primary action function (`generate`)

**Forbidden patterns:**

```typescript
// [FAIL] Client component imports SDK directly
'use client'
import ZAI from 'z-ai-web-dev-sdk'  // FORBIDDEN — bundle size + API key leak

// [FAIL] Client component calls chat.z.ai directly
const res = await fetch('https://chat.z.ai/api/...')  // FORBIDDEN — no auth, no rate limit

// [OK] Client component uses useAI hook
const { generate, loading, error } = useAI()
await generate('Summarize this page')
```

---

## 12. Sandbox Troubleshooting

This section provides diagnostic procedures for common sandbox failures. All procedures assume the canonical sandbox structure (`.zscripts/dev.sh`, `.zscripts/dev.log`, `.zscripts/dev.pid`).

### 12.1. Diagnostic Table

| Symptom | Likely Cause | Diagnostic Command | Resolution |
|---------|--------------|--------------------|------------|
| `GET / 500` in dev.log | Compile error in code | `cat .zscripts/dev.log \| tail -30` (look for error stack) | Fix the code error, sandbox HMR will reload |
| `GET / 200` but blank screen | HMR desync (deleted file still imported) | `cat .zscripts/dev.log \| tail -20` (look for "Module not found") | Re-initialize sandbox (Section 12.2 step 3) |
| `Connection refused` on port 3000 | Dev server crashed or not started | `curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:3000/` returns `000` | Re-initialize sandbox (Section 12.2 step 3) |
| `EADDRINUSE: address already in use :::3000` | Manual dev server start (forbidden) | `lsof -i :3000` shows a process | `pkill -f "next dev"` then re-initialize |
| `Module not found: Can't resolve '@/...'` | Missing package or wrong import path | `ls /home/z/my-project/src/...` (verify file exists) | `bun add <package>` OR fix import path |
| Preview panel stuck on loading | Dev server not responding to HMR events | `cat .zscripts/dev.log \| tail -30` (no recent entries) | Re-initialize sandbox (Section 12.2 step 3) |
| White screen after deleting files | Turbopack panic from deleted imports | `cat .zscripts/dev.log \| tail -30` (look for "Turbopack panic") | `rm -rf .next` then re-initialize |
| TypeScript errors in editor | Stale types or missing types | `bunx tsc --noEmit` | Install missing `@types/*` or fix types |

### 12.2. Recovery Procedures

**Level 1: Read logs (always start here)**

```bash
cat /home/z/my-project/.zscripts/dev.log | tail -30
cat /home/z/my-project/.zscripts/dev.pid  # check if PID file exists
ps -p $(cat /home/z/my-project/.zscripts/dev.pid 2>/dev/null) 2>/dev/null  # is process alive?
```

**Level 2: Re-initialize sandbox (default fix)**

```bash
# Step 1: Kill any manually-started dev servers (NEVER kill the .zscripts/dev.sh-managed one)
pkill -f "next dev" 2>/dev/null
pkill -f "bun run dev" 2>/dev/null

# Step 2: Clear Next.js cache (HMR state)
rm -rf /home/z/my-project/.next

# Step 3: Re-initialize via the canonical init script
curl https://z-cdn.chatglm.cn/fullstack/init-fullstack_1775040338514.sh | bash

# Step 4: Wait for dev server to bind
sleep 15

# Step 5: Verify
curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:3000/
# Expected: 200
cat /home/z/my-project/.zscripts/dev.log | tail -10
# Expected: "GET / 200 in ..."
```

**Level 3: Hard reset (when Level 2 fails)**

```bash
# Step 1: Kill all Node/Bun processes
pkill -f "next" 2>/dev/null
pkill -f "node" 2>/dev/null
pkill -f "bun" 2>/dev/null

# Step 2: Remove all build artifacts and sandbox state
rm -rf /home/z/my-project/.next
rm -f /home/z/my-project/.zscripts/dev.pid

# Step 3: Reinstall dependencies
cd /home/z/my-project && bun install

# Step 4: Re-initialize
curl https://z-cdn.chatglm.cn/fullstack/init-fullstack_1775040338514.sh | bash
sleep 15

# Step 5: Verify (same as Level 2 step 5)
```

### 12.3. Health Check Codes

| HTTP Code | Meaning | Action |
|-----------|---------|--------|
| 200 | Dev server running, responding to requests | Proceed with work |
| 000 | No response (server down or not bound to port) | Recovery Level 2 |
| 500 | Server error (compile error or runtime crash) | Check `.zscripts/dev.log`, fix code, recovery Level 2 if needed |
| 502 | Bad gateway (proxy upstream down) | Recovery Level 3 |
| 503 | Service unavailable (sandbox resource exhausted) | Wait 60s, retry; if persists, restart session |

### 12.4. Forbidden Manual Operations

These operations are FORBIDDEN because they break the sandbox-managed dev server:

| Operation | Why Forbidden | Use Instead |
|-----------|---------------|-------------|
| `npx next dev` | Breaks Preview Panel, conflicts with `.zscripts/dev.sh` | Re-initialize via `init-fullstack` script |
| `bun run dev` | Same as above | Re-initialize via `init-fullstack` script |
| `npm run dev` | Same as above | Re-initialize via `init-fullstack` script |
| `kill -9 $(cat .zscripts/dev.pid)` | Leaves orphan processes and stale state | `pkill -f "next dev"` then re-initialize |
| Editing `.zscripts/dev.sh` directly | Sandbox-managed file; changes will be overwritten | Configure via `next.config.ts` instead |
| `npx create-next-app` | Creates nested project, breaks sandbox paths | Use `init-fullstack` script which creates canonical structure |

---

## 13. Git Submodule Integration in Sandbox

Git submodules allow embedding external repositories (e.g., shared component libraries) into a Z.ai sandbox project. The sandbox's path constraints (`/home/z/my-project/` only) require a specific workflow.

### 13.1. Adding a Submodule

**Canonical procedure (clone to /tmp, rsync to root, reinit):**

```bash
# Step 1: Initialize sandbox first (creates Next.js scaffold)
curl https://z-cdn.chatglm.cn/fullstack/init-fullstack_1775040338514.sh | bash

# Step 2: Add submodule via git (this creates .gitmodules and the submodule folder)
cd /home/z/my-project
git submodule add https://github.com/user/Library.git src/lib/library

# Step 3: Verify .gitmodules
cat .gitmodules
# Expected:
# [submodule "src/lib/library"]
#     path = src/lib/library
#     url = https://github.com/user/Library.git

# Step 4: Update imports in your code
# Before: import { X } from "@/components/ui/library"
# After:  import { X } from "@/lib/library"

# Step 5: Re-initialize sandbox (HMR may crash after submodule add)
curl https://z-cdn.chatglm.cn/fullstack/init-fullstack_1775040338514.sh | bash
sleep 15
curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:3000/
```

**Forbidden: cloning directly into project subdirectory:**

```bash
# [FAIL] This creates a nested git repo, not a submodule
cd /home/z/my-project
git clone https://github.com/user/Library.git src/lib/library
# Result: src/lib/library/.git exists but no .gitmodules entry
# Consequence: git operations on parent repo ignore the nested repo,
#   and the parent repo's git status shows the folder as untracked
```

### 13.2. Updating a Submodule

```bash
# Pull latest changes from the submodule's upstream
cd /home/z/my-project
git submodule update --remote src/lib/library

# Review what changed
git diff src/lib/library

# Commit the new submodule version
git add src/lib/library
git commit -m "chore: update Library submodule to latest"

# Check current submodule version
git submodule status src/lib/library

# See what's new since last update
cd src/lib/library && git log --oneline HEAD..origin/main && cd ..

# Re-initialize if the submodule has new dependencies
curl https://z-cdn.chatglm.cn/fullstack/init-fullstack_1775040338514.sh | bash
```

### 13.3. Rollback a Submodule

If a submodule update breaks the project:

```bash
# Find the previous commit hash
cd src/lib/library
git log --oneline -5
cd ..

# Pin the submodule to a known-good commit
cd src/lib/library
git checkout <known-good-commit-hash>
cd ..
git add src/lib/library
git commit -m "fix: pin Library submodule to <commit-hash> after regression"

# Re-initialize sandbox
curl https://z-cdn.chatglm.cn/fullstack/init-fullstack_1775040338514.sh | bash
```

### 13.4. Submodule Workflow Rules

1. **Always initialize the sandbox BEFORE adding submodules** — the init script creates the canonical Next.js structure that submodules integrate into
2. **Always re-initialize AFTER adding/updating submodules** — HMR (Turbopack) crashes when folder structure changes mid-run
3. **Submodule paths MUST be under `src/`** — never place submodules at project root (breaks FSD layer separation, see STD-FE-001 Section 3.3)
4. **Submodule dependencies install at the parent level** — never run `bun install` inside a submodule folder; the parent `package.json` is the source of truth
5. **Cross-reference**: For git-specific rules (commit format, push policy, deadlock prevention during submodule operations), see STD-GIT-002

---

**Document complies with MARKDOWN_STANDARD v2.1 (level [W])**

---

## 10. Version History

| Version | Date | Changes |
|--------|------|---------|
| 1.3 | 2026-06-16 | [L3-002] Added Section 12: Sandbox Troubleshooting (diagnostic table, recovery procedures L1-L3, health check codes, forbidden manual operations). [L3-003] Added Section 13: Git Submodule Integration in Sandbox (adding, updating, rollback, workflow rules). [L3-004] Added Section 9.2: Canonical Client-Side Pattern (useAI hook) showing client -> hook -> API route -> SDK -> chat.z.ai flow. |
| 1.2 | 2026-06-16 | [L1-001] Fixed Section 5: replaced manual `npx next dev` with sandbox-managed `init-fullstack` protocol. [L1-002] Fixed log path: `/tmp/zdev.log` -> `/home/z/my-project/.zscripts/dev.log`. Added `.zscripts/` to path exceptions (Section 3.1). |
| 1.1 | 2026-05-14 | Added SDK Integration section with 10 usage rules |
| 1.0 | 2026-05 | Initial standard extracted from AGENT_RULES.md |

---

## 11. Cross-References

| Standard | Relationship |
|----------|-------------|
| STD-ENV-001 | Reproducibility Standard: path rules (Section 1.2 cross-references sandbox path allowance) |
| STD-FE-001 | Frontend Standard: Section 12 (AI Hook Patterns) defines useAI/useChat/useImage hooks that call API routes governed by this standard's Section 9 |
| STD-ERR-001 | Error Handling: API routes and hooks propagate errors via ApplicationError |
| STD-GIT-002 | GitHub Sandbox Safety: submodule git operations, deadlock prevention during submodule updates |

---

Built with: Next.js 16 + TypeScript + Tailwind CSS
