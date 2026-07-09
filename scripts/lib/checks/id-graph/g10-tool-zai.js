/**
 * G10 — No TOOL → ZAI edges
 */

module.exports = function (ids) {
  const violations = [];
  for (const id of ids) {
    if (id.prefix !== "TOOL") continue;
    for (const ref of id.related || []) {
      if (ref.startsWith("ZAI-")) {
        violations.push(`${id.id} → ${ref}`);
      }
    }
  }
  return {
    id: "G10",
    description: "No TOOL → ZAI edges",
    passed: violations.length === 0,
    detail: violations.length === 0 ? "no TOOL→ZAI edges" : violations.join(", "),
  };
};
