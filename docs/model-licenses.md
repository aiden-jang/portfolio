# Car model licenses

The source code's MIT license does not cover the car assets. This review records
what each model's publisher licenses, plus any upstream notice supplied by that
publisher. The checked source URLs, creator identities and license URLs are in
[the evidence record](model-license-evidence.json). The review was checked on
October 20, 2026 using Sketchfab's public model API.

## Source licenses

| Car                  | Model creator                                                                     | Publisher license                                         | Review                                                             |
| -------------------- | --------------------------------------------------------------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------ |
| Ferrari F40          | [vecarz](https://sketchfab.com/3d-models/ee082e412b0a4b2090e8492117841e95)        | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) | Source license verified                                            |
| Mercedes-Benz 300 SL | [Lexyc16](https://sketchfab.com/3d-models/505241c829c540a4921533000736904e)       | CC BY 4.0                                                 | Source license verified                                            |
| Toyota Supra A80     | [Martin Trafas](https://sketchfab.com/3d-models/eb9bb1eb41db431cb078088ae1ce45f8) | CC BY 4.0                                                 | Source license verified                                            |
| Porsche 911 RWB      | [SWIZ](https://sketchfab.com/3d-models/9b13e93711db460b99749ae95aea9764)          | CC BY 4.0                                                 | Source license verified; retain the embedded SWIZ copyright notice |
| BMW M3 E30           | [Martin Trafas](https://sketchfab.com/3d-models/ac3c7013434e403e8faff87948caf422) | CC BY 4.0                                                 | Source license verified                                            |
| Datsun 280Z          | [Martin Trafas](https://sketchfab.com/3d-models/0789ab2ece9442de94b3c41595e0ecbd) | CC BY 4.0                                                 | Source license verified                                            |
| Lamborghini Countach | [Randomness](https://sketchfab.com/3d-models/2f02b54e01fc428e8b19759c5970f882)    | CC BY 4.0                                                 | Source license verified                                            |

CC BY permits sharing and modification, including commercial use, provided its
conditions are met. The Contact credits give the supplied model titles, authors,
source links and license links, and identify adaptations. Preserve those credits
when moving, modifying or reusing a model. Attribution metadata is embedded in each GLB.

## Adaptations and other rights

Web exports use compressed geometry and WebP textures, retaining full mesh detail.
The RWB uses its original full-mesh GLB export; no site mesh simplification is applied.
The M3 and Datsun use vertex reordering and lossless meshopt compression. Original
materials and attribution metadata are retained. Site lighting, framing and
optional paint colors are runtime adaptations. Thin glazing uses alpha transparency
in place of refraction for reliable browser rendering, retaining its authored tint
and existing alpha where present.

The Countach and Supra use Sketchfab's official glTF downloads. Each archive includes a
license.txt matching the creator, model source and CC BY 4.0 license shown in the
listing. Their exports retain the source geometry, floating-point vertex precision,
texture dimensions and decoded texture pixels. glTF Transform 4.4.1 and
meshoptimizer 0.25.0 reorder and losslessly compress geometry; Sharp encodes
lossless WebP textures. The source attribution and a web adaptation notice are
embedded in each GLB. Compare original and optimized renders as well as decoded
geometry when changing these settings.

The Countach source uses the legacy glTF specular/glossiness material workflow,
which the site's Three.js loader does not support. glTF Transform converts those
materials to modern specular/roughness materials before compression. Source
geometry and image detail remain intact; this material conversion is an adaptation,
not a promise of identical lighting across different renderers. The tire material
uses opaque rubber so partial alpha in its source diffuse map does not hide the
tread and sidewall. Bodywork uses glossy clear-coated paint instead of the converted
maximum-roughness surface. These are explicit material adaptations; no geometry,
UVs, texture pixels or attribution are removed.

Listing descriptions, displayed comments and archive notices were checked for
upstream credits or game extraction. Neither publisher declares an upstream source.
This establishes the supplied publisher license, not independent proof of authorship
or clearance of manufacturer rights. The evidence record retains the supplied
license text, archive hashes and creator IDs, including older profile aliases.
Asset optimization uses local, deterministic geometry and image tools.

The Porsche publisher identifies Porsche AG as the vehicle-design rights holder.
Creator licenses do not grant manufacturer affiliation, trademark rights or a
blanket clearance of vehicle designs. The site credits retain that distinction.

## Updating the review

Check the original model and any credited upstream sources, not just a free-download
label or an embedded metadata field. Record the publisher identity and exact
license URL in the evidence record, update the displayed credits, and preserve
original copyright notices. Recheck a replacement asset before publishing it.
