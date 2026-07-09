/**
 * G04 — All Related: edges conform to layer matrix
 */

module.exports = function (ids, LAYER_MATRIX) {
  const violations = [];
  for (const id of ids) {
    const sourcePrefix = id.prefix || (id.id ? id.id.split("-")[0] : null);
    if (!sourcePrefix) continue;
    const sourceRow = LAYER_MATRIX[sourcePrefix];
    if (!sourceRow) continue;
    for (const ref of id.related || []) {
      const targetPrefix = ref.split("-")[0];
      const allowed = sourceRow.has(targetPrefix);
      if (!allowed) {
        violations.push(`${id.id} (${sourcePrefix}) → ${ref} (${targetPrefix})`);
      }
    }
  }
  return {
    id: "G04",
    description: "All Related: edges conform to layer matrix",
    passed: violations.length === 0,
    detail: violations.length === 0 ? "all conform" : violations.join(", "),
  };
};
