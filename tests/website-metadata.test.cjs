"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.join(__dirname, "..");

test("public homepage advertises the real canonical GitHub Pages URL", () => {
  const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
  const url = "https://projects0002013-web.github.io/Ground/";
  assert.ok(html.includes('<link rel="canonical" href="' + url + '" />'));
  assert.match(html, /<meta property="og:title"/);
  assert.match(html, /<meta property="og:description"/);
  assert.ok(html.includes('content="' + url + '"'));
  assert.match(html, /<meta name="description"/);
});

test("search metadata points only to public published routes", () => {
  const sitemap = fs.readFileSync(path.join(root, "sitemap.xml"), "utf8");
  const robots = fs.readFileSync(path.join(root, "robots.txt"), "utf8");
  assert.match(sitemap, /https:\/\/projects0002013-web\.github\.io\/Ground\//);
  assert.match(robots, /Sitemap: https:\/\/projects0002013-web\.github\.io\/Ground\/sitemap\.xml/);
  assert.doesNotMatch(sitemap, /(?:firebase|auth|private|token)/i);
});
