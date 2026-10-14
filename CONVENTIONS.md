# Repository conventions

`AGENTS.md` and `CLAUDE.md` link to this file so repository guidance has one source.
Development setup and commit conventions are in [CONTRIBUTING.md](CONTRIBUTING.md).

## Verification

Run `npm run verify` and `npm run test:browser` before reporting a change complete.
CI runs both. The verification gate covers:
typechecking, lint, formatting, repository checks, tests and a production build.
Vercel handles deployment separately.

- `check-size` pins ceilings for files that need size control and rejects oversized
  unlisted source files. Ceilings may decrease, never increase. After shrinking a
  tracked file, lower its ceiling in the same commit. Do not split files solely to
  satisfy a limit; give each module a coherent responsibility.
- `check-comments` checks source comments for oversized blocks and ticket IDs.
- `check-content` checks local documentation links, headings, public asset references
  and search metadata.
- `check-tests` requires the suite to meet its floor. Floors may increase, never
  decrease. A successful test process alone does not prove the complete suite ran.

Use `npm run <name>` for repository scripts. Confirm newly named scripts execute
the intended command rather than an npm builtin. Source checks must cover their
own implementation. Do not exclude files or weaken checks to make a change pass.

## Tests and evidence

Test behavior and invariants rather than restating implementation. For new checks,
introduce the failure they should detect, observe the check fail, restore the
source, then verify it passes. Confirm temporary mutations leave the tree clean.

Validate search results, file inventories and measurements before drawing
conclusions. An empty scan or implausibly clean result may indicate a bad glob,
wrong working directory or unavailable instrumentation.

Unit and DOM tests do not verify visual fidelity. Use browser checks for changed
layout, focus, history and interaction behavior, including desktop and mobile
widths where applicable. Report unavailable browsers or physical-device checks
as verification limits. Browser setup and regression coverage are documented in
[Quality checks](docs/quality.md).

## Comments and documentation

Keep comments that explain a non-obvious constraint or decision. Remove comments
that narrate obvious code, record successive revisions or explain what an older
implementation did. Re-read nearby comments after moving code.

Do not use comment blocks longer than four lines or ticket IDs in source comments.
If a longer block is necessary, ask before adding it. Test comments may explain
the scenario they exercise; the source comment scanner excludes test files.

Do not put live test totals, file lengths or check totals in prose documentation.
Let the verification tools report them. Documentation should describe the current
system; Git history records previous implementations.
