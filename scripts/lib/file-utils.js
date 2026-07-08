"use strict";

const fs = require("fs");
const path = require("path");

const SKIP_DIRS = new Set(["node_modules", ".next", "Z-ai-governance", ".git"]);
const SKIP_DIR_PATTERNS = ["src/components/ui"];
const EXEMPT_EXTENSIONS = new Set([".json", ".yml", ".yaml", ".toml", ".ini"]);
const EXEMPT_FILE_PATTERNS = [
  /worklog\.md$/i,
  /DECISIONS.*\.md$/i,
  /SESSION.*\.md$/i,
  /MIGRATIONS.*\.md$/i,
  /^INDEX\.md$/i,
];

function shouldSkip(filePath, relativePath) {
  const parts = relativePath.split(path.sep);
  for (const part of parts) {
    if (SKIP_DIRS.has(part)) return true;
  }
  for (const pattern of SKIP_DIR_PATTERNS) {
    if (relativePath.startsWith(pattern) || relativePath.includes(path.sep + pattern + path.sep))
      return true;
  }
  if (parts.includes("references")) return true;
  const basename = path.basename(filePath);
  for (const pattern of EXEMPT_FILE_PATTERNS) {
    if (pattern.test(basename)) return true;
  }
  const ext = path.extname(filePath).toLowerCase();
  if (EXEMPT_EXTENSIONS.has(ext)) return true;
  return false;
}

function listFiles(dir, root) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.relative(root, fullPath);
    if (entry.isDirectory()) {
      if (!shouldSkip(fullPath, relativePath)) results.push(...listFiles(fullPath, root));
    } else if (entry.isFile()) {
      if (!shouldSkip(fullPath, relativePath)) results.push(fullPath);
    }
  }
  return results;
}

function countLines(content) {
  if (content === "") return 0;
  return content.split("\n").length - (content.endsWith("\n") ? 1 : 0);
}

function discoverProjectRoot(startDir) {
  if (process.env.ZAI_PLATFORM_ROOT && fs.existsSync(process.env.ZAI_PLATFORM_ROOT)) {
    return process.env.ZAI_PLATFORM_ROOT;
  }
  let dir = startDir;
  for (let i = 0; i < 10; i++) {
    if (fs.existsSync(path.join(dir, "package.json"))) return dir;
    dir = path.dirname(dir);
  }
  return null;
}

module.exports = { listFiles, countLines, discoverProjectRoot, shouldSkip };
