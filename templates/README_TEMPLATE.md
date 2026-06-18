# Standard: README Template v2.2

> ID: STD-DOC-004
> Version: 2.2
> Level: **[W] Warning**
> Related: Markdown Standard (STD-DOC-002)

This template defines the mandatory structure for all project README files.

## 1. Mandatory Sections

Every README.md must contain the following sections in order:

| # | Section | Required | Description |
|---|---------|----------|-------------|
| 1 | Title + Description | Yes | Project name and brief description |
| 2 | Badges | Optional | Technology badges (SVG only) |
| 3 | Features | Yes | Key capabilities |
| 4 | Tech Stack | Yes | Technologies used |
| 5 | Getting Started | Yes | Installation and run instructions |
| 6 | Configuration | Optional | Environment variables, settings |
| 7 | Project Structure | Optional | Directory layout |
| 8 | API Reference | Optional | Endpoints, methods |
| 9 | Scripts | Optional | NPM/Bun commands |
| 10 | Development Rules | Optional | Code style, technology constraints |
| 11 | Agent Rules | Conditional | Required if `AGENT_RULES.md` exists in project root |
| 12 | Stack Signature | Yes | Mandatory footer |

## 2. Template

````markdown
# Project Name

Brief description of the project (1-2 sentences).

![Badge](https://img.shields.io/badge/Tech-Version-color?style=flat-square)

## Features

- Feature 1 - description
- Feature 2 - description
- Feature 3 - description

## Tech Stack

- **Framework** - description
- **Language** - description
- **Database** - description
- **Other** - description

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- Other requirements

### Installation

```bash
# Install dependencies
bun install

# Configure environment
cp .env.example .env

# Setup database
bun run db:push

# Run development server
npx next dev -p 3000
```

## Project Structure

- `src/app/` - Application routes
- `src/components/` - UI components
- `src/lib/` - Utilities
- `prisma/` - Database schema

## Scripts

| Script | Description |
|--------|-------------|
| `npx next dev -p 3000` | Development server |
| `bun run build` | Production build |
| `bun run lint` | Lint check |

## Configuration

### Environment Variables

See `.env.example`:

```env
DATABASE_URL="file:./db/dev.db"
```

## Development Rules

### Required Technologies
- Technology 1
- Technology 2

### Code Style
- Rule 1
- Rule 2

## Agent Rules (Mandatory)

Any AI agent working on this project MUST read and follow `AGENT_RULES.md`
before performing any operations.

See `AGENT_RULES.md` for full details.
See `instructions/` for complete rule descriptions.
See `skills/` for automated tooling.

---
Built with: Next.js 16 + TypeScript + Tailwind CSS
````

Note: The stack signature above is the default for Next.js projects. Replace with the actual project stack if using a different technology. Format: `Built with: <Framework> + <Language> + <Styling>` (see MARKDOWN_STANDARD v2.3, section 8).

## 3. Checklist

Before submitting, verify:

- [ ] No emoji in title or sections
- [ ] No ASCII arrows as list markers (use `-` for unordered lists)
- [ ] No em dash in headings or code (use hyphen `-`)
- [ ] No pseudo-graphics for tree structures
- [ ] Stack Signature present at end
- [ ] All mandatory sections included
- [ ] Agent Rules section present if AGENT_RULES.md exists
- [ ] Code blocks have language specified
- [ ] Badges added (optional but recommended for public repos)

## 4. Example Compliance

### Correct

```text
## Features
- Fast build - uses Turbopack
- Type safe — full TypeScript
```

Note: hyphen `-` is used as a separator in technical descriptions. Em dash `—` is allowed in plain text within list items per MARKDOWN_STANDARD, but prohibited in headings and code blocks.

### Incorrect

```text
## Features
- Fast build -> uses Turbopack
## Features — Core
```

Note: `->` as a separator in list items violates the list marker rule. Em dash `—` in a heading is prohibited.

---

## 5. Cross-References

| Standard | Relationship |
|----------|-------------|
| STD-DOC-002 | Markdown Standard: formatting rules for README content |
| STD-DOC-003 | No-Unicode Policy: character rules for README content (no emoji, no Unicode icons) |
| STD-ARCH-001 | Implementation Order: README assembly is Step 6 of the implementation sequence |

---

## 5A. Known Issues and Proposed Solutions

This section documents discovered inconsistencies, missing content, and proposed corrections. Each issue has an ID, status, and proposed action. Issues resolved in the current version are marked `[RESOLVED]`; outstanding issues are marked `[OPEN]`.

### RMT-001 `[RESOLVED in v2.2]` — Stale reference to MARKDOWN_STANDARD v2.1

**Problem:** Prior to v2.2, the note under §2 (Template) cited "MARKDOWN_STANDARD v2.1, section 7" for the Stack Signature format. The actual version of STD-DOC-002 is v2.3, and the Stack Signature is defined in §8 (not §7) of that version. The citation was both stale (wrong version) and misnumbered (wrong section).

**Resolution:** Updated the note to cite "MARKDOWN_STANDARD v2.3, section 8". This matches the actual current version and the correct section number for Stack Signature in STD-DOC-002.

### RMT-002 `[OPEN]` — `AGENT_RULES.md` is referenced but never defined

**Problem:** §1 (Mandatory Sections) row 11 says "Agent Rules | Conditional | Required if `AGENT_RULES.md` exists in project root". §2 (Template) includes an "Agent Rules (Mandatory)" section that says "Any AI agent working on this project MUST read and follow `AGENT_RULES.md`". §3 (Checklist) includes "Agent Rules section present if AGENT_RULES.md exists". However, no standard in the project defines:
- What `AGENT_RULES.md` is
- What its mandatory structure is
- Who creates it
- What its relationship is to the standards set (Group B) and the worklog system (Group A per STD-ARCH-001)

The file is referenced as if it were a well-known artifact, but it has no governing standard.

**Proposed solution:** One of:
1. Create a new standard `STD-DOC-006` (Agent Rules Standard) that defines `AGENT_RULES.md` — its structure, mandatory sections, relationship to AGENT_RULES template, and creation process. This is the cleanest option but adds a new standard.
2. Define `AGENT_RULES.md` as a section within an existing standard. The most natural home is `STD-AGENT-001` (Subagent Standard) or `STD-ENV-002` (Z.ai Integration) — both already discuss agent rules in passing.
3. Remove the `AGENT_RULES.md` reference from this template and replace with an inline "Agent Rules" section in the README itself (no external file). This is the lightest option.

Recommended: option 2, with `STD-ENV-002` as the host (since AGENT_RULES.md was originally extracted from there per its Version History v1.0 entry).

### RMT-003 `[OPEN]` — §1 table numbering vs §2 template structure mismatch

**Problem:** §1 (Mandatory Sections) lists 12 sections in numbered order. §2 (Template) does not preserve this numbering — it omits numbers and presents sections in a slightly different order. Specifically:
- §1 lists Stack Signature as #12 (last).
- §2 template places Stack Signature at the end of the file (correct), but does not number it.
- §1 lists Agent Rules as #11.
- §2 template places Agent Rules before the Stack Signature (correct relative order), but does not number it.
- §2 template includes "Project Structure" and "Scripts" sections that §1 also lists, but the template's order does not strictly follow §1's numeric order (e.g., Configuration appears after Scripts in the template, but is #6 in §1 before Scripts at #9).

This makes it hard to verify that the template satisfies the §1 requirements by direct comparison.

**Proposed solution:** Add the section number from §1 as a comment at the start of each section in the §2 template, e.g., `<!-- Section 6: Configuration -->`. This preserves readability while making the §1 ↔ §2 mapping verifiable. Alternatively, restructure §2 to follow §1's order strictly.

### RMT-004 `[OPEN]` — Stack Signature format rule contradicts STD-DOC-002

**Problem:** §2 note says "Format: `Built with: <Framework> + <Language> + <Styling>`". STD-DOC-002 §8 says "Format: `Built with: <project technologies>`" and adds "Content: letters, digits, `+` and `:` signs". The README_TEMPLATE format string `<Framework> + <Language> + <Styling>` implies exactly three components separated by `+`. STD-DOC-002 allows any number of components (e.g., "Next.js 16 + TypeScript + Tailwind CSS + Prisma"). The README_TEMPLATE's three-component form is more restrictive than STD-DOC-002.

**Proposed solution:** Update the §2 note to: "Format: `Built with: <project technologies>` (see MARKDOWN_STANDARD v2.3, section 8). Components are separated by `+`; the number of components is project-specific." This aligns with STD-DOC-002 and removes the implicit three-component restriction.

---

## 6. Version History

| Version | Date | Changes |
|--------|------|---------|
| 2.0 | 2026-05 | Restructured: mandatory sections table, template, checklist |
| 2.1 | 2026-05 | Added Stack Signature format note; added Agent Rules section per AGENT_RULES.md convention |
| 2.2 | 2026-06 | Updated §2 note to cite MARKDOWN_STANDARD v2.3 §8 (was v2.1 §7). Added §5A Known Issues documenting RMT-001 through RMT-004. Added explicit Cross-References table in §5. |

---

Built with: Next.js 16 + TypeScript + Tailwind CSS
