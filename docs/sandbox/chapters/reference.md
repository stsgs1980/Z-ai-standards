# Chapter 4: Reference

## 13. Useful Commands

### Check Sandbox Status

```bash
# Dev server logs
cat /home/z/my-project/.zscripts/dev.log | tail -30

# Dev server PID
cat /home/z/my-project/.zscripts/dev.pid

# Process PID
cat /home/z/my-project/.zscripts/dev.pid | xargs ps -p
```

### Check Code

```bash
# Linter
cd /home/z/my-project && bun run lint

# TypeScript errors
bunx tsc --noEmit
```

### Database (Prisma)

```bash
cd /home/z/my-project

# Apply schema
bunx prisma db push

# Generate client
bunx prisma generate

# Reset database
bunx prisma migrate reset
```

### Restart Sandbox

```bash
# Standard reinitialization
curl https://z-cdn.chatglm.cn/fullstack/init-fullstack_1775040338514.sh | bash

# Hard restart (if standard doesn't help)
pkill -f "next dev"
rm -rf /home/z/my-project/.next
curl https://z-cdn.chatglm.cn/fullstack/init-fullstack_1775040338514.sh | bash
```

### Preview URL

```bash
# Get container ID
echo $FC_CONTAINER_ID
# or
hostname

# Preview URL:
# https://preview-<container-id>.space-z.ai/
```

### Quick Command Reference

```bash
# Initialization
curl https://z-cdn.chatglm.cn/fullstack/init-fullstack_1775040338514.sh | bash

# Install package
cd /home/z/my-project && bun add <package>

# Check code
bun run lint

# Server logs
cat /home/z/my-project/.zscripts/dev.log | tail -20

# Database (if used)
bun run db:push
```

---

## 14. Pre-Completion Checklist

- [ ] Code in `/home/z/my-project/src/app/page.tsx`
- [ ] Dependencies installed via `bun add`
- [ ] `bun run lint` without errors
- [ ] Server logs without errors: `cat .zscripts/dev.log | tail -20`
- [ ] Preview Panel shows UI

---

## 15. Full Workflow Example

```bash
# 1. Initialize
curl https://z-cdn.chatglm.cn/fullstack/init-fullstack_1775040338514.sh | bash

# 2. Install needed packages
cd /home/z/my-project && bun add three @react-three/fiber @react-three/drei

# 3. Create components (if needed)
mkdir -p src/components
# ... write components in src/components/

# 4. Write UI in page.tsx
# ... edit src/app/page.tsx

# 5. Verify
bun run lint

# 6. View preview in the right panel
```

---

## 16. Golden Rules

1. **ALWAYS** start with `curl ... init-fullstack ... | bash`
2. **NEVER** start the dev server manually (`npm run dev`, `bun run dev`, `next dev`)
3. **ALL CODE** goes in `/home/z/my-project/` (project root, not subfolders)
4. **LOGS** are always here: `cat /home/z/my-project/.zscripts/dev.log | tail -30`
5. **DEPENDENCIES** are installed via: `cd /home/z/my-project && bun add <package>`
6. **RESTART** = reinitialize: `curl ... init-fullstack ... | bash`
7. **BROKEN** - don't fix manually, reinitialize

**Main rule:**

> Write code in `/home/z/my-project/src/app/page.tsx`, install dependencies via `bun add`, and the preview will appear on the right by itself.

**Don't overcomplicate:**

- Don't create new projects
- Don't start the server manually
- Don't look for external URLs

**Trust the system:**

- Preview Panel works automatically
- Dev server starts itself
- Hot reload works out of the box

---

## 17. Known Infrastructure Issues

This section documents problems that are not code-related, but caused by architectural limitations of the Z.ai sandbox. Knowing these problems will save hours of debugging.

---

### 17.1. Dev Server Dies on Idle (Idle Timeout)

#### Symptoms

- After 2-5 minutes of inactivity in the sandbox, Preview Panel shows an error
- Instead of a preview, you see: **"sandbox is inactive"**
- Or error 502 / Connection refused
- The `.zscripts/dev.log` logs have **NO** crash entries -- the process simply disappears

#### Network Diagram

```text
User's browser (chatglm.site / IM)
    |
    +----> Port 81 (sandbox proxy / gateway)
              |
              +----> Port 3000 (Next.js dev server)
                        |
                        +----> .zscripts/dev.sh (automatic startup)
```

When Next.js on port 3000 dies, the proxy on port 81 cannot forward the request and returns a **"sandbox is inactive"** error.

#### Cause

**Infrastructure limitation of the sandbox, NOT a code problem.**

The sandbox infrastructure kills idle dev servers to save resources. The process disappears:

- Without a crash log
- Without OOM (Out of Memory) error
- Without warning in system logs
- `nohup` doesn't help -- the process is killed at the container/orchestrator level

