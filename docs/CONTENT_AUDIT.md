# GROUND curriculum quality audit

The read-only audit examines the published question data without changing course IDs, answers, progress versions, Firebase rules or user data.

Run from the repository root:

```sh
npm run audit:content
npm run audit:content -- --json
```

It reports counts by course and flags:
- Missing question text, answer options, valid correct answer index or explanation (errors; exit code 1).
- Repeated option text and identical question stems within a course (manual review; does not fail the command).

Repeated questions may be intentional revision; review findings before editing. A passing structural audit is **not** proof that the scientific facts or answer keys are correct. A subject-matter reviewer should compare a sample of original source PDFs with interactive questions and explanations before release.

Do not renumber existing lessons, rewrite source PDFs, or change course progress versions merely to clean warnings. Any actual curriculum correction should have targeted tests and preserve the learner's previously earned progress.
