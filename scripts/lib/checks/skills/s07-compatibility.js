/**
 * S07 — compatibility field
 */

module.exports = function(skillDirs, parseFrontmatter, VALID_COMPAT) {
  const invalid = [];
  const compats = Array.from(VALID_COMPAT); // Set -> Array
  for (const s of skillDirs) {
    const skillMdPath = require("path").join(s.path, "SKILL.md");
    if (!require("fs").existsSync(skillMdPath)) continue;
    const content = require("fs").readFileSync(skillMdPath, "utf8");
    const fm = parseFrontmatter(content);
    if (!fm.parsed) continue;
    if ("compatibility" in fm.data) {
      if (!compats.includes(fm.data.compatibility)) {
        invalid.push(`${s.name}: invalid compatibility ${fm.data.compatibility}`);
      }
    }
  }
  return {
    id: "S07",
    description: "compatibility field valid (both|sandbox|ade)",
    passed: invalid.length === 0,
    detail: invalid.length === 0
      ? "all valid"
      : `${invalid.length} invalid: ${invalid.join("; ")}`,
  };
};