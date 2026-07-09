/**
 * G09 — No TOOL → PROC edges
 */

module.exports = function (ids) {
  const violations = [];
  for (const id of ids) {
    if (id.prefix !== "TOOL") continue;
    for (const ref of id.related || []) {
      if (ref.startsWith("PROC-")) {
        violations.push(`${id.id} → ${ref}`);
      }
    }
  }
  return {
    id: "G09",
    description: "No TOOL → PROC edges",
    passed: violations.length === 0,
    detail: violations.length === 0 ? "no TOOL→PROC edges" : violations.join(", "),
  };
};
