/**
 * G05 — No deprecated ID referenced outside migration window
 */

module.exports = function (ids, migrations) {
  const deprecated = ids.filter((i) => i.status === "DEPRECATED" || i.status === "SUPERSEDED");
  const violations = [];
  for (const dep of deprecated) {
    if (migrations.has(dep.id)) {
      continue;
    }
    for (const id of ids) {
      if ((id.related || []).includes(dep.id)) {
        violations.push(`${id.id} → ${dep.id} (outside migration window)`);
      }
    }
  }
  return {
    id: "G05",
    description: "No deprecated ID referenced outside migration window",
    passed: violations.length === 0,
    detail: violations.length === 0 ? "all within window" : violations.join(", "),
  };
};
