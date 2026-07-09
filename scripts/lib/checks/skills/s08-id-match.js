/**
 * S08 — frontmatter id matches blockquote ID
 */

module.exports = function(skillDirs) {
  const mismatched = [];
  for (const s of skillDirs) {
    const skillMdPath = require("path").join(s.path, "SKILL.md");
    if (!require("fs").existsSync(skillMdPath)) continue;
    const content = require("fs").readFileSync(skillMdPath, "utf8");
    const idMatch = content.match(/id:\s*ZAI-([A-Z]+)-(\d+)/);
    const blockquoteMatch = content.match(/^>\s*ID:\s*ZAI-([A-Z]+)-(\d+)/m);
    if (idMatch && blockquoteMatch) {
      if (idMatch[0] !== blockquoteMatch[0]) {
        mismatched.push(s.name);
      }
    }
  }
  return {
    id: "S08",
    description: "frontmatter id matches blockquote ID:",
    passed: mismatched.length === 0,
    detail: mismatched.length === 0
      ? "all matched"
      : `${mismatched.length} mismatched: ${mismatched.join(", ")}`,
  };
};