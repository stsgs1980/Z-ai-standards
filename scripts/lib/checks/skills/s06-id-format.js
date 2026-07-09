/**
 * S06 — id field format
 */

module.exports = function(skillDirs, VALID_DOMAINS) {
  const invalid = [];
  const domains = Array.from(VALID_DOMAINS); // Set -> Array
  for (const s of skillDirs) {
    const skillMdPath = require("path").join(s.path, "SKILL.md");
    if (!require("fs").existsSync(skillMdPath)) continue;
    const content = require("fs").readFileSync(skillMdPath, "utf8");
    const idMatch = content.match(/id:\s*ZAI-([A-Z]+)-(\d+)/);
    if (!idMatch) continue;
    const domain = idMatch[1];
    if (!domains.includes(domain)) {
      invalid.push(`${s.name}: invalid domain ${domain}`);
    }
  }
  return {
    id: "S06",
    description: "id field format valid (ZAI-<DOMAIN>-<NNN>, valid domain)",
    passed: invalid.length === 0,
    detail: invalid.length === 0
      ? "all ids valid"
      : `${invalid.length} invalid: ${invalid.join("; ")}`,
  };
};