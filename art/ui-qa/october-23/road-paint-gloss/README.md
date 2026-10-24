# Road paint gloss review

Reviewed on October 23, 2026 in Chrome using production builds. Baseline commit
`2a7d090`; all clean comparisons use the same 1440 × 900 viewport, fixed camera,
curated default paint and dusk lighting.

[Comparisons](comparisons.jpg) pairs equal crops for the Miata, RWB, A80 Supra,
E30, Datsun 280Z, F40, 300 SL and M4 ADRO. The adjacent `before-` and `after-`
images retain the full captures. Their picker thumbnails use the revised renders.
[Phone Miata](phone-miata.jpg) shows the finish at 390 × 844 with night lighting;
[tablet RWB](tablet-rwb.jpg) checks the normal interface at 768 × 1024.

Each finish targets a verified body material name. Base roughness is capped at
0.24 with a full clearcoat; sharper authored coats are retained. The existing
Aventador and R35 profiles keep their settings. The GT3 already has sharp paint;
F1 racing finishes are unchanged. Colors, metalness, maps, geometry and all source
GLB files stay intact. Tires, wheels, glass, trim and carbon keep their authored
materials. The F40 remains red and the Miata keeps its authored pop-up headlights.

Real model tests verify body material discovery after framing, gloss, preservation
of color, maps and metalness, unchanged surrounding materials, and repeat-safe
application. Disabling the new finish dispatch fails the new regression cases;
restoring it passes. License evidence records the runtime adaptation separately
from source asset optimization.

Physical-device performance and screen-reader audio were not reviewed.
