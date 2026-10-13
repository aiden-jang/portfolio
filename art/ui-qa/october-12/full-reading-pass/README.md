# Full browsing and reading pass

## Scope

- Project rows: larger featured titles, quieter technology text, clear primary case-study links.
- Filters: retained existing category semantics, labeled real-time work Live, removed per-button counts; visible results keep one total.
- Preview controls: sharing moved into the screenshot viewer, with selected-view permalinks and clipboard fallback retained.
- Screenshot framing: adjusted the recipient garden crop; inspected existing globe and room framing.
- Case studies: shortened the dense earthquake reconciliation explanation and removed repeated migration and garden explanations.
- Experience: explicitly labeled end-to-end ownership in publisher work.
- Transitions: checked fast section changes; reading surfaces still hide the car.
- Mobile menu: closes when keyboard focus leaves; Escape and section selection continue to dismiss it.
- Car controls: consistent dock action heights, existing square paint swatches preserved, selected-state styling retained.
- Keyboard legend: quieter spacing and a separate clickable controls action.
- Contact: stronger text contrast, successful-copy status and a useful blocked-clipboard fallback; text can be selected.
- Responsive layouts: tablet project titles get their own row; short landscape omits the fixed dock to prevent overlap; short phones reserve scroll space below Contact.
- Interaction states: consistent link hover and disabled cursors; existing focus outlines retained.
- Cleanup: underline-style preview choices and fewer repeated counts and share actions.

## Verification

Inspected desktop 1440-by-900, phone 390-by-900 and 320-by-568, tablet 834-by-1112,
landscape 844-by-390 and a 720-by-900 viewport equivalent to a 1440-wide browser at
200% zoom. The equivalent viewport checks reflow; it does not emulate all browser-zoom rendering.

Checked horizontal overflow in every section, AI filtering, shared preview URLs,
screenshot closing, mobile menu Escape/focus dismissal, quick reading-section changes,
and both successful and blocked clipboard operations. The résumé PDF is unchanged.

The dock omission is deliberate only for short landscape screens. Dragging the car
and keyboard shortcuts remain available; normal dock layouts return at taller heights.
