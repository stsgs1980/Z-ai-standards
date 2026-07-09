/**
 * G08 — No PROC → ZAI edges
 */

module.exports = function (ids) {
  const violations = [];
  for (const id of ids) {
    if (id.prefix !== "PROC") continue;
    for (const ref of id.related || []) {
      if (ref.startsWith("ZAI-")) {
        violations.push(`${id.id} → ${ref}`);
      }
    }
  }
  return {
    id: "G08",
    description: "No PROC → ZAI edges",
    passed: violations.length === 0,
    detail: violations.length === 0 ? "no PROC→ZAI edges" : violations.join(", "),
  };
};
