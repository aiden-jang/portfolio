# Contributing

Use Node.js 22.22.2 or newer in the Node 22 line and install dependencies with
`npm ci`. Run `npm run dev` for the local site. Read [the architecture](docs/architecture.md) and
[repository conventions](CONVENTIONS.md) before changing behavior.

Keep changes focused. Preserve keyboard access, reduced motion, model credits,
shared URLs and browser history. UI changes should include desktop and mobile
browser checks; explain any verification limits in the pull request.
[Quality checks](docs/quality.md) covers automated browser setup and coverage.

Run `npm run verify` and `npm run test:browser` before opening a pull request.
Add regression coverage for behavior changes where tests can meaningfully detect the failure. Do not update
screenshots, generated artifacts or the résumé unless the change calls for it.

Use Conventional Commits without an app name or scope, for example:

```text
fix: restore focus after closing screenshots
refactor: separate scene URL synchronization
```

Describe the problem, the resulting behavior and validation in the pull request.
For bugs, include reproduction steps and browser/device details. Do not put
credentials or private information in public issues.

## Browser review

Serve the production build with `npm run build` and `npm run preview` when checking
bundling, loading or responsive styling. Review desktop, tablet and narrow-phone
widths; viewport emulation does not establish physical-phone compatibility.

- Scroll through every section and check text, fixed navigation and car visibility.
- Select and filter projects, open case studies, inspect screenshots, and use Back
  and Forward with a shared case-study URL.
- Check keyboard navigation, dialog focus restoration and background scroll locking.
- Try car selection, paint, lighting and shared garage URLs in a fresh tab.
- Check reduced motion, loading failures, attribution and contact actions.

Record relevant evidence and unavailable browser/device checks in the change description.
Keep generated captures local or in temporary CI artifacts; [quality checks](docs/quality.md)
describes the review workflow.

## Deployment and search updates

Run `npm run verify` before publishing. After a production deployment, confirm the
Vercel build succeeded and inspect the live homepage, a shared project URL and a
shared garage URL. Check that icons, screenshots and models load from production.
CI verification and a Vercel deployment are separate results.

Search metadata lives in `index.html`; crawler discovery files live in
`public/robots.txt` and `public/sitemap.xml`. Keep their canonical hostname aligned
with `https://www.aidenjang.com/`. Employer details stay visible to visitors but
carry `data-nosnippet` in both the initial HTML and rendered content. Preserve that
attribute when editing About, Experience or employer labels in case studies.

After deploying metadata changes, use Google Search Console's URL Inspection tool
to test the live homepage and request indexing. Search results reflect Google's
last crawl, and Google chooses the displayed title, description and site name.
