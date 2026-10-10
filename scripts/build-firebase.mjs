import { build } from "esbuild";
await build({
  entryPoints: ["scripts/firebase-sdk-entry.mjs"],
  outfile: "js/firebase-sdk.js",
  bundle: true,
  format: "esm",
  target: "es2020",
  minify: true,
  legalComments: "linked",
});
