"use strict";

const path = require("path");

const CATEGORIES = {
  SOURCE: { hard: 250, soft: 150, extensions: [".ts", ".tsx", ".js", ".jsx", ".py", ".sh"] },
  CSS: { hard: 250, soft: 150, extensions: [".css"] },
  TEST: { hard: 400, soft: 250, pattern: /\.(test|spec)\.[^.]+$/i },
  SKILL: { hard: 800, soft: 400, pattern: /^SKILL\.md$/i },
  README: { hard: 400, soft: 250, pattern: /^README\.md$/i },
  STD: {
    hard: 1200,
    soft: 800,
    pattern: /^(A11Y|AGENT|ARCH|DESIGN|DOC|ERR|FE|GIT|META|SEC|SKILL|STD)-.+\.md$/i,
  },
  RULE: { hard: 200, soft: 120, pattern: /^RULE-.+\.md$/i },
  PROC: { hard: 400, soft: 250, pattern: /^(PROC|TOOL)-.+\.md$/i },
  OTHER_MD: { hard: 400, soft: 250, extensions: [".md"] },
};

function categorizeFile(filePath) {
  const basename = path.basename(filePath);
  const ext = path.extname(filePath).toLowerCase();
  if (CATEGORIES.TEST.pattern.test(basename)) return "TEST";
  if (CATEGORIES.SKILL.pattern.test(basename)) return "SKILL";
  if (CATEGORIES.README.pattern.test(basename)) return "README";
  if (CATEGORIES.STD.pattern.test(basename)) return "STD";
  if (CATEGORIES.RULE.pattern.test(basename)) return "RULE";
  if (CATEGORIES.PROC.pattern.test(basename)) return "PROC";
  if (CATEGORIES.SOURCE.extensions.includes(ext)) return "SOURCE";
  if (CATEGORIES.CSS.extensions.includes(ext)) return "CSS";
  if (CATEGORIES.OTHER_MD.extensions.includes(ext)) return "OTHER_MD";
  return null;
}

module.exports = { CATEGORIES, categorizeFile };
