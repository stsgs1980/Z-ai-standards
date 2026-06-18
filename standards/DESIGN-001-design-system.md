# Design System Standard

> ID: STD-DESIGN-001
> Version: 3.0.1
> Level: **[C] Critical** + **[W] Warning**
> Related: Markdown Standard v2.3 (STD-DOC-002), No-Unicode Policy v2.3 (STD-DOC-003), STD-META-001 (ID system)

This standard consists of two layers: **Core** (framework-agnostic, design-language-agnostic rules that apply to any project) and **Profile** (product-specific token values, component maps, and design language choices). The Core is universal; the Profile is a concrete instantiation that is swapped per project.

---

## 0. Scope

### Covers

Any **DOM-based UI with CSS**, regardless of component framework or design language:

| Dimension | Coverage |
|-----------|----------|
| Component frameworks | React, Vue, Svelte, Angular, Solid, vanilla JS |
| CSS approaches | Tailwind, UnoCSS, CSS Modules, Vanilla CSS, SASS/SCSS, CSS-in-JS (Styled Components, Emotion, vanilla-extract) |
| Design languages | Terminal, corporate, editorial, SaaS, immersive (via Profile) |
| Themes | Light, dark, custom presets (via CSS custom properties cascade) |
| Platforms | Browser, SSR, static site generation |

### Does NOT Cover

Environments where **CSS custom properties do not exist** or where the rendering model is fundamentally different from DOM + CSS:

| Environment | Why | Coverage |
|-------------|-----|----------|
| **React Native / Flutter / SwiftUI** | No DOM, no CSS custom properties. Tokens must be JS objects consumed via `StyleSheet.create()` or platform theming. The token *naming* and *semantic structure* from this standard apply, but the delivery mechanism is entirely different. | ~50% (naming + semantics only) |
| **Canvas / WebGL without DOM** (Three.js, PIXI.js, raw WebGL) | No DOM, no CSS. Tokens must be passed as JS constants into shaders, material properties, or renderer config. | ~40% (JS constants from P12/P13; visual tokens need per-renderer adaptation) |
| **Print / PDF design** | No light/dark themes, no animations, no interactivity. Color model is CMYK, not oklch/RGB. Typography units are points, not pixels. | ~10% (typography scale concept only; values and color model incompatible) |
| **Terminal TUI applications** | No CSS. Only 256 ANSI colors, no custom properties, no font families beyond terminal defaults. | ~5% (semantic naming concept only) |
| **Embedded / microcontrollers** | No CSS, no DOM, no rendering pipeline compatible with web tokens. | 0% |

### Boundary Rule

**If the project renders UI through a DOM with CSS**, this standard applies fully. The token delivery mechanism (CSS custom properties) is the hard boundary. Projects outside this boundary may adopt the *naming conventions and semantic structure* from this standard, but must implement their own delivery mechanism and must document the adaptation in their Profile.

---

## 1. Introduction and Goals

This standard defines the design token system that governs all visual output. Tokens are the atomic units of the design system. Every color, font size, spacing value, and card style must resolve to a named token. Hardcoded values are prohibited in production code.

**Goals:**

- Ensure visual consistency across all UI blocks and views
- Maintain a single source of truth for typography, color, and spacing decisions
- Guarantee theme adaptability (light/dark) through semantic tokens
- Eliminate hardcoded hex values, arbitrary font sizes, and ad-hoc spacing
- Enable systematic enforcement through linting and code review
- Separate universal rules from product-specific decisions so the standard applies across project types and design languages

**Conformance levels:**

| Level | Context | Action on violation |
|-------|---------|---------------------|
| **[C] Critical** | UI components, production code | Blocks merge |
| **[W] Warning** | Documentation, prototypes, internal tools | Comment in review, request to fix |

---

## 2. Architecture: Core + Profile

### 2.1. Core (Universal)

The Core defines **rules, structure, and constraints** that apply regardless of project type, design language, or CSS framework. It says *what must exist* and *how tokens are organized*, but not *what the specific values are*.

Core rules are marked with `[CORE]` throughout this document.

### 2.2. Profile (Product-Specific)

A Profile is a concrete instantiation of the Core for a specific project. It fills in the values: which fonts, which colors, which card archetypes, which component-to-token mappings. A project must have exactly one active Profile.

Profile-specific content is marked with `[PROFILE]` throughout this document.

### 2.3. Relationship

```text
Core (Sections 3-13 of this document)
  |
  +-- Profile A: [name] (Sections P1-P11, any project)
  +-- Profile B: [name] (Sections P1-P11, any project)
  +-- Profile N: ... (each project creates its own)
```

Each Profile must satisfy all Core constraints. If a Core rule says "you must have at least 2 font roles", the Profile defines which 2. If a Core rule says "color tokens must have light and dark variants", the Profile provides those variants. A project must have exactly one active Profile; the Core alone is incomplete for implementation because it contains no concrete values.

---

## 3. [CORE] Typography Rules

### 3.1. Font Roles

Every project must define at least **two** font roles:

| Role | Token | Requirements |
|------|-------|-------------|
| Primary | `font-sans` (or project-defined name) | Variable weight support (400-700 minimum); high legibility at the project's body text range |
| Monospace | `font-mono` (or project-defined name) | Tabular-nums mandatory if used for data; ligatures controlled; clear glyph distinction (0/O, 1/l/I) |

Additional roles (e.g., `font-serif` for editorial) are allowed but must be defined in the Profile with the same requirements structure.

### 3.2. Typography Scale

Every project must define a **named typography scale** with the following constraints:

- Minimum **5** levels (small + body + subheading + heading + page heading)
- Maximum **12** levels (prevents uncontrolled proliferation)
- Each level must specify: size (px or rem), weight, font role, and optional extras (tracking, transform)
- Every font size used in the interface must map to a named token in the scale
- Arbitrary font sizes (`text-[9px]`, `text-[13px]` outside of named tokens) are prohibited at level [C]
- The scale range must match the project context: dense dashboards typically use 10-24px; immersive and editorial projects may extend to 48-72px for page headings. The range is a Profile decision; the requirement for a named scale is Core

### 3.3. Font Convention Rules

- Font family is referenced by role token, never by font name in component code
- The mapping from role to concrete font lives in the CSS framework configuration, not in components
- A heading must never use a monospace role unless the Profile explicitly documents this as an exception
- A project may substitute fonts provided the replacement meets the role requirements. Substitution must be documented and approved by Tech Lead

---

## 4. [CORE] Color Token Rules

### 4.1. Semantic Naming

All color tokens must use **semantic or functional names**, not color names:

| Correct | Incorrect |
|---------|-----------|
| `--accent-primary` | `--green-500` |
| `--brand-color` | `--coral` |
| `--semantic-search` | `--violet-600` |
| `--destructive` | `--red` |

### 4.2. Light/Dark Variants

Every color token used in the interface must have **both** a light and a dark variant. The only exception is brand tokens that are intentionally identical across themes (must be documented in the Profile).

### 4.3. Token Aliasing

Aliases are allowed to provide convenience names, but each alias must resolve to a primary token. Two aliases must not define the same color independently; they must share a single source of truth.

### 4.4. Prohibition of Hardcoded Colors

- Direct `text-X dark:text-Y` pairs (framework-specific color pairs) are prohibited at level [C]
- Hardcoded hex/rgb/hsl values in component code are prohibited at level [C]
- All colors must resolve to CSS custom properties or their framework equivalent

### 4.5. Token Integration Patterns

A design system that relies on CSS custom properties must define how those properties integrate with the project's styling framework. Without an explicit integration pattern, developers are forced into hybrid approaches that mix `className` utilities with inline `style` attributes, degrading both performance and readability. This section defines four integration patterns; a Profile must adopt one and document the choice.

**Pattern A: Theme Extension (for utility-first CSS frameworks)**

The CSS custom properties are registered in the framework's theme configuration. Components use framework utilities exclusively; no inline `style` attributes are needed.

```css
/* tailwind.config.ts -- register tokens as theme values */
export default {
  theme: {
    extend: {
      colors: {
        'accent-primary': 'var(--terminal-accent)',
        'brand': 'var(--neuro-brand)',
        'star': 'var(--star-color)',
        'semantic-search': 'var(--semantic-violet)',
        'destructive': 'var(--accent-red)',
      },
      spacing: {
        'xs': 'var(--space-xs)',
        'sm': 'var(--space-sm)',
        'md': 'var(--space-md)',
        'lg': 'var(--space-lg)',
        'xl': 'var(--space-xl)',
      }
    }
  }
}
```

```tsx
// Component code -- clean, no inline styles
<span className="text-accent-primary">$</span>
<div className="p-md gap-sm">
  <h1 className="text-2xl font-bold font-sans">Title</h1>
</div>
```

This pattern keeps all styling in the utility layer, avoids `style={{}}` in JSX, and works correctly with SSR. It applies to projects using Tailwind CSS v3+, UnoCSS, or any utility-first CSS framework with theme extension support. The pattern is framework-agnostic: replace `tailwind.config.ts` with the equivalent configuration file for your utility framework (e.g., `uno.config.ts` for UnoCSS, `windi.config.ts` for Windi CSS). The principle remains the same: register CSS custom properties as theme values, consume via utility classes.

**Important:** Theme extension requires access to the framework's configuration file. In some setups (Create React App without eject, certain corporate build pipelines, locked managed platforms), modifying the theme configuration may be impossible or require admin access. In such cases, **Pattern B or Pattern C is the appropriate choice** -- they provide full token compliance without requiring framework configuration changes. No Profile should mandate Pattern A when the project's build system does not support it.

**Pattern B: CSS Modules**

The CSS custom properties are referenced directly in `.module.css` files. Components apply class names from the module.

```css
/* Dashboard.module.css */
.prompt {
  color: var(--terminal-accent);
  font-size: var(--text-label-size);
  font-weight: var(--text-label-weight);
  font-family: var(--font-mono);
}

.container {
  padding: var(--space-md);
  gap: var(--space-sm);
}
```

```tsx
// Component code
import styles from './Dashboard.module.css';

<span className={styles.prompt}>$</span>
<div className={styles.container}>
  <h1 className={styles.heading}>Title</h1>
</div>
```

This pattern is the natural choice for projects using CSS Modules, CSS-in-JS libraries that support custom properties (Styled Components, Emotion), or any framework without utility-first conventions.

**Pattern C: Vanilla CSS / Global Stylesheets**

The CSS custom properties are referenced directly in global or scoped CSS files. This is the simplest pattern with zero framework dependencies.

