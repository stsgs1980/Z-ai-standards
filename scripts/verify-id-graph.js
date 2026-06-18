#!/usr/bin/env node
/**
 * ============================================================================
 * verify-id-graph.js — Cross-Repo ID Graph Validator v1.0.0
 * ============================================================================
 *
 * ID: TOOL-VERIFY-004
 * Implements: STD-META-001 v2.0 §10.2 (G01-G15) + STD-SKILL-001 v1.0 §10.2
 * Spec: _design/verify-id-graph-spec.md (APPROVED 2026-06-17)
 *
 * PURPOSE
 *   Validates that the ID graph across the 4 Z-ai repositories is consistent:
 *     - No duplicate IDs (G01)
 *     - All Related: references resolve (G02)
 *     - No cycles in Related: graph (G03, G11)
 *     - Layer-edge matrix respected (G04, G07-G10)
 *     - No deprecated IDs referenced post-window (G05)
 *     - Aligned_with: has corresponding Related: edge (G15)
 *     - Compatibility DAG valid for ZAI skills (G14)
 *     - Soft warnings (W01-W10) for non-critical issues
 *     - Soft warnings (W11-W15) for project health / consistency (v1.1.0)
 *
 * TWO-LEVEL STRICTNESS
 *   HARD (G01-G15)  → exit 1 if any fail
 *                    Always apply to STD/RULE/PROC/TOOL
 *                    Apply to ZAI skills only when `id` field present
 *   SOFT (W01-W10)  → reported, but does not fail
 *                    Unless --fail-on-warnings flag is set
 *   SOFT (W11-W15)  → project-health warnings (v1.1.0): size anomalies,
 *                    missing §XA Known Issues, broken cross-doc refs,
 *                    excessive OPEN issues, naming drift
 *
 * USAGE
 *   node scripts/verify-id-graph.js [options]
 *
 *   Options:
 *     --root=<path>        Override platform root
 *     --json               Output JSON instead of human-readable
 *     --ci                 Skip network-dependent checks
 *     --fail-on-warnings   Exit 1 if any warning is emitted
 *     --verbose            Print full graph
 *     --repo=<name>        Limit to one repo (debug)
 *     --help               Show this help
 *
 * EXIT CODES
 *   0 — all HARD checks pass (warnings may be present)
 *   1 — at least one HARD check failed (or warning with --fail-on-warnings)
 *   2 — configuration error (missing repos, parse error)
 *
 * ============================================================================
 */

'use strict';

const fs = require('fs');
const path = require('path');

// ============================================================================
// CONSTANTS
// ============================================================================

const VERSION = '1.1.0';
const EFFECTIVE_DATE = '2026-06-17';

// Allowed Related: edges per STD-META-001 §6.1
// Matrix: source prefix → set of allowed target prefixes
const LAYER_MATRIX = {
  STD:  new Set(['STD']),
  RULE: new Set(['STD', 'RULE', 'PROC', 'TOOL', 'ZAI']),
  PROC: new Set(['STD', 'RULE', 'PROC', 'TOOL']),
  TOOL: new Set(['STD', 'RULE', 'TOOL']),
  ZAI:  new Set(['STD', 'RULE', 'TOOL', 'ZAI']),
};

// Compatibility DAG per STD-SKILL-001 §7.2
// Source compatibility → allowed target compatibility
const COMPAT_MATRIX = {
  both:    new Set(['both']),
  sandbox: new Set(['both', 'sandbox']),
  ade:     new Set(['both', 'ade']),
};

// Forbidden layer edges (G07-G10)
const FORBIDDEN_EDGES = {
  G07: { from: 'STD',  to: ['RULE', 'PROC', 'TOOL', 'ZAI'] },
  G08: { from: 'PROC', to: ['ZAI'] },
  G09: { from: 'TOOL', to: ['PROC'] },
  G10: { from: 'TOOL', to: ['ZAI'] },
};

// Repo discovery globs per spec §3.2
const REPO_GLOBS = {
  standards: {
    patterns: ['standards/**/*.md', 'STANDARDS.md', '*.md'],
    prefix: 'STD',
  },
  guard: {
    patterns: ['AGENT_RULES.md', 'rules/**/*.md', 'instructions/**/*.md',
               'scripts/**/*.{sh,js,ts}', 'tools/**/*.{md,ts,js}'],
    prefixes: ['RULE', 'PROC', 'TOOL'],
  },
  skills: {
    patterns: ['skills/**/SKILL.md', 'skills/**/*.md'],
    prefixes: ['ZAI'],
  },
  platform: {
    patterns: ['*.md', 'docs/**/*.md', 'templates/**/*.md'],
    prefixes: [],  // platform declares no IDs; only scanned for references
  },
};

// ID format regex
const ID_REGEX = /^(STD|RULE|PROC|TOOL|ZAI)-([A-Z]+)-(\d{3})$/;

// ============================================================================
// RESULTS STATE
// ============================================================================

const results = {
  declarations: [],     // all ID declarations across all repos
  edges: {
    related: [],        // directed edges from Related:
    aligned_with: [],   // undirected edges from Aligned_with:
  },
  migrations: [],       // parsed MIGRATIONS.md entries
  checks: {
    G01: { status: 'PASS', description: 'No duplicate IDs across repos', details: [] },
    G02: { status: 'PASS', description: 'All Related: references resolve to existing IDs', details: [] },
    G03: { status: 'PASS', description: 'No cycles in Related: graph', details: [] },
    G04: { status: 'PASS', description: 'All Related: edges conform to layer matrix', details: [] },
    G05: { status: 'PASS', description: 'No deprecated ID referenced outside migration window', details: [] },
    G07: { status: 'PASS', description: 'No STD → (RULE/PROC/TOOL/ZAI) edges', details: [] },
    G08: { status: 'PASS', description: 'No PROC → ZAI edges', details: [] },
    G09: { status: 'PASS', description: 'No TOOL → PROC edges', details: [] },
    G10: { status: 'PASS', description: 'No TOOL → ZAI edges', details: [] },
    G11: { status: 'PASS', description: 'No self-references', details: [] },
    G12: { status: 'PASS', description: 'No typo-IDs (format violations)', details: [] },
    G14: { status: 'PASS', description: 'Compatibility DAG valid for ZAI skills', details: [] },
    G15: { status: 'PASS', description: 'Aligned_with: has corresponding Related: edge', details: [] },
  },
  warnings: [],          // W01-W10 entries
  stats: {
    ids_extracted: 0,
    related_edges: 0,
    aligned_with_edges: 0,
    repos_scanned: 0,
  },
};

