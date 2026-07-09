/**
 * ============================================================================
 * lib/graph-transform.cjs — JSON → DOT transform for graph-deps.sh
 * ============================================================================
 *
 * Extracted from graph-deps.sh (was inline heredoc, 244 lines).
 * Reads verify-id-graph.js --json output + re-parses source .md files
 * for Related:/Aligned_with: edges, then emits Graphviz DOT.
 *
 * Usage:
 *   node lib/graph-transform.cjs <json-path> <dot-path> <platform-dir>
 *
 * ============================================================================
 */
"use strict";

const fs = require("fs");
const path = require("path");

const jsonPath = process.argv[2];
const dotPath = process.argv[3];
const platformDir = process.argv[4];

if (!jsonPath || !dotPath || !platformDir) {
  console.error("Usage: node graph-transform.cjs <json> <dot> <platform-dir>");
  process.exit(2);
}

const data = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));

const ID_REGEX = /^(STD|RULE|PROC|TOOL|ZAI)-([A-Z]+)-(\d{3})$/;

function findFiles(dir, ext) {
  const out = [];
  function walk(d) {
    for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
      if (entry.name === "node_modules" || entry.name === ".git") continue;
      const p = path.join(d, entry.name);
      if (entry.isDirectory()) walk(p);
      else if (entry.name.endsWith(ext)) out.push(p);
    }
  }
  try {
    walk(dir);
  } catch (_) {}
  return out;
}

const files = [
  ...findFiles(path.join(platformDir, "standards", "standards"), ".md"),
  ...findFiles(path.join(platformDir, "guard", "rules"), ".md"),
  ...findFiles(path.join(platformDir, "guard", "instructions"), ".md"),
  ...findFiles(path.join(platformDir, "guard", "scripts"), ".sh"),
  ...findFiles(path.join(platformDir, "guard", "tools"), ".sh"),
  ...findFiles(path.join(platformDir, "skills"), ".md"),
];

const nodes = new Map();
const edges = [];

function layerOf(prefix) {
  if (prefix === "STD") return "L1";
  if (prefix === "RULE" || prefix === "PROC" || prefix === "TOOL") return "L2";
  if (prefix === "ZAI") return "L3";
  return "L?";
}

