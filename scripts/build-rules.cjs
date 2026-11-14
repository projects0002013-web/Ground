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
function numericPattern(values) {
  const sorted = [...new Set(values)].sort((a, b) => a - b);
  const parts = [];
  for (let i = 0; i < sorted.length;) {
    let end = i;
    while (end + 1 < sorted.length && sorted[end + 1] === sorted[end] + 1) end++;
    const first = sorted[i], last = sorted[end];
    if (first === 1 && last === 9) parts.push("[1-9]");
    else if (Math.floor(first / 10) === Math.floor(last / 10) && last - first >= 2)
      parts.push(String(Math.floor(first / 10)) + "[" + (first % 10) + "-" + (last % 10) + "]");
    else if (last - first >= 2) parts.push("[" + first + "-" + last + "]");
    else for (let n = first; n <= last; n++) parts.push(String(n));
    i = end + 1;
  }
  return parts.length === 1 ? parts[0] : "(?:" + parts.join("|") + ")";
}
function keyPattern(keys) {
  const byCourse = new Map();
  for (const key of keys) {
    const separator = key.indexOf(":");
    const course = key.slice(0, separator);
    const lesson = key.slice(separator + 1);
    if (!byCourse.has(course)) byCourse.set(course, { numeric: [], literal: [] });
    const group = byCourse.get(course);
    if (/^\\d+$/.test(lesson)) group.numeric.push(Number(lesson));
    else group.literal.push(lesson);
  }
  const courses = [];
  for (const [course, group] of byCourse) {
    const lessons = [];
    if (group.numeric.length) lessons.push(numericPattern(group.numeric));
    lessons.push(...group.literal);
    courses.push(course + ":" + (lessons.length === 1 ? lessons[0] : "(?:" + lessons.join("|") + ")"));
  }
  return "^(?:" + courses.join("|") + ")$";
}
const catalogExpression = [...groups]
  .map(([info, keys]) =>
    "key.matches(" + JSON.stringify(keyPattern(keys)) + ") ? " + info + " : "
  )
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
