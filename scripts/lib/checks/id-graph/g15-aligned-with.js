/**
 * G15 — Aligned_with: has corresponding Related: edge
 */

module.exports = function (ids) {
  const violations = [];
  for (const id of ids) {
    for (const aligned of id.aligned_with || []) {
      const hasRelated =
        (id.related || []).includes(aligned) ||
        ids.find((i) => i.id === aligned)?.related?.includes(id.id);
      if (!hasRelated) {
        violations.push(`${id.id} aligned_with ${aligned} but no Related: edge`);
      }
    }
  }
  return {
    id: "G15",
    description: "Aligned_with: has corresponding Related: edge",
    passed: violations.length === 0,
    detail: violations.length === 0 ? "all aligned with Related:" : violations.join(", "),
  };
};