for (const file of files) {
  let raw;
  try {
    raw = fs.readFileSync(file, "utf-8");
  } catch (_) {
    continue;
  }

  const relPath = path.relative(platformDir, file);
  let id = null;
  let title = null;

  const fmMatch = raw.match(/^---\s*\n([\s\S]*?)\n---/);
  if (fmMatch) {
    const fm = fmMatch[1];
    const idLine = fm.match(/^id:\s*(\S+)/m);
    if (idLine) id = idLine[1];
    const titleLine = fm.match(/^title:\s*(.+)$/m);
    if (titleLine) title = titleLine[1].trim();
  }

  if (!id) {
    const bqIdMatch = raw.match(/^>\s*ID:\s*(\S+)/m);
    if (bqIdMatch) id = bqIdMatch[1];
  }

  if (!id) {
    const hMatch = raw.match(/^#\s+(STD|RULE|PROC|TOOL|ZAI)-([A-Z]+)-(\d{3})\b/);
    if (hMatch) id = hMatch[0].match(/(STD|RULE|PROC|TOOL|ZAI)-[A-Z]+-\d{3}/)[0];
  }

  if (!id || !ID_REGEX.test(id)) continue;

  const prefix = id.split("-")[0];
  const layer = layerOf(prefix);

  if (!title) {
    const h1 = raw.match(/^#\s+(.+)$/m);
    if (h1)
      title = h1[1]
        .replace(/^Standard:\s*/, "")
        .replace(/\s+v\d.*$/, "")
        .trim();
  }
  if (!title) title = id;

  nodes.set(id, { prefix, layer, title: title.slice(0, 60), file: relPath });

  if (fmMatch) {
    const fm = fmMatch[1];
    const relatedMatch = fm.match(/related:\s*\n((?:\s+-\s+\S+\n?)+)/);
    if (relatedMatch) {
      const targets = relatedMatch[1].matchAll(/-\s+(STD|RULE|PROC|TOOL|ZAI)-[A-Z]+-\d{3}/g);
      for (const t of targets) {
        edges.push({ from: id, to: t[0].replace(/^-\s+/, ""), kind: "related" });
      }
    }
  }

  const bqRelMatch = raw.match(/^>\s*Related:\s*(.+)$/m);
  if (bqRelMatch) {
    const list = bqRelMatch[1].trim();
    if (!/^\(none|^—/.test(list)) {
      const targets = list.matchAll(/(STD|RULE|PROC|TOOL|ZAI)-[A-Z]+-\d{3}/g);
      for (const t of targets) {
        if (t[0] !== id) edges.push({ from: id, to: t[0], kind: "related" });
      }
    }
  }

  const bqAlignMatch = raw.match(/^>\s*Aligned_with:\s*(.+)$/m);
  if (bqAlignMatch) {
    const list = bqAlignMatch[1].trim();
    const targets = list.matchAll(/(STD|RULE|PROC|TOOL|ZAI)-[A-Z]+-\d{3}/g);
    for (const t of targets) {
      if (t[0] !== id) edges.push({ from: id, to: t[0], kind: "aligned" });
    }
  }
}

// --- emit DOT ---
let dot = "";
dot += "digraph zai_id_graph {\n";
dot += "  graph [\n";
dot += "    rankdir=LR,\n";
dot += "    splines=true,\n";
dot += "    overlap=false,\n";
dot += '    fontname="Helvetica",\n';
dot +=
  '    label="Z-ai Platform ID Graph\\n' +
  nodes.size +
  " nodes / " +
  edges.length +
  " edges\\nGenerated " +
  new Date().toISOString().slice(0, 10) +
  '",\n';
dot += "    labelloc=t,\n";
dot += "    fontsize=14,\n";
dot += '    bgcolor="#fafafa"\n';
dot += "  ];\n";
dot +=
  '  node [fontname="Helvetica", fontsize=10, style="filled,rounded", shape=box, penwidth=1.2];\n';
dot += '  edge [fontname="Helvetica", fontsize=8, color="#666666"];\n';

const COLORS = {
  STD: { fill: "#dbeafe", stroke: "#1e40af", text: "#1e3a8a" },
  RULE: { fill: "#fef3c7", stroke: "#92400e", text: "#78350f" },
  PROC: { fill: "#fef3c7", stroke: "#92400e", text: "#78350f" },
  TOOL: { fill: "#fef3c7", stroke: "#92400e", text: "#78350f" },
  ZAI: { fill: "#dcfce7", stroke: "#166534", text: "#14532d" },
};

const byLayer = { L1: [], L2: [], L3: [] };
for (const [id, meta] of nodes) {
  if (byLayer[meta.layer]) byLayer[meta.layer].push(id);
}

dot += "  subgraph cluster_L1 {\n";
dot += '    label="L1 — Standards (STD-*)";\n';
dot += '    style="filled,rounded"; fillcolor="#eff6ff"; color="#bfdbfe"; fontsize=12;\n';
for (const id of byLayer.L1) {
  const m = nodes.get(id);
  const c = COLORS[m.prefix] || COLORS.STD;
  const safeTitle = m.title.replace(/"/g, "'").replace(/\\/, "/");
  dot += `    "${id}" [label="${id}\\n${safeTitle}", fillcolor="${c.fill}", color="${c.stroke}", fontcolor="${c.text}"];\n`;
}
dot += "  }\n";

dot += "  subgraph cluster_L2 {\n";
dot += '    label="L2 — Guard (RULE-*/PROC-*/TOOL-*)";\n';
dot += '    style="filled,rounded"; fillcolor="#fffbeb"; color="#fde68a"; fontsize=12;\n';
for (const id of byLayer.L2) {
  const m = nodes.get(id);
  const c = COLORS[m.prefix] || COLORS.RULE;
  const safeTitle = m.title.replace(/"/g, "'").replace(/\\/, "/");
  dot += `    "${id}" [label="${id}\\n${safeTitle}", fillcolor="${c.fill}", color="${c.stroke}", fontcolor="${c.text}"];\n`;
}
dot += "  }\n";

dot += "  subgraph cluster_L3 {\n";
dot += '    label="L3 — Skills (ZAI-*)";\n';
dot += '    style="filled,rounded"; fillcolor="#f0fdf4"; color="#bbf7d0"; fontsize=12;\n';
for (const id of byLayer.L3) {
  const m = nodes.get(id);
  const c = COLORS.ZAI;
  const safeTitle = m.title.replace(/"/g, "'").replace(/\\/, "/");
  dot += `    "${id}" [label="${id}\\n${safeTitle}", fillcolor="${c.fill}", color="${c.stroke}", fontcolor="${c.text}"];\n`;
}
dot += "  }\n";

const seen = new Set();
for (const e of edges) {
  if (!nodes.has(e.from) || !nodes.has(e.to)) continue;
  const key = `${e.from}->${e.to}:${e.kind}`;
  if (seen.has(key)) continue;
  seen.add(key);
  if (e.kind === "aligned") {
    dot += `  "${e.from}" -> "${e.to}" [style=dashed, color="#9333ea", penwidth=1.5, label="align"];\n`;
  } else {
    dot += `  "${e.from}" -> "${e.to}" [color="#666666", penwidth=1.0];\n`;
  }
}

const connected = new Set();
for (const e of edges) {
  if (nodes.has(e.from) && nodes.has(e.to)) {
    connected.add(e.from);
    connected.add(e.to);
  }
}

dot += "  subgraph cluster_orphans {\n";
dot += '    label="Orphan nodes (no edges)";\n';
dot += '    style="dashed,rounded"; color="#d4d4d4"; fontsize=10;\n';
dot += "    rank=sink;\n";
let orphanCount = 0;
for (const [id, meta] of nodes) {
  if (!connected.has(id)) {
    const c = COLORS[meta.prefix] || COLORS.STD;
    const safeTitle = meta.title.replace(/"/g, "'").replace(/\\/, "/");
    dot += `    "${id}_orphan" [label="${id}\\n${safeTitle}", fillcolor="${c.fill}", color="${c.stroke}", fontcolor="${c.text}"];\n`;
    orphanCount++;
  }
}
if (orphanCount === 0) {
  dot += '    "none" [label="(none)", shape=plaintext, fillcolor=none, color=none];\n';
}
dot += "  }\n";

dot += "}\n";

fs.writeFileSync(dotPath, dot);
console.log(
  "[transform] nodes=" + nodes.size + " edges=" + edges.length + " orphans=" + orphanCount,
);
console.log("[transform] DOT written to " + dotPath);
