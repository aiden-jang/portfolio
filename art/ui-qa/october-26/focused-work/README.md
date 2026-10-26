# Selected work and startup review

Graphics baseline: `bb3f13a`. This pass features everythingisfine, mrrp and worth,
keeps the remaining projects and screenshot links available, and adds verified
engineering flows for everythingisfine and Accounts. Their case studies include
failure handling, tradeoffs and links to the public source repositories.

## Startup and rendering

The effects graph now uses the existing scene renderer directly. Its HDR bloom,
ACES tone mapping, SMAA and single-sample targets retain their settings and order.
The original floor gradient is baked into a lossless PNG; its generator checks
every decoded RGBA value before writing the asset. Car model files, geometry and
texture resolution were not changed.

Instrumentation observed two WebGL contexts and one 2D canvas before the change,
then one WebGL context and no 2D canvas afterward. The existing delayed-effects
regression caught the redundant contexts before the fix. The texture-reference
guard also rejected a temporary missing asset. The glow encoder rejected a
temporary colored gradient rather than silently discarding its color; the original
gradient was restored and regenerated.

Exploratory runs used native clocks, a touch-enabled 390 × 844 viewport at DPR 2,
4× CPU slowdown, 150 ms latency and 200,000 bytes/s download throughput. These
were local uncompressed previews with a warmed desktop graphics driver. Their
timings do not establish a percentage speedup or actual phone responsiveness.
The recorded after sample used the unoptimized PNG encoding of the same pixels;
the final asset uses the verified lossless grayscale encoding.

Clean car captures were compared at desktop and phone widths in both lighting
modes. Dusk captures were almost identical; Night captures had small differences,
with mean channel differences below one level on the 0–255 scale. Paint, lamps,
reflections and silhouette were visually reviewed. These captures do not establish
frame pacing or eliminate the need for cold-start device testing.

## Content and layout

Both engineering flows were checked in Chromium at desktop, phone and narrow-phone
widths, and in WebKit at desktop and phone widths. Their cards fit within the
dialogs, the source links point to the corresponding repositories, and the compact
gallery retains bloomnote’s screenshot states.

Navigation refreshes view eligibility after the first frame and font readiness,
as well as section resizing. Deterministic DOM checks reproduced controls staying
hidden after position-only layout settling, and passed after the fix. An
intermittent Chromium picker failure was not reproduced in fresh-load probing;
its exact trigger remains unconfirmed.

Complete repository verification and the final Chromium and WebKit regression
run passed. Whole-test retries remained disabled.

- [Desktop system flow and failure handling](desktop-system-flow.png)
- [Phone system flow](phone-system-flow.png)
- [Phone failure notes](phone-failure-notes.png)
- [Phone selected work](phone-selected-work.png)
- [Recorded measurements](measurements.json)

The [visitor walkthrough](../../../../docs/visitor-review.md) is prepared, with
observations marked untested. Physical iPhone and Android checks, screen-reader
audio and fresh-visitor sessions were not conducted.
