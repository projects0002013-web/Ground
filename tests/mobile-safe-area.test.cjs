"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const css = fs.readFileSync(path.join(root, "css", "style.css"), "utf8");

test("mobile viewport exposes screen safe-area insets", () => {
  assert.match(html, /<meta\s+name="viewport"\s+content="[^"]*viewport-fit=cover[^"]*"\s*\/>/);
});

test("mobile navigation and lesson buttons reserve the bottom safe area", () => {
  const rules = [
    /:root\[data-compact="true"\] \.sidebar\s*\{[^}]*height:\s*calc\(75px \+ env\(safe-area-inset-bottom, 0px\)\)/,
    /:root\[data-compact="true"\] \.shell\s*\{[^}]*padding-bottom:\s*calc\(75px \+ env\(safe-area-inset-bottom, 0px\)\)/,
    /:root\[data-compact="true"\] \.lesson-bottom\s*\{[^}]*padding-bottom:\s*calc\(15px \+ env\(safe-area-inset-bottom, 0px\)\)/,
  ];
  for (const rule of rules) assert.match(css, rule);
});