function fail(checkId, detail) {
  results.checks[checkId].status = 'FAIL';
  results.checks[checkId].details.push(detail);
}

function warn(warningId, detail) {
  results.warnings.push({ id: warningId, detail });
}

// ============================================================================
// CLI PARSING
// ============================================================================

function parseArgs(argv) {
  const opts = {
    root: null,
    json: false,
    ci: false,
    failOnWarnings: false,
    verbose: false,
    repo: null,
    help: false,
  };
  for (const arg of argv.slice(2)) {
    if (arg === '--help' || arg === '-h') opts.help = true;
    else if (arg === '--json') opts.json = true;
    else if (arg === '--ci') opts.ci = true;
    else if (arg === '--fail-on-warnings') opts.failOnWarnings = true;
    else if (arg === '--verbose') opts.verbose = true;
    else if (arg.startsWith('--root=')) opts.root = arg.slice(7);
    else if (arg.startsWith('--repo=')) opts.repo = arg.slice(7);
    else {
      console.error(`Unknown argument: ${arg}`);
      process.exit(2);
    }
  }
  return opts;
}

function showHelp() {
  console.log(`
verify-id-graph.js v${VERSION} — Cross-Repo ID Graph Validator

Usage:
  node scripts/verify-id-graph.js [options]

Options:
  --root=<path>        Override platform root
  --json               Output JSON instead of human-readable
  --ci                 Skip network-dependent checks
  --fail-on-warnings   Exit 1 if any warning is emitted
  --verbose            Print full graph
  --repo=<name>        Limit to one repo (debug): standards|guard|skills|platform
  --help, -h           Show this help

Exit codes:
  0 — all HARD checks pass
  1 — at least one HARD check failed
  2 — configuration error
`);
}

// ============================================================================
// REPO DISCOVERY
// ============================================================================

