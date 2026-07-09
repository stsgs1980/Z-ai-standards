/**
 * V05 — STD-META-001 registry includes STD-DESIGN-001 and STD-FE-001 v2.0+
 */

module.exports = function (PATHS, extractSection) {
  const metaContent = require("fs").readFileSync(PATHS.STD_META_001, "utf8");
  const registrySection = extractSection(metaContent, "4.1 – 4.12. Standards (STD-)");
  const designExists = /STD-DESIGN-001/.test(registrySection);
  const feSection = extractSection(metaContent, "4.18.1 Limits matrix");
  const feVersionMatch = feSection.match(/STD-.*MD.*v([\d.]+)/);
  const feVersion = feVersionMatch ? parseFloat(feVersionMatch[1]) : 0;
  return {
    id: "V05",
    description: "STD-META-001 registry includes STD-DESIGN-001 and STD-FE-001 v2.0+",
    passed: designExists && feVersion >= 2.0,
    detail: `STD-DESIGN-001=${designExists}, STD-FE-001 v2.0+=${feVersion >= 2.0} (matched: ${feVersionMatch?.[1] || "none"})`,
  };
};
