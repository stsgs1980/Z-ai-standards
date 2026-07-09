/**
 * V13 — AGENT_RULES_TEMPLATE.md exists
 */

module.exports = function (TEMPLATES_DIR) {
  const agentRulesTemplate = require("path").join(TEMPLATES_DIR, "AGENT_RULES_TEMPLATE.md");
  if (!require("fs").existsSync(agentRulesTemplate)) {
    return {
      id: "V13",
      description: "AGENT_RULES_TEMPLATE.md exists",
      passed: false,
      detail: "not found",
    };
  }
  const content = require("fs").readFileSync(agentRulesTemplate, "utf8");
  const onboarding = /onboarding/i.test(content);
  const priorityOrder = /priority.*order/i.test(content);
  const sectionsTable = /sections.*table/i.test(content);
  return {
    id: "V13",
    description:
      "AGENT_RULES_TEMPLATE.md exists with Onboarding Protocol + Priority Order + Sections table",
    passed: onboarding && priorityOrder && sectionsTable,
    detail: `onboarding=${onboarding}, priority order=${priorityOrder}, sections table=${sectionsTable}`,
  };
};
