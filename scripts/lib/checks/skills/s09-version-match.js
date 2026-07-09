/**
 * S09 — frontmatter version matches blockquote Version:
 */

const { parseBlockquote } = require("../../parsers");

module.exports = function(skillDirs, parseFrontmatter) {
  const mismatched = [];
  for (const s of skillDirs) {
    const skillMdPath = require("path").join(s.path, "SKILL.md");
    if (!require("fs").existsSync(skillMdPath)) continue;
    const content = require("fs").readFileSync(skillMdPath, "utf8");
    const fm = parseFrontmatter(content);
    if (!fm.parsed) continue;
    const versionMatch = content.match(/^>\s*Version:\s*([\d.]+)/m);
    if (versionMatch && fm.data.version !== versionMatch[1]) {
      mismatched.push(s.name);
    }
  }
  return {
    id: "S09",
    description: "frontmatter version matches blockquote Version: — checked skills with both",
    passed: mismatched.length === 0,
    detail: mismatched.length === 0
      ? "all matched"
      : `${mismatched.length} mismatched: ${mismatched.join(", ")}`,
  };
};