# Curated garage order

The [desktop picker](desktop.jpg) shows the agreed lineup beginning with F40,
300 SL, Miata and Datsun. Countach is sixth. [The end of the picker](desktop-end.jpg)
retains both F1 cars, Ferrari F1-75 followed by Red Bull RB16B. The
[phone picker](phone.jpg) shows the same order in its two-column layout. All picker
thumbnails loaded in the reviewed production build in Chrome.

Only the visible order changes. Permanent registry identities and model files are
unchanged, so existing shared garage URLs keep their cars. Number keys 1–9 follow
the visible positions; later cars retain Select hints. The earlier shortcut-hint
captures describe their own revision, before this reorder.

The existing cycle regression pins the agreed sequence and rejects the prior
order. Browser coverage checks the rendered sequence, a retired R8 link, picker
focus and wrapping, Miata headlights, Datsun selection with its new key 4, and
reload behavior at desktop and phone widths. No new test cases or CI jobs are added.
Phone review uses viewport emulation; physical-device and screen-reader audio
checks were not performed.