**The code is absolutely correct.** If the project works on Vercel (as with Filter Log, 258126 accepted), the code is 100% working. The problem is purely infrastructure-related.

#### Solution

**Option 1: Reinitialize (guaranteed method)**

```bash
curl https://z-cdn.chatglm.cn/fullstack/init-fullstack_1775040338514.sh | bash
```

**Option 2: Wait for automatic restart**

In some configurations, the sandbox automatically restarts the dev server on the next request. Wait 10-30 seconds and refresh the Preview Panel.

**Option 3: Preventive measures**

To avoid idle time during long work sessions:

- Periodically refresh the Preview Panel (every 2-3 minutes)
- Use `watch` or a script that pings the dev server

```bash
# Simple ping script (run in background)
while true; do curl -s http://localhost:3000 > /dev/null; sleep 60; done &
```

#### How to Distinguish Infrastructure from Code Problems

| Indicator                | Infrastructure            | Code Error                  |
| ------------------------ | ------------------------- | --------------------------- |
| Preview Panel error      | "sandbox is inactive"     | 500, 404, compilation error |
| `.zscripts/dev.log` logs | Empty or cut off          | Error with stack trace      |
| Reproducibility          | After 2-5 minutes of idle | After code change           |
| Solution                 | Reinitialize              | Fix the code                |

---

### 17.2. CORS / Cross-Origin Requests Blocked (502)

#### Symptoms

- Preview Panel shows 502 Bad Gateway
- CORS errors in the browser console
- Requests to `localhost:3000` are blocked

#### Cause

Next.js 16 requires explicit permission for cross-domain requests to the dev server via `allowedDevOrigins` in `next.config.ts`. Without this setting, the browser in the sandbox (domain `chatglm.site` or `space-z.ai`) blocks requests to `localhost:3000`.

Network diagram:

```text
Browser (https://preview-xxx.space-z.ai)
    |
    +----> API request (https://preview-xxx.space-z.ai/api/...)
              |
              +----> sandbox proxy (port 81)
                        |
                        +----> Next.js dev server (localhost:3000)
                                  |
                                  +----> blocked without allowedDevOrigins
```

#### Solution

Add `allowedDevOrigins` to `next.config.ts`:

```typescript
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ... other settings

  // Allows cross-domain requests to the dev server from the sandbox
  // Without this, the browser on chatglm.site blocks requests to localhost:3000
  allowedDevOrigins: ["*"], // Allow all for development

  // Alternative: explicitly specify sandbox domains
  // allowedDevOrigins: [
  //   'https://preview-*.space-z.ai',
  //   'https://*.chatglm.site',
  //   'https://*.z.ai'
  // ],
};

export default nextConfig;
```

> **Important:**
>
> - `["*"]` allows everyone -- **safe only for development** in the sandbox
> - In production, replace with specific domains
> - After changing `next.config.ts`, reinitialization is needed:
>   ```bash
>   curl https://z-cdn.chatglm.cn/fullstack/init-fullstack_1775040338514.sh | bash
>   ```

#### Verification

After applying the setting:

```bash
# Check that the config was applied
cat /home/z/my-project/next.config.ts | grep -A3 "allowedDevOrigins"

# Reinitialize
curl https://z-cdn.chatglm.cn/fullstack/init-fullstack_1775040338514.sh | bash

# Check logs
cat /home/z/my-project/.zscripts/dev.log | tail -20
```

---

### 17.3. Comparison: Infrastructure vs Code

| Problem                            | Infrastructure              | Code                |
| ---------------------------------- | --------------------------- | ------------------- |
| Dev server dies on idle            | [OK] Idle timeout           | [FAIL]              |
| "sandbox is inactive" error        | [OK]                        | [FAIL]              |
| CORS 502 without allowedDevOrigins | [OK] Next.js 16 requirement | [FAIL]              |
| HMR crashes after file deletion    | [FAIL]                      | [OK] Turbopack      |
| Module not found                   | [FAIL]                      | [OK]                |
| EADDRINUSE                         | [FAIL]                      | [OK] (manual start) |

---

### 17.4. Quick Checklist for Preview Issues

If Preview Panel is not working, check in this order:

- [ ] Is there a process on port 3000? `lsof -i :3000`
- [ ] Are there errors in the logs? `cat .zscripts/dev.log | tail -30`
- [ ] Was there idle time > 2-5 minutes? -> section 17.1
- [ ] Is `allowedDevOrigins` added to `next.config.ts`? -> section 17.2
- [ ] Does reinitialization help? `curl ... init-fullstack ... | bash`

**Golden rule for infrastructure problems:**

> If the code works on Vercel but doesn't work in the sandbox -- **the problem is in the infrastructure**. Don't waste time debugging code, immediately apply solutions from section 17.

---

Built with: Next.js 16 + TypeScript + Tailwind CSS