```css
/* styles.css */
.prompt {
  color: var(--terminal-accent);
  font: var(--text-label-weight) var(--text-label-size) var(--font-mono);
}

.container {
  padding: var(--space-md);
  display: flex;
  gap: var(--space-sm);
}
```

This pattern is suitable for projects using plain CSS, SASS/SCSS, PostCSS, or any build system that processes standard CSS. It has no framework coupling and works universally.

**Pattern D: CSS-in-JS (Styled Components, Emotion, vanilla-extract, Stitches)**

The CSS custom properties are referenced inside styled components or CSS-in-JS template literals. This pattern applies to projects using Styled Components, Emotion, vanilla-extract, Stitches, or any CSS-in-JS library that supports `var()` references within template literals or style objects.

```typescript
// Styled Components example
import styled from 'styled-components'

const Prompt = styled.span`
  color: var(--terminal-accent);
  font-size: var(--text-label-size);
  font-weight: var(--text-label-weight);
  font-family: var(--font-mono);
`

const Container = styled.div`
  padding: var(--space-md);
  gap: var(--space-sm);
`
```

```typescript
// Emotion example
import { css } from '@emotion/react'

const promptStyle = css`
  color: var(--terminal-accent);
  font: var(--text-label-weight) var(--text-label-size) var(--font-mono);
`
```

This pattern preserves all the benefits of CSS custom properties (theming via `:root`/`.dark`, no inline `style={{}}`) while leveraging the scoped styling and co-location features of CSS-in-JS. It avoids the runtime cost of JavaScript-based theming by using native CSS custom properties for theme switching instead of JavaScript theme context objects.

**Important:** CSS-in-JS libraries that use JavaScript objects for theming (e.g., `ThemeProvider` with a JS theme object) must still register tokens as CSS custom properties in a global stylesheet and reference them via `var()`. This ensures theme switching works through the CSS cascade (`:root`/`.dark`) rather than requiring JavaScript re-renders, which is consistent with how Patterns A, B, and C handle theming.

**Requirement:** The Profile must state which integration pattern it uses and provide the corresponding theme configuration or stylesheet structure. Mixed patterns (e.g., Pattern A for spacing and Pattern B for colors) are allowed but must be documented with a clear rule for which pattern applies to which token category.

---

## 5. [CORE] Syntax Highlighting Rules

Projects that render code blocks must define syntax highlighting tokens with the following constraints:

- Each syntax role (comment, keyword, string, function, etc.) must be a named token with light and dark variants
- The syntax highlighter must be configured to consume these tokens, not hardcoded colors
- The highlighter must support custom CSS class mapping and theme overrides via CSS custom properties
- The highlighter must not inject inline `style` attributes with hardcoded colors

Minimum required syntax roles (a project may define more):

| Role | Purpose |
|------|---------|
| `--syntax-comment` | Code comments |
| `--syntax-keyword` | Language keywords, HTTP methods |
| `--syntax-string` | String literals, URLs |
| `--syntax-function` | Function names, API paths |

---

## 6. [CORE] Spacing Rules

### 6.1. Spacing Scale

Every project must define a **named spacing scale** with the following constraints:

- Minimum **4** levels (tight + small + medium + large)
- Maximum **8** levels (prevents uncontrolled proliferation)
- Each level must specify a pixel or rem value
- Every `gap`, `padding`, and `margin` must use a named token from the scale
- Arbitrary spacing values are prohibited at level [C]
- The scale range must match the project context: dense dashboards typically use 4-24px; immersive sites with 3D, parallax, and full-bleed content may use 8-64px or wider. The range is a Profile decision; the requirement for a named scale is Core

### 6.2. Spacing Convention

- Spacing tokens must be progressive (each step is the next logical increment)
- Card-to-content padding and card-to-card spacing must be documented in the Profile
- If responsive spacing overrides are needed, they must be documented as a named pattern in the Profile, not ad-hoc

---

## 7. [CORE] Card Style Rules

### 7.1. Card Archetypes

Every project must define **at least one** card archetype. Each archetype must specify:

- Border treatment (e.g., dashed, solid, none, gradient, glow)
- Background treatment (e.g., transparent, tinted, muted, glass/blur, gradient, elevated)
- Padding (reference to spacing token)
- Typography rules (which font role for which content type)
- Content scope (what type of content belongs in this archetype)

The treatments listed above are illustrative, not exhaustive. A Profile may define any visual treatment that serves its design language, provided the treatment is documented and consistent across all cards of that archetype.

**Common archetypes (a Profile may define additional ones):**

| Archetype | Purpose | Typical content |
|-----------|---------|-----------------|
| Terminal | CLI-style display | Command output, prompts, dashboard stats |
| Content | Prose and descriptions | Articles, instructions, documentation |
| Stat | Single metric display | Numbers, KPIs, counters |
| Interactive / Canvas | Full-viewport interaction | 3D renderers, flow editors, maps, drag-and-drop boards |

A Profile must define at least one archetype. Projects with interactive visual content (3D, diagrams, maps) should define an Interactive/Canvas archetype to separate viewport-based content from information-display cards.

### 7.2. Card Style Constraints

- A card must be classified into exactly one archetype
- Mixing visual treatments from different archetypes on the same card is prohibited at level [C]
- The visual contract of an archetype (border style + background + typography rules) is normative; the component name is implementation

---

## 8. [CORE] Icon and Graphics Rules

Character and icon rules follow **No-Unicode Policy v2.3** (STD-DOC-003).

### 8.1. Icon Standard

- Any visual symbol in the interface must be **SVG only**
- Icons use a project icon library that must satisfy: SVG components or files; stroke/fill customization via design tokens; comprehensive UI icon set; SVGO-optimized
- Brand logos use official SVG via Markdown image syntax
- All icons must support theming and use design tokens for stroke/fill colors
- Fallback must exist for critical icons (text alternative via `aria-label`)

### 8.2. Prohibited Icon Patterns

| Pattern | Level | Replacement |
|---------|-------|-------------|
| Emoji as icons | [C] | SVG from icon library |
| Unicode symbols as status | [C] | Text tags: `[OK]`, `[FAIL]`, `[TODO]` |

---

## 9. [CORE] Markdown Compliance

Documentation files must comply with **Markdown Standard v2.3** (STD-DOC-002):

- Unordered lists use `-` marker strictly
- Code blocks specify a language; `text` or `bash` as fallback
- One `H1` per document; no closing `#` symbols on headings
- No typographic symbols in headings or code blocks
- Status indicators use text tags: `[OK]`, `[FAIL]`, `[TODO]`, `[WARNING]`
- Stack signature in root files: `Built with: <project technologies>`

Character prohibitions follow **STD-DOC-003 sections 4-5** at level `[W]`.

---

## 10. [CORE] Control and Enforcement

### 10.1. Level [C] Critical - Blocks Merge

| Stage | Action | Blocks merge? |
|-------|--------|---------------|
| Code Review | PR rejected | **Yes** |
| CI Pipeline | Error in logs | **Yes** |
| Linting | Error report | **Yes** |

Violations at level [C]:

- Hardcoded hex colors in component code
- Framework-specific color pairs instead of semantic tokens
- Font role violations (e.g., mono on headings where Profile forbids it)
- Arbitrary font sizes outside the named scale
- Card archetype misuse
- Emoji or Unicode icons in UI

### 10.2. Level [W] Warning - Does Not Block Merge

| Stage | Action | Blocks merge? |
|-------|--------|---------------|
| Code Review | Comment requesting fix | **No** |
| CI Pipeline | Warning in logs | **No** |
| Repeated violation | Escalation to Tech Lead | **Possible** |

Violations at level [W]:

- Missing stack signature in root documentation
- Typographic symbols in headings or code blocks
- Documentation not matching Markdown Standard

### 10.3. Enforcement Rule Template

Each project must implement an automated rule (ESLint, Stylelint, or equivalent) that:

- Detects hardcoded hex/rgb/hsl values in component code
- Detects framework-specific color utility classes that bypass semantic tokens
- Reports violations at the appropriate level ([C] = error, [W] = warning)

The specific prohibited patterns (which color classes, which hex values) are defined by the Profile (P9), not by the Core. Each Profile must provide its own enforcement rule template or configuration. The Core only requires that an enforcement mechanism exists.

### 10.4. Adoption Levels

Enforcing the full standard at [C] level from day one creates an unreasonably high barrier for existing teams and projects. This standard defines a **three-phase adoption process** that gradually raises enforcement levels. New projects may start at Phase 2 or Phase 3 if the team is already familiar with token-based design systems.

**Phase 1: Foundation (Weeks 1-2)**

All [C]-level violations are temporarily reported as [W]. No merge blocks. The goal is awareness, not compliance.

- Colors: [W] hardcoded hex values, [W] framework color pairs instead of semantic tokens
- Typography: [W] arbitrary font sizes, [W] font role violations
- Spacing: [W] arbitrary spacing values
- CI: Warnings only; zero merge blocks

During this phase, the team installs the Profile, configures CSS custom properties in the global stylesheet, and begins learning the token names. Speed impact is minimal because nothing blocks work.

**Phase 2: Color Lock (Weeks 3-4)**

Color rules escalate to [C] and block merge. Typography and spacing remain at [W], but their violations **must be logged and visible in CI dashboards** even though they do not block merge.

- Colors: **[C]** hardcoded hex values, **[C]** framework color pairs -- blocks merge
- Typography: **[W+]** arbitrary font sizes, font role violations -- logged in CI, visible in dashboards, does not block merge
- Spacing: **[W+]** arbitrary spacing values -- logged in CI, visible in dashboards, does not block merge
- CI: Color violations are errors; typography and spacing are warnings with a persistent count report

The **[W+]** level means the violation is tracked and reported alongside a running total (e.g., "34 spacing violations, 12 typography violations") so the team can see their debt accumulating and address it incrementally before Phase 3 activates full enforcement. Without this visibility, teams that ignore [W] violations for 4 weeks will face an overwhelming number of blocking errors when Phase 3 begins.

This phase is prioritized because color is the most visible inconsistency and the hardest to fix retroactively. By week 4, the team should be comfortable with semantic color tokens and should have made visible progress on reducing typography and spacing debt.

**[W+] CI integration example (GitHub Actions):**

