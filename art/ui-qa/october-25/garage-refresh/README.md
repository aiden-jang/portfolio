# Garage refresh review

Chrome review of the production build with the selected Corvette export and
Titanium Silver R35. The picker keeps the R35, adds the Corvette, and retires the
Countach, A80 Supra and Aventador while retaining their original shared identities.

- `corvette-source-comparison.jpg`: original GLB on the left, optimized asset on
  the right, under the same fixed portfolio camera and Dusk lighting. Compared
  decals, body surfaces, cockpit, wheels, tires and aero details.
- `optimized-desktop.jpg`: optimized Corvette in clean capture mode.
- `r35-silver.jpg`: R35 default paint in clean capture mode. Body paint changes
  independently of wheels, carbon, glass and trim.
- `garage-pair.jpg`: picker previews, with the silver R35 on the left and the
  yellow Corvette on the right.
- `corvette-phone.jpg`: normal phone layout with the fixed-livery controls.
- `corvette-tablet.jpg`: normal tablet layout and car framing.
- `r35-phone.jpg`: phone layout with the new default paint label.
- `picker-phone.jpg`: visible selection, thumbnails and the revised garage.
- `fidelity.json`: decoded geometry, hierarchy, material and texture comparison
  against the downloaded original, plus decoded glTF validation results.

The Corvette keeps all source triangles, exact vertex attributes, material
parameters and texture dimensions. Near-lossless WebP bounds measured RGB changes
to 2/255 and preserves alpha exactly. This is high-quality texture compression,
not a claim of pixel-identical textures. Original images remain when compression
would not be smaller or would violate those bounds. The optional model remains a
substantial download and is excluded from arrival prefetching.

Viewport emulation does not establish physical-phone compatibility.

The repository verification gate passed. Browser cases were exercised in headed
Chromium and WebKit. The broad WebKit navigation cases exceeded their total
runtime budget with diagnostic tracing enabled on this Mac, then passed with
tracing off and their original assertions, accessibility scans, screenshot checks
and time limits intact. CI configuration and assertions were not relaxed.
