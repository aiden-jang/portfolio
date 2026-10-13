# Visual car selection

The user requested replacing native car dropdowns with immediate arrows and a visual
browser. Both layouts now use the same selection component and retain chassis codes.
The car remains immediately playable without opening the browser.

The browser uses locally rendered previews of the actual model assets, with original
colors and consistent studio framing. Each image links its model author; the license
remains visible in the footer. Temporary rendering files were removed after export.
The static previews load only when the browser opens, without loading every 3D model.

Wide layouts show all choices in a compact grid. Narrow layouts scroll the grid while
keeping the heading and Close control visible. Opening focuses and reveals the selected
car. Arrow keys move focus, Enter chooses, Home/End jump, and Escape closes. Page scroll
is locked while browsing and restored afterward. Focus returns to the visible selector,
including when the responsive layout changes while the browser is open.

Direct arrows stay focused during loading and ignore additional choices until ready.
Loading appears inside the selector, with accessible status feedback. If a model fails,
choosing its card retries it. Preview image failures retain a readable placeholder.

Related polish: phone car selection occupies its own row; paint and lighting labels
sit inside their controls. Tablet secondary actions use icons with accessible names
to preserve space. The desktop Reset label no longer wraps. Obsolete picker styles
were removed from the recent refinement sheet.

Verification covered real previews, selected state, arrow focus versus selection,
Enter selection, End selection, Escape, scroll restoration, selected-card visibility,
and focus restoration across responsive layouts. The narrow layout was verified at
320 CSS pixels, with no horizontal overflow, and the tablet dock also fit. Browser zoom
was accounted for when measuring CSS viewport sizes. The pending-selection regression
test failed with its guard removed and passed when restored. The full repository
verification suite passed. Physical phone and Safari checks remain unavailable.

The main intro, section composition, default spin, Contact camera, storage behavior
and résumé document were preserved. This is an authorized revision to car selection,
not a replacement of the overall showroom composition.