```yaml
# .github/workflows/design-debt.yml
name: Design System Debt Tracker
on: [push, pull_request]
jobs:
  debt-report:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Count spacing violations
        run: |
          SPACING=$(grep -rn 'p-[0-9.]\+\|gap-[0-9.]\+\|m-[0-9.]\+' src/ | grep -v 'var(--' | wc -l)
          echo "::warning file=design-debt::Spacing violations: $SPACING (does not block merge)"
          echo "SPACING_DEBT=$SPACING" >> $GITHUB_ENV
      - name: Count typography violations
        run: |
          TYPO=$(grep -rn 'text-\[.*px\]\|text-xs\|text-sm\|text-lg\|text-xl\|text-2xl' src/ | grep -v 'var(--\|font-mono\|font-sans' | wc -l)
          echo "::warning file=design-debt::Typography violations: $TYPO (does not block merge)"
          echo "TYPO_DEBT=$TYPO" >> $GITHUB_ENV
      - name: Debt summary
        if: always()
        run: |
          echo "### Design System Debt Report" >> $GITHUB_STEP_SUMMARY
          echo "| Category | Violations |" >> $GITHUB_STEP_SUMMARY
          echo "|----------|-----------|" >> $GITHUB_STEP_SUMMARY
          echo "| Spacing  | $SPACING_DEBT |" >> $GITHUB_STEP_SUMMARY
          echo "| Typography | $TYPO_DEBT |" >> $GITHUB_STEP_SUMMARY
```

This workflow produces a persistent count in the PR summary. The team sees debt trending up or down each week. The exact grep patterns must be adapted to the Profile's token names and prohibited patterns (P8).

**Phase 3: Full Enforcement (Week 5+)**

All Core rules are enforced at their designated levels. This is the steady state.

- Colors: [C] as designated
- Typography: [C] as designated
- Spacing: [C] as designated
- Cards, icons, markdown: [C] or [W] as designated in Sections 3-9
- CI: Full enforcement with the Profile's linting rules

**For existing projects with large codebases**, Phase 1 may extend to 4 weeks and Phase 2 to 6 weeks. The timeline is a recommendation, not a mandate; the Tech Lead decides when to advance based on team readiness.

**MVP and prototype projects** may remain at Phase 1 indefinitely, provided the deviation is documented in the project's README or architecture decision record.

---

## 11. [CORE] Exceptions

### 11.1. Unconditionally Allowed

- Brand tokens with identical light/dark values (intentional, must be documented in Profile)
- Tabular-nums on data values (exception to font role rules, justified by alignment needs)
- Named responsive spacing patterns (documented in Profile, not ad-hoc)

### 11.2. Exceptions by Agreement

| Situation | Requirement |
|-----------|-------------|
| Third-party component requires inline styles | Document exception in code comment |
| External design requirement (marketing) | Coordinate with design lead |
| Prototype / MVP | Level [I] applies; document deviation |

### 11.3. Approval Process

1. Create issue with justification
2. Get approval from Tech Lead
3. Document exception in code with `// DESIGN-EXCEPTION: <reason>` comment
4. Add to whitelist in linting rule if necessary

### 11.4. Creating a New Profile

To create a new Profile:

1. Copy the Profile template (Sections P1-P11 as defined in Section 13) or use any existing Profile as a starting point
2. Replace the Profile Identity header (Profile ID, Design Language, Project Type)
3. Fill in all 11 required sections (P1-P11) with your project's values
4. Verify every Core constraint is satisfied (see Section 13.1: Profile Validation Checklist)
5. Submit for review alongside the project's design documentation
6. Once approved, the Profile becomes the authoritative token source for that project

A Profile may be stored in the same document as the Core (for single-project repositories) or in a separate document (for multi-project organizations). When stored separately, the Profile document must reference the Core version it complies with.

### 11.5. Agent Context Generation

When code is generated by AI agents (coding assistants, automated scaffolding tools), the full standard document is too large for a system prompt. A **compressed agent context** must be derived from the Profile to fit within prompt token limits while preserving all information the agent needs to produce compliant code.

**Why this is necessary:** Core rules tell an agent what *not* to do ("no hardcoded colors"), but without Profile values the agent has no idea what *to* do (which token to use instead). An agent without Profile context will default to framework conventions (e.g., Tailwind `text-blue-500`) that almost certainly violate the standard.

**Agent context format:**

Every Profile must be able to produce a compressed agent context containing four sections:

```markdown
# Design System Context (for AI agent)

## Typography
<token-name>: <size> <weight> <family> [<extras>]
(one line per token)

## Colors
<token-name>: <light-value> / dark: <dark-value>
(one line per token; aliases marked with "= <primary-token>")

## Spacing
<token-name>: <value>
(all tokens on one or two lines)

## Rules
- <rule 1>
- <rule 2>
(concise list of constraints the agent must follow)
```

**Requirements for the agent context:**

- Must fit within 3500 characters (approximately 900 tokens) when rendered
- Must include every typography token, every color token, every spacing token
- Must include all [C]-level rules that the agent is likely to violate
- Must NOT include prose explanations, rationale, version history, or cross-references
- Token values must be the actual values (hex, oklch, px), not references to sections
- The Profile must provide a concrete example of the rendered agent context
- **Compression is allowed:** Token names may be shortened in the agent context (e.g., `--ta` for `--terminal-accent`, `--sv` for `--semantic-violet`) provided a mapping table is included at the top of the context. This allows larger Profiles to fit within the limit without omitting tokens

**Auto-generation requirement:** The agent context (P11) must be generated from the Profile's token definitions (P1-P5) by a script, not written manually. Manual maintenance of P11 is impractical because any change to P1-P5 must be reflected in P11 immediately; without automation, P11 will drift out of sync and produce stale instructions for AI agents.

**Adoption-phase alignment:**

| Adoption Phase | P11 Script Requirement |
|---------------|----------------------|
| Phase 1 | Optional. Manual generation is acceptable. The team may maintain P11 by hand during the initial adoption period. |
| Phase 2 | Recommended. A script should be written or adapted, but CI enforcement is not required yet. |
| Phase 3 | **Mandatory.** The script must run as part of the CI pipeline or as a pre-commit hook. A build must fail if the generated P11 does not match the committed P11 (preventing drift). |

This phased requirement avoids overburdening small teams (2-3 developers) that are still learning the token system. The script becomes mandatory only when the project reaches full enforcement, by which point the team has enough familiarity to write or adapt one in a few hours.

The generation script must:
- Read token definitions from P2 (Typography Scale), P3 (Color Tokens), P4 (Syntax Highlighting), and P5 (Spacing Scale)
- Render each token in the compact format defined above
- Append the [C]-level rules from the Profile
- Verify the output fits within 3500 characters (fail the build if it does not)
- (Phase 3 only) Run as part of the CI pipeline or as a pre-commit hook

A Profile may provide the generation script in any language (shell, Node.js, Python). The script must be committed alongside the Profile document.

**Target audience:** This context is written for an AI code generator, not a human. Prioritize completeness and precision over readability.

---

## 12. [CORE] Pre-merge Checklist

### Before merge (code [C]):

- [ ] No hardcoded hex colors in component code
- [ ] No framework-specific color pairs (use semantic tokens)
- [ ] No font role violations per Profile rules
- [ ] No arbitrary font sizes outside the named scale
- [ ] Card styles match their archetype per Profile definition
- [ ] All colors resolve to CSS custom properties or framework equivalent
- [ ] Syntax highlighting uses named tokens (not hardcoded colors)
- [ ] Spacing uses only the named scale tokens
- [ ] Icons use SVG (from project icon library) with fallback

### Before merge (documentation [W]):

- [ ] No emoji or Unicode icons (STD-DOC-003 sections 4-5)
- [ ] No typographic symbols in headings or code blocks
- [ ] Status indicators use text tags: `[OK]`, `[FAIL]`
- [ ] Unordered lists use `-` marker strictly
- [ ] Code blocks specify language or `text`/`bash` fallback
- [ ] Stack signature present in root files
- [ ] Diagrams use whitelist characters only (STD-DOC-003 section 6.2)

---

## 13. [CORE] Profile Requirements

Every Profile must include the following sections. If a section is not applicable (e.g., a project without syntax highlighting), it must state "Not applicable" with a justification.

The Profile Identity (name, project type, design language) is stated in the Profile header preamble and does not have a separate numbered section.

| # | Required Section | Content |
|---|-----------------|---------|
| P1 | Font Roles & Default Implementation | Concrete fonts mapped to each role |
| P2 | Typography Scale | Named tokens with size, weight, family, extras |
| P3 | Color Tokens | Semantic tokens with light/dark values + aliases |
| P4 | Syntax Highlighting Tokens | If applicable; otherwise "N/A" with justification |
| P5 | Spacing Scale | Named tokens with pixel/rem values |
| P6 | Card Archetypes | At least one archetype with border, background, padding, typography rules |
| P7 | Component Token Map | Archetype-level token mapping (mandatory); element-level mapping (optional, see below) |
| P8 | Prohibited Patterns | Product-specific patterns to flag in linting |
| P9 | CSS Custom Properties | Copy-paste `:root` / `.dark` block |
| P10 | Enforcement Rule | Automated rule template (ESLint, Stylelint, or equivalent) |
| P11 | Agent Context | Compressed context for AI code generation (see Section 11.5) |

In addition to P1-P11, every Profile must include:

- **Integration Pattern Statement**: Which Token Integration Pattern (A, B, or C from Section 4.5) the Profile uses, with the corresponding theme configuration or stylesheet structure
- **Adoption Phase Statement**: Which Adoption Level (Phase 1, 2, or 3 from Section 10.4) the project is currently targeting, and the planned escalation timeline

**P7 granularity levels:**

The Component Token Map supports two levels of detail. A Profile must include at least Level 1; Level 2 is optional.

**Level 1: Archetype Mapping (mandatory).** Maps each card archetype to the typography and color tokens it uses, without enumerating individual elements. This is compact and maintainable.

Example:
```markdown
| Archetype | Typography Tokens | Color Tokens | Spacing Tokens |
|-----------|-------------------|-------------|----------------|
| Terminal | --text-label, --text-badge, --text-section, --text-code | --terminal-accent, --neuro-brand, --semantic-violet | --space-xs, --space-sm, --space-md |
| Content | --text-h1, --text-h2, --text-h3, --text-body, --text-body-sm | foreground, muted-foreground, --star-color | --space-md, --space-lg, --space-xl |
| Stat | --text-code, --text-badge | foreground, muted-foreground | --space-sm, --space-md |
```

**Level 2: Element Mapping (optional).** Maps individual UI elements to specific tokens. This is useful for large projects with dedicated platform teams, but impractical for small teams because it grows linearly with the number of UI elements and requires continuous maintenance. If maintained manually, Level 2 maps often become stale within weeks.

A Profile that chooses Level 2 should also provide a mechanism for keeping the map in sync (e.g., a script that extracts token usage from component code, or a design token tool that generates the map from Figma Tokens). Without such a mechanism, Level 2 is not recommended.

### 13.1. Profile Validation Checklist

