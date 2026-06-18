# Standard: Markdown Formatting v2.3 (EN)

> ID: STD-DOC-002
> Version: 2.3.1
> Level: **[C] Critical** (unified with STD-DOC-003 — same rule = same severity)
> Related: STD-META-001 (ID system)
> Note: Character rules (emoji, box-drawing, etc.) are delegated to STD-DOC-003. Per ARCH-002 install order, DOC-003 is read after DOC-002. The dependency edge is therefore DOC-003 → DOC-002 (DOC-003 depends on DOC-002's markdown scope).

---

## 1. Introduction and Goals

This standard establishes rules for Markdown documentation formatting to ensure visual consistency and professional product quality.

**Goals:**

- Ensure visual consistency of documentation
- Maintain professional product quality
- Guarantee control through design system
- Eliminate uncontrolled visual artifacts
- Enforce standards automatically via ESLint where possible

---

## 2. Scope

| Level | Context | Action on violation |
|-------|---------|---------------------|
| **[C] Critical** | README.md, CHANGELOG.md, docs/, project documentation | Blocks commit (husky + lint-staged) |

**See also:**
- **No-Unicode Policy v2.3** — for UI components [C], production code [C], AI-communication [W], prototypes [I]

---

## 3. Prohibited Elements

Character prohibitions are defined in **No-Unicode Policy v2.3** (STD-DOC-003) sections 4-5. Level **[C] Critical** applies to documentation files — same severity as source code (same rule = same severity).

**Summary (authoritative rules in STD-DOC-003):**

| Category | Level | Note |
|----------|-------|------|
| Emoji | [C] | No exceptions |
| Unicode icons | [C] | Use text tags |
| Table pseudographics | [W] | Use Markdown syntax |
| Typographics in headings/code | [W] | Allowed in plain text only (see scope below) |

**Prohibition scope (for Typographics in .md files):**

- Headings and subheadings
- Tables (except reference tables - see below)
- Inline code and code blocks (comments, strings)
- File and folder names

**`(ref)` exception for reference tables and code blocks:** If the purpose of a table cell or a code block line is to identify a specific character (to show what is prohibited or allowed), the character may be included with a `(ref)` marker. This does not violate the spirit of the standard: the character is used as the object of description, not as formatting. Without the actual symbol, the example loses clarity: "Incorrect: `—` (ref) in heading" is demonstrative; "Incorrect: em dash in heading" is blind.

---

## 4. Allowed Elements

### 4.1. Text Rules

Allowed character sets are defined in **STD-DOC-003 section 6.1**. For .md files at level [W]:

- All characters from the STD-DOC-003 basic set are allowed
- **Typographic symbols** (em dash, en dash, degree, copyright, plus-minus) are allowed in **plain text only** — prohibited in headings, tables, code blocks, and file names (see Section 3)

### 4.2. ASCII Diagrams

The whitelist for technical diagrams in documentation is defined in **STD-DOC-003 section 6.2**. Level [I] applies within code blocks; level [W] applies in plain text documentation.

### 4.3. Markdown Syntax

| Element | Syntax |
|---------|--------|
| Headings | `#`, `##`, `###` |
| Bold | `**text**` |
| Italic | `*text*` |
| Inline code | `` `code` `` |
| Code block | ` ```language ` |
| Blockquote | `>` |
| Unordered List | `-` (strictly) |
| Ordered List | `1.` |
| Link | `[text](url)` |
| Image | `![alt](url)` |

### 4.4. Text Tags for Statuses

Use text labels instead of Unicode symbols:

| Correct | Incorrect |
|---------|-----------|
| `[OK]` | [v] (ref) |
| `[FAIL]` | [x] (ref) |
| `[DONE]` | [OK] (ref) |
| `[TODO]` |  (ref) |
| `[WARNING]` | [WARN] (ref) |
| `[INFO]` | (ref) |

---

## 5. Formatting Rules

### 5.1. Headings

- Use `#` for H1, `##` for H2, etc.
- Do not use closing `#` symbols
- Only one H1 per document
- Do not use typographic symbols (like em dash) in headings

```text
Correct:      # Heading
Incorrect:    # Heading #
Incorrect:    # Heading — (ref) Subtitle
```

The `—` (ref) symbol in the example above is a demonstration of the prohibited character; the `(ref)` marker indicates reference usage.

### 5.2. Lists

**Unordered:**

- Always use `-` as the single marker for unordered lists.
- Do not mix with `*` or `+`.

```text
Correct:      - Item 1
Incorrect:    * Item 1
Incorrect:    -> Item 1
```

**Ordered:**

```text
1. First item
2. Second item
```

### 5.3. Text Emphasis

| Format | Syntax |
|--------|--------|
| Bold | `**text**` |
| Italic | `*text*` |
| Strikethrough | `~~text~~` |

### 5.4. Code Formatting

**Inline code** (within text):

```markdown
Use the `processFile()` function for processing.
```

**Code block** (with language specified):

````markdown
```typescript
const config = {
  encoding: 'utf-8',
  strict: true
};
```
````

**Unknown Languages Rule:**
If the exact programming language or format is not supported by the renderer or is unknown, always specify `text` or `bash` instead of leaving the block blank.

```text
Correct:      ```text
Incorrect:    ```text
```

**Rules:**

| Element | Format | Purpose |
|---------|--------|---------|
| Inline code | `` `code` `` | Functions, variables, commands within text |
| Code block | `` ```language `` | Multi-line code, examples, configs |

**Do NOT use custom colors:**

- Markdown does not natively support colors
- HTML tags like `<span style="color:red">` may be blocked on GitHub
- Syntax highlighting is applied automatically by the renderer
- Color is the responsibility of the theme (GitHub, VS Code), not the document

---

## 6. Visual Elements

### 6.1. Visual Elements in Markdown

Icon and graphic rules are defined in **STD-DOC-003 section 7**. For .md files:

- Any visual symbol = **SVG only** or **text alternative** (STD-DOC-003 section 7.1)
- SVG insertion uses standard Markdown image syntax. Raw `<svg>...</svg>` HTML tags are prohibited:

```markdown
![Icon description](./path/to/icon.svg)
```

### 6.2. Icon Library

See **STD-DOC-003 section 7.2** for icon library requirements. In documentation, use text descriptions instead of icons.

### 6.3. Brand Logos

See **STD-DOC-003 section 7.4** for brand logo requirements. When mentioning technologies in documentation, use official SVG via Markdown image syntax.

---

## 7. Badges

Badges are graphical indicators of project metadata (version, build status, license). Place them at the beginning of README.md after the heading.

### 7.1. Allowed Sources

| Source | Usage |
|--------|-------|
| shields.io | Recommended — generates PNG/SVG without emoji |
| custom SVG | Allowed if compliant with No-Unicode Policy |

### 7.2. Prohibited

- Emoji in badges (shields.io supports it, but do not use)
- External icons inside badges
- Badges with statuses that do not reflect reality

### 7.3. Typical Badges for npm Package

```markdown
[![npm version](https://img.shields.io/npm/v/zai-agent-toolkit.svg)](https://www.npmjs.com/package/zai-agent-toolkit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
```

### 7.4. Placeholders (for projects without CI)

If CI is not configured, use static badges:

```markdown
[![Status: Draft](https://img.shields.io/badge/Status-Draft-yellow.svg)]()
[![Version: 1.9.5](https://img.shields.io/badge/Version-1.9.5-blue.svg)]()
```

When CI is configured, replace with dynamic ones.

---

## 8. Stack Signature

Root documentation files must contain a stack signature at the end of the file.

**Scope:**
- `README.md` (root)
- `CHANGELOG.md` (root)
- *Optional for nested `docs/` files, but not required.*

**Format:**

```markdown
---
Built with: <project technologies>
```

The specific stack is determined by the project, not the standard. Example for Next.js projects:

```markdown
---
Built with: Next.js 16 + TypeScript + Tailwind CSS
```

For the default value in this stack, see `README_TEMPLATE.md`.

**Rules:**

- Placement: end of file
- Separator: three dashes `---`
- Content: letters, digits, `+` and `:` signs
- Graphics prohibited

---

## 9. Control and Enforcement

### 9.1. Level [W] Warning - Blocking Policy

| Stage | Action | Blocks merge? |
|-------|--------|---------------|
| Code Review | Comment requesting fix | **No** |
| CI Pipeline | Warning in logs | **No** |
| Repeated violation | Escalation to Tech Lead | **Possible** |

**Rule:** Level [W] does not block merge automatically. PR author can:

1. Fix violations and get approval
2. Justify exception in comments
3. Get approval with reviewer consensus

**Escalation:** On systematic violations (3+ PRs without fixes) — merge blocked until discussion with Tech Lead.

### 9.2. Mandatory Validation of All .md Files

**Rule:** Any created or added `.md` file in the project **must** pass validation and editing according to this standard.

| Action | When | Responsible |
|--------|------|-------------|
| Creating new .md | Before commit | Author |
| Adding external .md | Before merge | Reviewer |
| Copying .md from another project | Before commit | Author |

**Process:**

1. Validation by checklist (see section 12)
2. Fix violations
3. Add stack signature (if root file)
4. Review in Code Review

---

## 10. ESLint Integration for Markdown Linting

This section describes how to configure ESLint to automatically enforce the rules defined in this standard and the nested **No-Unicode Policy (STD-DOC-003)**. ESLint acts as the automated enforcement layer for the rules that are otherwise checked manually in code review.

### 10.1. Why ESLint for Markdown?

Manual code review is insufficient for consistent enforcement of formatting and character policies across large projects. ESLint provides:

- **Immediate feedback** in the editor (red squiggles, error popups)
- **Pre-commit hooks** that catch violations before they enter the repository
- **CI/CD pipeline enforcement** that generates reports on every push
- **Uniform severity** — rules from STD-DOC-003 ([C] Critical) apply equally to source code and documentation. Same rule = same severity. No downgrade for .md files.

The key principle: **ESLint is the automated executor of the standards, not a replacement for them.** The standards documents remain the single source of truth; ESLint configuration is derived from them.

### 10.2. Required Dependencies

```bash
# Core ESLint (if not already installed)
npm install --save-dev eslint

# Markdown processor — lets ESLint parse .md files
npm install --save-dev eslint-plugin-markdown

# Custom rule for No-Unicode Policy enforcement (see STD-DOC-003 section 10.1)
# This file lives in your project at: eslint-rules/no-unicode-policy.js
```

**Dependency chain:**

```text
eslint
  └── eslint-plugin-markdown       (parses .md into virtual JS AST)
       └── no-unicode-policy.js    (custom rule from STD-DOC-003)
```

### 10.3. ESLint Configuration (Flat Config — eslint.config.js)

ESLint 9+ uses the flat config format. The configuration below maps this standard's rules to ESLint warnings and STD-DOC-003 rules to ESLint errors.

```javascript
// eslint.config.js
import markdown from "eslint-plugin-markdown";
import noUnicodePolicy from "./eslint-rules/no-unicode-policy.js";

export default [
  // --- Global ignores ---
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "dist/**",
      "build/**",
      "coverage/**",
    ],
  },

  // --- Markdown files (.md) ---
  // eslint-plugin-markdown extracts code blocks from .md files
  // and presents them as virtual JS/TS files for linting.
  ...markdown.configs.recommended,

  {
    files: ["**/*.md/**"],          // virtual files inside .md code blocks
    rules: {
      // STD-DOC-002: Code blocks must specify a language
      // (enforced via custom rule — see section 10.5)
      "markdown/code-block-language": "warn",

      // STD-DOC-003: No emoji/Unicode graphics in code blocks
      "no-unicode-policy/no-emoji": "error",
      "no-unicode-policy/no-unicode-graphics": "error",

      // General quality rules for code inside .md blocks
      "no-undef": "off",            // code snippets in docs may be incomplete
      "no-unused-vars": "off",      // examples don't need every variable used
      "no-console": "off",          // examples often show console usage
    },
  },

  {
    files: ["**/*.md"],             // the .md files themselves (not code blocks)
    plugins: {
      "no-unicode-policy": noUnicodePolicy,
    },
    rules: {
      // STD-DOC-003 section 4: No emoji in Markdown documentation
      "no-unicode-policy/no-emoji-in-md": "warn",

      // STD-DOC-003 section 4: No Unicode icons in Markdown documentation
      "no-unicode-policy/no-unicode-graphics-in-md": "warn",
    },
  },

  // --- Source code files (.ts, .tsx, .js, .jsx) ---
  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    plugins: {
      "no-unicode-policy": noUnicodePolicy,
    },
    rules: {
      // STD-DOC-003 [C] Critical: No emoji in production code / UI strings
      "no-unicode-policy/no-emoji": "error",

      // STD-DOC-003 [C] Critical: No Unicode graphics in production code
      "no-unicode-policy/no-unicode-graphics": "error",

      // STD-DOC-002 indirectly: no irregular whitespace (NBSP, ZWSP, etc.)
      "no-irregular-whitespace": "error",
    },
  },
];
```

### 10.4. ESLint Configuration (Legacy — .eslintrc.js)

For projects still using the legacy config format:

```javascript
// .eslintrc.js
module.exports = {
  plugins: ["markdown"],

  overrides: [
    {
      // Code blocks inside .md files
      files: ["**/*.md/**"],
      rules: {
        "no-unicode-policy/no-emoji": "error",
        "no-unicode-policy/no-unicode-graphics": "error",
        "no-undef": "off",
        "no-unused-vars": "off",
        "no-console": "off",
      },
    },
    {
      // .md files themselves
      files: ["**/*.md"],
      rules: {
        "no-unicode-policy/no-emoji-in-md": "warn",
        "no-unicode-policy/no-unicode-graphics-in-md": "warn",
      },
    },
    {
      // Source code files
      files: ["**/*.{ts,tsx,js,jsx}"],
      rules: {
        "no-unicode-policy/no-emoji": "error",
        "no-unicode-policy/no-unicode-graphics": "error",
        "no-irregular-whitespace": "error",
      },
    },
  ],
};
```

### 10.5. Custom ESLint Rules for This Standard

#### 10.5.1. Rule: `code-block-language`

Enforces section 5.4 of this standard: every fenced code block must specify a language. If the exact language is unknown, `text` or `bash` must be used as a fallback.

```javascript
// eslint-rules/code-block-language.js
module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Require language specification in fenced code blocks (STD-DOC-002 section 5.4)",
    },
    messages: {
      missingLanguage:
        "Code block must specify a language. Use 'text' or 'bash' if unknown (STD-DOC-002 section 5.4).",
    },
  },
  create(context) {
    const sourceCode = context.sourceCode || context.getSourceCode();
    const text = sourceCode.getText();
    const lines = text.split("\n");

    // Match opening fences without a language: ``` without anything after
    const fenceRegex = /^```(\s*)$/;

    return {
      Program() {
        lines.forEach((line, index) => {
          if (fenceRegex.test(line)) {
            context.report({
              loc: { line: index + 1, column: 0 },
              messageId: "missingLanguage",
            });
          }
        });
      },
    };
  },
};
```

#### 10.5.2. Rule: `no-emoji-in-md`

Scans the raw text of `.md` files (outside code blocks) for emoji characters. This is the Markdown-specific version of the No-Unicode Policy rule — it operates at level [W] Warning per STD-DOC-002 section 9.1.

```javascript
// eslint-rules/no-emoji-in-md.js
module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Disallow emoji in Markdown documentation (STD-DOC-002 + STD-DOC-003 section 4)",
    },
    messages: {
      emojiFound:
        "Emoji are prohibited in documentation. Use text tags like [OK], [FAIL] instead (STD-DOC-002 section 4.4, STD-DOC-003 section 4).",
    },
  },
  create(context) {
    const emojiPattern =
      /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{27BF}\u{FE00}-\u{FEFF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2702}-\u{27B0}]/u;

    return {
      Program(node) {
        const sourceCode = context.sourceCode || context.getSourceCode();
        const text = sourceCode.getText();

        // Remove code blocks (they are handled by the code-block-level rules)
        const textWithoutCodeBlocks = text.replace(/```[\s\S]*?```/g, "");

        const lines = textWithoutCodeBlocks.split("\n");
        lines.forEach((line, index) => {
          if (emojiPattern.test(line)) {
            context.report({
              loc: { line: index + 1, column: 0 },
              messageId: "emojiFound",
            });
          }
        });
      },
    };
  },
};
```

### 10.6. Nested Standards: How ESLint Rules Map to This Document

The relationship between this standard (STD-DOC-002) and the No-Unicode Policy (STD-DOC-003) is reflected in the ESLint severity levels:

| Standard Section | Rule | ESLint Severity | Rationale |
|------------------|------|-----------------|-----------|
| STD-DOC-002 Section 3 (Prohibited: Emoji) | `no-unicode-policy/no-emoji-in-md` | `error` | [C] level — same as source code |
| STD-DOC-002 Section 3 (Prohibited: Unicode icons) | `no-unicode-policy/no-unicode-graphics-in-md` | `error` | [C] level — same as source code |
| STD-DOC-002 Section 5.4 (Code block language) | `code-block-language` | `warn` | [W] level for documentation |
| STD-DOC-003 Section 4 (Prohibited: Emoji in code) | `no-unicode-policy/no-emoji` | `error` | [C] level for production code |
| STD-DOC-003 Section 4 (Prohibited: Unicode graphics in code) | `no-unicode-policy/no-unicode-graphics` | `error` | [C] level for production code |
| STD-DOC-002/003 (Irregular whitespace) | `no-irregular-whitespace` | `error` | Always critical |

**Key principle of uniform severity:** A rule originating from STD-DOC-003 ([C] Critical) applies with the same severity regardless of context — source code or documentation. The rationale: if emoji are prohibited, they are prohibited everywhere. Downgrading severity for .md files created an enforcement gap where violations in documentation were not caught before merge. The `lint-md.js` script defaults to `--level=C` and can be overridden with `--level=W` for projects that intentionally want softer enforcement.

### 10.7. Application Stages

| Stage | When | Tool | Action |
|-------|------|------|--------|
| Editor | Real-time | ESLint + VS Code extension | Inline errors |
| Pre-commit | Before commit | husky + lint-staged | Block commit on any violation |
| CI | Push to branch | eslint-plugin-markdown + custom rules | Report in logs |
| Pre-merge | Before merge to main | GitHub Action | Report in PR |

**lint-staged configuration:**

```json
{
  "*.{ts,tsx,js,jsx}": [
    "eslint --max-warnings=0"
  ],
  "*.md": [
    "node lint-md.js"
  ]
}
```

**Note:** `lint-md.js` defaults to `--level=C`, so .md violations also block the commit. To soften enforcement for a specific project, use `node lint-md.js --level=W` instead — violations will be reported as warnings but will not block the commit.

**CI workflow:**

```yaml
# .github/workflows/md-lint.yml
name: Markdown + Code Lint
on: [push, pull_request]
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - name: Lint source code (blocks on error)
        run: npx eslint '**/*.{ts,tsx,js,jsx}' --max-warnings=0
      - name: Lint Markdown (blocks on error)
        run: node lint-md.js .
```

### 10.8. Inline Disabling of ESLint Rules

ESLint supports inline disable comments, but they must be used sparingly and with justification, consistent with the escalation policy in section 9.1.

```markdown
<!-- eslint-disable-next-line no-unicode-policy/no-emoji-in-md -->
This line intentionally contains an emoji for demonstration purposes.
```

**Rules for inline disables:**

1. Each `eslint-disable` must include a comment explaining why
2. Disables of [C]-level rules in production code require Tech Lead approval
3. Disables of [W]-level rules in documentation require a comment in the PR
4. `eslint-disable` without a specific rule name is prohibited — always specify which rule is being disabled

### 10.9. Running ESLint Manually

```bash
# Lint all source code files (errors block)
npx eslint 'src/**/*.{ts,tsx}'

# Lint all Markdown files (warnings do not block)
npx eslint '**/*.md' --plugin markdown

# Lint a specific file
npx eslint docs/README.md --plugin markdown

# Fix auto-fixable issues (formatting, not policy violations)
npx eslint '**/*.md' --plugin markdown --fix
```

**Important:** ESLint `--fix` can only fix formatting issues (indentation, quote style, missing semicolons). It **cannot** fix policy violations (emoji removal, Unicode graphics replacement) — these require manual intervention because the correct replacement depends on context.

### 10.10. Troubleshooting Common Issues

| Problem | Cause | Solution |
|---------|-------|----------|
| ESLint does not scan .md files | Missing `eslint-plugin-markdown` | Install and configure the plugin (section 10.3) |
| False positives on emoji in code blocks | `.md` rule scanning code blocks | Ensure `no-emoji-in-md` strips code blocks (section 10.5.2) |
| `no-undef` errors in .md code snippets | ESLint treats code blocks as real JS | Add `"no-undef": "off"` in `.md/**` override (section 10.3) |
| Custom rule not found | Incorrect plugin path | Verify `eslint-rules/no-unicode-policy.js` exists and is imported correctly |
| Flat config vs legacy config conflict | Mixed config formats | Use only one format — flat config (`eslint.config.js`) for ESLint 9+ |

---

## 11. Exceptions

### 11.1. Unconditionally Allowed

See **STD-DOC-003 section 11.1** for the complete list of unconditionally allowed characters. For .md files, typographic symbols are additionally allowed in plain text (level [W]).

### 11.2. Exceptions by Agreement

| Situation | Requirement |
|-----------|-------------|
| External requirements | Email campaigns - coordinate with marketing |
| Localization | Languages with non-ASCII characters |

---

## 12. ASCII Diagram Examples

ASCII diagrams are **allowed** in documentation (README, docs/).

### 12.1. Architecture Diagram Example

```text
+-------------------+
|    Component A    |
+---------+---------+
          |
          v
+-------------------+
|    Component B    |
+---------+---------+
          |
          +-----> Component C
```

### 12.2. Flow Diagram Example

```text
User Request --> API Gateway --> Auth Service
                                      |
                                      v
                                 Database
                                      |
                                      v
                               Response --> User
```

### 12.3. Sequence Diagram Example

```text
Client          Server          Database
  |                |               |
  +----request---->|               |
  |                +----query----->|
  |                |<---result-----+
  |<---response----+               |
```

---

## 13. Pre-merge Checklist

- [ ] No emoji or Unicode icons in documentation (STD-DOC-003 sections 4-5)
- [ ] No typographic symbols (em dash, copyright, etc.) in code blocks or headings
- [ ] Status indicators — text tags `[OK]`, `[FAIL]`
- [ ] Unordered lists use strictly `-` marker
- [ ] Unknown code blocks use `text` or `bash` fallback
- [ ] Stack signature present in root files
- [ ] Formatting matches standard
- [ ] Diagrams use whitelist characters
- [ ] ESLint runs without errors on source code
- [ ] ESLint warnings in .md files reviewed and justified

---

## 14. Version History

| Version | Date | Changes |
|--------|------|---------|
| 1.0 | 2024-Q4 | Initial version |
| 2.0 | 2025-01 | Level [W], link to No-Unicode Policy v2.0, ASCII diagram whitelist, [W] blocking policy, linting stages, code formatting rules |
| 2.1 | 2025-01 | Allowed typographics in plain text; fixed `-` as sole list marker; clarified SVG via `![]()`; limited Stack Signature to root files; added `text/bash` fallback rule; removed redundant `v` from CI regex |
| 2.1.1 | 2025-01 | Updated references from No-Unicode Policy v2.0 to v2.1; CI config updated with eslint-plugin-markdown; Unicode symbols in section 4.4 replaced with text descriptions (document must not violate its own standard); code blocks without language replaced with `text` |
| 2.1.2 | 2025-01 | Introduced `(ref)` exception for reference tables: characters in identifier cells allowed with marker; restored specific Unicode characters in prohibited/allowed element tables; `Incorrect` examples again show the actual prohibited character |
| 2.1.3 | 2025-01 | Extended `(ref)` exception to code blocks: identifier characters allowed with marker in code blocks too; `Incorrect` examples in code blocks now contain the actual symbol with `(ref)`; restored Unicode symbols in EN table 4.4 |
| 2.1.4 | 2025-01 | Stack signature parameterized: format `Built with: <technologies>`, specific stack is project responsibility; default value moved to README_TEMPLATE |
| 2.1.5 | 2025-05 | Added section 7 "Badges" with shields.io rules, placeholders for projects without CI; section numbering shifted |
| 2.2.0 | 2026-05 | Deduplication: removed 7 elements duplicated with STD-DOC-003 (prohibited elements table, allowed characters, ASCII diagram whitelist, icon library, brand logos, sanitization regex, unconditionally allowed). Replaced with cross-references. Kept .md-specific rules: typographics scope, (ref) exception, SVG insertion, badges, stack signature, formatting rules, text tags |
| 2.3.0 | 2026-06 | Added comprehensive section 10 "ESLint Integration for Markdown Linting": flat config and legacy config examples, custom rules (code-block-language, no-emoji-in-md), nested standards mapping table, application stages with lint-staged and CI workflows, inline disable policy, manual run commands, troubleshooting; updated pre-merge checklist with ESLint items; updated references from STD-DOC-003 v2.1 to v2.2 |
| 2.3.1 | 2026-06 | Updated in-body references from STD-DOC-003 v2.2 to v2.3 (header Related field, §3, §4.1, §4.2, §6.1, §6.2, §6.3, §7.2, §7.4, §11.1, §13 checklist). Added §14A Known Issues documenting MD-001 through MD-003. |

---

## 14A. Known Issues and Proposed Solutions

This section documents discovered inconsistencies, missing content, and proposed corrections. Each issue has an ID, status, and proposed action. Issues resolved in the current version are marked `[RESOLVED]`; outstanding issues are marked `[OPEN]`.

### MD-001 `[OPEN]` — Level `[C]` vs `[W]` contradiction

**Problem:** The header of this file (§0) says `Level: **[C] Critical** (unified with STD-DOC-003 — same rule = same severity)`. The footer says `Document complies with MARKDOWN_STANDARD v2.3 (level [W])`. The registry in `STANDARD_ID_SYSTEM.md` (STD-META-001 §4.4) lists this standard as `[W] Warning`. `IMPLEMENTATION_ORDER.md` §1 Group B table also lists it as `[W]`. There is a three-way contradiction: header says `[C]`, footer/registry/IMPLEMENTATION_ORDER say `[W]`.

The header's rationale ("unified with STD-DOC-003 — same rule = same severity") argues for `[C]`: the same character prohibitions (emoji, Unicode icons) apply at `[C]` level in source code per STD-DOC-003 §3, and the rationale is that documentation should not be a downgrade path for violations.

The registry's `[W]` reflects the original design where Markdown documentation was a softer context — warnings, not blocks.

**Proposed solution:** Decide authoritatively which level applies, then propagate the decision across all four locations:
1. This file's header (§0).
2. This file's footer ("Document complies...").
3. STD-META-001 §4.4 registry entry.
4. STD-ARCH-001 §1 Group B table.

Recommended decision: keep `[C]` (matching STD-DOC-003's "same rule = same severity" principle), because the ESLint configuration in §10 already treats Markdown emoji/Unicode graphics as `error` (not `warn`), and the `lint-md.js` script defaults to `--level=C`. The header is correct; the footer and registry are stale.

Alternative: keep `[W]` and demote the ESLint severity for `.md` files from `error` to `warn`. This is a softer policy but creates the enforcement gap that the v2.3.0 ESLint integration explicitly closed.

Until resolved, the registry keeps `[W]` (matching the registry's prior state) — see STD-META-001 Known Issues entry META-005 for the cross-reference.

### MD-002 `[RESOLVED in v2.3.1]` — In-body references to STD-DOC-003 cited v2.2

**Problem:** Prior to v2.3.1, the header `Related:` field said "No-Unicode Policy v2.2 (STD-DOC-003)". In-body references in §3, §4.1, §4.2, §6.1, §6.2, §6.3, §7.2, §7.4, §11.1, and §13 also cited v2.2. The actual version of STD-DOC-003 at the time of audit was v2.3.0.

**Resolution:** Header `Related:` field updated to "No-Unicode Policy v2.3 (STD-DOC-003)". All in-body references to STD-DOC-003 v2.2 updated to v2.3.

### MD-003 `[OPEN]` — §10.3 ESLint config sets Markdown emoji to `warn`, contradicts §10.6 mapping table

**Problem:** §10.3 (ESLint Configuration — Flat Config) sets `no-unicode-policy/no-emoji-in-md` to `"warn"` and `no-unicode-policy/no-unicode-graphics-in-md` to `"warn"` for `**/*.md` files. However, §10.6 (Nested Standards mapping table) lists these same rules with severity `error` for STD-DOC-002 §3 (Prohibited: Emoji and Unicode icons). The §10.6 table footnote says "A rule originating from STD-DOC-003 ([C] Critical) applies with the same severity regardless of context — source code or documentation." This is internally inconsistent: §10.3 uses `warn`, §10.6 says `error`.

**Proposed solution:** Align §10.3 with §10.6 by changing both `no-emoji-in-md` and `no-unicode-graphics-in-md` from `"warn"` to `"error"` in the flat config and the legacy config (§10.4). Add a note in §10.3 explaining: "These rules fire at `error` severity to match STD-DOC-003 [C] level — same rule, same severity. To soften enforcement for a specific project, override in the project's local ESLint config." This is consistent with MD-001's recommended resolution (keep [C]).

---

**Document complies with MARKDOWN_STANDARD v2.3 (level [W])**

---

## 15. Cross-References

| Standard | Relationship |
|----------|-------------|
| STD-DOC-003 | No-Unicode Policy: single source of truth for character rules. Sections 4-5 (prohibited elements), 6.1 (allowed characters), 6.2 (ASCII diagrams), 7 (icons/logos), 8.2-8.3 (sanitization regex), 10.1 (ESLint custom rule no-unicode-policy.js), 11.1 (unconditionally allowed) are cross-referenced from this standard |
| STD-META-001 | Standard ID System: registry entry for STD-DOC-002 must be kept in sync with the version in this document's header. See MD-001 for the level-ambiguity issue that requires registry attention. |

---

Built with: Next.js 16 + TypeScript + Tailwind CSS
