/**
 * S04 — YAML frontmatter parses
 */

module.exports = function(skillDirs, parseFrontmatter) {
  const failed = [];
  for (const s of skillDirs) {
    const skillMdPath = require("path").join(s.path, "SKILL.md");
    if (!require("fs").existsSync(skillMdPath)) continue;
    const content = require("fs").readFileSync(skillMdPath, "utf8");
    const fm = parseFrontmatter(content);
    if (!fm.parsed) {
      failed.push(s.name);
    }
  }
  return {
    id: "S04",
    description: "YAML frontmatter parses — scanned all skill folders with SKILL.md",
    passed: failed.length === 0,
    detail: failed.length === 0
      ? "all frontmatter blocks parse successfully"
      : `${failed.length} failed: ${failed.join(", ")}`,
  };
};