Before a Profile is approved, verify it satisfies every Core constraint. Each item below maps to a Core section:

- [ ] **Header**: Profile ID, design language, and project type are stated in the Profile preamble
- [ ] **Integration Pattern**: Integration Pattern Statement present (Section 4.5); theme configuration or stylesheet structure provided
- [ ] **Adoption Phase**: Adoption Phase Statement present (Section 10.4); current phase and escalation timeline documented
- [ ] **P1 Font Roles**: At least 2 roles defined (Core Section 3.1); each role has requirements and a default implementation
- [ ] **P2 Typography Scale**: 5-12 levels defined (Core Section 3.2); each level has size, weight, family, extras; scale range matches project context
- [ ] **P3 Color Tokens**: All tokens use semantic names (Core Section 4.1); every interface token has light and dark variants (Core Section 4.2); aliases resolve to primary tokens (Core Section 4.3); no hardcoded colors in the Profile's own examples
- [ ] **P4 Syntax Highlighting**: If applicable, all minimum roles defined (Core Section 5); if not applicable, "N/A" stated with justification
- [ ] **P5 Spacing Scale**: 4-8 levels defined (Core Section 6.1); scale range matches project context
- [ ] **P6 Card Archetypes**: At least 1 archetype defined (Core Section 7.1); each archetype specifies border, background, padding, typography rules, content scope
- [ ] **P7 Component Token Map**: Archetype-level mapping provided (mandatory Level 1); element-level mapping is optional (Level 2) and only recommended if a sync mechanism exists
- [ ] **P8 Prohibited Patterns**: Profile-specific patterns listed with violation type and replacement; patterns cover the Profile's own token replacements
- [ ] **P9 CSS Custom Properties**: Complete `:root` and `.dark` blocks provided; all tokens from P1-P5 are present
- [ ] **P10 Enforcement Rule**: Automated rule template provided (Core Section 10.3); rule covers patterns from P8
- [ ] **P11 Agent Context**: Compressed context fits within 3500 characters (compression via short codes allowed); includes all typography, color, and spacing tokens; includes [C]-level rules; no prose or rationale (Core Section 11.5); auto-generation script provided (mandatory in Phase 3, optional in Phase 1-2)
- [ ] **Cross-cutting**: No framework bindings in normative sections (bindings allowed only in "Default Implementation" subsections and marked as informational); Profile-specific rules do not contradict Core constraints; SVG-only icon standard (Core Section 8); Markdown compliance (Core Section 9)

---

## PROFILE: Terminal Dashboard (EXAMPLE)

> Profile ID: PROFILE-TERMINAL-001
> Design Language: Terminal-inspired developer dashboard
> Project Type: Knowledge base / documentation tool with CLI aesthetic
> Integration Pattern: Pattern A (Theme Extension with Tailwind CSS)
> Adoption Phase: Phase 3 (Full Enforcement)

**IMPORTANT: This is an EXAMPLE Profile, not the standard itself.** The Core (Sections 3-13) defines the universal rules. Everything below is one possible instantiation of those rules for a specific design language (terminal aesthetic). If your project has a different visual language, you create your own Profile following the same P1-P11 structure. The Core remains unchanged; only the Profile changes.

This example Profile serves a dual purpose:

1. **Working profile** for projects that match this design language (terminal-style developer tools). Use as-is.

2. **Reference template** for understanding how a Profile is structured. Each section below maps to a required P-section from the Core (Section 13). When creating a new Profile, follow the same structure but replace all token values, component names, and design language choices with your own.

**How to create a new Profile:**

- Copy all P-sections below (P1-P11)
- Change Profile ID, Design Language, Project Type
- Replace ALL token values (fonts, colors, spacing, archetypes, component map) with your project's values
- Replace ALL Profile-specific rules with rules appropriate for your design language
- Verify against the Profile Validation Checklist (Section 13.1)
- Remove this instructional preamble from the new Profile

**Key principle:** The structural skeleton (P1-P11) is the same for every Profile. The values inside are different for each project.

**Section-to-P mapping in this example:**

| Document Section | P-Section | Content |
|-----------------|-----------|---------|
| (header) | -- | Profile Identity |
| 14 | P1 | Font Roles & Default Implementation |
| 15 | P2 | Typography Scale |
| 16 | P3 | Color Tokens |
| 17 | P4 | Syntax Highlighting Tokens |
| 18 | P5 | Spacing Scale |
| 19 | P6 | Card Archetypes |
| 20 | P7 | Component Token Map |
| 21 | P8 | Prohibited Patterns |
| 22 | P9 | CSS Custom Properties |
| 23 | P10 | Enforcement Rule |
| 24 | P11 | Agent Context |

Note: Sections 25-26 (Version History, Cross-References) are document infrastructure shared by Core and Profile. They are not Profile-specific.

---

## 14. [PROFILE P1] Font Roles & Default Implementation

| Role | Token | Default Font | Rationale |
|------|-------|-------------|-----------|
| Sans-serif | `font-sans` | Inter | Variable weight, optimized for screen legibility, wide language support |
| Monospace | `font-mono` | JetBrains Mono | Designed for code, ligatures available, clear at small sizes |

A project may substitute fonts provided the replacement meets the Core role requirements (Section 3.1). Substitution must be documented in the project configuration and approved by Tech Lead.

---

## 15. [PROFILE P2] Typography Scale

Ten tokens. The monospace role dominates chrome elements (labels, badges, prompts, metadata), which is characteristic of the terminal aesthetic.

### 15.1. Token Definitions

| Token | Size | Weight | Family | Extras | Usage |
|-------|------|--------|--------|--------|-------|
| `--text-h1` | 24px | Bold (700) | `font-sans` | -- | Page heading |
| `--text-h2` | 18px | Bold (700) | `font-sans` | -- | Section heading |
| `--text-h3` | 14px | Semibold (600) | `font-sans` | -- | Card / element heading |
| `--text-body` | 14px | Regular (400) | `font-sans` | -- | Descriptions, notes, explanations |
| `--text-body-sm` | 12px | Regular (400) | `font-sans` | -- | Secondary text, subtitles, dates |
| `--text-label` | 11px | Regular (400) | `font-mono` | -- | Field labels, breadcrumbs, terminal titles |
| `--text-badge` | 10px | Regular (400) | `font-mono` | -- | Count badges, tiny labels |
| `--text-section` | 10px | Regular (400) | `font-mono` | Uppercase, tracking-wider | Section headers, category labels |
| `--text-code` | 13px | Regular (400) | `font-mono` | -- | Code blocks, terminal output |
| `--text-code-label` | 11px | Medium (500) | `font-mono` | -- | Terminal title bar labels |

### 15.2. Default Implementation (Tailwind CSS) -- Informational

| Token | Tailwind Class |
|-------|---------------|
| `--text-h1` | `text-2xl font-bold font-sans` |
| `--text-h2` | `text-lg font-bold font-sans` |
| `--text-h3` | `text-sm font-semibold font-sans` |
| `--text-body` | `text-sm font-sans` |
| `--text-body-sm` | `text-xs font-sans` |
| `--text-label` | `text-[11px] font-mono` |
| `--text-badge` | `text-[10px] font-mono` |
| `--text-section` | `text-[10px] font-mono uppercase tracking-wider` |
| `--text-code` | `text-[13px] font-mono` |
| `--text-code-label` | `text-[11px] font-mono font-medium` |

A project using a different CSS framework must map these tokens to the framework's equivalent utility classes or custom CSS. The token definitions (size, weight, family) in Section 15.1 are normative; this Tailwind mapping is informational and only applies if this CSS framework is used.

### 15.3. Profile-Specific Font Rules

- `font-sans` is mandatory for all headings (`h1`, `h2`, `h3`). Headings must never use `font-mono`.
- `font-mono` is reserved for terminal chrome: labels, badges, buttons, metadata, footer, sidebar, prompts.
- `font-sans` is for readable text: headings, descriptions, body content, card text.
- Stat card values use `font-mono` with `tabular-nums` (exception to the "mono is for chrome" rule, justified by tabular data alignment).

### 15.4. Typography Usage Examples

```tsx
// [OK] Heading uses font-sans via token
<h1 className="text-2xl font-bold font-sans">Page Title</h1>

// [FAIL] Heading uses font-mono
<h1 className="text-2xl font-bold font-mono">Page Title</h1>

// [OK] Terminal label uses font-mono via token
<span className="text-[11px] font-mono">$</span>

// [FAIL] Arbitrary font size not in scale
<span className="text-[9px]">Label</span>
```

### 15.5. Alternative Implementation: CSS Modules (Pattern B)

The Tailwind mapping above is the default for this Profile. If the project uses CSS Modules instead (Integration Pattern B, Section 4.5), the typography tokens would be consumed as follows:

```css
/* typography.module.css */
.h1 {
  font-size: 24px;
  font-weight: 700;
  font-family: var(--font-sans);
}

.h2 {
  font-size: 18px;
  font-weight: 700;
  font-family: var(--font-sans);
}

.body {
  font-size: 14px;
  font-weight: 400;
  font-family: var(--font-sans);
}

.label {
  font-size: 11px;
  font-weight: 400;
  font-family: var(--font-mono);
}

.code {
  font-size: 13px;
  font-weight: 400;
  font-family: var(--font-mono);
}
```

```tsx
// Component code with CSS Modules
import typo from './typography.module.css';

<h1 className={typo.h1}>Page Title</h1>
<span className={typo.label}>$</span>
```

The token values (size, weight, family) are the same regardless of integration pattern. Only the consumption mechanism changes.

---

## 16. [PROFILE P3] Color Tokens

### 16.1. Primary Tokens

| Token | Light Value | Dark Value | Purpose |
|-------|-------------|------------|---------|
| `--terminal-accent` | `oklch(0.65 0.2 145)` | `oklch(0.75 0.18 145)` | Green for `$` prompts, active nav cursor |
| `--neuro-brand` | `#FA3913` | `#FA3913` | Coral for brand mark, dividers |
| `--star-color` | `oklch(0.78 0.16 75)` | (auto dark variant) | Amber for stars, bookmarks, AI sparkles |
| `--semantic-violet` | `oklch(0.55 0.25 295)` | `oklch(0.65 0.22 295)` | Violet for semantic search, AI badges |
| `--accent-red` | `#dc2626` | `#f87171` | Destructive actions, errors |

### 16.2. Accent Aliases

