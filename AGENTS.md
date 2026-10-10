# Ground course content

The user supplies the lessons as files. Preserve this agreed structure when adding content:

- Grade 7 has exactly **13 numbered circles**, one uploaded lesson file per circle. Do not add an extra final-challenge circle or split a file's subsections into separate circles.
- Keep IDs 1–13 stable. Unprovided lessons remain `pending: true` with empty theory/questions and cannot start or unlock. Fill the matching existing slot when its file arrives; do not invent the remaining lesson topics.
- Circle 1 is **Экосистемы**, from `materials/grade7/lesson-01-ecosystems.pdf`: introduction, five sections, 25 oral/written self-check prompts, chapter summary, then the file's 40-question exam. The pass mark is 28/40. Self-check prompts are not included in the exam score. Keep the original PDF available to the learner.
- Do not carry completion of an unrelated old lesson into replacement content. Course progress versions handle the replacement while keeping XP, genes and other courses intact.
- These 13-circle requirements apply to grade 7. Do not change the other courses without a user request.

For lesson/data/player changes run `node --test tests/player.test.cjs` and relevant cases in `python3 tests/browser_smoke.py`. Preserve the learner's interface preference and progress.
