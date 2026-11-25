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
function compactMetadata(metadata) {
  const groups = new Map();
  const courses = new Map();
  for (const [key, value] of Object.entries(metadata)) {
    const { previous, ...info } = value;
    const signature = JSON.stringify(info);
    if (!groups.has(signature)) groups.set(signature, []);
    groups.get(signature).push(key);
    const course = key.split(":")[0];
    if (!courses.has(course)) courses.set(course, {});
    courses.get(course)[key] = previous;
  }
  const previous = [...courses].map(([course, entries]) =>
    `key.matches(${JSON.stringify("^" + course + ":.*$")}) ? ${JSON.stringify(entries)}.get(key, null) : `
  ).join("") + "null";
  const info = [...groups].map(([signature, keys]) =>
    `key.matches(${JSON.stringify("^(" + keys.join("|") + ")$")}) ? ${signature.slice(0, -1)},"previous":previous} : `
  ).join("") + "null";
  return `let previous = ${previous}; return ${info};`;
}
const template = fs.readFileSync("scripts/firestore.rules.template", "utf8");
fs.writeFileSync(
  "firestore.rules",
  template
    .replace("/* CATALOG */", compactMetadata(metadata))
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
