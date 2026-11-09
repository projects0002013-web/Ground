"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

function authHarness() {
  const window = {
    GroundFirebaseConfig: {
      firebase: {
        apiKey: "public-test-key",
        authDomain: "demo-ground.firebaseapp.com",
        projectId: "demo-ground",
        appId: "public-test-app",
      },
    },
  };
  const source = fs.readFileSync(path.join(__dirname, "../js/auth.js"), "utf8");
  vm.runInNewContext(source, { window }, { filename: "auth.js" });
  return window.GroundAuth;
}

test("auth detects missing Firebase public configuration before attempting sign-in", () => {
  const auth = authHarness();
  assert.equal(auth.configured(), true);
});

test("auth reports the required Firebase authorized-domain action", () => {
  const auth = authHarness();
  const message = auth.errorText({ code: "auth/unauthorized-domain" });
  assert.match(message, /Authorized domains/);
  assert.match(message, /projects0002013-web\.github\.io/);
});

test("auth distinguishes popup closure from Google provider configuration", () => {
  const auth = authHarness();
  assert.match(auth.errorText({ code: "auth/popup-closed-by-user" }), /закрылось/);
  assert.match(auth.errorText({ code: "auth/operation-not-allowed" }), /Sign-in method/);
});

test("unknown Firebase auth errors remain diagnosable without exposing details", () => {
  const auth = authHarness();
  assert.match(auth.errorText({ code: "auth/custom-unknown" }), /auth\/custom-unknown/);
  assert.doesNotMatch(auth.errorText({ code: "auth/custom-unknown", message: "secret" }), /secret/);
  assert.match(auth.errorText(null), /Не удалось войти/);
});
