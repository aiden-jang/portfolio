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
checks enable touch input. The navigation cases exercise normal-motion case studies
and screenshot viewers as well as reduced-motion page navigation. They also check
the compact All controls entry, contextual camera reset, stable dock placement and
access to setup sharing. Unit checks cover a held manual camera angle and model
hit testing that rejects empty space and hidden geometry. Phone chrome checks cover
menu-only section navigation, touch dismissal without keyboard hints, visible
sharing feedback and a deliberately held next-car
download at narrow widths so loading feedback must clear the header.
Contact composition checks keep the copy centered within the layout viewport at
desktop, phone and short-phone sizes, excluding any reserved scrollbar gutter.
They check header/footer clearance and keep email actions in view.
Screenshot pixels require the red car to remain visible outside the copy; visual
review checks readability over the softened car.
A screenshot pixel check verifies that the default car
actually renders; it excludes the paint controls so those cannot disguise a blank
canvas. Screenshot capture and pixel assertions retry together within their existing
budgets. Each capture attempt is bounded so a transient browser capture error can
recover; persistent capture errors or missing car pixels still fail. Whole-test
retries remain disabled. A reflection check guards against dark halos cutting into the floor glow
beside bright headlights. Garage checks cover retired shared links, curated picker
focus and wrapping, numbered selection, reloads and a visible clean-capture scene.
R35 selection and reload run separately from the multi-car navigation tour to
bound each test’s model-loading work without raising its timeout. The Countach check uses one model load per engine, resizing between phone and
desktop while checking shared paint, default restoration and picker focus. The
clock is fixed for consistent studio lighting. Car-detail checks load each supported
model once per engine, resize between phone and desktop, exercise keyboard
activation and reset on selection, and check that unrelated cars hide the controls.
Real-model unit fixtures check DRS isolation and restoration. The Supra keeps its
normal lighting without an interactive headlight control.

The delayed-effects case also counts successfully created graphics contexts:
startup must reuse the scene’s WebGL context and load the pre-rendered glow without
creating a 2D canvas. The same case still requires the car to render visibly.
Navigation unit checks cover initial position settling and delayed font layout
without requiring a resize or scroll to reveal the Intro controls.

The retired M1 check resizes one shared-link scene across desktop, tablet and phone
layouts, then checks picker exclusion, focus, fixed-livery links, reloads,
rejoining the curated garage and both creator credits.
Screenshot pixels require its red and blue Motorsport colors in both lighting modes.

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

Use the [first-visit walkthrough](visitor-review.md) to observe project discovery,
engineering explanations, résumé access and contact on actual phones. Its results
remain unverified until those sessions happen.

The [October resource and loading review](../art/ui-qa/october-26/resource-review/README.md)
records decoded-image cleanup, connection-aware optional downloads and production
shader diagnostics. Its throttled local runs identify remaining startup delays;
they do not replace physical-phone or field measurements.
