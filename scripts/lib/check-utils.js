"use strict";

function createResults() {
  return {
    checks: [],
    stats: { files_scanned: 0, hard_pass: 0, hard_fail: 0, soft_warnings: 0 },
  };
}

function addCheck(results, id, status, description, detail, isSoft) {
  results.checks.push({ id, status, description, detail, isSoft: !!isSoft });
  if (status === "PASS") results.stats.hard_pass++;
  else if (isSoft) results.stats.soft_warnings++;
  else results.stats.hard_fail++;
}

module.exports = { createResults, addCheck };
