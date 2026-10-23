# Quality checks

Use Node.js 22.22.2 or newer in the Node 22 line, matching CI and the DOM test
runtime. Install dependencies with `npm ci`.

## Automatic verification

```sh
npm run verify
```

This runs typechecking, lint, formatting, repository checks, unit and DOM tests,
and a production build. TypeScript rejects unused locals and parameters. The
repository checks cover source size, comments, documentation links and headings,
public asset references, and consistent search metadata. The unit test floor
prevents a partial or accidentally skipped suite from looking complete.

## Browser and accessibility regressions

Install the matching browser builds once, and again after updating Playwright:

```sh
npx playwright install chromium webkit
npm run test:browser
```

The browser suite builds the application and starts an isolated production preview
on port 4175. It refuses to reuse another server, so development mode or a stale
build cannot silently stand in for the current source. CI runs this suite after
`npm run verify` and installs the browser system dependencies on its runner.

The suite checks desktop and phone layouts in Chromium and WebKit. It exercises
navigation, screenshot inspection, case studies, credits, keyboard focus and
scroll restoration, cold shared links, and a delayed effects download. Phone
checks enable touch input. A screenshot pixel check verifies that the default car
actually renders; it excludes the paint controls so those cannot disguise a blank
canvas. A reflection check guards against dark halos cutting into the floor glow
beside bright headlights. Garage checks cover retired shared links, curated picker
focus and wrapping, numbered selection, reloads and a visible clean-capture scene. The clock is fixed for consistent studio lighting.

Axe checks WCAG A and AA rules on the page and open dialogs. The tests use the real
models, images and interface. Local telemetry endpoints are stubbed because they
are unrelated to the portfolio's interactions.

For a focused run:

```sh
npm run test:browser -- --project=webkit
```

Failed browser tests retain screenshots, context and traces in `test-results/`.
Use the trace path printed in the failure output with `npx playwright show-trace`.
Generated browser output is ignored by Git and repository source scans.

## Visual and device review

Passing automation does not establish visual quality or physical-device behavior.
Inspect the changed surfaces at desktop, tablet and narrow-phone widths, including
short viewports. Review readable copy, control targets, fixed navigation, loading
and failure states, reduced motion and the Contact arrival. Keep useful evidence
in `art/ui-qa/` and label historical reviews as evidence of their own revision.

WebKit is an engine check; it does not replace testing Safari on a physical iPhone.
Screen-reader audio, touch gestures and actual device performance still require
manual checks. Record unavailable checks explicitly rather than treating them as
passed.
