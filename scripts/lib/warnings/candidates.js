"use strict";

const path = require("path");

function buildCandidates(refPath, standardsTreeRoot, filePath, platformRoot) {
  return [
    path.join(standardsTreeRoot, refPath),
    path.join(standardsTreeRoot, "standards", refPath),
    path.join(standardsTreeRoot, "docs", refPath),
    path.join(standardsTreeRoot, "scripts", refPath),
    path.join(standardsTreeRoot, "templates", refPath),
    path.join(standardsTreeRoot, "guides", refPath),
    path.join(path.dirname(filePath), refPath),
    path.join(platformRoot, refPath),
    path.join(platformRoot, refPath.replace(/^Z-ai-platform\//, "")),
    path.join(platformRoot, refPath.replace(/^Z-ai-standards\//, "standards/")),
    path.join(platformRoot, refPath.replace(/^Z-ai-guard\//, "../Z-ai-guard/")),
    path.join(platformRoot, refPath.replace(/^Z-ai-skills\//, "../Z-ai-skills/")),
    path.join(platformRoot, "skills", refPath.replace(/^Z-ai-skills\//, "")),
    path.join(platformRoot, "skills", "skills", refPath.replace(/^Z-ai-skills\/skills\//, "")),
    path.join(platformRoot, "guard", refPath.replace(/^Z-ai-guard\//, "")),
    path.join(platformRoot, "docs", "session", refPath),
    path.join(platformRoot, refPath.replace(/^MIGRATIONS\.md$/, "standards/MIGRATIONS.md")),
    path.join(platformRoot, "skills", "skills", refPath),
  ];
}

module.exports = { buildCandidates };