| Alias Token | Resolves To | Light | Dark | When to use |
|-------------|-------------|-------|------|-------------|
| `--accent-green` | `var(--terminal-accent)` | `#16a34a` | `#4ade80` | When referencing "green accent" in a new context |
| `--accent-amber` | `var(--star-color)` | `#b45309` | `#fbbf24` | When referencing "amber accent" for warnings |
| `--accent-violet` | `var(--semantic-violet)` | `#7c3aed` | `#a78bfa` | When referencing "violet accent" in a new context |
| `--accent-red` | (primary token) | `#dc2626` | `#f87171` | Destructive, error states |

### 16.3. CSS Implementation

```css
:root {
  /* Primary tokens with light values */
  --terminal-accent: oklch(0.65 0.2 145);
  --neuro-brand: #FA3913;
  --star-color: oklch(0.78 0.16 75);
  --semantic-violet: oklch(0.55 0.25 295);
  --accent-red: #dc2626;

  /* Aliases resolve to primaries */
  --accent-green: var(--terminal-accent);
  --accent-amber: var(--star-color);
  --accent-violet: var(--semantic-violet);
}

.dark {
  --terminal-accent: oklch(0.75 0.18 145);
  --semantic-violet: oklch(0.65 0.22 295);
  --accent-red: #f87171;
}
```

### 16.4. Profile-Specific Color Rules

- Replace all `text-green-600 dark:text-green-400` pairs with `var(--terminal-accent)`.
- Replace all `text-amber-500` (star color) with `var(--star-color)`.
- Replace all `text-violet-600` / `text-violet-500` with `var(--semantic-violet)`.
- Never hardcode hex colors in component code.
- `--neuro-brand` is the same value in both themes (intentional brand consistency).

**Template note for new Profiles:** This Profile defines only accent and brand colors because the terminal aesthetic relies on the framework's default neutral palette (`foreground`, `muted-foreground`, `border`, `muted`) for surface and text colors. A Profile with a richer visual language (e.g., immersive, editorial, marketing) should define additional semantic tokens for neutral surfaces and text layers. Examples:

| Token | Purpose | Why it matters |
|-------|---------|----------------|
| `--surface-primary` | Main background | Deeper than default for immersive sites |
| `--surface-elevated` | Card/panel background | Visual depth without borders |
| `--text-primary` | Main text | Higher contrast than default foreground |
| `--text-secondary` | Supporting text | Softer than primary, but not muted |
| `--divider` | Lines and separators | Distinct from border, subtler |

These are optional at the Core level, but strongly recommended for any project that cannot rely on the framework's default neutral palette.

### 16.5. Color Token Usage Examples

```tsx
// [FAIL] Hardcoded color pair
<span className="text-green-600 dark:text-green-400">$</span>

// [OK] Semantic token via theme extension (Pattern A, Section 4.5)
<span className="text-accent-primary">$</span>

// [FAIL] Hardcoded violet
<button className="bg-violet-600">Search</button>

// [OK] Semantic token via theme extension (Pattern A, Section 4.5)
<button className="bg-semantic-search">Search</button>
```

---

## 17. [PROFILE P4] Syntax Highlighting Tokens

Eight tokens for code block syntax coloring in the terminal aesthetic.

### 17.1. Token Definitions

| Token | Light | Dark | Demo |
|-------|-------|------|------|
| `--syntax-comment` | `#6b7280` | `#78716c` | `// comment` |
| `--syntax-keyword` | `#16a34a` | `#4ade80` | `POST` |
| `--syntax-string` | `#b45309` | `#fbbf24` | `"value"` |
| `--syntax-function` | `#7c3aed` | `#c084fc` | `/api/backup` |
| `--syntax-path` | `#0891b2` | `#22d3ee` | `/path/to/file` |
| `--syntax-flag` | `#2563eb` | `#60a5fa` | `--verbose` |
| `--syntax-number` | `#c2410c` | `#fb923c` | `42` |
| `--syntax-env` | `#0d9488` | `#2dd4bf` | `DATABASE_URL=` |

### 17.2. CSS Implementation

```css
:root {
  --syntax-comment: #6b7280;
  --syntax-keyword: #16a34a;
  --syntax-string: #b45309;
  --syntax-function: #7c3aed;
  --syntax-path: #0891b2;
  --syntax-flag: #2563eb;
  --syntax-number: #c2410c;
  --syntax-env: #0d9488;
}

.dark {
  --syntax-comment: #78716c;
  --syntax-keyword: #4ade80;
  --syntax-string: #fbbf24;
  --syntax-function: #c084fc;
  --syntax-path: #22d3ee;
  --syntax-flag: #60a5fa;
  --syntax-number: #fb923c;
  --syntax-env: #2dd4bf;
}
```

### 17.3. Default Syntax Highlighter: Prism.js -- Informational

```css
/* [OK] Prism theme using design tokens */
.token.comment { color: var(--syntax-comment); }
.token.keyword { color: var(--syntax-keyword); }
.token.string  { color: var(--syntax-string); }
.token.function { color: var(--syntax-function); }

/* [FAIL] Prism theme with hardcoded values */
.token.comment { color: #6b7280; }
.token.keyword { color: #16a34a; }
```

A project may use an alternative syntax highlighter (Shiki, Highlight.js, etc.) provided it maps token classes to the same `--syntax-*` custom properties.

---

## 18. [PROFILE P5] Spacing Scale

### 18.1. Token Definitions

| Token | Pixels | Usage |
|-------|--------|-------|
| `--space-xs` | 6px | Inside badges, tight groups |
| `--space-sm` | 8px | Within groups, icon gaps |
| `--space-md` | 12px | Within cards, sections |
| `--space-lg` | 16px | Between sections, card padding |
| `--space-xl` | 24px | Page-level padding, view margins |

### 18.2. Default Implementation (Tailwind CSS) -- Informational

| Token | Tailwind Class |
|-------|---------------|
| `--space-xs` | `gap-1.5` / `p-1.5` |
| `--space-sm` | `gap-2` / `p-2` |
| `--space-md` | `gap-3` / `p-3` |
| `--space-lg` | `gap-4` / `p-4` |
| `--space-xl` | `gap-6` / `p-6` |

### 18.3. Profile-Specific Spacing Rules

- Spacing between a card border and its content is `--space-md` (12px).
- Spacing between cards in a list is `--space-sm` (8px).
- Page-level containers use `--space-xl` (24px).

### 18.4. Responsive Spacing Pattern

Terminal-archetype cards follow a unified responsive margin pattern:

```tsx
// Outer margin: responsive
<div className="m-3 sm:m-4 md:m-6">

// Inner padding: responsive
<div className="p-3 sm:p-4">
```

This is the only spacing pattern that uses responsive breakpoints. All other spacing values are static tokens. Other Profiles may define different responsive patterns appropriate to their design language.

---

## 19. [PROFILE P6] Card Archetypes

### 19.1. Terminal Card

- Border: `border-dashed`
- Wrapper: Terminal-style frame component (default implementation: `TerminalFrame`)
- Background: Default (no tint)
- Content: Command output, terminal prompts, interactive shell, dashboard stats
- Typography: `font-mono` for chrome, `font-sans` for titles

**Requirements for the wrapper component:**

- Renders a dashed border container
- Provides consistent terminal-style framing (header bar with dots, prompt prefix)
- Supports light/dark theme via semantic tokens

```tsx
// [OK] Terminal card (using default TerminalFrame wrapper, Pattern A)
<TerminalFrame>
  <div className="border-dashed p-md">
    <span className="text-badge font-mono">dashboard</span>
    <span className="text-accent-primary">$</span>
    <span className="text-code font-mono">ls ~/documents</span>
  </div>
</TerminalFrame>
```

### 19.2. Content Card

- Border: `solid` (default)
- Wrapper: Content card component (default implementation: `Card`)
- Background: Default (no tint)
- Content: Prose, descriptions, translations, explanatory text
- Typography: `font-sans` for all text, `font-mono` only for code snippets

**Requirements for the wrapper component:**

- Renders a solid border container
- Supports padding via spacing tokens
- Does not add terminal-style chrome (no dashed borders, no prompt prefixes)

```tsx
// [OK] Content card (using default Card wrapper, Pattern A)
<Card>
  <div className="p-md">
    <h3 className="text-h3 font-sans">
      Deployment Guide
    </h3>
    <p className="text-body font-sans">
      Instructions for configuring the environment and launching
      in production mode.
    </p>
    <span className="text-badge font-mono">devops</span>
  </div>
</Card>
```

### 19.3. Stat Card

- Border: None
- Background: `--muted-alpha` (50% opacity muted surface via `color-mix()`)
- Content: Single metric, number + label
- Typography: `font-mono` for value (tabular-nums), `font-mono` for label

The Stat Card uses a semi-transparent muted background. This is implemented via a dedicated `--muted-alpha` CSS custom property that uses `color-mix()` to produce 50% opacity of the muted surface color. This approach satisfies Core 4.4 (all colors must resolve to CSS custom properties) without relying on framework-specific opacity modifiers like `bg-muted/50` which bypass the custom property layer.

```css
/* In :root and .dark (see Section 22 for full block) */
:root {
  --muted-alpha: color-mix(in oklch, var(--muted) 50%, transparent);
}
.dark {
  --muted-alpha: color-mix(in oklch, var(--muted) 50%, transparent);
}
```

```tsx
// [OK] Stat card (Pattern A: Theme Extension)
<div className="bg-muted-alpha p-md">
  <span className="text-code font-mono tabular-nums">42</span>
  <span className="text-badge font-mono">documents</span>
</div>

// [OK] Stat card (Pattern B: CSS Modules)
<div className={styles.statCard}>
  <span className={styles.statValue}>42</span>
  <span className={styles.statLabel}>documents</span>
</div>

/* stat.module.css */
.statCard { background: var(--muted-alpha); padding: var(--space-md); }
.statValue { font: 400 13px/1 var(--font-mono); font-variant-numeric: tabular-nums; }
.statLabel { font: 400 10px/1 var(--font-mono); }
```

**For Profiles using Pattern A with Tailwind CSS:** Register `muted-alpha` in the theme configuration alongside other tokens. Do not use the `bg-muted/50` opacity modifier syntax, as it generates opacity at the utility layer rather than resolving through a CSS custom property, which violates Core 4.4.

**Browser compatibility note:** `color-mix(in oklch, ...)` requires Chrome/Edge 111+, Firefox 113+, Safari 16.4+. For projects that must support older browsers (Safari 15, legacy environments), define a static fallback value alongside the `color-mix()` declaration. The fallback must be documented as a Profile-specific exception:

```css
:root {
  /* Fallback for browsers without color-mix() support */
  --muted-alpha: rgba(128, 128, 128, 0.05);
  /* Modern definition -- overrides fallback when supported */
  --muted-alpha: color-mix(in oklch, var(--muted) 50%, transparent);
}
```

