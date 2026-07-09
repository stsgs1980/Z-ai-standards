/**
 * Paths for verify-standards.js
 */

const path = require("path");

module.exports = function (STANDARDS_DIR, DOCS_DIR, TEMPLATES_DIR) {
  return {
    STD_ENV_002: path.join(STANDARDS_DIR, "ENV-002-zai-integration.md"),
    STD_FE_001: path.join(STANDARDS_DIR, "FE-001-frontend.md"),
    STD_META_001: path.join(STANDARDS_DIR, "META-001-standard-id-system.md"),
    STD_DESIGN_001: path.join(STANDARDS_DIR, "DESIGN-001-design-system.md"),
    STD_DOC_003: path.join(STANDARDS_DIR, "DOC-003-unicode-policy.md"),
    STD_ARCH_001: path.join(STANDARDS_DIR, "ARCH-002-implementation-order.md"),
    HOOKS_GUIDE: path.join(DOCS_DIR, "sandbox-hooks-cookbook.md"),
    HOOKS_GUIDE_PARTS: [
      path.join(DOCS_DIR, "hooks-basic.md"),
      path.join(DOCS_DIR, "hooks-ai.md"),
      path.join(DOCS_DIR, "hooks-triggers.md"),
    ],
    WORKLOG_MD: path.join(STANDARDS_DIR, "worklog.md"),
    CHANGELOG_MD: path.join(STANDARDS_DIR, "CHANGELOG.md"),
    AGENT_RULES_MD: path.join(STANDARDS_DIR, "AGENT_RULES.md"),
  };
};
