"use strict";

const fs = require("fs");
const path = require("path");

const VALID_DOMAINS = new Set([
  "MEM",
  "FS",
  "SESSION",
  "DEV",
  "ARCH",
  "QA",
  "REQ",
  "META",
  "STS",
  "SDK",
  "DOC",
  "HEALTH",
  "CHART",
  "DEVTOOLS",
]);

const VALID_COMPAT = new Set(["both", "sandbox", "ade"]);

function parseFrontmatter(content) {
  const m = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (!m)
    return { parsed: false, data: {}, raw: "", error: "no frontmatter block (---...---) found" };

  const raw = m[1];
  const data = {};
  const lines = raw.split(/\r?\n/);
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim() || line.trim().startsWith("#")) {
      i++;
      continue;
    }

    const kvMatch = line.match(/^([a-zA-Z_][a-zA-Z0-9_-]*)\s*:\s*(.*)$/);
    if (!kvMatch) {
      i++;
      continue;
    }

    const key = kvMatch[1];
    let value = kvMatch[2].trim();

    if (value === ">" || value === ">-" || value === "|") {
      const indent = line.match(/^(\s*)/)[1].length;
      const foldedLines = [];
      i++;
      while (i < lines.length) {
        const nextLine = lines[i];
        if (nextLine.trim() === "") {
          i++;
          continue;
        }
        const nextIndent = nextLine.match(/^(\s*)/)[1].length;
        if (nextIndent <= indent) break;
        foldedLines.push(nextLine.trim());
        i++;
      }
      data[key] = foldedLines.join(" ");
      continue;
    }

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      data[key] = value.slice(1, -1);
      i++;
      continue;
    }

    if (/^-?\d+(\.\d+)?$/.test(value)) {
      data[key] = parseFloat(value);
      i++;
      continue;
    }

    if (value === "true" || value === "false") {
      data[key] = value === "true";
      i++;
      continue;
    }

    data[key] = value;
    i++;
  }

  return { parsed: true, data, raw, error: null };
}

function parseBlockquote(content) {
  let body = content;
  const fmMatch = content.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n/);
  if (fmMatch) body = content.slice(fmMatch[0].length);

  const h1Match = body.match(/^#\s+(.+?)\r?$/m);
  if (!h1Match) return {};

  const afterH1 = body.slice(h1Match.index + h1Match[0].length);
  const bqMatch = afterH1.match(/^\s*>\s*([\s\S]*?)(\r?\n\s*\r?\n|\r?\n#|\r?$)/m);
  if (!bqMatch) return {};

  const bqText = bqMatch[1];
  const fields = {};
  for (const line of bqText.split(/\r?\n/)) {
    const m = line.match(/^\s*>\s*([A-Za-z_]+)\s*:\s*(.*)$/);
    if (!m) continue;
    const key = m[1].toLowerCase().replace(/_/g, "_");
    fields[key] = m[2].trim();
  }
  return fields;
}

function listSkillDirs(skillsRoot) {
  if (!fs.existsSync(skillsRoot)) return [];
  return fs
    .readdirSync(skillsRoot, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .filter((d) => !d.name.startsWith(".") && d.name !== "docs")
    .filter((d) => fs.existsSync(path.join(skillsRoot, d.name, "SKILL.md")))
    .map((d) => ({ name: d.name, path: path.join(skillsRoot, d.name) }));
}

function discoverPlatformRoot(startDir) {
  if (process.env.ZAI_PLATFORM_ROOT && fs.existsSync(process.env.ZAI_PLATFORM_ROOT)) {
    return process.env.ZAI_PLATFORM_ROOT;
  }
  let dir = startDir || __dirname;
  for (let i = 0; i < 10; i++) {
    const gitmodules = path.join(dir, ".gitmodules");
    if (fs.existsSync(gitmodules)) {
      const content = fs.readFileSync(gitmodules, "utf8");
      if (content.includes("Z-ai-standards") && content.includes("Z-ai-skills")) {
        return dir;
      }
    }
    if (fs.existsSync(path.join(dir, "standards")) && fs.existsSync(path.join(dir, "skills"))) {
      return dir;
    }
    dir = path.dirname(dir);
  }
  return null;
}

module.exports = {
  VALID_DOMAINS,
  VALID_COMPAT,
  parseFrontmatter,
  parseBlockquote,
  listSkillDirs,
  discoverPlatformRoot,
};
