/**
 * W08 — Aligned_with: symmetry (B reciprocates A's declaration)
 */

module.exports = function (ids) {
  const missingReciprocal = [];
  for (const id of ids) {
    for (const aligned of id.aligned_with || []) {
      const target = ids.find((i) => i.id === aligned);
      if (!target) continue;
      if (!(target.aligned_with || []).includes(id.id)) {
        missingReciprocal.push(`${id.id} → ${aligned} (not reciprocated)`);
      }
    }
  }
  return {
    id: "W08",
    description: "Aligned_with: symmetry (B reciprocates A's declaration)",
    passed: true,
    detail: missingReciprocal.length === 0 ? "all reciprocated" : missingReciprocal.join(", "),
    isWarning: true,
  };
};
