/**
 * G07 — No STD → (RULE/PROC/TOOL/ZAI) edges
 */

module.exports = function (ids) {
  const violations = [];
  for (const id of ids) {
    if (id.prefix !== "STD") continue;
    for (const ref of id.related || []) {
      const targetPrefix = ref.split("-")[0];
      if (["RULE", "PROC", "TOOL", "ZAI"].includes(targetPrefix)) {
        violations.push(`${id.id} → ${ref}`);
      }
    }
  }
  return {
    id: "G07",
    description: "No STD → (RULE/PROC/TOOL/ZAI) edges",
    passed: violations.length === 0,
    detail: violations.length === 0 ? "no downward edges" : violations.join(", "),
  };
};
