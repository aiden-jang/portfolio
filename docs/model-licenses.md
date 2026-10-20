# Car model licenses

The source code's MIT license does not cover the car assets. This review records
what each model's publisher licenses, plus any upstream notice supplied by that
publisher. The checked source URLs, creator identities and license URLs are in
[the evidence record](model-license-evidence.json). The review was checked on
October 20, 2026 using Sketchfab's public model API.

## Source licenses

| Car                  | Model creator                                                                         | Publisher license                                         | Review                                                             |
| -------------------- | ------------------------------------------------------------------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------ |
| Ferrari F40          | [vecarz](https://sketchfab.com/3d-models/ee082e412b0a4b2090e8492117841e95)            | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) | Source license verified                                            |
| Mercedes-Benz 300 SL | [Lexyc16](https://sketchfab.com/3d-models/505241c829c540a4921533000736904e)           | CC BY 4.0                                                 | Source license verified                                            |
| Porsche 911 Turbo    | [Lionsharp Studios](https://sketchfab.com/3d-models/8568d9d14a994b9cae59499f0dbed21e) | CC BY 4.0                                                 | Source license verified                                            |
| Porsche 911 RWB      | [SWIZ](https://sketchfab.com/3d-models/9b13e93711db460b99749ae95aea9764)              | CC BY 4.0                                                 | Source license verified; retain the embedded SWIZ copyright notice |
| BMW M3 E30           | [Martin Trafas](https://sketchfab.com/3d-models/ac3c7013434e403e8faff87948caf422)     | CC BY 4.0                                                 | Source license verified                                            |
| Datsun 280Z          | [Martin Trafas](https://sketchfab.com/3d-models/0789ab2ece9442de94b3c41595e0ecbd)     | CC BY 4.0                                                 | Source license verified                                            |
| Polestar 1           | [Martin Trafas](https://sketchfab.com/3d-models/4a368c71047c4eb0829525d933752828)     | CC BY 4.0                                                 | Source license verified                                            |

CC BY permits sharing and modification, including commercial use, provided its
conditions are met. The Contact credits give the supplied model titles, authors,
source links and license links, and identify adaptations. Preserve those credits
when moving, modifying or reusing a model. Attribution metadata is embedded in each GLB.

## Adaptations and other rights

Web exports use compressed geometry and WebP textures. The RWB is additionally
simplified; the 911, M3 and Datsun retain their geometry while receiving meshopt
compression. The 911, M3, Datsun and RWB retain their original materials, texture
images and attribution metadata. Site lighting, framing and optional paint colors are
runtime adaptations. The 911 also receives missing tangent data for its paint
material; its existing geometry and vertex attributes are retained.

Optimization uses glTF Transform 4.4.1 and meshoptimizer 0.25.0. The RWB export
uses a simplification target ratio of 0.1, an error bound of 0.0003 and locked
mesh borders, followed by filtered meshopt compression with 16-bit positions,
14-bit texture coordinates and 8-bit normals. The other optimized cars use
vertex reordering and meshopt compression without mesh simplification. Compare
original and optimized renders as well as decoded geometry when changing these
settings.

The Polestar uses the creator's linked Blender source, exported with Blender
4.5.3 LTS. Studio lights and backdrop are omitted, meshes are triangulated, and
procedural paint and window shaders are adapted to glTF PBR materials. Its web
finish is silver with opaque tinted windows. Supplied wheel, brake and lamp
textures are retained, resized to at most 1024 pixels and encoded as WebP at
quality 85. Geometry is reordered and filtered meshopt compressed without simplification,
using 16-bit positions, 14-bit texture coordinates and 8-bit normals.
The model's source, author, license and adaptation notice are embedded in its GLB.

The Porsche publisher identifies Porsche AG as the vehicle-design rights holder.
Creator licenses do not grant manufacturer affiliation, trademark rights or a
blanket clearance of vehicle designs. The site credits retain that distinction.

## Updating the review

Check the original model and any credited upstream sources, not just a free-download
label or an embedded metadata field. Record the publisher identity and exact
license URL in the evidence record, update the displayed credits, and preserve
original copyright notices. Recheck a replacement asset before publishing it.
