/**
 * V17 — README.md follows README_TEMPLATE
 */

module.exports = function (REPO_ROOT) {
  const readmePath = require("path").join(REPO_ROOT, "README.md");
  if (!require("fs").existsSync(readmePath)) {
    return {
      id: "V17",
      description: "README.md follows README_TEMPLATE",
      passed: false,
      detail: "not found",
    };
  }
  const content = require("fs").readFileSync(readmePath, "utf8");
  const badges = /!\[.*\]\(.*shields\.io.*\)/.test(content);
  const features = /features|Features|FEATURES/i.test(content) && content.includes("#");
  const techStack = /tech.?stack|stack|Stack/i.test(content);
  const gettingStarted = /getting.?started|quick.?start|setup|install/i.test(content);
  const license = /license|License|LICENSE/i.test(content);
  const description = content.split("\n")[0].length > 20;
  return {
    id: "V17",
    description: "README.md follows README_TEMPLATE: badges + required sections",
    passed: badges && features && techStack && gettingStarted && license && description,
    detail: `badges=${badges}, features=${features}, techStack=${techStack}, gettingStarted=${gettingStarted}, license=${license}, description=${description}`,
  };
};
