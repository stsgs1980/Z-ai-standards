"use strict";

const VERSION = "1.0.0";

function parseArgs(argv, validFlags) {
  const opts = {};
  for (const arg of argv.slice(2)) {
    if (arg === "--help" || arg === "-h") {
      opts.help = true;
      continue;
    }
    if (arg === "--json") {
      opts.json = true;
      continue;
    }
    if (arg === "--soft") {
      opts.soft = true;
      continue;
    }
    if (arg === "--strict") {
      opts.strict = true;
      continue;
    }
    if (arg.startsWith("--root=")) {
      opts.root = arg.slice(7);
      continue;
    }
    if (arg.startsWith("--snapshot=")) {
      opts.snapshot = arg.slice(11);
      continue;
    }
    if (arg.startsWith("--compare=")) {
      opts.compare = arg.slice(10);
      continue;
    }
    if (arg.startsWith("--update-snapshot")) {
      opts.updateSnapshot = true;
      continue;
    }
    console.error(`Unknown argument: ${arg}`);
    process.exit(2);
  }
  return opts;
}

function printJSON(data) {
  console.log(JSON.stringify(data, null, 2));
}

module.exports = { VERSION, parseArgs, printJSON };
