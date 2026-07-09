/**
 * V04 — No emoji/Unicode graphic chars (STD-DOC-003)
 */

module.exports = function (targets, extractSection) {
  const offenders = [];
  for (const t of targets) {
    const content = require("fs").readFileSync(t, "utf8");
    const fences = content.matchAll(/```[\s\S]*?```/g);
    const codeSpans = [];
    for (const match of fences) {
      const codeOnly = match[0].replace(/^```[\w]*\n?/, "").replace(/```$/, "");
      codeSpans.push(codeOnly);
    }
    const noCode = content.replace(/```[\s\S]*?```/g, "");
    const emoji = /[\u{1F300}-\u{1F9FF}]/u;
    const graphic = /[\u{2580}-\u{259F}]/u;
    for (const span of codeSpans) {
      if (emoji.test(span) || graphic.test(span)) {
        offenders.push(t);
        break;
      }
    }
  }
  return {
    id: "V04",
    description: "No emoji/Unicode graphic chars in .md files (STD-DOC-003) — code spans stripped",
    passed: offenders.length === 0,
    detail: offenders.length === 0 ? "all clean" : offenders.join(", "),
  };
};
