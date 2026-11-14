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
const previous = Object.fromEntries(
  Object.entries(metadata)
    .filter(([, info]) => info.previous != null)
    .map(([key, info]) => [key, info.previous]),
);
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
}
function numericPattern(values) {
  const buckets = new Map();
  for (const value of [...new Set(values)].sort((a, b) => a - b)) {
    const tens = Math.floor(value / 10), ones = value % 10;
    if (!buckets.has(tens)) buckets.set(tens, []);
    buckets.get(tens).push(ones);
  }
  const parts = [];
  for (const [tens, ones] of buckets) {
    const first = ones[0], last = ones[ones.length - 1];
    const contiguous = ones.every((value, index) => index === 0 || value === ones[index - 1] + 1);
    if (contiguous && ones.length >= 2) {
      if (tens === 0) parts.push("[" + first + "-" + last + "]");
      else parts.push(String(tens) + "[" + first + "-" + last + "]");
    } else {
      for (const one of ones) parts.push(String(tens * 10 + one));
    }
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
    if (/^\d+$/.test(lesson)) group.numeric.push(Number(lesson));
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
const template = fs.readFileSync("scripts/firestore.rules.template", "utf8");
fs.writeFileSync(
  "firestore.rules",
  template
    .replace("/* CATALOG */", catalogExpression)
    .replace("/* PREVIOUS */", JSON.stringify(previous))
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
