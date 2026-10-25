# Visual consistency review

The visual pass keeps the dark palette, large introduction and full-detail car
models. It gives the garage one shared control panel, consistent control corners
and more readable utility text. The duplicate car caption and repeated project
ownership labels are removed. About follows its content height and reading
sections share a calmer heading and metadata scale.

Contact puts its copy beside the car on desktop and above it on phones. Short
phone screens use a wider camera composition without changing model geometry,
materials, textures or the arrival/reversal animation.

The contact regressions first failed against the previous composition at desktop,
phone and short-phone widths. They check the copy placement, require visible car
pixels outside it and reject car pixels behind it. Existing browser journeys cover
stable controls, model-specific actions, keyboard focus, reduced motion, navigation
and accessibility.

The live browser controls became unreliable during review; production browser-test
captures provide the remaining visual evidence. Local unit workers were serialized
after a model-fixture resource timeout. Assertions, time limits, test floors and CI
settings were preserved. Browser verification uses headed Chromium and WebKit with
local trace recording disabled. Physical phones and screen-reader audio were not
tested.

The before captures record the old centered contact composition:

- [Desktop before](contact-desktop-before.png)
- [Phone before](contact-phone-before.png)

Final captures:

| View     | Desktop                         | Phone                       |
| -------- | ------------------------------- | --------------------------- |
| Intro    | [Desktop](intro-desktop.png)    | [Phone](intro-phone.png)    |
| Projects | [Desktop](projects-desktop.png) | [Phone](projects-phone.png) |
| About    | [Desktop](about-desktop.png)    | [Phone](about-phone.png)    |
| Contact  | [Desktop](contact-desktop.png)  | [Phone](contact-phone.png)  |

[Short-phone contact](contact-narrow.png) checks the smallest reviewed composition.
[Transition before](about-transition-before.png) records the reading edge cutting
across the car. Final About captures include the corrected document-relative
projection. The complete browser suite passed before that final correction; the
composition and portfolio navigation journeys were rerun against the final source
in both engines, alongside the full repository verification.
