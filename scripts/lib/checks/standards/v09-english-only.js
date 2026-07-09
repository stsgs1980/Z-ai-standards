/**
 * V09 — All .md files are English-only (< 2% Cyrillic)
 */

module.exports = function (targets) {
  const offenders = [];
  for (const t of targets) {
    const content = require("fs").readFileSync(t, "utf8");
    const cyrillic = /[\u0400-\u04FF]/g;
    const matches = content.match(cyrillic);
    const ratio = matches ? matches.length / content.length : 0;
    if (ratio > 0.02) {
      offenders.push(t);
    }
  }
  return {
    id: "V09",
    description: "All .md files in upload/ are English-only (< 2% Cyrillic)",
    passed: offenders.length === 0,
    detail: offenders.length === 0 ? "all files English-only" : offenders.join(", "),
  };
};
