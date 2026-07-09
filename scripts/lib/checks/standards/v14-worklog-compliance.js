/**
 * V14 — worklog.md follows WORKLOG_TEMPLATE
 */

module.exports = function (WORKLOG_MD) {
  if (!require("fs").existsSync(WORKLOG_MD)) {
    return {
      id: "V14",
      description: "worklog.md follows WORKLOG_TEMPLATE",
      passed: true,
      detail: "not found (standards/ level)",
    };
  }
  const content = require("fs").readFileSync(WORKLOG_MD, "utf8");
  const timestamps = /\d{4}-\d{2}-\d{2} \d{2}:\d{2}/.test(content);
  const statusTags = /\[OPEN\]|\[CLOSED\]|\[RESOLVED\]/.test(content);
  return {
    id: "V14",
    description: "worklog.md follows WORKLOG_TEMPLATE: timestamps + status tags",
    passed: timestamps && statusTags,
    detail: `timestamps=${timestamps}, status tags=${statusTags}`,
  };
};
