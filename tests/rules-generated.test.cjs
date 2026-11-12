"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const root = path.resolve(__dirname, "..");

test("committed Firestore rules match the protected course catalog", () => {
  const result = spawnSync(
    process.execPath,
    [path.join(root, "scripts", "build-rules.cjs"), "--check"],
    { cwd: root, encoding: "utf8" },
  );
  assert.equal(result.status, 0, result.stderr || result.stdout);
});
