# Standard: README Template v2.2

> ID: STD-DOC-004
> Version: 2.2
> Level: **[W] Warning**
> Related: Markdown Standard (STD-DOC-002)
> verified_by: scripts/verify-standards.js#V10 (§1 Badges Required, §2 ≥3 badge examples, §3 checklist item)

This template defines the mandatory structure for all project README files.

## 1. Mandatory Sections

Every README.md must contain the following sections in order:

| # | Section | Required | Description |
|---|---------|----------|-------------|
| 1 | Title + Description | Yes | Project name and brief description |
| 2 | Badges | **Yes (public repos)** | Technology badges (SVG only). Mandatory for public repos. Minimum 3 badges: tech stack, license, build/status. |
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

> **Note on badges (§2):** For private/internal repos, badges remain optional. For public repos on GitHub, badges are mandatory because they are the primary at-a-glance signal for tech stack, license, and build status on the repository landing page. See §4 for the canonical badge set.

## 2. Template

````markdown
# Project Name

Brief description of the project (1-2 sentences).

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?style=flat-square&logo=tailwind-css)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)
![Build Status](https://img.shields.io/github/actions/workflow/status/<owner>/<repo>/ci.yml?branch=main&style=flat-square)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)

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

Note: The stack signature above is the default for Next.js projects. Replace with the actual project stack if using a different technology. Format: `Built with: <Framework> + <Language> + <Styling>` (see MARKDOWN_STANDARD v2.1, section 7).

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
- [ ] **At least 3 badges present (tech stack + license + build/status) - required for public repos**

## 4. Canonical Badge Set

The template in §2 includes six badges. Three are **mandatory** for public repos; the other three are **recommended**:

| # | Badge | Status | Purpose |
|---|-------|--------|---------|
| 1 | Next.js (tech) | **Mandatory** | Identifies the primary framework. Replace `Next.js-16` with the actual framework + version. |
| 2 | TypeScript (tech) | **Mandatory** | Identifies the primary language. Replace with the actual language badge if not TypeScript. |
| 3 | License: MIT | **Mandatory** | Declares the license. Replace `MIT` with the actual license (Apache-2.0, BSD-3-Clause, etc.). |
| 4 | Build Status | Recommended | Links CI workflow status. Only include if a CI workflow exists at `.github/workflows/ci.yml`. |
| 5 | PRs Welcome | Recommended | Signals that the project accepts contributions. |
| 6 | Tailwind CSS (tech) | Recommended | Optional secondary tech badge. Add or remove based on the actual stack. |

### Badge Style Convention

- Use `style=flat-square` for all badges (consistent visual rhythm on GitHub).
- Prefer badges with `logo=` parameter when the tech has a Simple Icons logo (https://simpleicons.org).
- Use `shields.io` URLs exclusively - they are SVG, fast, and CDN-cached.
- Avoid badge services that return raster PNGs.
- Avoid animated badges (they render inconsistently across markdown renderers).

## 5. Example Compliance

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

## 6. Cross-References

| Standard | Relationship |
|----------|-------------|
| STD-DOC-002 | Markdown Standard: formatting rules for README content |

---

Built with: Next.js 16 + TypeScript + Tailwind CSS
