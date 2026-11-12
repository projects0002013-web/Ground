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
// Only evaluate the requested course's catalog entries in Firestore Rules.
// The unpartitioned 78-activity map exceeds the emulator's 1000-expression budget
// for transactions that update a user profile and an attempt together.
const catalogGroups = {};
for (const [key, value] of Object.entries(metadata)) {
  const prefix = key.split(":")[0];
  (catalogGroups[prefix] ??= {})[key] = value;
}
const catalogExpression = Object.entries(catalogGroups)
  .map(([prefix, entries]) =>
    "key.matches('^" + prefix + ":') ? (" + JSON.stringify(entries, null, 2) + ").get(key, null) : "
  ).join("") + "null";
const template = fs.readFileSync("scripts/firestore.rules.template", "utf8");
fs.writeFileSync(
  "firestore.rules",
  template
    .replace("/* CATALOG */", catalogExpression)
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
    ),
);
