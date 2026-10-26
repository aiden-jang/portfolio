# Car resource and phone loading review

Baseline: `ecf152b`. This pass releases decoded images when a loaded car retires,
deduplicates disposal of shared model resources, limits speculative downloads to
reported fast connections without data saving, and keeps shader diagnostics in
development. Car files, fitting, materials, lights, reflections and display
resolution are unchanged.

## Browser observations

An isolated Chromium browser used a touch-enabled 390 × 844 viewport at DPR 2.
The switching sequence was F40 → Corvette → F40 → Corvette → F40 → Miata → F40.
Instrumentation counted image creation and unique image closes, along with GPU
texture creation and deletion. Each sample followed the selected model's response
completion and loading feedback clearing.

Before the fix, none of the retired cars' decoded images were explicitly closed.
After the fix, every retired bitmap was closed: the final F40 had 25 open images,
with the other 126 closed. GPU texture counts returned to the same F40 baseline.
These are lifecycle counts, not measurements of native image memory in bytes.
JavaScript heap measurements cannot establish how much bitmap memory was freed.
The baseline switching run used a fixed Playwright clock; its timing was discarded.
The final run used the browser's native clock.

Production startup made no shader-log reads after the change, compared with 81
in the instrumented baseline. Shader compilation and texture uploads still run;
skipping diagnostic reads does not remove their cost.

Separate fresh contexts exercised missing connection information, data saving and
a reported fast connection. Over six seconds after the first car became ready,
the first two downloaded only the selected F40. The fast connection additionally
warmed the small Mercedes model. No page errors occurred in these checks.

Repository verification and the complete Chromium and WebKit regression suite
passed. Whole-test retries remained disabled.

- [Recorded measurements](measurements.json)
- [Phone rendering after repeated switching](phone-after-switching.png)
- [Three.js texture and ImageBitmap disposal guidance](https://threejs.org/manual/pages/how-to-dispose-of-objects.html)
- [Three.js renderer diagnostic settings](https://threejs.org/docs/pages/WebGLRenderer.html#debug)

## Limits and remaining device review

Exploratory cold-start runs used 4× CPU slowdown, 150 ms network latency and
200,000 bytes/s download throughput against the local production preview. That
preview serves uncompressed JavaScript and is not the production CDN. Native
event timing still showed a delayed Menu interaction and long main-thread tasks.
Startup timing varied materially between runs; this review makes no percentage
speedup claim and does not mark cold-start responsiveness solved.

The screenshot was reviewed for the visible car, finish, lamps, reflection and
phone controls. It does not establish frame pacing on a physical phone. Physical
iPhone and Android testing, screen-reader audio and field performance were not
available. Repeat the first load, Menu interaction and car switching on those
devices before treating mobile performance as fully verified.
