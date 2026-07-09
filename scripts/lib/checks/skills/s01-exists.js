/**
 * S01 — SKILL.md exists
 */

module.exports = function(skillDirs) {
  const missing = skillDirs.filter((s) => !require("fs").existsSync(require("path").join(s.path, "SKILL.md")));
  return {
    id: "S01",
    description: `SKILL.md exists in every skills/skills/{name}/ folder — scanned ${skillDirs.length} folders`,
    passed: missing.length === 0,
    detail: missing.length === 0
      ? `all ${skillDirs.length} folders have SKILL.md`
      : `${missing.length} folder(s) missing SKILL.md: ${missing.map((m) => m.name).join(", ")}`,
  };
};