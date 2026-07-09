/**
 * V10 — No .md file exceeds 1000 lines (W11 hard promotion)
 */

module.exports = function (STANDARDS_DIR, DOCS_DIR, TEMPLATES_DIR) {
  const offenders = [];
  const scanDir = (dir) => {
    if (!require("fs").existsSync(dir)) return;
    const files = require("fs").readdirSync(dir);
    files.forEach((f) => {
      const fullPath = require("path").join(dir, f);
      if (f.endsWith(".md")) {
        const lines = require("fs").readFileSync(fullPath, "utf8").split("\n").length;
        if (lines > 1000) {
          offenders.push(`${f}: ${lines} lines`);
        }
      }
    });
  };
  scanDir(STANDARDS_DIR);
  scanDir(DOCS_DIR);
  scanDir(TEMPLATES_DIR);
  return {
    id: "V10",
    description: "No .md file exceeds 1000 lines",
    passed: offenders.length === 0,
    detail: offenders.length === 0 ? "all files ≤ 1000 lines" : offenders.join(", "),
  };
};
