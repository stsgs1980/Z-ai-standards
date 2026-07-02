/**
 * ============================================================================
 * lib/output.js — output formatters for verify-id-graph.js
 * ============================================================================
 *
 * Extracted from verify-id-graph.js v1.1.5 as part of O-018 modularization
 * (continuation). Contains emitHumanReadable() and emitJSON() — pure
 * functions that take a results object and produce string output.
 *
 * DEPENDENCIES
 *   - None (pure functions; caller passes results + version + opts).
 *
 * CONSUMERS
 *   - verify-id-graph.js main: calls emitJSON() always (for snapshot/compare
 *     modes), calls emitHumanReadable() when --json is NOT set.
 *
 * NOTE
 *   The functions accept a `results` parameter (the main verifier's state
 *   object) rather than importing it as a module-level singleton. This
 *   keeps them pure and testable.
 *
 * ============================================================================
 */

'use strict';

/**
 * emitHumanReadable(results, version, effectiveDate, opts) → string
 *
 * Produces the multi-line human-readable output:
 *   - Header (version, effective date, counts)
 *   - Per-prefix breakdown
 *   - Hard checks (G01-G15) with PASS/FAIL markers
 *   - Soft warnings (W01-W15) grouped by warning ID
 *   - Summary line with hard pass/fail counts
 */
function emitHumanReadable(results, version, effectiveDate, opts) {
  const out = [];
  out.push(`verify-id-graph.js v${version}`);
  out.push(`Effective date: ${effectiveDate}`);
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
    const mark = check.status === 'PASS' ? '[PASS]' : '[FAIL]';
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

/**
 * emitJSON(results, version, effectiveDate, opts) → string
 *
 * Produces the JSON output payload. Structure:
 *   - version, effective_date
 *   - summary { ids_extracted, related_edges, aligned_with_edges,
 *               hard_pass, hard_fail, warnings }
 *   - checks [{ id, status, description, details }, ...]
 *   - warnings [{ id, detail }, ...]
 *   - snapshot_meta (only when opts.snapshot or opts.updateSnapshot)
 *
 * The snapshot_meta block lets consumers detect script-version drift
 * without parsing the version field separately.
 */
function emitJSON(results, version, effectiveDate, opts) {
  const hardPass = Object.values(results.checks).filter(c => c.status === 'PASS').length;
  const hardFail = Object.values(results.checks).filter(c => c.status === 'FAIL').length;

  const payload = {
    version,
    effective_date: effectiveDate,
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
  };

  // When writing a snapshot, embed metadata so consumers can detect
  // script-version drift without parsing the version field separately.
  if (opts.snapshot || opts.updateSnapshot) {
    payload.snapshot_meta = {
      script_version: version,
      created_at: new Date().toISOString(),
      purpose: 'Baseline for verify-id-graph.js --compare. Do not hand-edit; regenerate with --update-snapshot.',
    };
  }
  return JSON.stringify(payload, null, 2);
}

module.exports = {
  emitHumanReadable,
  emitJSON,
};
