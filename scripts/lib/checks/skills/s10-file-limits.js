/**
 * S10 — File size limits
 */

module.exports = function(skillDirs) {
  const SKILL_LIMIT = 800;
  const CONTRACT_LIMIT = 500;
  const README_LIMIT = 400;

  const skillViolations = [];
  const contractViolations = [];
  const readmeViolations = [];

  for (const s of skillDirs) {
    const skillMdPath = require("path").join(s.path, "SKILL.md");
    if (require("fs").existsSync(skillMdPath)) {
      const lines = require("fs").readFileSync(skillMdPath, "utf8").split("\n").length;
      if (lines > SKILL_LIMIT) {
        skillViolations.push(`${s.name}: ${lines} lines`);
      }
    }

    const contractPath = require("path").join(s.path, "CONTRACT.md");
    if (require("fs").existsSync(contractPath)) {
      const lines = require("fs").readFileSync(contractPath, "utf8").split("\n").length;
      if (lines > CONTRACT_LIMIT) {
        contractViolations.push(`${s.name}: ${lines} lines`);
      }
    }

    const readmePath = require("path").join(s.path, "README.md");
    if (require("fs").existsSync(readmePath)) {
      const lines = require("fs").readFileSync(readmePath, "utf8").split("\n").length;
      if (lines > README_LIMIT) {
        readmeViolations.push(`${s.name}: ${lines} lines`);
      }
    }
  }

  const details = [];
  if (skillViolations.length > 0) {
    details.push(`SKILL.md: ${skillViolations.join("; ")}`);
  }
  if (contractViolations.length > 0) {
    details.push(`CONTRACT.md: ${contractViolations.join("; ")}`);
  }
  if (readmeViolations.length > 0) {
    details.push(`README.md: ${readmeViolations.join("; ")}`);
  }

  return {
    id: "S10",
    description: "File size limits: SKILL.md ≤ 800, CONTRACT.md ≤ 500, README.md ≤ 400",
    passed: skillViolations.length === 0 && contractViolations.length === 0 && readmeViolations.length === 0,
    detail: details.length > 0 ? details.join(" | ") : "all files within limits",
  };
};