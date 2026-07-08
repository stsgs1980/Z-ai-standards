# Chapter 1: Getting Started

## 1. Quick Start

### Clean Start - Correct Sequence

```bash
# Step 1: Initialize the sandbox (ALWAYS the first command)
curl https://z-cdn.chatglm.cn/fullstack/init-fullstack_1775040338514.sh | bash
```

This command:

- Creates a Next.js 16 project structure
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

### What NOT to do

```bash
# [FAIL] Do NOT start dev server manually
npm run dev
bun run dev
next dev
npx next dev

# [FAIL] Do NOT create projects from scratch
npx create-next-app

# [FAIL] Do NOT clone into subfolders (see section 6)
git clone ... && cd subdir && npm install
```

> **Why:** The sandbox manages the dev server itself through `.zscripts/dev.sh`. Manual startup breaks the Preview Panel - preview does not update and stops working.

### Sandbox Agent Limitations

The sandbox agent (GLM-5.2, M-5-Turbo) has security restrictions that affect command execution:

| Command Type        | Agent Behavior | Reason                                    |
| ------------------- | -------------- | ----------------------------------------- |
| `curl ... \| bash`  | **BLOCKED**    | Executes remote code — high security risk |
| `bash <(curl ...)`  | **BLOCKED**    | Executes remote code — high security risk |
| `git clone`         | **ALLOWED**    | Downloads files only — low risk           |
| `git pull`          | **ALLOWED**    | Downloads files only — low risk           |
| `bun add`           | **ALLOWED**    | Package installation — expected behavior  |
| `node scripts/*.js` | **ALLOWED**    | Local script execution — low risk         |

**Workaround for bootstrap.sh:**

If the agent refuses to run bootstrap.sh, use this alternative sequence:

```bash
# Agent will execute these commands:
git clone --recurse-submodules https://github.com/stsgs1980/Z-ai-platform.git /home/z/my-project/Z-ai-platform
cd /home/z/my-project/Z-ai-platform
git config core.fileMode false
git submodule foreach --recursive 'git config core.fileMode false'
# Skills are already integrated — no symlink needed
```

**Why this works:**

- `git clone` is safe (downloads files only)
- `git config` is safe (modifies local config)
- Skills are already present in the repo as inline directories

**For fresh sandbox sessions:**
The agent will typically find and execute the necessary commands on its own when given a clear goal. Provide context:

> "I need to set up Z-ai-platform in this sandbox. Clone https://github.com/stsgs1980/Z-ai-platform.git with submodules into /home/z/my-project/Z-ai-platform and verify the skills are accessible."

---

## 2. Project Structure

```text
/home/z/my-project/
  src/
    app/
      page.tsx          # MAIN FILE - all UI goes here
      layout.tsx        # Layout (rarely needed)
      globals.css       # Global styles
    components/
      ui/               # shadcn/ui components
      sections/         # Page sections
      features/         # Stateful components
    lib/
      guided-tour/      # Git submodule (GuidedTour)
      perf-data.ts
      db.ts
      utils.ts
  prisma/
    schema.prisma       # Database schema
  public/               # Static files
  .zscripts/
    dev.sh              # Dev server startup script (DO NOT EDIT)
    dev.pid             # Process PID
    dev.log             # LOGS (read from here on errors)
  .gitmodules           # Submodule configuration
  package.json
  tsconfig.json
  tailwind.config.ts
  next.config.ts
```

### Important Files

| File                   | Purpose                                               |
| ---------------------- | ----------------------------------------------------- |
| `src/app/page.tsx`     | **Single page** - all UI here                         |
| `src/components/ui/`   | Ready shadcn/ui components                            |
| `prisma/schema.prisma` | Database definition                                   |
| `.zscripts/dev.log`    | Dev server logs                                       |
| `next.config.ts`       | Next.js configuration (including `allowedDevOrigins`) |

---

## 3. Development Rules

### [OK] DO

1. **Write code only in `src/app/page.tsx`**

   ```tsx
   "use client";

   export default function Home() {
     return <div className="min-h-screen">{/* Your UI */}</div>;
   }
   ```

2. **Use shadcn/ui components**

   ```tsx
   import { Button } from "@/components/ui/button";
   import { Card } from "@/components/ui/card";
   ```

3. **Create additional components in `src/`**

   ```text
   src/
     app/
       page.tsx
     my-components/
       Chart.tsx
       Data.tsx
   ```

4. **Use `'use client'` for interactive components**

   ```tsx
   "use client";

   import { useState } from "react";
   ```

5. **Check logs on errors**
   ```bash
   cat /home/z/my-project/.zscripts/dev.log | tail -30
   ```

### [FAIL] DO NOT

1. **Do NOT start dev server manually**

   ```bash
   # [FAIL] DO NOT DO THIS
   npm run dev
   bun run dev
   next dev
   ```

2. **Do NOT create other routes**

   ```bash
   # [FAIL] DO NOT DO THIS
   src/app/about/page.tsx
   src/app/api/route.ts
   ```

3. **Do NOT use external URLs for preview**

   ```bash
   # [FAIL] DO NOT DO THIS
   http://localhost:3000
   http://127.0.0.1:3000
   preview-xxx.space.chatglm.site
   ```

4. **Do NOT create a project from scratch**

   ```bash
   # [FAIL] DO NOT DO THIS
   npx create-next-app
   ```

5. **Do NOT clone repositories into separate folders**
   ```bash
   # [FAIL] DO NOT DO THIS
   git clone https://github.com/xxx/yyy.git
   cd yyy && npm install
   ```

---

## 4. Working with Dependencies

### Installing Packages

```bash
cd /home/z/my-project && bun add <package>
```

### Common Dependencies

| Category    | Packages                                     |
| ----------- | -------------------------------------------- |
| 3D Graphics | `three @react-three/fiber @react-three/drei` |
| Animations  | `framer-motion`                              |
| Charts      | `recharts`                                   |
| Forms       | `react-hook-form @hookform/resolvers zod`    |
| Dates       | `date-fns`                                   |
| Tables      | `@tanstack/react-table`                      |

### Prisma (Database)

1. Define the schema in `prisma/schema.prisma`:

   ```prisma
   model User {
     id    Int    @id @default(autoincrement())
     name  String
     email String @unique
   }
   ```

2. Apply the schema:

   ```bash
   bun run db:push
   ```

3. Use in code:
   ```tsx
   import { db } from "@/lib/db";

   const users = await db.user.findMany();
   ```

### If Prisma is Needed After Cloning a Project

```bash
cd /home/z/my-project

# Apply schema
bunx prisma db push

# Generate client
bunx prisma generate
```
