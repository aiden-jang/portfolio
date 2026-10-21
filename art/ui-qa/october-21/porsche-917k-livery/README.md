# Porsche 917K fixed livery

The 917K keeps its authored red racing livery. Desktop and mobile paint controls,
the repaint command and paint shortcut hint are hidden for this car. Keyboard
paint actions and randomization keep the original finish. Incoming custom-paint
links are normalized to the original livery and cannot carry their pending color
into a later car selection.

Local browser review confirms the compact [desktop controls](desktop.jpg) and
[phone controls](phone.jpg). The original livery and car asset are unchanged.
Unit regressions were observed failing with the livery lock disabled, then passing
with it restored. Browser regressions cover old custom-color links, hidden paint
controls and commands, keyboard input and switching to a customizable car.

The initial captures use the development preview. A [production capture](production.jpg)
confirms that a custom-color URL opens the original livery without paint controls.
Emulated viewports do not
establish physical-device performance or actual iPhone Safari behavior.
