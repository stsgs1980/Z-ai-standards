/**
 * G01 — No duplicate IDs across repos
 */

module.exports = function (ids) {
  const idMap = {};
  const duplicates = [];
  for (const id of ids) {
    if (idMap[id.id]) {
      duplicates.push(`${id.id} (${id.file} and ${idMap[id.id].file})`);
    } else {
      idMap[id.id] = id;
    }
  }
  return {
    id: "G01",
    description: "No duplicate IDs across repos",
    passed: duplicates.length === 0,
    detail: duplicates.length === 0 ? "no duplicates" : duplicates.join(", "),
  };
};
