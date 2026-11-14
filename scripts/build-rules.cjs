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
// Firestore Rules have a 1000-expression evaluation budget. A literal
// object with every activity and all metadata fields exceeds it when the
// profile and attempt documents are committed atomically. Group activities
// that share reward/validation metadata and match compact key patterns.
const groups = new Map();
const previous = {};
for (const [key, info] of Object.entries(metadata)) {
  const compact = {
    xp: info.xp,
    genes: info.genes,
    total: info.total,
    version: info.version,
    kind: info.kind,
  };
  const signature = JSON.stringify(compact);
  if (!groups.has(signature)) groups.set(signature, []);
  groups.get(signature).push(key);
  if (info.previous != null) previous[key] = info.previous;
}
const catalogExpression = [...groups]
  .map(([info, keys]) => {
    const pattern = "^(?:" + keys.join("|") + ")$";
    return "key.matches(" + JSON.stringify(pattern) + ") ? " + info + " : ";
  })
  .join("") + "null";
const previousExpression = JSON.stringify(previous);
const template = fs.readFileSync("scripts/firestore.rules.template", "utf8");
fs.writeFileSync(
  "firestore.rules",
  template
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
    ),
);
