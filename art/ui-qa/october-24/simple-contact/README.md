# Simple Contact layout

Local production preview reviewed in Chrome on October 24, 2026.
These captures record the Contact simplification at this revision.

- Desktop and tablet: email is the main action, with a copy icon and secondary social links.
- Narrow phone: the address and copy target fit beside each other, and the subtitle wraps naturally.
- Short phone: the main actions and footer credits remain visible without overlapping.

Requested preview viewports were 1440 × 900, 768 × 900, 320 × 740 and 390 × 620.
The browser scrollbar occupies part of the available width.

The email points to its mailto destination. Copying shows confirmation without
moving the social links. The footer opens the complete model attribution dialog.
The car remains a decorative backdrop with its controls hidden. Existing browser
navigation cases cover Contact accessibility, credits opening and focus restoration
at desktop and phone widths. The copy fallback test preserves accessible failure
feedback when a newer failed copy finishes before an older successful request.

This is local browser evidence, not production or physical-device verification.