CSS custom properties follow the cascade: browsers that support `color-mix()` will use the second declaration; older browsers will fall back to the first. The static fallback value must be visually verified by the design team and documented in the Profile.

### 19.4. Interactive / Canvas Card

- Border: None or `solid` (Profile-specific)
- Background: Transparent or `--muted-alpha` (Profile-specific)
- Content: Full-viewport interactive areas: canvas renderers (Three.js, D3, Konva), flow editors, drag-and-drop boards, map views, animation playgrounds
- Typography: `font-sans` for overlay controls; `font-mono` for coordinate/data readouts

This archetype is for components where the primary visual output is not prose or metrics but an interactive canvas or viewport. Unlike Terminal, Content, and Stat cards which display information, the Interactive/Canvas card provides a drawing surface or interaction area. The card itself is a thin wrapper; the visual weight comes from the rendered content (3D scene, diagram, chart, map), not from border or background treatments.

**Requirements for the wrapper component:**

- Renders a boundary container for the interactive content
- Supports an optional overlay for controls (toolbar, zoom controls, legend)
- Must not add padding that clips the canvas/viewport content (padding applies to overlay only)
- Must handle resize events to keep the interactive content responsive

```tsx
// [OK] Interactive/Canvas card (Pattern A)
<CanvasCard>
  <Canvas3DRenderer data={sceneData} />
  <CanvasOverlay position="top-right">
    <ZoomControls />
    <AxisToggle />
  </CanvasOverlay>
</CanvasCard>

// [OK] Interactive/Canvas card (Pattern B)
<CanvasCard>
  <FlowEditor data={flowData} />
  <CanvasOverlay position="bottom-left">
    <span className={styles.readout}>x: 142 y: 87</span>
  </CanvasOverlay>
</CanvasCard>
```

**Animation tokens (Section P12):** Components within an Interactive/Canvas card that use transitions, spring physics, or keyframe animations must reference animation tokens (`--duration-*`, `--easing-*`) rather than hardcoded millisecond values or cubic-bezier strings. This ensures animation timing is consistent with the rest of the design system and can be adjusted per Profile (e.g., slower animations for accessibility, faster for power-user tools).

### 19.5. Profile-Specific Card Rules

- A Content Card must never use `border-dashed`.
- A Terminal Card must always use `border-dashed` and be wrapped in a terminal-style frame component.
- A Stat Card uses `--muted-alpha` (color-mix 50% muted) with minimal visual weight. No heavy borders.

```tsx
// [FAIL] Content card with terminal style
<Card className="border-dashed">
  <p className="text-sm font-sans">Prose content here</p>
</Card>

// [FAIL] Terminal card with solid border
<div className="border-solid p-3">
  <span>$</span> ls
</div>
```

Note: These rules are specific to the Terminal Dashboard Profile. A different Profile may define entirely different archetype constraints (e.g., an immersive Profile might require glass backgrounds for feature cards and no borders on any card type).

---

## 20. [PROFILE P7] Component Token Map

This map is specific to the Terminal Dashboard layout (sidebar + header + footer + views). A different project will have a different component structure and a different token map. The requirement is that every major UI block is mapped; the specific blocks and elements are Profile-specific.

### 20.1. Shell Components

| Block | Element | Typography Token | Color Token | Card Style |
|-------|---------|-----------------|-------------|------------|
| Sidebar | Brand title | `--text-h3` | `foreground` | -- |
| Sidebar | Brand label | `--text-badge` | `--neuro-brand` | -- |
| Sidebar | Nav item label | `--text-label` | `muted-foreground` | -- |
| Sidebar | Active arrow `>` | `--text-badge` | `--terminal-accent` | -- |
| Sidebar | Count badge | `--text-badge` | `muted-foreground` | -- |
| Header | Breadcrumb path | `--text-label` | `foreground` | -- |
| Header | App name + `$` prompt | `--text-label` | `--terminal-accent` | -- |
| Header | Semantic button | -- | `--semantic-violet` | -- |
| Header | Search border (active) | -- | `--semantic-violet / 50%` | -- |
| Footer | Prompt `//>` | `--text-label` | `--terminal-accent` | -- |
| Footer | App name | `--text-label` | `foreground` | -- |
| Footer | Version | `--text-badge` | `muted-foreground` | -- |
| Footer | Brand divider | -- | `--neuro-brand` | -- |

### 20.2. View Components

| Block | Element | Typography Token | Color Token | Card Style |
|-------|---------|-----------------|-------------|------------|
| Dashboard | Stat value | `--text-code` (mono, tabular) | `foreground` | Terminal |
| Dashboard | Stat label | `--text-badge` | `muted-foreground` | Terminal |
| Dashboard | Prompt `$` | `--text-label` | `--terminal-accent` | Terminal |
| Dashboard | Section header | `--text-section` | `muted-foreground` | Terminal |
| Dashboard | Doc title | `--text-h3` | `foreground` | Terminal |
| Dictionary | Term name | `--text-h3` | `foreground` | Content |
| Dictionary | Translation | `--text-body` | `muted-foreground` | Content |
| Dictionary | Explanation | `--text-body-sm` | `muted-foreground / 70%` | Content |
| Dictionary | Category badge | `--text-badge` | `category.color` | Content |
| Documents | Doc title | `--text-h3` | `foreground` | Terminal |
| Documents | Star icon | -- | `--star-color` | Terminal |
| Documents | Date | `--text-badge` | `muted-foreground / 60%` | Terminal |
| Documents | Category badge | `--text-badge` | `category.color` | Terminal |
| Doc Viewer | Prose headings | `--text-h1` / `--text-h2` / `--text-h3` | `foreground` | Content |
| Doc Viewer | Prose body | `--text-body` | `foreground` | Content |
| Doc Viewer | Code blocks | `--text-code` | `syntax-*` tokens | Terminal |
| Doc Viewer | Blockquote | `--text-body` | `muted-foreground` | Content |
| Notes | Note title | `--text-h3` | `foreground` | Terminal |
| Notes | Note preview | `--text-body-sm` | `muted-foreground` | Terminal |
| Notes | AI badge | `--text-badge` | `--semantic-violet` | Terminal |
| Notes | Prompt `$` | `--text-label` | `--terminal-accent` | Terminal |
| Instructions | Search input | `--text-label` | `muted-foreground` | Terminal |
| Instructions | Prompt `$` | `--text-label` | `--terminal-accent` | Terminal |
| Instructions | Step title | `--text-h3` | `foreground` | Terminal |
| Instructions | Step description | `--text-body` | step-type accent | Terminal |
| Upload | Drop zone title | `--text-h2` | `foreground` | Terminal |
| Upload | Drop zone description | `--text-body` | `muted-foreground` | Terminal |
| Upload | Status label | `--text-label` | `--terminal-accent` | Terminal |

### 20.3. Token Map Usage Example

```tsx
// Sidebar > Nav item label: --text-label, muted-foreground
<nav>
  <a className="text-[11px] font-mono text-muted-foreground">
    Documents
  </a>
</nav>

// Sidebar > Active arrow: --text-badge, --terminal-accent (Pattern A)
<span className="text-badge font-mono text-accent-primary">
  &gt;
</span>
```

---

## 21. [PROFILE P8] Prohibited Patterns

The patterns below are specific to this Profile (Terminal Dashboard). Each Profile must list its own prohibited patterns based on its token choices and design language. The structure of the table (Pattern / Violation / Replacement) is reusable; the content is not.

### 21.1. Hardcoded Colors

| Pattern | Violation | Replacement (Pattern A: Theme Extension) |
|---------|-----------|------------------------------------------|
| `text-green-600 dark:text-green-400` | Color pair instead of token | `text-accent-primary` |
| `text-amber-500 fill-amber-500` | No dark variant, hardcoded | `text-star fill-star` |
| `bg-violet-600` | Hardcoded violet | `bg-semantic-search` |
| `text-red-500` | Hardcoded red | `text-destructive` |
| `text-[#FA3913]` | Hardcoded hex | `text-brand` |
| `bg-zinc-900 text-zinc-400` | Theme-inflexible | `--muted-alpha` (60% variant) + semantic tokens |
| `#f5f5f4` / `#292524` in prose pre | Hardcoded pre background | `bg-muted` / `border-border` |

### 21.2. Arbitrary Typography

| Pattern | Violation | Replacement |
|---------|-----------|-------------|
| `text-[9px]` | Below scale minimum | `--text-badge` (10px) |
| `font-mono font-bold` on heading | Mono heading | `font-sans` via `--text-h1/h2/h3` |
| `text-xs sm:text-sm` | Inconsistent responsive sizing | Choose one token |
| Heading without `font-sans` | Browser default serif | Explicit `font-sans` |

### 21.3. Card Style Violations

| Pattern | Violation | Replacement |
|---------|-----------|-------------|
| `border-dashed` on prose card | Terminal style on Content card | `solid` border + Content Card |
| `border-solid` on terminal card | Content style on Terminal card | `border-dashed` + Terminal Card |
| Heavy border on stat card | Over-styled stat | `--muted-alpha` minimal |

---

## 22. [PROFILE P9] CSS Custom Properties Summary

Complete copy-paste reference. Add to the project's global stylesheet.

```css
/*
 * DESIGN SYSTEM TOKENS
 * Profile: Terminal Dashboard (PROFILE-TERMINAL-001)
 * Add to project's global stylesheet.
 * Framework-specific class mappings are in Section 15.2 and Section 18.2 (if applicable).
 */
:root {
  /* Typography: size/weight/family values are in Section 15.1; framework class mappings in Section 15.2 (if applicable) */

  /* Semantic Color Tokens (Section 16) */
  --terminal-accent: oklch(0.65 0.2 145);
  --neuro-brand: #FA3913;
  --star-color: oklch(0.78 0.16 75);
  --semantic-violet: oklch(0.55 0.25 295);
  --accent-red: #dc2626;

  /* Accent Aliases (Section 16.2) */
  --accent-green: var(--terminal-accent);
  --accent-amber: var(--star-color);
  --accent-violet: var(--semantic-violet);

  /* Surface Alpha Tokens (Section 19.3) */
  --muted-alpha: color-mix(in oklch, var(--muted) 50%, transparent);

  /* Syntax Highlighting (Section 17) */
  --syntax-comment: #6b7280;
  --syntax-keyword: #16a34a;
  --syntax-string: #b45309;
  --syntax-function: #7c3aed;
  --syntax-path: #0891b2;
  --syntax-flag: #2563eb;
  --syntax-number: #c2410c;
  --syntax-env: #0d9488;

  /* Spacing: pixel values are in Section 18.1; framework class mappings in Section 18.2 (if applicable) */
}

.dark {
  --terminal-accent: oklch(0.75 0.18 145);
  --semantic-violet: oklch(0.65 0.22 295);
  --accent-red: #f87171;

  --syntax-comment: #78716c;
  --syntax-keyword: #4ade80;
  --syntax-string: #fbbf24;
  --syntax-function: #c084fc;
  --syntax-path: #22d3ee;
  --syntax-flag: #60a5fa;
  --syntax-number: #fb923c;
  --syntax-env: #2dd4bf;
}
```

