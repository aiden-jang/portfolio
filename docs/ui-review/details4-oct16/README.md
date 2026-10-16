# External destinations — October 16

Project, contribution, car-credit and contact links that open a new tab expose an accessible description. Visible labels and layouts remain unchanged. The résumé file and its already-labelled button were not edited.

A focused browser journey checks actual link descriptions on the page and inside the car chooser, project story and model-credit dialogs. It requires nonempty link inventories. Removing the referenced description makes the native accessibility assertion fail. The original keyboard, modal, responsive and visual journeys are unchanged; repeating the link inventory at each accessibility checkpoint added unnecessary work to those journeys.

Existing orbit-region and touch-hold rules continue to separate page scrolling from car interaction. Spoken screen-reader output and native external-app handoffs were not tested.

The repository verification and complete Chromium/WebKit browser suite passed. The missing-description probe failed for the intended accessible-description assertion, and the reviewed source was restored before the passing run. No test timeout, retry or existing accessibility assertion changed.
