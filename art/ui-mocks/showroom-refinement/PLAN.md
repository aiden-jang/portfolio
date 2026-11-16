# Showroom refinement

A browser mock for the whole portfolio, preserving its car-led identity. The primary
visitor is a hiring team evaluating Aiden for software engineering roles. The visitor
mode is Experience: the car and actual software lead, with quiet navigation around them.

## Design decision

Make the work feel as carefully presented as the car. Preserve the open showroom,
Geist, charcoal and ivory, the real garage, the existing factual copy and approved
application captures. Give each section a clear focal point and reduce the surrounding
visual noise. This extends the current visual world.

The initial idea was to use the same split layout for both featured projects. That
would make a long scroll feel repetitive. The mock reverses Iodine's desktop layout,
while keeping a consistent text-first order on phones. Supporting projects use images
above their descriptions so they can be scanned visually without competing with the
two featured projects. Their preview frames share a 2:1 ratio with crops focused on the app interaction; opening a screenshot shows the complete image.

## Working tokens

| Role            | Value     |
| --------------- | --------- |
| Showroom / page | `#101014` |
| Controls        | `#17171c` |
| Hover surface   | `#24242c` |
| Main text       | `#e8e8e6` |
| Secondary text  | `#aaaab3` |
| Control edge    | `#45454f` |

The car supplies the color; project imagery supplies variety. Geist remains the only
interface typeface. Geist Mono is reserved for actual code or keyboard instructions.
Desktop type roles: name 72–152px, section headings 40–64px, project names 28–38px,
body 15–17px, secondary details 12–14px. The existing oversized name is a deliberate
exception to the general display-size ceiling because it belongs to this showroom.

A shared 1280px content width aligns the header, showroom introduction, reading sections
and Contact. Desktop sections have 112px vertical breathing room; mobile uses 116px above headings to clear the fixed navigation, and 88px below.
Controls keep 44px targets, 8px corners and visible focus. Screenshots use 12px corners, with no extra image mat or artificial browser frame.
Featured images use deliberate globe and editor crops, with complete captures available through inspection. Supporting previews use uniform
2:1 frames; crops can differ by app, and the screenshot viewer preserves every pixel.

## Proposed work by surface

| Surface           | Proposed polish                                                                                          | Reason                                                   |
| ----------------- | -------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| Opening           | Keep the existing camera and full car; slightly reduce the name and loosen its tracking                  | A composed opening with room for the silhouette          |
| Garage            | Opaque dock, clearer grouping, larger chooser labels and consistent spacing                              | Easier to explore without adding scenery                 |
| Experience        | Remove section numbering, enlarge outcomes and descriptions, align roles and evidence                    | Hiring teams can read the engineering proof quickly      |
| Featured projects | Everythingisfine first, Iodine second; large image beside a narrow text column, alternating sides        | Each project gets a deliberate presentation              |
| Iodine            | Keep contributor attribution and case study; omit the additional three-panel explainer from the overview | Avoid repeating detail before someone chooses to read it |
| Other projects    | Seven image-led entries with consistent preview frames; two columns on desktop, one on phones            | Show the range without giving every app featured weight  |
| Project browsing  | Quiet underline filters, remove sticky toolbar, retain jump selector                                     | Less fixed chrome around the work                        |
| Case studies      | Wider reading surface, readable labels, simpler engineering diagrams                                     | Carry the same finish into the details                   |
| About             | Heading and personal facts on the left, prose on the right                                               | A calm pause before Contact                              |
| Contact           | Keep the newly approved fixed-car composition, Privacy and credits                                       | A clear closing action                                   |
| Motion            | Keep the showroom interaction and case-study transition; remove repeated text entrances                  | Focus motion on the memorable artifact and user actions  |

Desktop structure:

```text
name + introduction
              full interactive car
                   garage dock

roles                  engineering outcomes

Selected work          filters / jump
project copy           large screenshot
large screenshot       iodine contribution copy

image                  image
project + links        project + links

About + facts          personal prose

contact copy           fixed car
```

Phone structure:

```text
name + introduction
interactive car
garage dock

roles
engineering outcomes

Selected work
project copy
large screenshot
(repeat for iodine)

image
project + links
(repeat for supporting projects)

About + prose + facts
contact copy
fixed car
```

## Implementation status

The main portfolio uses the subsequent approved full-width featured project
presentation, with Experience between the featured and supporting projects. This
isolated mock preserves the earlier split layout as an archived design reference. Set `PORTFOLIO_MOCK_ROUTE=/` when running the capture
helper to review the main app; those captures are saved under the `production` folder.

## Review and implementation plan

1. Review the full mock at desktop and phone sizes, including the garage and case studies.
2. Agree on the featured-project composition and the amount of supporting detail.
3. Apply approved layout and type changes to source components in focused steps; replace
   prototype-only suppression with deliberate component changes where appropriate.
4. Check keyboard flow, reduced motion, contrast, loading failures and responsive layouts;
   keep screenshot geometry, shared links, project filters and the garage functioning.
5. Compare production before/after captures, then run the repository verification gates.

The prototype reuses the production React app and garage rather than recreating their
behavior. It adds scoped styles only. No package, model asset or production entry point
is changed. Reusing the existing lazy scene and selectors preserves the current React
loading and rendering boundaries; performance improvements require measurements before
implementation.

## How to review

Run `npm run dev`, then open `/art/ui-mocks/showroom-refinement/review.html`.
The review frame switches between the current site and proposal and offers desktop and
390px phone sizes. Open `/art/ui-mocks/showroom-refinement/` directly for the full-width mock.
The gallery still contains all nine projects; mrrp and worth remain supporting projects.

To regenerate browser captures against the local server:

```sh
PORTFOLIO_MOCK_URL=http://127.0.0.1:5190 node art/ui-mocks/showroom-refinement/capture.mjs
```

`PORTFOLIO_MOCK_BROWSER=webkit` repeats the capture with WebKit. Generated PNGs belong in
`art/ui-qa/showroom-refinement/<browser>/` and are intentionally not committed. Browser emulation
checks layout and interaction, but does not establish physical-phone compatibility.

Reference for the interaction review: [Web Interface Guidelines](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md).

The design scan flagged Geist as a common font. It is intentionally retained because
the brief explicitly preserves the existing typography.

## Validation

Repository verification passed. The existing project-layout regressions passed in
Chromium and WebKit. The mock capture flow checked desktop and phone layouts, equal
supporting preview frames, project order, all nine entries, case-study opening,
screenshot opening, Escape, focus restoration and overflow at intermediate widths.
Generated before/after captures support visual review. No physical device was available.