---

## 23. [PROFILE P10] Enforcement: ESLint Rule (Example)

The prohibited patterns below are specific to this Profile (Terminal Dashboard). Each Profile must define its own set of prohibited patterns based on its token choices. The structure of the rule is reusable; the pattern list is not.

```javascript
// eslint-rules/design-tokens.js
module.exports = {
  meta: {
    type: 'problem',
    docs: { description: 'Enforce design system token usage' }
  },
  create(context) {
    const prohibitedColorPatterns = [
      /text-green-\d+/,
      /text-amber-\d+/,
      /text-violet-\d+/,
      /text-red-\d+(?!\s)/,
      /bg-violet-\d+/,
      /border-violet-\d+/
    ];

    const prohibitedHexInJsx = /#[0-9a-fA-F]{3,8}/;

    return {
      JSXAttribute(node) {
        if (node.name?.name !== 'className') return;
        const value = node.value?.value || '';
        for (const pattern of prohibitedColorPatterns) {
          if (pattern.test(value)) {
            context.report({
              node,
              message: 'Hardcoded Tailwind color detected. '
                + 'Use a semantic token instead (see DESIGN_SYSTEM_STANDARD).'
            });
          }
        }
      },
      StringLiteral(node) {
        if (prohibitedHexInJsx.test(node.value)) {
          context.report({
            node,
            message: 'Hardcoded hex color detected. '
              + 'Use a CSS custom property instead.'
          });
        }
      }
    };
  }
};
```

### CI Pipeline Integration

```yaml
# .github/workflows/design-lint.yml
name: Design System Lint
on: [push, pull_request]
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm install eslint-plugin-markdown
      - run: npx eslint --rule 'design-tokens: error' 'src/**/*.{tsx,jsx}'
      - run: npx eslint --plugin markdown '**/*.md' --rule 'no-irregular-whitespace: error'
```

---

## 24. [PROFILE P11] Agent Context

Compressed design system context derived from this Profile for use in AI agent system prompts.

```markdown
# Design System Context (for AI agent)

## Typography
--text-h1: 24px Bold font-sans
--text-h2: 18px Bold font-sans
--text-h3: 14px Semibold font-sans
--text-body: 14px Regular font-sans
--text-body-sm: 12px Regular font-sans
--text-label: 11px Regular font-mono
--text-badge: 10px Regular font-mono
--text-section: 10px Regular font-mono Uppercase tracking-wider
--text-code: 13px Regular font-mono
--text-code-label: 11px Medium font-mono

## Colors
--terminal-accent: oklch(0.65 0.2 145) / dark: oklch(0.75 0.18 145)
--neuro-brand: #FA3913 (same both themes)
--star-color: oklch(0.78 0.16 75) / dark: auto
--semantic-violet: oklch(0.55 0.25 295) / dark: oklch(0.65 0.22 295)
--accent-red: #dc2626 / dark: #f87171
--accent-green = var(--terminal-accent)
--accent-amber = var(--star-color)
--accent-violet = var(--semantic-violet)
--syntax-comment: #6b7280 / dark: #78716c
--syntax-keyword: #16a34a / dark: #4ade80
--syntax-string: #b45309 / dark: #fbbf24
--syntax-function: #7c3aed / dark: #c084fc
--syntax-path: #0891b2 / dark: #22d3ee
--syntax-flag: #2563eb / dark: #60a5fa
--syntax-number: #c2410c / dark: #fb923c
--syntax-env: #0d9488 / dark: #2dd4bf

## Spacing
--space-xs: 6px | --space-sm: 8px | --space-md: 12px | --space-lg: 16px | --space-xl: 24px

## Rules
- All colors via CSS custom properties; never hardcoded hex or Tailwind color classes (text-green-*, bg-violet-*, etc.)
- Headings (h1-h3): font-sans ONLY, never font-mono
- font-mono is for: labels, badges, prompts, code, metadata, terminal chrome
- Every gap/padding/margin must use spacing scale tokens; no arbitrary values
- Icons: SVG only (from project icon library); never emoji or Unicode symbols
- Cards: Terminal=border-dashed+TerminalFrame | Content=border-solid+Card | Stat=--muted-alpha
- Syntax highlighting: use --syntax-* tokens, never hardcoded colors
- No text-X dark:text-Y pairs; use semantic tokens with auto light/dark
```

**Compressed variant (short-code mapping):**

When the full context above exceeds the character limit for larger Profiles, token names may be shortened using a mapping table. The agent reads the map first, then resolves short codes throughout the rest of the context. This typically reduces size by 30-40%.

```markdown
# Design System Context (compressed)
## Map
ta=terminal-accent | nb=neuro-brand | sc=star-color | sv=semantic-violet
ar=accent-red | ag=accent-green | ab=accent-amber | av=accent-violet
sx=syntax | h1-h3=text-h1..h3 | bd=text-body | bs=text-body-sm
lb=text-label | bg=text-badge | sn=text-section | cd=text-code | cl=text-code-label
ma=muted-alpha

## Typography
h1:24px B sans|h2:18px B sans|h3:14px Sb sans|bd:14px R sans|bs:12px R sans
lb:11px R mono|bg:10px R mono|sn:10px R mono UC tw|cd:13px R mono|cl:11px M mono

## Colors
ta:oklch(.65 .2 145)/d:oklch(.75 .18 145) | nb:#FA3913 | sc:oklch(.78 .16 75)/d:auto
sv:oklch(.55 .25 295)/d:oklch(.65 .22 295) | ar:#dc2626/d:#f87171 | ma:color-mix
ag=ta|ab=sc|av=sv
sx-cmt:#6b7280/d:#78716c|sx-kw:#16a34a/d:#4ade80|sx-str:#b45309/d:#fbbf24
sx-fn:#7c3aed/d:#c084fc|sx-pth:#0891b2/d:#22d3ee|sx-fl:#2563eb/d:#60a5fa
sx-num:#c2410c/d:#fb923c|sx-env:#0d9488/d:#2dd4bf

## Spacing
xs:6|sm:8|md:12|lg:16|xl:24

## Rules
- Colors: CSS vars only; no hex/Tailwind colors in code
- Headings: sans ONLY; mono for labels/badges/prompts/code
- Spacing: tokens only; no arbitrary values
- Icons: SVG only; no emoji/Unicode
- Cards: Terminal=dashed+Frame | Content=solid+Card | Stat=ma
- Syntax: sx-* tokens; no hardcoded colors
```

The generation script (Section 11.5) may output either format. The compressed format is recommended when the full format exceeds 3000 characters.

---

## 25. [PROFILE P12] Animation Tokens

Projects that use CSS transitions, JavaScript-driven animations, spring physics, or keyframe animations must define animation tokens to ensure timing and easing consistency across the interface. Hardcoded `transition-duration`, `animation-duration`, or `cubic-bezier()` values in component code are prohibited at level [W] (level [C] for Interactive/Canvas archetype components).

### 25.1. Duration Tokens

| Token | Milliseconds | Usage |
|-------|-------------|-------|
| `--duration-instant` | 100ms | Micro-interactions: button press, toggle, checkbox |
| `--duration-fast` | 150ms | Hover effects, focus rings, tooltip appear |
| `--duration-normal` | 250ms | Panel expand/collapse, dropdown open, tab switch |
| `--duration-slow` | 400ms | Page transitions, modal open/close, drawer slide |
| `--duration-slower` | 600ms | Complex morphing, multi-step reveals |

### 25.2. Easing Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--easing-default` | `cubic-bezier(0.4, 0, 0.2, 1)` | Most transitions (standard ease-out) |
| `--easing-in` | `cubic-bezier(0.4, 0, 1, 1)` | Elements leaving the viewport (collapse, dismiss) |
| `--easing-out` | `cubic-bezier(0, 0, 0.2, 1)` | Elements entering the viewport (expand, appear) |
| `--easing-spring` | `cubic-bezier(0.175, 0.885, 0.32, 1.275)` | Playful overshoot (bouncing badge, spring toggle) |
| `--easing-linear` | `linear` | Progress bars, continuous rotation, loading spinners |

### 25.3. Usage Rules

- Every CSS `transition` property must reference `--duration-*` and `--easing-*` tokens, not hardcoded values
- Every JavaScript animation (Framer Motion, React Spring, GSAP) must use values derived from these tokens, not arbitrary numbers
- The `tokens/` layer must export these values as JavaScript constants for use in JS animation libraries:

```typescript
// tokens/animations.ts
export const duration = {
  instant: 100,
  fast: 150,
  normal: 250,
  slow: 400,
  slower: 600,
} as const

export const easing = {
  default: [0.4, 0, 0.2, 1] as const,
  in: [0.4, 0, 1, 1] as const,
  out: [0, 0, 0.2, 1] as const,
  spring: [0.175, 0.885, 0.32, 1.275] as const,
} as const
```

This dual registration (CSS custom properties for CSS transitions, JS constants for JS animations) is the recommended pattern. It satisfies the single source of truth principle: the canonical values live in `tokens/animations.ts`, and the CSS custom properties in `:root` are derived from the same source.

### 25.4. Profile-Specific Rules

- A Profile may adjust duration values (e.g., 2x slower for accessibility-focused products, 2x faster for power-user tools)
- A Profile must document any deviation from the default values
- Interactive/Canvas archetype components must use these tokens at level [C]; other components at level [W]

---

## 26. [PROFILE P13] Breakpoint Tokens

Projects that implement responsive layouts must define breakpoint tokens to ensure viewport boundary consistency across the codebase. Hardcoded pixel values in `@media` queries or JavaScript `matchMedia` calls are prohibited at level [W].

### 26.1. Breakpoint Definitions

| Token | Pixels | Target |
|-------|--------|--------|
| `--bp-xs` | 480px | Mobile (portrait) |
| `--bp-sm` | 640px | Mobile (landscape) / small tablet |
| `--bp-md` | 768px | Tablet |
| `--bp-lg` | 1024px | Small desktop / large tablet |
| `--bp-xl` | 1280px | Desktop |
| `--bp-2xl` | 1536px | Large desktop |

