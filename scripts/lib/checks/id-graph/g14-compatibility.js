/**
 * G14 — Compatibility DAG valid for ZAI skills
 */

module.exports = function (ids, COMPAT_MATRIX) {
  const violations = [];
  for (const id of ids) {
    if (id.prefix !== "ZAI") continue;
    const sourceCompat = id.compatibility;
    if (!sourceCompat) continue;
    const sourceRow = COMPAT_MATRIX[sourceCompat];
    if (!sourceRow) continue;
    for (const ref of id.related || []) {
      const target = ids.find((i) => i.id === ref);
      if (!target || target.prefix !== "ZAI") continue;
      const targetCompat = target.compatibility;
      if (!targetCompat) continue;
      const allowed = sourceRow.has(targetCompat);
      if (!allowed) {
        violations.push(`${id.id} (${sourceCompat}) → ${ref} (${targetCompat})`);
      }
    }
  }
  return {
    id: "G14",
    description: "Compatibility DAG valid for ZAI skills",
    passed: violations.length === 0,
    detail: violations.length === 0 ? "all valid" : violations.join(", "),
  };
};
