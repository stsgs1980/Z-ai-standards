/**
 * G11 — No self-references
 */

module.exports = function (ids) {
  const selfRefs = [];
  for (const id of ids) {
    if ((id.related || []).includes(id.id)) {
      selfRefs.push(id.id);
    }
  }
  return {
    id: "G11",
    description: "No self-references",
    passed: selfRefs.length === 0,
    detail: selfRefs.length === 0 ? "no self-references" : selfRefs.join(", "),
  };
};