### 26.2. Usage Rules

**CSS media queries:** CSS custom properties cannot be used directly in `@media` query conditions (this is a CSS specification limitation). Instead, breakpoints are defined as JavaScript constants and used via one of these approaches:

```typescript
// tokens/breakpoints.ts
export const breakpoints = {
  xs: 480,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const
```

**Approach 1 -- Utility-first framework (Pattern A):** Register breakpoints in the framework configuration. Tailwind and UnoCSS use these values in `screens`/`breakpoints` config, enabling responsive prefixes (`sm:`, `md:`, `lg:`) that match the design system breakpoints.

```css
/* tailwind.config.ts or uno.config.ts */
export default {
  theme: {
    screens: {
      xs: '480px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    }
  }
}
```

**Approach 2 -- CSS preprocessor (Pattern B/C):** Use SASS/SCSS variables or PostCSS custom media to keep breakpoint values in sync:

```scss
// _breakpoints.scss
$bp-xs: 480px;
$bp-sm: 640px;
$bp-md: 768px;
$bp-lg: 1024px;
$bp-xl: 1280px;
$bp-2xl: 1536px;

@mixin md-up {
  @media (min-width: $bp-md) { @content; }
}
```

**Approach 3 -- JavaScript (React hooks):** Use the breakpoint constants with `matchMedia` or a responsive hook:

```typescript
import { breakpoints } from '@/tokens/breakpoints'

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${breakpoints.lg}px)`)
    setIsDesktop(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])
  return isDesktop
}
```

### 26.3. Profile-Specific Rules

- A Profile may add or remove breakpoints to match its target devices
- A Profile must document which breakpoints it uses and which responsive strategy (mobile-first or desktop-first) it follows
- The default approach is mobile-first (`min-width` queries)

---

## 26A. Known Issues and Proposed Solutions

This section documents discovered inconsistencies, missing content, and proposed corrections. Each issue has an ID, status, and proposed action. Issues resolved in the current version are marked `[RESOLVED]`; outstanding issues are marked `[OPEN]`.

### DES-001 `[RESOLVED in v3.0.1]` — Stale version references to STD-DOC-003 and STD-DOC-002

**Problem:** Prior to v3.0.1, the header `Related:` line and §8 referenced "No-Unicode Policy v2.1" (STD-DOC-003), and §9 referenced "Markdown Standard v2.2" (STD-DOC-002). The actual versions at the time of audit were STD-DOC-003 v2.3.0 and STD-DOC-002 v2.3.0.

**Resolution:** Header `Related:` line updated to cite v2.3 for both standards. §8 updated to "No-Unicode Policy v2.3". §9 updated to "Markdown Standard v2.3".

### DES-002 `[RESOLVED in v3.0.1]` — Standard not registered in STD-META-001

**Problem:** STD-DESIGN-001 was not present in the ID registry (STD-META-001 §4). The `DESIGN` domain was not listed in §3 (Reserved Domains). A shipped, actively-maintained standard had no registered ID — citations in other standards (e.g., STD-FE-001 §11) referenced an ID that the registry did not recognize.

**Resolution:** STD-META-001 v1.2 added `DESIGN` to §3 and created §4.11 "Design System (DESIGN)" with the `STD-DESIGN-001` entry (v3.0.0 → v3.0.1, [C]+[W], ACTIVE). Cross-reference between STD-META-001 and STD-DESIGN-001 is now bidirectional.

### DES-003 `[OPEN]` — Cross-References section omits STD-META-001

**Problem:** §28 (Cross-References) lists STD-FE-001, STD-DOC-002, STD-DOC-003, and ZAI-ARCH-002, but does not list STD-META-001 — the registry that defines this standard's ID. This breaks the bidirectional link convention: STD-META-001 now references STD-DESIGN-001 (after DES-002), but STD-DESIGN-001 does not reference back.

**Proposed solution:** Add a row to §28: `STD-META-001 | Standard ID System: registers this standard's ID (STD-DESIGN-001) in §4.11`.

### DES-004 `[OPEN]` — `ZAI-ARCH-002` is a skill, not a standard

**Problem:** §28 Cross-References lists `ZAI-ARCH-002 | Anti-Monolith Skill`. The `ZAI-ARCH-` prefix follows the skill ID convention, not the `STD-` standard convention. The Cross-References section of a standard should reference other standards (with `STD-` IDs); skills are operational artifacts, not governance documents.

**Proposed solution:** Either (a) move the ZAI-ARCH-002 reference to a new "Related Skills" section separate from Cross-References, or (b) annotate the existing row with "(skill, not standard)" to make the distinction explicit. Option (b) is the lighter touch; option (a) is the cleaner separation. Decision deferred to project owner.

### DES-005 `[OPEN]` — Profile example uses project-specific tokens without flagging them as illustrative

**Problem:** §13 "Profile Requirements" and §14-24 show a concrete "Terminal Dashboard" Profile with specific tokens (`--terminal-accent`, `--neuro-brand`, `--star-color`, `--semantic-violet`). The header §13 header says "(EXAMPLE)" but the individual sections (§15-§24) do not repeat the disclaimer. A reader landing on §16 (Color Tokens) directly may mistake the specific token names for Core requirements.

**Proposed solution:** Add a one-line note at the top of each P1-P11 section: "This section shows the Terminal Dashboard example Profile. Values are illustrative; substitute your project's values." Alternatively, wrap the entire Profile example in a single `<details>` block so its illustrative nature is structurally obvious.

---

## 27. Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-06 | Initial version |
| 1.0.1 | 2026-06 | Font families restructured: roles with requirements separated from default implementation |
| 1.1.0 | 2026-06 | Removed all framework-specific bindings; Tailwind/Prism/Lucide/TerminalFrame/globals.css abstracted |
| 2.0.0 | 2026-06 | **Architectural split**: Core (universal rules, Sections 3-13) separated from Profile (product-specific values, Sections 14-24). Profile system introduced (Section 13). Terminal Dashboard as default Profile and editable template (PROFILE-TERMINAL-001). Profile creation process documented (Section 11.4). Agent context generation documented (Section 11.5). Concrete agent context example added (Section 24) |
| 2.1.0 | 2026-06 | **Universality polish**: removed all remaining framework bindings from normative Core text; added Profile Validation Checklist (Section 13.1); expanded card archetype treatment options (Section 7.1) to include glass/gradient/glow/elevated; added spacing and typography scale range context notes (Sections 3.2, 6.1) for immersive and editorial projects; replaced hardcoded section references with P-references (Section 11.4); added Profile-specific disclaimers to Component Token Map, Prohibited Patterns, ESLint Rule, and Card Rules sections; removed "Built with" footer (framework binding); added note about Profile versioning when stored separately; updated Section 2.3 diagram to remove project-specific labels; clarified that enforcement patterns are Profile-specific (Section 10.3); updated Profile header from "PROFILE: Terminal Dashboard" to "PROFILE: Terminal Dashboard (EXAMPLE)" |
| 2.2.0 | 2026-06 | **Practical adoption**: added Adoption Levels with three-phase enforcement (Section 10.4); added Token Integration Patterns with three patterns (Theme Extension, CSS Modules, Vanilla CSS) to eliminate inline style anti-pattern (Section 4.5); required auto-generation script for Agent Context P11 instead of manual writing (Section 11.5); split P7 Component Token Map into mandatory Level 1 (archetype mapping) and optional Level 2 (element mapping); added CSS Modules mapping example (Section 15.5); added neutral/surface token template note for non-terminal Profiles (Section 16.4); replaced all `style={{}}` examples with Pattern A theme extension classes; added Integration Pattern and Adoption Phase statements to Profile requirements and Validation Checklist; updated Prohibited Patterns table to show Pattern A replacements |
| 2.3.0 | 2026-06 | **Adoption polish**: added [W+] level in Phase 2 for spacing/typography CI visibility with persistent count reports, preventing debt shock at Phase 3 transition; made P11 auto-generation script optional in Phase 1-2 and mandatory only in Phase 3 (reduces barrier for small teams); clarified that Pattern B and Pattern C are equal alternatives to Pattern A when theme extension is unavailable (CRA without eject, locked build pipelines); replaced `bg-muted/50` Stat Card background with `--muted-alpha` CSS custom property using `color-mix()` to satisfy Core 4.4 compliance; increased P11 character limit from 2000 to 3500 and added compression via short-code mapping |
| 2.3.1 | 2026-06 | **Edge case polish**: added `color-mix()` browser compatibility note with cascade-based fallback pattern (Safari 15, legacy browsers); added [W+] CI integration example with GitHub Actions workflow showing persistent debt count in PR summaries; added P11 compressed variant example with short-code mapping table showing 30-40% size reduction |
| 3.0.0 | 2026-06 | **Stack and design universality**: added Pattern D CSS-in-JS (Styled Components, Emotion, vanilla-extract, Stitches) to Section 4.5; added Interactive/Canvas card archetype (Section 7.1 archetype table, Section 19.4); added P12 Animation Tokens (duration, easing, dual CSS+JS registration); added P13 Breakpoint Tokens (responsive layout consistency); made Pattern A framework-agnostic (utility-first CSS, not just Tailwind); added UnoCSS/Windi CSS configuration references; added Section 0 Scope with explicit Covers / Does NOT Cover / Boundary Rule |
| 3.0.1 | 2026-06 | **Cross-reference sync**: updated header `Related:` to cite No-Unicode Policy v2.3 (was v2.1) and Markdown Standard v2.3 (was v2.2). Updated §8 in-body reference to STD-DOC-003 v2.3. Updated §9 in-body reference to STD-DOC-002 v2.3. Added §26A Known Issues documenting DES-001 through DES-005. |

---

## 28. Cross-References

| Standard | Relationship |
|----------|-------------|
| **STD-FE-001** | **Frontend Development: governs how React components consume design tokens. Section 11 delegates to this standard for all visual token rules; this standard takes precedence on token names, values, and enforcement.** |
| STD-DOC-002 | Markdown Standard: formatting rules for documentation files |
| STD-DOC-003 | No-Unicode Policy: character rules, icon standard, sanitization |
| ZAI-ARCH-002 | Anti-Monolith Skill: auto-decomposition when thresholds exceeded; Section 2 limits and Section 9 exception ceilings in STD-FE-001 are aligned with this skill |

**Scope and applicability:** See Section 0 for the authoritative scope definition (Covers / Does NOT Cover / Boundary Rule). The design token layer applies to any DOM-based UI with CSS; React-specific constraints are governed by STD-FE-001; non-DOM environments require documented adaptation.

---

Built with: Next.js 16 + TypeScript + Tailwind CSS
