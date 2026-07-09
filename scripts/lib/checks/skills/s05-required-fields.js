/**
 * S05 — Required frontmatter fields
 */

module.exports = function(skillDirs, parseFrontmatter) {
  const required = ["name", "description", "version"];
  const missing = [];
  for (const s of skillDirs) {
    const skillMdPath = require("path").join(s.path, "SKILL.md");
    if (!require("fs").existsSync(skillMdPath)) continue;
    const content = require("fs").readFileSync(skillMdPath, "utf8");
    const fm = parseFrontmatter(content);
    if (!fm.parsed) continue;
    for (const field of required) {
      if (!(field in fm.data)) {
        missing.push(`${s.name}: missing ${field}`);
      }
    }
  }
  return {
    id: "S05",
    description: "Required frontmatter fields present: name, description, version",
    passed: missing.length === 0,
    detail: missing.length === 0
      ? "all skills have required fields"
      : `${missing.length} missing: ${missing.join("; ")}`,
  };
};