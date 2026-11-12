/* Generate canonical reward bounds from the same published lesson catalog. */
const fs = require("node:fs");
const catalog = require("../js/cloud-catalog.js").buildCatalog();
const metadata = Object.fromEntries(
  Object.values(catalog.activities).map((a) => [
    a.key,
    {
      xp: a.rewardXP,
      genes: a.rewardGenes,
      total: a.questions.length,
      version: a.version,
      kind: a.kind,
      previous: a.previous,
    },
  ]),
);
for (const course of ["7", "8", "9", "10", "11", "ent", "olympiad"])
  metadata[course + ":practice"] = {
    xp: 0,
    genes: 0,
    total: 12,
    version: 1,
    kind: "practice",
    previous: null,
  };
// Group activities by their exact reward and validation metadata to avoid
// evaluating one large per-lesson map on every Firestore transaction.
const variants = new Map();
const previousEntries = {};
for (const [key, info] of Object.entries(metadata)) {
  const variant = JSON.stringify({ xp: info.xp, genes: info.genes, total: info.total, version: info.version, kind: info.kind });
  if (!variants.has(variant)) variants.set(variant, []);
  variants.get(variant).push(key);
  if (info.previous != null) previousEntries[key] = info.previous;
}
const catalogExpression = [...variants].map(([value, keys]) =>
  "key in " + JSON.stringify(keys) + " ? " + value + " : "
).join("") + "null";
const previousExpression = JSON.stringify(previousEntries);
const template = fs.readFileSync("scripts/firestore.rules.template", "utf8");
const generated = template
    .replace("/* CATALOG */", catalogExpression)
    .replace("/* PREVIOUS */", previousExpression)
    .replace("/* VERSIONS */", JSON.stringify(catalog.versions))
    .replace(
      "/* OBSOLETE_KEYS */",
      Object.entries(catalog.versions)
        .map(
          ([course, version]) =>
            `(versions.get(${JSON.stringify(course)}, 1) == ${version} ? [] : ${JSON.stringify(Object.keys(catalog.activities).filter((key) => key.startsWith(course + ":")))})`,
        )
        .join(".concat(") +
        ")".repeat(Object.keys(catalog.versions).length - 1),
    );
if (process.argv.includes("--check")) {
  if (fs.readFileSync("firestore.rules", "utf8") !== generated) {
    console.error("firestore.rules is out of date; run npm run build:rules.");
    process.exitCode = 1;
  }
} else fs.writeFileSync("firestore.rules", generated);
