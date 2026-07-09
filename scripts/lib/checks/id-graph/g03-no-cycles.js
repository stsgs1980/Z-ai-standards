/**
 * G03/G11 — No cycles in Related: graph
 */

module.exports = function (ids, tarjanSCC) {
  const edges = [];
  const nodes = new Set();
  for (const id of ids) {
    nodes.add(id.id);
    for (const ref of id.related || []) {
      edges.push({ source: id.id, target: ref });
      nodes.add(ref);
    }
  }
  const sccs = tarjanSCC(Array.from(nodes), edges);
  const cycles = sccs.filter((scc) => scc.length > 1);
  return {
    id: "G03",
    description: "No cycles in Related: graph",
    passed: cycles.length === 0,
    detail: cycles.length === 0 ? "no cycles" : cycles.map((c) => `(${c.join(" → ")})`).join(", "),
  };
};