function discoverPlatformRoot(opts) {
  // Priority 1: explicit --root
  if (opts.root) {
    if (!fs.existsSync(opts.root)) {
      console.error(`[verify-id-graph] --root path does not exist: ${opts.root}`);
      process.exit(2);
    }
    return opts.root;
  }

  // Priority 2: env var
  if (process.env.ZAI_PLATFORM_ROOT) {
    if (fs.existsSync(process.env.ZAI_PLATFORM_ROOT)) {
      return process.env.ZAI_PLATFORM_ROOT;
    }
  }

  // Priority 3: walk up from script __dirname looking for .gitmodules
  let dir = __dirname;
  for (let i = 0; i < 10; i++) {
    const gitmodules = path.join(dir, '.gitmodules');
    if (fs.existsSync(gitmodules)) {
      const content = fs.readFileSync(gitmodules, 'utf8');
      if (content.includes('Z-ai-standards') || content.includes('Z-ai-guard') || content.includes('Z-ai-skills')) {
        return dir;
      }
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }

  // Priority 4: assume <platform>/standards/scripts/verify-id-graph.js layout
  // Script is at __dirname, platform root is 3 levels up
  dir = __dirname;
  for (let i = 0; i < 5; i++) {
    // Check if this looks like a platform root (has _design/ or standards/ or skills/)
    if (fs.existsSync(path.join(dir, '_design')) ||
        fs.existsSync(path.join(dir, 'standards')) ||
        fs.existsSync(path.join(dir, 'skills'))) {
      return dir;
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }

  console.error(`[verify-id-graph] Could not discover platform root.`);
  console.error(`  Tried: __dirname walk-up, ZAI_PLATFORM_ROOT env, --root flag`);
  console.error(`  Set --root=<path> or ZAI_PLATFORM_ROOT env var explicitly.`);
  process.exit(2);
}

function findRepos(platformRoot, opts) {
  const repos = {};

  // Look for known repo directory names (case-insensitive)
  const candidates = {
    standards: ['Z-ai-standards', 'standards'],
    guard: ['Z-ai-guard', 'guard'],
    skills: ['Z-ai-skills', 'skills'],
    platform: ['Z-ai-platform', 'platform'],  // often == platformRoot
  };

  for (const [name, candidatesList] of Object.entries(candidates)) {
    if (opts.repo && opts.repo !== name) continue;
    for (const cand of candidatesList) {
      const p = path.join(platformRoot, cand);
      if (fs.existsSync(p) && fs.statSync(p).isDirectory()) {
        // Skip if it's just the sandbox runtime skills (not a Z-ai-skills repo)
        // The sandbox skills/ dir is at /home/z/my-project/skills/ and contains
        // only Z.ai official skills (no ZAI- IDs). We want to skip it for now.
        // Heuristic: a real Z-ai-skills repo has one of:
        //   - SKILLS.md (legacy marker)
        //   - skill-id-system/ at top level (older layout)
        //   - skills/ subdir containing INDEX.md or skill-id-system/ (4-repo split layout,
        //     where the submodule root contains skills/<name>/SKILL.md)
        if (name === 'skills' && cand === 'skills' &&
            !fs.existsSync(path.join(p, 'SKILLS.md')) &&
            !fs.existsSync(path.join(p, 'skill-id-system')) &&
            !fs.existsSync(path.join(p, 'skills', 'INDEX.md')) &&
            !fs.existsSync(path.join(p, 'skills', 'skill-id-system'))) {
          // This is the sandbox runtime skills dir, not the Z-ai-skills repo.
          // Skip unless explicitly requested.
          if (!opts.repo) continue;
        }
        repos[name] = p;
        break;
      }
    }
  }

  // Always include _design/ if it exists (for draft standards during release)
  // This allows verify-id-graph.js to validate drafts before 4-repo migration
  const designDir = path.join(platformRoot, '_design');
  if (fs.existsSync(designDir) && (!opts.repo || opts.repo === '_design')) {
    repos._design = designDir;
  }

  // Always include platform root itself for reference scanning
  if (!repos.platform) {
    repos.platform = platformRoot;
  }

  return repos;
}

// ============================================================================
// FILE SCANNING
// ============================================================================

function listFiles(rootDir, patterns) {
  const files = [];
  for (const pattern of patterns) {
    files.push(...globFiles(rootDir, pattern));
  }
  return [...new Set(files)];  // dedup
}

function globFiles(rootDir, pattern) {
  // Simple glob implementation: supports ** and basic patterns
  // For .md patterns, walk dir tree
  const results = [];

  function walk(dir, depth = 0) {
    if (depth > 15) return;  // safety limit
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch (e) {
      return;
    }

    for (const entry of entries) {
      // Skip common uninteresting dirs
      if (entry.name === 'node_modules' || entry.name === '.git' ||
          entry.name === '_research' || entry.name === 'upload' ||
          entry.name === 'tool-results' || entry.name === 'download') {
        continue;
      }

      const full = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        walk(full, depth + 1);
      } else if (entry.isFile()) {
        const rel = path.relative(rootDir, full);
        if (matchesPattern(rel, pattern)) {
          results.push(full);
        }
      }
    }
  }

  // Special case: pattern starts at root like 'STANDARDS.md' or '*.md'
  if (!pattern.includes('/')) {
    const direct = path.join(rootDir, pattern);
    if (fs.existsSync(direct)) {
      results.push(direct);
    }
    // Also walk for *.md patterns
    if (pattern === '*.md') {
      walk(rootDir);
    }
  } else {
    walk(rootDir);
  }

  return results;
}

function matchesPattern(relPath, pattern) {
  // Convert glob to regex: ** → .*, * → [^/]*, . → \.
  // Special case: **/  should match zero or more directories (not require at least one)
  let regex = pattern
    .replace(/\./g, '\\.')
    .replace(/\\\*\*\\\//g, '{{DOUBLESTAR_SLASH}}')  // **/  (after . escaping, * is still *)
    .replace(/\*\*\//g, '{{DOUBLESTAR_SLASH}}')        // **/  (raw, just in case)
    .replace(/\*\*/g, '{{DOUBLESTAR}}')
    .replace(/\*/g, '[^/]*')
    .replace(/{{DOUBLESTAR_SLASH}}/g, '(?:.*/)?')      // **/  →  zero or more dirs
    .replace(/{{DOUBLESTAR}}/g, '.*');
  regex = '^' + regex + '$';
  return new RegExp(regex).test(relPath);
}

// ============================================================================
// HEADER EXTRACTION (3 formats per spec §4.1)
// ============================================================================

function parseYAMLFrontmatter(content) {
  // Match --- at start, then YAML block, then ---
  const m = content.match(/^---\n([\s\S]*?)\n---\n/);
  if (!m) return null;
  const yaml = m[1];
  const result = {};
  const lines = yaml.split('\n');
  let currentListKey = null;
  for (const line of lines) {
    // List item under a previous key (e.g., "  - VALUE")
    const listItem = line.match(/^\s+-\s+(.*)$/);
    if (listItem && currentListKey) {
      if (!Array.isArray(result[currentListKey])) {
        result[currentListKey] = [];
      }
      let v = listItem[1].trim();
      // Strip quotes
      if ((v.startsWith('"') && v.endsWith('"')) ||
          (v.startsWith("'") && v.endsWith("'"))) {
        v = v.slice(1, -1);
      }
      result[currentListKey].push(v);
      continue;
    }
    const kv = line.match(/^(\w+):\s*(.*)$/);
    if (kv) {
      let val = kv[2].trim();
      // Strip quotes
      if ((val.startsWith('"') && val.endsWith('"')) ||
          (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      // Empty value means: either null or a list follows — start collecting list items
      if (val === '') {
        result[kv[1]] = [];
        currentListKey = kv[1];
      } else {
        result[kv[1]] = val;
        currentListKey = null;
      }
    } else if (!line.trim()) {
      // Blank line ends list collection
      currentListKey = null;
    }
  }
  // Convert empty arrays back to empty string for backward compat with `if (yaml.id)` checks
  // (id is always a scalar, so this only affects list keys)
  return result;
}

function parseBlockquoteHeader(content) {
  // Find lines starting with > at the top of the file (after H1)
  // Parse key: value pairs, supporting comma-separated lists
  const lines = content.split('\n');
  const header = {};
  let inBlockquote = false;
  for (let i = 0; i < Math.min(lines.length, 80); i++) {
    const line = lines[i];
    // Match: "> Key: value" or "> **Key:** value" patterns
    const m = line.match(/^>\s*\*?\*?([A-Za-z_][\w_]*)\*?\*?:\s*(.*)$/);
    if (m) {
      inBlockquote = true;
      let val = m[2].trim();
      // Strip trailing markdown formatting and parenthetical notes for list fields
      // e.g. "STD-FE-001, STD-DESIGN-001 (some note)" → "STD-FE-001, STD-DESIGN-001"
      const key = m[1];
      // Strip leading ** and trailing **
      val = val.replace(/^\*\*/, '').replace(/\*\*$/, '').trim();
      header[key] = val;
    } else if (inBlockquote && line.startsWith('>')) {
      // continuation line in blockquote, skip (or could be Status text)
    } else if (inBlockquote && !line.startsWith('>')) {
      // End of blockquote — but allow re-entry if more > lines appear
      // (some docs have prose between blockquote sections)
    }
  }
  return header;
}

function parseHTMLComment(content) {
  // Find: <!-- ID: RULE-ENV-008 | ver:1.0 | Level: C | Related: STD-ENV-001,STD-ENV-002 | Aligned_with: -->
  const m = content.match(/<!--\s*ID:\s*([A-Z]+-[A-Z]+-\d{3})\s*\|([\s\S]*?)-->/);
  if (!m) return null;
  const id = m[1];
  const rest = m[2];
  const fields = { id };
  for (const part of rest.split('|')) {
    const kv = part.match(/^\s*(\w+):\s*(.*?)\s*$/);
    if (kv) {
      const key = kv[1].toLowerCase();
      const val = kv[2];
      if (key === 'ver') fields.version = val;
      else if (key === 'level') fields.level = val.replace(/^\[?\*?\*?\[?/, '').replace(/[\]\*]?$/, '').trim();
      else if (key === 'related') fields.related = val ? val.split(',').map(s => s.trim()).filter(Boolean) : [];
      else if (key === 'aligned_with') fields.aligned_with = val ? val.split(',').map(s => s.trim()).filter(Boolean) : [];
    }
  }
  return fields;
}

function extractDeclaration(filePath, repoName) {
  const content = fs.readFileSync(filePath, 'utf8');
  if (!content.trim()) return null;

  let decl = null;
  let format = null;

  // Try HTML comment first (rules)
  const htmlFields = parseHTMLComment(content);
  if (htmlFields && htmlFields.id) {
    decl = htmlFields;
    format = 'html-comment';
  }

  // Try YAML frontmatter (skills)
  if (!decl) {
    const yaml = parseYAMLFrontmatter(content);
    if (yaml && yaml.id) {
      // For ZAI skills with YAML frontmatter, also parse blockquote for Related:/Aligned_with:
      const bq = parseBlockquoteHeader(content);
      // Prefer YAML list (related:); fall back to blockquote Related:
      let yamlRelated = [];
      if (Array.isArray(yaml.related)) {
        yamlRelated = yaml.related
          .flatMap(v => (v.match(/\b(STD|RULE|PROC|TOOL|ZAI)-[A-Z]+-\d{3}\b/g) || []));
      } else if (yaml.related) {
        yamlRelated = yaml.related.match(/\b(STD|RULE|PROC|TOOL|ZAI)-[A-Z]+-\d{3}\b/g) || [];
      }
      let yamlAligned = [];
      if (Array.isArray(yaml.aligned_with)) {
        yamlAligned = yaml.aligned_with
          .flatMap(v => (v.match(/\b(STD|RULE|PROC|TOOL|ZAI)-[A-Z]+-\d{3}\b/g) || []));
      } else if (yaml.aligned_with) {
        yamlAligned = yaml.aligned_with.match(/\b(STD|RULE|PROC|TOOL|ZAI)-[A-Z]+-\d{3}\b/g) || [];
      }
      const bqRelated = bq.Related
        ? (bq.Related.match(/\b(STD|RULE|PROC|TOOL|ZAI)-[A-Z]+-\d{3}\b/g) || [])
        : [];
      const bqAligned = bq.Aligned_with
        ? (bq.Aligned_with.match(/\b(STD|RULE|PROC|TOOL|ZAI)-[A-Z]+-\d{3}\b/g) || [])
        : [];
      // Merge and dedupe (YAML takes precedence, blockquote fills gaps)
      const relatedIds = [...new Set([...yamlRelated, ...bqRelated])];
      const alignedIds = [...new Set([...yamlAligned, ...bqAligned])];

      decl = {
        id: yaml.id,
        version: yaml.version,
        related: relatedIds,
        aligned_with: alignedIds,
        compatibility: yaml.compatibility || null,
        trigger: yaml.trigger ? yaml.trigger.split(',').map(s => s.trim()) : null,
        author: yaml.author || null,
        level: yaml.level ? String(yaml.level).replace(/[\[\]\*]/g, '').trim() : null,
      };
      format = 'yaml';
      // Cross-check frontmatter id vs blockquote ID
      if (bq.ID && bq.ID !== decl.id) {
        decl._fmId = decl.id;
        decl._bqId = bq.ID;
      }
      if (bq.Version && bq.Version !== decl.version) {
        decl._fmVer = decl.version;
        decl._bqVer = bq.Version;
      }
    }
  }

  // Try blockquote (standards)
  if (!decl) {
    const bq = parseBlockquoteHeader(content);
    if (bq.ID) {
      // Parse Related: — extract only ID-shaped tokens (ignore prose)
      const relatedIds = bq.Related
        ? (bq.Related.match(/\b(STD|RULE|PROC|TOOL|ZAI)-[A-Z]+-\d{3}\b/g) || [])
        : [];
      const alignedIds = bq.Aligned_with
        ? (bq.Aligned_with.match(/\b(STD|RULE|PROC|TOOL|ZAI)-[A-Z]+-\d{3}\b/g) || [])
        : [];

      decl = {
        id: bq.ID,
        version: bq.Version || null,
        level: bq.Level ? bq.Level.replace(/[\[\]\*]/g, '').trim() : null,
        related: relatedIds,
        aligned_with: alignedIds,
        compatibility: null,
        trigger: null,
        author: null,
      };
      format = 'blockquote';
    }
  }

  if (!decl) return null;

  // Parse ID components
  const m = decl.id.match(ID_REGEX);
  if (!m) {
    // G12 candidate — typo-IDs handled in Phase 4
    return {
      id: decl.id,
      prefix: null,
      domain: null,
      number: null,
      malformed: true,
      file: filePath,
      repo: repoName,
      header_format: format,
      ...decl,
    };
  }

  return {
    id: decl.id,
    prefix: m[1],
    domain: m[2],
    number: parseInt(m[3], 10),
    version: decl.version,
    level: decl.level,
    related: decl.related || [],
    aligned_with: decl.aligned_with || [],
    compatibility: decl.compatibility || null,
    trigger: decl.trigger || null,
    author: decl.author || null,
    file: filePath,
    repo: repoName,
    header_format: format,
    malformed: false,
    _fmId: decl._fmId || null,
    _bqId: decl._bqId || null,
    _fmVer: decl._fmVer || null,
    _bqVer: decl._bqVer || null,
  };
}

// ============================================================================
// REFERENCE EXTRACTION (any mention of an ID in any file)
// ============================================================================

function extractReferences(content) {
  // Find all ID-shaped tokens in the content
  const refs = new Set();
  const regex = /\b(STD|RULE|PROC|TOOL|ZAI)-[A-Z]+-\d{3}\b/g;
  let m;
  while ((m = regex.exec(content)) !== null) {
    refs.add(m[0]);
  }
  return [...refs];
}

// ============================================================================
// MIGRATIONS PARSING
// ============================================================================

function parseMigrations(filePath) {
  if (!fs.existsSync(filePath)) return [];
  const content = fs.readFileSync(filePath, 'utf8');
  const migrations = [];
  // Find YAML blocks inside ```yaml ... ```
  const blocks = content.match(/```yaml\n([\s\S]*?)```/g) || [];
  for (const block of blocks) {
    const yaml = block.replace(/^```yaml\n/, '').replace(/\n```$/, '');
    const entry = {};
    for (const line of yaml.split('\n')) {
      const m = line.match(/^(\w+):\s*(.*)$/);
      if (m) {
        let val = m[2].trim();
        if (val === '|' || val === '>') {
          // Multiline value — skip for simplicity
          continue;
        }
        entry[m[1]] = val;
      }
    }
    if (entry.old_id && entry.action) {
      migrations.push(entry);
    }
  }
  return migrations;
}

// ============================================================================
// TARJAN'S SCC ALGORITHM (for cycle detection)
// ============================================================================

function tarjanSCC(nodes, edges) {
  // nodes: array of node IDs
  // edges: array of {source, target}
  // Returns: array of SCCs (each SCC is an array of node IDs)
  const adj = new Map();
  for (const n of nodes) adj.set(n, []);
  for (const e of edges) {
    if (adj.has(e.source)) {
      adj.get(e.source).push(e.target);
    }
  }

  let index = 0;
  const stack = [];
  const indices = new Map();
  const lowlinks = new Map();
  const onStack = new Map();
  const sccs = [];

  function strongconnect(v) {
    indices.set(v, index);
    lowlinks.set(v, index);
    index++;
    stack.push(v);
    onStack.set(v, true);

    for (const w of adj.get(v) || []) {
      if (!indices.has(w)) {
        strongconnect(w);
        lowlinks.set(v, Math.min(lowlinks.get(v), lowlinks.get(w)));
      } else if (onStack.get(w)) {
        lowlinks.set(v, Math.min(lowlinks.get(v), indices.get(w)));
      }
    }

    if (lowlinks.get(v) === indices.get(v)) {
      const scc = [];
      let w;
      do {
        w = stack.pop();
        onStack.set(w, false);
        scc.push(w);
      } while (w !== v);
      sccs.push(scc);
    }
  }

  for (const v of nodes) {
    if (!indices.has(v)) {
      strongconnect(v);
    }
  }

  return sccs;
}

// ============================================================================
// MAIN PHASES
// ============================================================================

function phase1_extractIDs(repos) {
  // Phase 1: scan all files in each repo, extract declarations
  for (const [repoName, repoPath] of Object.entries(repos)) {
    if (repoName === '_design') {
      // Special: scan _design/ for draft standards
      // List all .md files directly in _design/
      const designFiles = fs.readdirSync(repoPath)
        .filter(f => f.endsWith('.md'))
        .map(f => path.join(repoPath, f));
      for (const f of designFiles) {
        const decl = extractDeclaration(f, repoName);
        if (decl) results.declarations.push(decl);
      }
      continue;
    }

    const config = REPO_GLOBS[repoName];
    if (!config) continue;
    const files = listFiles(repoPath, config.patterns);
    for (const f of files) {
      const decl = extractDeclaration(f, repoName);
      if (decl) results.declarations.push(decl);
    }
  }
  results.stats.ids_extracted = results.declarations.length;
}

function phase2_buildCatalog() {
  // Phase 2: detect duplicate IDs (G01)
  const idMap = new Map();
  for (const decl of results.declarations) {
    if (decl.malformed) continue;
    if (!idMap.has(decl.id)) {
      idMap.set(decl.id, []);
    }
    idMap.get(decl.id).push(decl);
  }
  for (const [id, decls] of idMap) {
    if (decls.length > 1) {
      // Check if it's a duplicate (not just multiple references)
      const files = decls.map(d => `${d.repo}:${path.basename(d.file)}`);
      fail('G01', `Duplicate ID ${id} declared in: ${files.join(', ')}`);
    }
  }
  return idMap;
}

function phase3_buildEdges(idMap) {
  // Phase 3: build directed (Related:) and undirected (Aligned_with:) edges
  for (const decl of results.declarations) {
    if (decl.malformed) continue;

    // Related: edges (directed)
    for (const target of decl.related) {
      results.edges.related.push({
        source: decl.id,
        target,
        source_file: decl.file,
        source_repo: decl.repo,
        kind: `${decl.prefix}→${(target.match(/^[A-Z]+/) || ['?'])[0]}`,
      });
    }

    // Aligned_with: edges (undirected, stored as lex-ordered pairs)
    for (const target of decl.aligned_with) {
      const left = decl.id < target ? decl.id : target;
      const right = decl.id < target ? target : decl.id;
      // Check if edge already exists (declared by other side)
      const existing = results.edges.aligned_with.find(e =>
        e.left === left && e.right === right
      );
      if (existing) {
        existing.reciprocated = true;
      } else {
        results.edges.aligned_with.push({
          left,
          right,
          declared_by: decl.id,
          reciprocated: false,
          file: decl.file,
        });
      }
    }
  }
  results.stats.related_edges = results.edges.related.length;
  results.stats.aligned_with_edges = results.edges.aligned_with.length;
}

function phase4_validateReferences(idMap, migrations) {
  // Phase 4: G02, G05, G12, W01, W10
  for (const edge of results.edges.related) {
    const target = edge.target;

    // G12: format check
    if (!ID_REGEX.test(target)) {
      fail('G12', `${edge.source} → ${target}: target does not match ID format (typo?) in ${edge.source_file}`);
      continue;
    }

    // G02: existence check
    if (!idMap.has(target)) {
      // Check if it's a migrated ID
      const mig = migrations.find(m => m.old_id === target);
      if (mig) {
        // W01 or G05
        warn('W01', `${edge.source} references ${target} (deprecated, action=${mig.action}); migration window: until ${mig.window_close_version}`);
      } else {
        fail('G02', `${edge.source} → ${target}: target ID does not exist (in ${edge.source_file})`);
      }
    }
  }

  // W10: ZAI skill referenced by ID but missing its own `id` field
  // (Detected when an external reference points to a ZAI-* ID that has no declaration)
  // Already partially covered by G02 — but W10 is specifically for skills
  // For v1.0, we report W10 only if we can identify the missing-declaring skill
  // This requires skill-folder-name ↔ ID mapping which is out of scope for v1.0
}

function phase5_validateLayerEdges() {
  // Phase 5: G04, G07-G10
  for (const edge of results.edges.related) {
    const sourceM = edge.source.match(ID_REGEX);
    const targetM = edge.target.match(ID_REGEX);
    if (!sourceM || !targetM) continue;  // already flagged in Phase 4

    const sourcePrefix = sourceM[1];
    const targetPrefix = targetM[1];

    // Check allowed by matrix
    const allowed = LAYER_MATRIX[sourcePrefix];
    if (!allowed || !allowed.has(targetPrefix)) {
      fail('G04', `${edge.source} → ${edge.target}: layer edge ${sourcePrefix}→${targetPrefix} not allowed by matrix`);
    }

    // Check specific forbidden patterns
    for (const [gCode, rule] of Object.entries(FORBIDDEN_EDGES)) {
      if (sourcePrefix === rule.from && rule.to.includes(targetPrefix)) {
        fail(gCode, `${edge.source} → ${edge.target}: forbidden ${gCode} edge (${rule.from}→${targetPrefix})`);
      }
    }
  }
}

function phase6_detectCycles() {
  // Phase 6: G03, G11
  // Self-references (G11)
  for (const edge of results.edges.related) {
    if (edge.source === edge.target) {
      fail('G11', `Self-reference: ${edge.source} → ${edge.target} in ${edge.source_file}`);
    }
  }

  // Cycles (G03) via Tarjan SCC
  const nodes = [...new Set([
    ...results.edges.related.map(e => e.source),
    ...results.edges.related.map(e => e.target),
  ])];
  const sccs = tarjanSCC(nodes, results.edges.related);
  for (const scc of sccs) {
    if (scc.length > 1) {
      fail('G03', `Cycle detected: ${scc.join(' → ')} → ${scc[0]}`);
    }
  }
}

function phase7_alignedWithSymmetry(idMap) {
  // Phase 7: G15, W08
  for (const edge of results.edges.aligned_with) {
    // G15: must have corresponding Related: edge in either direction —
    // BUT only for SAME-LAYER pairs (e.g. STD ↔ STD, RULE ↔ RULE).
    // Cross-layer Aligned_with (e.g. STD ↔ ZAI) is a STANDALONE
    // relationship per STD-META-001 §6.2 — Related is forbidden by
    // G07 in one direction and optional in the other, so requiring it
    // would conflict with G07 and is semantically wrong: Aligned_with
    // IS the cross-layer relationship, not a hint to look for Related.
    const leftPrefix = (edge.left.match(/^[A-Z]+/) || ['?'])[0];
    const rightPrefix = (edge.right.match(/^[A-Z]+/) || ['?'])[0];

    if (leftPrefix === rightPrefix) {
      const hasRelated = results.edges.related.some(e =>
        (e.source === edge.left && e.target === edge.right) ||
        (e.source === edge.right && e.target === edge.left)
      );
      if (!hasRelated) {
        fail('G15', `Aligned_with: ${edge.left} ↔ ${edge.right} has no corresponding Related: edge (declared by ${edge.declared_by})`);
      }
    }

    // W08: reciprocation (applies to ALL Aligned_with edges, regardless of layer)
    if (!edge.reciprocated) {
      warn('W08', `${edge.declared_by} declares Aligned_with ${edge.right === edge.declared_by ? edge.left : edge.right}; not reciprocated (in ${edge.file})`);
    }
  }
}

function phase8_compatibilityDAG(idMap) {
  // Phase 8: G14, W07, W09
  // Get ZAI skills with compatibility field
  const zaiSkills = new Map();
  for (const decl of results.declarations) {
    if (decl.prefix === 'ZAI' && decl.compatibility) {
      // W09: compatibility declared but no id (this shouldn't happen — if decl exists, id exists)
      // W09 is more for skills without ID that have compatibility — handled at extract time
      zaiSkills.set(decl.id, decl.compatibility);
    }
  }

  // Check ZAI → ZAI edges
  for (const edge of results.edges.related) {
    const sourceM = edge.source.match(ID_REGEX);
    const targetM = edge.target.match(ID_REGEX);
    if (!sourceM || !targetM) continue;
    if (sourceM[1] !== 'ZAI' || targetM[1] !== 'ZAI') continue;

    const sourceCompat = zaiSkills.get(edge.source);
    const targetCompat = zaiSkills.get(edge.target);

    if (!sourceCompat || !targetCompat) {
      // One of them doesn't have compatibility — skip (warning W09 covered elsewhere)
      continue;
    }

    const allowed = COMPAT_MATRIX[sourceCompat];
    if (!allowed || !allowed.has(targetCompat)) {
      fail('G14', `${edge.source} (compat=${sourceCompat}) → ${edge.target} (compat=${targetCompat}): incompatible (allowed targets for ${sourceCompat}: ${[...allowed].join(', ')})`);
    }
  }

  // W07: frontmatter/blockquote disagreement (for ZAI skills with id)
  for (const decl of results.declarations) {
    if (decl.prefix !== 'ZAI') continue;
    if (decl._fmId && decl._bqId && decl._fmId !== decl._bqId) {
      warn('W07', `${decl.id}: frontmatter id="${decl._fmId}" disagrees with blockquote ID="${decl._bqId}"`);
    }
    if (decl._fmVer && decl._bqVer && decl._fmVer !== decl._bqVer) {
      warn('W07', `${decl.id}: frontmatter version="${decl._fmVer}" disagrees with blockquote Version="${decl._bqVer}"`);
    }
  }
}

function phase9_orphanWarnings(idMap) {
  // Phase 9: W02-W06
  const referenced = new Set();
  for (const edge of results.edges.related) {
    referenced.add(edge.target);
  }
  const alignedTargets = new Set();
  for (const edge of results.edges.aligned_with) {
    alignedTargets.add(edge.left);
    alignedTargets.add(edge.right);
  }

  for (const decl of results.declarations) {
    if (decl.malformed) continue;

    if (decl.prefix === 'RULE' && decl.related.length === 0) {
      warn('W02', `${decl.id} (${path.basename(decl.file)}): RULE with empty Related: (orphan)`);
    }
    if (decl.prefix === 'STD' && !referenced.has(decl.id) && !alignedTargets.has(decl.id)) {
      warn('W03', `${decl.id}: STD not referenced by any RULE/ZAI (dead standard)`);
    }
    if (decl.prefix === 'ZAI' && decl.related.length === 0 && decl.aligned_with.length === 0) {
      // W04 only for ZAI WITH IDs (which is the case here since we have a decl)
      warn('W04', `${decl.id} (${path.basename(decl.file)}): ZAI skill with empty Related: and Aligned_with: (rogue skill with ID)`);
    }
    if (decl.prefix === 'PROC' && decl.related.length === 0) {
      warn('W05', `${decl.id}: PROC with empty Related: (orphan procedure)`);
    }
    if (decl.prefix === 'TOOL' && decl.related.length === 0) {
      warn('W06', `${decl.id}: TOOL with empty Related: (orphan tool)`);
    }
  }
}

// ============================================================================
// PHASE 10 — PROJECT HEALTH WARNINGS (W11-W15, v1.1.0)
// ============================================================================
// These catch growth/decay signals that G01-G15 do not cover:
//   W11 — Size anomaly (file > 1000 lines warn, > 1500 critical warn)
//   W12 — Missing §XA Known Issues section
//   W13 — Broken cross-doc file references (link to non-existent .md/.sh)
//   W14 — Excessive OPEN Known Issues (> 5 = debt accumulation signal)
//   W15 — Naming drift (file does not match <DOMAIN>-<NNN>-<name>.md)
//
// These are SOFT warnings — they do NOT fail CI. Use --fail-on-warnings to promote.
// ============================================================================

const VALID_DOMAINS = new Set([
  'META', 'ARCH', 'DOC', 'SKILL', 'ENV', 'GIT', 'DESIGN',
  'FE', 'A11Y', 'ERR', 'SEC', 'TEST', 'AGENT',
]);

function phase10_healthWarnings(repos) {
  if (!repos.standards) return;
  const standardsTreeRoot = repos.standards;

  // Collect all .md files under standards/ tree (covers standards/standards/*.md,
  // standards/docs/**/*.md, standards/templates/*.md)
  const mdFiles = [];
  function walk(dir, depth) {
    if (depth > 8) return;
    let entries;
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); }
    catch (e) { return; }
    for (const entry of entries) {
      if (entry.name === 'node_modules' || entry.name === '.git' ||
          entry.name === '_design' || entry.name === 'legacy') continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full, depth + 1);
      else if (entry.name.endsWith('.md')) mdFiles.push(full);
    }
  }
  walk(standardsTreeRoot, 0);

  for (const filePath of mdFiles) {
    const fileName = path.basename(filePath);
    let content;
    try { content = fs.readFileSync(filePath, 'utf8'); }
    catch (e) { continue; }
    const lineCount = content.split('\n').length;

    // W15: naming drift — applies only to standards/standards/ (normative files)
    // Skip docs/, templates/, README.md, INDEX.md (non-normative)
    const isNormative = filePath.includes(path.join('standards', 'standards') + path.sep);
    if (isNormative) {
      const nameMatch = fileName.match(/^([A-Z0-9]+)-(\d{3})-(.+)\.md$/);
      if (!nameMatch) {
        if (fileName !== 'README.md' && fileName !== 'INDEX.md') {
          warn('W15', `${fileName}: does not match <DOMAIN>-<NNN>-<name>.md naming convention`);
        }
      } else {
        const domain = nameMatch[1];
        if (!VALID_DOMAINS.has(domain)) {
          warn('W15', `${fileName}: unknown domain "${domain}" (valid: ${[...VALID_DOMAINS].join(', ')})`);
        }
      }
    }

    // W11: size anomaly (applies to all .md files)
    if (lineCount > 1500) {
      warn('W11', `${fileName}: ${lineCount} lines (CRITICAL — exceeds 1500-line cap, split required)`);
    } else if (lineCount > 1000) {
      warn('W11', `${fileName}: ${lineCount} lines (exceeds 1000-line soft cap, consider splitting)`);
    }

    // W12: missing §XA Known Issues section (applies only to normative standards)
    if (isNormative) {
      // Pattern matches: ## 10A. Known Issues, ## 11A. Known Issues, ## XA. Known Issues
      const hasKnownIssues = /^\s*##\s+\d*[A-Z]\.?\s*Known\s+Issues/im.test(content);
      if (!hasKnownIssues) {
        warn('W12', `${fileName}: no §XA Known Issues section (convention per ENV-002 v1.2 §10A)`);
      }
    }

    // W14: excessive OPEN Known Issues
    const openMatches = content.match(/\[OPEN\]/g);
    if (openMatches && openMatches.length > 5) {
      warn('W14', `${fileName}: ${openMatches.length} OPEN Known Issues (exceeds 5-issue soft cap — debt accumulation signal)`);
    }

    // W13: broken cross-doc file references
    // Matches `path/to/file.md` or `path/to/file.sh` in inline code.
    // Skips: URLs, absolute paths, .ts/.js/.json imports, version-history fragments.
    const refPattern = /`([a-zA-Z0-9_\-\/]+\.(md|sh))`/g;
    let m;
    const seen = new Set(); // dedupe within one file
    while ((m = refPattern.exec(content)) !== null) {
      const refPath = m[1];
      if (seen.has(refPath)) continue;
      seen.add(refPath);
      // Skip URLs and absolute paths
      if (refPath.startsWith('http://') || refPath.startsWith('https://')) continue;
      if (refPath.startsWith('/home/') || refPath.startsWith('/tmp/') ||
          refPath.startsWith('/usr/') || refPath.startsWith('/etc/')) continue;
      // Resolve against multiple candidate roots
      const candidates = [
        path.join(standardsTreeRoot, refPath),                       // from repo root (e.g. standards/docs/sandbox/x.md)
        path.join(standardsTreeRoot, 'standards', refPath),          // from standards/ subdir
        path.join(standardsTreeRoot, 'docs', refPath),               // from docs/
        path.join(standardsTreeRoot, 'scripts', refPath),            // from scripts/
        path.join(standardsTreeRoot, 'templates', refPath),          // from templates/
        path.join(path.dirname(filePath), refPath),                  // from current file's dir
      ];
      const exists = candidates.some(p => {
        try { return fs.existsSync(p); } catch (e) { return false; }
      });
      if (!exists) {
        warn('W13', `${fileName}: references \"${refPath}\" which does not exist in standards/ tree`);
      }
    }
  }
}

// ============================================================================
// OUTPUT FORMATTING
// ============================================================================

function emitHumanReadable(opts) {
  const out = [];
  out.push(`verify-id-graph.js v${VERSION}`);
  out.push(`Effective date: ${EFFECTIVE_DATE}`);
  out.push(`Repos scanned: ${results.stats.repos_scanned}`);
  out.push(`IDs extracted: ${results.stats.ids_extracted}`);
  out.push(`Related: edges: ${results.stats.related_edges}`);
  out.push(`Aligned_with: edges: ${results.stats.aligned_with_edges}`);
  out.push('');

  // Per-prefix counts
  const counts = {};
  for (const decl of results.declarations) {
    counts[decl.prefix] = (counts[decl.prefix] || 0) + 1;
  }
  out.push(`By prefix: ${Object.entries(counts).map(([k, v]) => `${k}=${v}`).join(', ')}`);
  out.push('');

  out.push('--- Hard Checks (G01-G15) ---');
  for (const [id, check] of Object.entries(results.checks)) {
    const mark = check.status === 'PASS' ? '✓' : '✗';
    out.push(`  ${mark} ${id}: ${check.description}`);
    if (check.status === 'FAIL') {
      for (const d of check.details.slice(0, 5)) {
        out.push(`      ${d}`);
      }
      if (check.details.length > 5) {
        out.push(`      ... and ${check.details.length - 5} more`);
      }
    }
  }
  out.push('');

  out.push('--- Soft Warnings (W01-W15) ---');
  if (results.warnings.length === 0) {
    out.push('  (none)');
  } else {
    const byId = {};
    for (const w of results.warnings) {
      if (!byId[w.id]) byId[w.id] = [];
      byId[w.id].push(w);
    }
    for (const [id, ws] of Object.entries(byId)) {
      out.push(`  ${id}: ${ws.length} warning(s)`);
      for (const w of ws.slice(0, 3)) {
        out.push(`      ${w.detail}`);
      }
      if (ws.length > 3) {
        out.push(`      ... and ${ws.length - 3} more`);
      }
    }
  }
  out.push('');

  // Summary
  const hardPass = Object.values(results.checks).filter(c => c.status === 'PASS').length;
  const hardFail = Object.values(results.checks).filter(c => c.status === 'FAIL').length;
  out.push(`Result: ${hardFail === 0 ? 'PASS' : 'FAIL'} (${hardPass}/${hardPass + hardFail} hard checks, ${results.warnings.length} warnings)`);

  return out.join('\n');
}

function emitJSON(opts) {
  const hardPass = Object.values(results.checks).filter(c => c.status === 'PASS').length;
  const hardFail = Object.values(results.checks).filter(c => c.status === 'FAIL').length;

  return JSON.stringify({
    version: VERSION,
    effective_date: EFFECTIVE_DATE,
    summary: {
      ids_extracted: results.stats.ids_extracted,
      related_edges: results.stats.related_edges,
      aligned_with_edges: results.stats.aligned_with_edges,
      hard_pass: hardPass,
      hard_fail: hardFail,
      warnings: results.warnings.length,
    },
    checks: Object.entries(results.checks).map(([id, c]) => ({
      id,
      status: c.status,
      description: c.description,
      details: c.details,
    })),
    warnings: results.warnings,
  }, null, 2);
}

// ============================================================================
// MAIN
// ============================================================================

function main() {
  const opts = parseArgs(process.argv);
  if (opts.help) {
    showHelp();
    process.exit(0);
  }

  const platformRoot = discoverPlatformRoot(opts);
  const repos = findRepos(platformRoot, opts);
  results.stats.repos_scanned = Object.keys(repos).length;

  if (process.env.DEBUG_ID_GRAPH) {
    console.error('[debug] platformRoot:', platformRoot);
    console.error('[debug] repos:', JSON.stringify(repos, null, 2));
  }

  if (results.stats.repos_scanned === 0) {
    console.error('[verify-id-graph] No repos discovered. Use --root=<path>');
    process.exit(2);
  }

  // Parse migrations from each repo
  for (const [repoName, repoPath] of Object.entries(repos)) {
    const migPath = path.join(repoPath, 'MIGRATIONS.md');
    if (fs.existsSync(migPath)) {
      results.migrations.push(...parseMigrations(migPath));
    }
  }
  // Also check _design/MIGRATIONS.md
  const designMig = path.join(platformRoot, '_design', 'MIGRATIONS.md');
  if (fs.existsSync(designMig)) {
    results.migrations.push(...parseMigrations(designMig));
  }

  // Run all phases
  phase1_extractIDs(repos);

  if (process.env.DEBUG_ID_GRAPH) {
    console.error('[debug] declarations extracted:', results.declarations.length);
    for (const d of results.declarations) {
      console.error(`  ${d.id} (${d.prefix}) from ${path.basename(d.file)}`);
    }
  }

  const idMap = phase2_buildCatalog();
  phase3_buildEdges(idMap);
  phase4_validateReferences(idMap, results.migrations);
  phase5_validateLayerEdges();
  phase6_detectCycles();
  phase7_alignedWithSymmetry(idMap);
  phase8_compatibilityDAG(idMap);
  phase9_orphanWarnings(idMap);
  phase10_healthWarnings(repos);

  // Emit output
  if (opts.json) {
    console.log(emitJSON(opts));
  } else {
    console.log(emitHumanReadable(opts));
  }

  // Exit code
  const hardFail = Object.values(results.checks).filter(c => c.status === 'FAIL').length;
  if (hardFail > 0) {
    process.exit(1);
  }
  if (opts.failOnWarnings && results.warnings.length > 0) {
    process.exit(1);
  }
  process.exit(0);
}

main();
