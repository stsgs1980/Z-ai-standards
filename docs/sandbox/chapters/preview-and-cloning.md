# Chapter 2: Preview and Cloning

## 5. Preview Panel

### How Preview Works

1. Dev server starts **automatically** on initialization
2. Preview Panel is located on the **right** side of the interface
3. Updates **automatically** when code changes

### Preview Panel Network Diagram

```text
Browser (chatglm.site / IM)
    |
    +----> Port 81 (sandbox proxy)
              |
              +----> Port 3000 (Next.js dev server)
                        |
                        +----> .zscripts/dev.sh (automatic startup)
```

> **Important:** Preview Panel in Z.ai works through a sandbox proxy on port 81, which forwards requests to the Next.js dev server on port 3000. If the dev server dies, the proxy returns a "sandbox is inactive" error (see section 17).

### If Preview is Not Working

1. **Check logs:**

   ```bash
   cat /home/z/my-project/.zscripts/dev.log | tail -30
   ```

2. **Check linter:**

   ```bash
   bun run lint
   ```

3. **Restart via reinitialization:**
   ```bash
   curl https://z-cdn.chatglm.cn/fullstack/init-fullstack_1775040338514.sh | bash
   ```

### Other Reasons Preview is Not Working

| Symptom                   | Cause                     | Solution                                             |
| ------------------------- | ------------------------- | ---------------------------------------------------- |
| Page 500                  | Compilation error in code | `cat .zscripts/dev.log \| tail -30` - find the error |
| White screen              | Dev server crashed        | Reinitialize the sandbox                             |
| Preview shows old content | HMR broken                | Reinitialize the sandbox                             |
| Connection refused        | No process on port 3000   | Reinitialize the sandbox                             |
| Module not found          | Forgot `bun add`          | `bun add <package>`                                  |
| "sandbox is inactive"     | Dev server killed on idle | See section 17.1                                     |

### For IM Users

If you use Z.ai through IM (Telegram, etc.), the preview link is:

```text
https://preview-<container-id>.space-z.ai/
```

Where `<container-id>` can be found with:

```bash
echo $FC_CONTAINER_ID
# or
hostname
```

---

## 6. Cloning a Third-Party Project

### Correct Way (Code in Project Root)

```bash
# Step 1: Initialize sandbox (creates Next.js scaffold)
curl https://z-cdn.chatglm.cn/fullstack/init-fullstack_1775040338514.sh | bash

# Step 2: Clone TEMPORARILY into a separate folder
cd /tmp && git clone https://github.com/user/project.git

# Step 3: Copy project files to the sandbox ROOT
rsync -av --exclude='node_modules' --exclude='.next' \
  /tmp/project/ /home/z/my-project/

# Step 4: Install dependencies in the sandbox ROOT
cd /home/z/my-project && bun install

# Step 5: Reinitialize (restarts dev server)
curl https://z-cdn.chatglm.cn/fullstack/init-fullstack_1775040338514.sh | bash

# Step 6: Verify
cat /home/z/my-project/.zscripts/dev.log | tail -20
```

### Incorrect Way

```bash
# [FAIL] Do NOT clone directly into a project subfolder
cd /home/z/my-project
git clone https://github.com/user/project.git my-project
cd my-project && npm install && npm run dev  # Will break the sandbox!
```

> **Why it doesn't work:** The sandbox dev server starts in `/home/z/my-project/` and expects the code there. If the code is in a subfolder - the preview shows the default placeholder, not your project.
