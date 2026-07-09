/**
 * V11 — WORKLOG_TEMPLATE.md exists
 */

module.exports = function (TEMPLATES_DIR) {
  const worklogTemplate = require("path").join(TEMPLATES_DIR, "WORKLOG_TEMPLATE.md");
  if (!require("fs").existsSync(worklogTemplate)) {
    return {
      id: "V11",
      description: "WORKLOG_TEMPLATE.md exists",
      passed: false,
      detail: "not found",
    };
  }
  const content = require("fs").readFileSync(worklogTemplate, "utf8");
  const appendOnlyRule = /append-only/i.test(content);
  const entryFormat = /entry.*format/i.test(content);
  return {
    id: "V11",
    description: "WORKLOG_TEMPLATE.md exists with append-only rule + entry format section",
    passed: appendOnlyRule && entryFormat,
    detail: `append-only=${appendOnlyRule}, entry format=${entryFormat}`,
  };
};
