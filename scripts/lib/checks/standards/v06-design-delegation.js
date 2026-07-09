/**
 * V06 — STD-FE-001 §11/§12 delegate to STD-DESIGN-001
 */

module.exports = function (PATHS, extractSection) {
  const feContent = require("fs").readFileSync(PATHS.STD_FE_001, "utf8");
  const s11 = extractSection(feContent, "11");
  const s12 = extractSection(feContent, "12");
  const designRef = /STD-DESIGN-001/.test(s11) || /STD-DESIGN-001/.test(s12);
  const hexPattern = /#[0-9A-Fa-f]{6}/;
  const hardcodedHex = hexPattern.test(s11) || hexPattern.test(s12);
  return {
    id: "V06",
    description: "STD-FE-001 §11/§12 delegate to STD-DESIGN-001 (no hardcoded hex tokens)",
    passed: designRef && !hardcodedHex,
    detail: `STD-DESIGN-001 ref=${designRef}, hardcoded hex=${hardcodedHex}`,
  };
};
