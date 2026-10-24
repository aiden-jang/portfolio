# Aiden Jang’s portfolio

Software engineering experience, personal products and open-source contributions,
with an interactive 3D garage. Built with React, TypeScript and Three.js.

**[Visit aidenjang.com](https://www.aidenjang.com/)**

![Portfolio preview](public/og-image.png)

## Explore

- Orbit the car, browse models, change paint and lighting, and share a setup.
- Read experience and project case studies in a continuous page.
- Filter projects and inspect original screenshots without leaving the portfolio.
- Reach Contact with the car’s front-to-overhead camera arrival.

Car controls appear only when Intro fills the viewport. The Contact car is a
decorative backdrop with no drag gestures or car controls. It appears when the
section enters the viewport, holding its opening angle until the section is almost
in place. Keyboard controls, reduced motion, loading errors and model attribution
are supported. The portfolio content remains available if the 3D scene fails.
The garage mixes stock classics, newer modified road cars and fixed-livery race
cars. Model-specific controls raise the Miata’s headlights and open DRS on either F1
car. Retired selections remain available through existing shared links.

## Run locally

Use Node.js 22.22.2 or newer in the Node 22 line, matching CI.

```sh
npm ci
npm run dev
```

Vite prints the local URL. No environment variables are required for local development.

```sh
npm run verify   # dependency audit, types, lint, formatting, content checks, tests and build
npm run test     # tests only
npm run preview  # serve dist/ after building
```

CI runs verification on pull requests and pushes to `main`. Vercel handles
production builds and deployment separately; GitHub Actions does not deploy.
CI also runs Chromium and WebKit interaction and accessibility regressions.
See [Contributing](CONTRIBUTING.md#deployment-and-search-updates) for release and
search-update checks.

## Development

- [Quality checks](docs/quality.md): browser setup, regression coverage and visual review.
- [Architecture](docs/architecture.md): module responsibilities and runtime behavior.
- [Contributing](CONTRIBUTING.md): setup, changes, validation and commit conventions.
- [Repository conventions](CONVENTIONS.md): code and verification requirements.
- [To do](docs/todo.md): saved garage model candidates and selection preferences.

The stack includes Vite, React Three Fiber, drei, postprocessing, Tailwind CSS,
Zustand, and Vercel Analytics and Speed Insights. Exact versions are in
[package.json](package.json) and [package-lock.json](package-lock.json).

## Licenses and credits

The source code is [MIT licensed](LICENSE). Third-party assets retain their own licenses:

- Car models: publisher licenses, authors, original titles, source links and adaptations
  appear in the site’s Contact credits. [The model license review](docs/model-licenses.md)
  records the verified sources, attribution requirements and web adaptations.
- Geist: [font license](public/fonts/Geist-LICENSE.txt).
- Geist Mono: [font license](public/fonts/Geist-Mono-LICENSE.txt).

The source license does not relicense third-party assets.

[Analytics and URL privacy](docs/analytics.md) describes traffic and performance reporting.
