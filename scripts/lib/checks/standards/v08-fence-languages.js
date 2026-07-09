/**
 * V08 — All code fences have language tags (STD-DOC-002 §4.3)
 */

module.exports = function (targets) {
  const offenders = [];
  for (const t of targets) {
    const content = require("fs").readFileSync(t, "utf8");
    const fences = content.matchAll(/```(\w*)/g);
    for (const match of fences) {
      if (!match[1]) {
        offenders.push(t);
        break;
      }
    }
  }
  return {
    id: "V08",
    description: "All 3-backtick code fences have a language tag (STD-DOC-002 §4.3)",
    passed: offenders.length === 0,
    detail: offenders.length === 0 ? "all fences specify a language" : offenders.join(", "),
  };
};
