/**
 * G12 — No typo-IDs (format violations)
 */

module.exports = function (ids, ID_REGEX) {
  const invalid = [];
  for (const id of ids) {
    if (!ID_REGEX.test(id.id)) {
      invalid.push(`${id.id} (${id.file})`);
    }
  }
  return {
    id: "G12",
    description: "No typo-IDs (format violations)",
    passed: invalid.length === 0,
    detail: invalid.length === 0 ? "all valid" : invalid.join(", "),
  };
};
