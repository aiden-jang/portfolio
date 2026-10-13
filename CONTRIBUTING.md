# Contributing

Use Node.js 22 and install dependencies with `npm ci`. Run `npm run dev` for the
local site. Read [the architecture](docs/architecture.md) and
[repository conventions](CONVENTIONS.md) before changing behavior.

Keep changes focused. Preserve keyboard access, reduced motion, model credits,
shared URLs and browser history. UI changes should include desktop and mobile
browser checks; explain any verification limits in the pull request.

Run `npm run verify` before opening a pull request. Add regression coverage for
behavior changes where tests can meaningfully detect the failure. Do not update
screenshots, generated artifacts or the résumé unless the change calls for it.

Use Conventional Commits without an app name or scope, for example:

```text
fix: restore focus after closing screenshots
refactor: separate scene URL synchronization
```

Describe the problem, the resulting behavior and validation in the pull request.
For bugs, include reproduction steps and browser/device details. Do not put
credentials or private information in public issues.
