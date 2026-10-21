# Car model licenses

The source code's MIT license does not cover the car assets. This review records
what each model's publisher licenses, plus any upstream notice supplied by that
publisher. The checked source URLs, creator identities and license URLs are in
[the evidence record](model-license-evidence.json). The review was checked on
October 21, 2026 using Sketchfab's public model API.

## Source licenses

| Car                  | Model creator                                                                                                                                                                                                   | Publisher license                                         | Review                                                             |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------ |
| Ferrari F40          | [vecarz](https://sketchfab.com/3d-models/ee082e412b0a4b2090e8492117841e95)                                                                                                                                      | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) | Source license verified                                            |
| Mercedes-Benz 300 SL | [Lexyc16](https://sketchfab.com/3d-models/505241c829c540a4921533000736904e)                                                                                                                                     | CC BY 4.0                                                 | Source license verified                                            |
| Toyota Supra A80     | [Martin Trafas](https://sketchfab.com/3d-models/eb9bb1eb41db431cb078088ae1ce45f8)                                                                                                                               | CC BY 4.0                                                 | Source license verified                                            |
| Porsche 911 RWB      | [SWIZ](https://sketchfab.com/3d-models/9b13e93711db460b99749ae95aea9764)                                                                                                                                        | CC BY 4.0                                                 | Source license verified; retain the embedded SWIZ copyright notice |
| BMW M3 E30           | [Martin Trafas](https://sketchfab.com/3d-models/ac3c7013434e403e8faff87948caf422)                                                                                                                               | CC BY 4.0                                                 | Source license verified                                            |
| Datsun 280Z          | [Martin Trafas](https://sketchfab.com/3d-models/0789ab2ece9442de94b3c41595e0ecbd)                                                                                                                               | CC BY 4.0                                                 | Source license verified                                            |
| Audi R8              | [wallon](https://sketchfab.com/3d-models/e17e438f076f4427a58d93aa779edaed)                                                                                                                                      | CC BY 4.0                                                 | Source license verified                                            |
| Porsche 911 Turbo    | [Lexyc16](https://sketchfab.com/3d-models/de1ffd344c41481892511f7fd332c136)                                                                                                                                     | CC BY 4.0                                                 | Source license verified                                            |
| Porsche 917K         | [vecarz](https://sketchfab.com/3d-models/porsche-917k-lm-red-wwwvecarzcom-1b0f1751a3064ea1a015cdfceebf7918), based on [JUSTGAME](https://sketchfab.com/3d-models/porsche-917k-abb07de409db42178e3df943dd009103) | CC BY 4.0                                                 | Selected and credited upstream publisher licenses verified         |

CC BY permits sharing and modification, including commercial use, provided its
conditions are met. The Contact credits give the supplied model titles, authors,
source links and license links, and identify adaptations. Preserve those credits
when moving, modifying or reusing a model. Attribution metadata is embedded in each GLB.

## Adaptations and other rights

Web exports use compressed geometry and WebP textures, retaining full mesh detail.
The RWB uses its original full-mesh GLB export; no site mesh simplification is applied.
The M3 and Datsun use vertex reordering and lossless meshopt compression. Original
materials and attribution metadata are retained. Site lighting, framing, curated
paint defaults and optional paint colors are runtime adaptations. Thin glazing uses alpha transparency
in place of refraction for reliable browser rendering, retaining its authored tint
and existing alpha where present.

The R8, Supra A80, stock Porsche 930 and Porsche 917K use Sketchfab's official glTF downloads. Each archive includes a
license.txt matching the creator, model source and CC BY 4.0 license shown in the
listing. Their exports retain the source geometry, floating-point vertex precision,
texture dimensions and decoded texture pixels. glTF Transform 4.4.1 and
meshoptimizer 0.25.0 reorder and losslessly compress geometry; Sharp encodes
lossless WebP textures. The source attribution and a web adaptation notice are
embedded in each GLB. Compare original and optimized renders as well as decoded
geometry when changing these settings.

The R8 retains the author's PBR materials, clearcoat and amber-gold paint, including
separate tires, carbon fiber, glazing and lights. No material workflow conversion
or roughness changes are applied. It is a modified widebody exterior model.

The stock Porsche 930 download already supplies supported metallic/roughness
materials and clearcoat. Its body material is named for paint discovery; its
material response is unchanged. The default graphite paint and shared thin-glass
handling are runtime adaptations.

Listing descriptions, displayed comments and archive notices were checked for
upstream credits or game extraction. Except for the 917K's credited JUSTGAME source, these publishers declare no upstream source.
This establishes the supplied publisher license, not independent proof of authorship
or clearance of manufacturer rights. The evidence record retains the supplied
license text, archive hashes and creator IDs, including older profile aliases.
Asset optimization uses local, deterministic geometry and image tools.

The RWB publisher identifies Porsche AG as the vehicle-design rights holder.
Creator licenses do not grant manufacturer affiliation, trademark rights or a
blanket clearance of vehicle designs. The site credits retain that distinction.

The Porsche 917K uses the selected vecarz red Le Mans export, with JUSTGAME's
upstream credit retained. Its full mesh, source livery, texture pixels and material
parameters are preserved. Shared thin-glass handling applies.

The proposed Supra GT300 is not included. The vecarz reupload lists CC BY, but the
credited [builder's source](https://sketchfab.com/3d-models/toyota-gr-supra-gt-gt300-58efbe2b2e144d8e8edfcc0c64e55f88)
uses [Free Standard](https://sketchfab.com/licenses), restricting standalone-file
access, and identifies an unlinked downloaded base model. Resolve these terms
before publishing it in the public asset directory or repository.

## Updating the review

Check the original model and any credited upstream sources, not just a free-download
label or an embedded metadata field. Record the publisher identity and exact
license URL in the evidence record, update the displayed credits, and preserve
original copyright notices. Recheck a replacement asset before publishing it.
