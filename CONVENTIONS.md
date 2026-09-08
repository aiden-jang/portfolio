# Working in portfolio

How this repo expects to be worked in. Personal working style (commits, planning,
how to explain things) lives in the global `~/.claude/CLAUDE.md`.

The sections below are engineering standards that apply to any codebase, plus the checks this
repo actually runs.

## The checks this repo has

`npm run verify` is the whole gate, and CI runs exactly that. Vercel builds and deploys on its
own, so CI never deploys. Beyond typecheck, lint, format and build:

- **check-size** pins a line ceiling per sprawl-prone file and rejects any unlisted file over
  300 lines. Ceilings only move down: shrink a file, lower its number in the same commit. It
  also fails when a ceiling sits well above the real count, so one cannot drift into meaning
  nothing.
- **check-comments** enforces the two comment rules below that a script can judge: no block over
  four lines, and no ticket ids. Test files are out of scope, since a test comment explains why
  the test exists.
- **check-tests** runs the suite and holds it to a floor. A green run is not a full run: one
  `describe.skip` leaves vitest exiting 0 having quietly run fewer tests than yesterday. Floors
  only move up.

They scan `.ts`, `.tsx`, `.mjs` and `.js`, so they cover the config files and their own source.
`format:check` is in the gate because it was already a script that nothing ran, and
`src/ui/marks.tsx` had drifted out of format unnoticed.

The one script sharing a name with an npm builtin is `test`. `npm run test` was confirmed to
execute the suite rather than being shadowed, which is the only reason it keeps that name.

## What the tests are for

The suite is unit-only and covers the pure logic: angle interpolation, the auto-fit and
body-material detection in `carHelpers`, permalink building, and the data invariants in
`config.ts` and `workItems.ts`. Three of those exist because a comment claimed something no
check enforced. The `CARS` arrival budget is the clearest: index 0 and its two neighbours all
download on a first visit, and the test fails if a heavy model lands in one of those slots.

Whether a comment earns its place is not automated, and "never explain what the code used to do"
is not either: "used to" is ambiguous in English. `// Only used to size the draining bar` is
present-tense and fine, `// Each game used to start with a clean slate` is a changelog. A check
cannot tell them apart, and one that cries wolf gets ignored. Read them instead.

## Do not trust your own measurements

Most false statements come from scans that measured nothing, not from misreading code. Real cases:
a glob with `{src,test}` braces matched zero files, so a coverage sweep compared against an empty
string and called every module untested; a `cd` inside a backgrounded command did not apply, so
three "stability runs" ran nothing; a coverage tool reported 0% because it could not instrument the
runtime; a script name silently resolved to an npm builtin, so a check reported green for a day
without ever executing.

So: an impossibly clean result means suspect the scan first. And **green is not proof unless you
have seen that check fail** — break the thing it guards, watch it go red, then believe it.

## Writing a new check

- It has to cover its own source, or the checks stop being checked.
- It has to cover every place the failure can appear, not just where you first saw it.
- Exclude test files from source scans: tests mount throwaway routes and declare throwaway types.
- Prove it fails before trusting it, and prove a failure leaves the tree clean.
- Always `npm run <name>`, and check a new script name is not an npm builtin. A script called
  `docs` is shadowed by npm's own `docs`, which exits 0 without running anything.

## Numbers in prose

Do not write live counts into docs: test totals, check totals, file lengths. Nothing verifies them
and they go stale silently. Say what a thing is and let the check print the number. Describing a
past change is different, and fine.

## Comments

- No comment block over four lines. If one seems necessary, ask.
- Never explain a refactor, or what the code used to do. A reader never saw that version.
- A comment that logs successive changes is a changelog. Git has it, and the log drifts out of step
  with the value it describes.
- After moving code, re-read every comment near the seam. A move strands them on the wrong function.
- Never raise a comment budget to fit prose. Trim instead — no script can enforce that about itself.
