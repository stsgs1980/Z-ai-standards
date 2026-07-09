/**
 * S02 — frontmatter name matches folder name
 */

module.exports = function(skillDirs, parseFrontmatter) {
  const offenders = [];
  for (const s of skillDirs) {
    const skillMdPath = require("path").join(s.path, "SKILL.md");
    if (!require("fs").existsSync(skillMdPath)) continue;
    const content = require("fs").readFileSync(skillMdPath, "utf8");
    const fm = parseFrontmatter(content);
    if (!fm.parsed) continue;
    const expected = s.name;
    if (fm.data.name !== expected) {
      offenders.push(`${s.name}: frontmatter name="${fm.data.name}" expected "${expected}"`);
    }
  }
  return {
    id: "S02",
    description: "frontmatter `name` matches folder name exactly (per §3.3 + §9.1)",
    passed: offenders.length === 0,
    detail: offenders.length === 0
      ? `all ${skillDirs.length} skills match`
      : `${offenders.length} mismatch(es): ${offenders.join("; ")}`,
  };
};