/**
 * V07 — STD-FE-001 §2 anti-monolith thresholds present
 */

module.exports = function (PATHS, extractSection) {
  const feContent = require("fs").readFileSync(PATHS.STD_FE_001, "utf8");
  const s2 = extractSection(feContent, "2");
  const checks = [
    { pattern: /File.*150.*250/, name: "File 150/250" },
    { pattern: /Component.*100.*200/, name: "Component 100/200" },
    { pattern: /Page.*30.*50/, name: "Page 30/50" },
    { pattern: /hook.*50.*100/, name: "hook 50/100" },
    { pattern: /Barrel.*30.*50/, name: "Barrel 30/50" },
    { pattern: /useState.*2/, name: "useState 2" },
    { pattern: /\[ANTI-MONOLITH EXCEPTION\]/, name: "exception marker" },
  ];
  const found = checks.map((c) => ({ name: c.name, found: c.pattern.test(s2) }));
  return {
    id: "V07",
    description: "STD-FE-001 §2 anti-monolith thresholds present",
    passed: found.every((f) => f.found),
    detail: found.map((f) => `${f.name}=${f.found}`).join(", "),
  };
};
