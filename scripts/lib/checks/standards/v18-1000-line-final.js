/**
 * V18 — No .md file exceeds 1000 lines (scanned 42 files)
 */

module.exports = function (STANDARDS_DIR, DOCS_DIR, TEMPLATES_DIR) {
  let totalFiles = 0;
  let maxLines = 0;
  const maxFile = null;
  const scanDir = (dir) => {
    if (!require("fs").existsSync(dir)) return;
    const files = require("fs").readdirSync(dir);
    files.forEach((f) => {
      const fullPath = require("path").join(dir, f);
      if (f.endsWith(".md")) {
        const lines = require("fs").readFileSync(fullPath, "utf8").split("\n").length;
        totalFiles++;
        if (lines > maxLines) {
          maxLines = lines;
        }
        if (lines > 1000) {
          if (!maxFile || lines > require("fs").readFileSync(maxFile, "utf8").split("\n").length) {
            maxFile = `${f}: ${lines} lines`;
          }
        }
      }
    });
  };
  scanDir(STANDARDS_DIR);
  scanDir(DOCS_DIR);
  scanDir(TEMPLATES_DIR);
  return {
    id: "V18",
    description: "No .md file exceeds 1000 lines (scanned files)",
    passed: maxLines <= 1000,
    detail: maxLines <= 1000 ? `all ${totalFiles} files ≤ 1000 lines` : `${maxFile}`,
  };
};
