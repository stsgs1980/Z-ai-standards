/**
 * G02 — All Related: references resolve to existing IDs
 */

module.exports = function (ids) {
  const idSet = new Set(ids.map((i) => i.id));
  const unresolved = [];
  for (const id of ids) {
    for (const ref of id.related || []) {
      if (!idSet.has(ref)) {
        unresolved.push(`${id.id} → ${ref} (${id.file})`);
      }
    }
  }
  return {
    id: "G02",
    description: "All Related: references resolve to existing IDs",
    passed: unresolved.length === 0,
    detail: unresolved.length === 0 ? "all resolve" : unresolved.join(", "),
  };
};
