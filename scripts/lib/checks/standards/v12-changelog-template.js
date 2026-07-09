/**
 * V12 — CHANGELOG_TEMPLATE.md exists
 */

module.exports = function (TEMPLATES_DIR) {
  const changelogTemplate = require("path").join(TEMPLATES_DIR, "CHANGELOG_TEMPLATE.md");
  if (!require("fs").existsSync(changelogTemplate)) {
    return {
      id: "V12",
      description: "CHANGELOG_TEMPLATE.md exists",
      passed: false,
      detail: "not found",
    };
  }
  const content = require("fs").readFileSync(changelogTemplate, "utf8");
  const keepAChangelog = /Keep a Changelog/i.test(content);
  const categories = ["Added", "Changed", "Fixed", "Deprecated", "Removed", "Security"];
  const foundCategories = categories.filter((c) => content.includes(c));
  return {
    id: "V12",
    description: "CHANGELOG_TEMPLATE.md exists with Keep a Changelog format (6 categories)",
    passed: keepAChangelog && foundCategories.length >= 4,
    detail: `Keep a Changelog ref=${keepAChangelog}, categories found=${foundCategories.length}/6`,
  };
};
