/**
 * V15 — CHANGELOG.md follows CHANGELOG_TEMPLATE
 */

module.exports = function (CHANGELOG_MD) {
  if (!require("fs").existsSync(CHANGELOG_MD)) {
    return {
      id: "V15",
      description: "CHANGELOG.md follows CHANGELOG_TEMPLATE",
      passed: false,
      detail: "not found",
    };
  }
  const content = require("fs").readFileSync(CHANGELOG_MD, "utf8");
  const versionHeaders = /^##\s+\[?\d+\.\d+\.\d+\]?/m.test(content);
  const categories = ["Added", "Changed", "Fixed"];
  const foundCategories = categories.filter((c) => content.includes(c));
  return {
    id: "V15",
    description:
      "CHANGELOG.md follows CHANGELOG_TEMPLATE: version headers + Keep a Changelog categories",
    passed: versionHeaders && foundCategories.length >= 3,
    detail: `version headers=${versionHeaders}, categories found=[${foundCategories.join(", ")}]`,
  };
};
