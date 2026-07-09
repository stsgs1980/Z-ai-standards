/**
 * V16 — AGENT_RULES.md follows AGENT_RULES_TEMPLATE
 */

module.exports = function (AGENT_RULES_MD) {
  if (!require("fs").existsSync(AGENT_RULES_MD)) {
    return {
      id: "V16",
      description: "AGENT_RULES.md follows AGENT_RULES_TEMPLATE",
      passed: true,
      detail: "AGENT_RULES.md not found — skipping (not required at standards level)",
    };
  }
  const content = require("fs").readFileSync(AGENT_RULES_MD, "utf8");
  const onboarding = /onboarding/i.test(content);
  const priorityOrder = /priority.*order/i.test(content);
  const sectionsTable = /sections.*table/i.test(content);
  return {
    id: "V16",
    description: "If AGENT_RULES.md exists, it follows AGENT_RULES_TEMPLATE structure",
    passed: onboarding && priorityOrder && sectionsTable,
    detail: `onboarding=${onboarding}, priority order=${priorityOrder}, sections table=${sectionsTable}`,
  };
};
