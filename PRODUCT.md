# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

The primary audience is recruiters and hiring teams evaluating Aiden Jang for
software engineering roles. The owner confirmed that getting interviews is the
portfolio's primary goal.

## Product Purpose

Present Aiden's engineering experience, personal applications and open-source
contributions, with direct access to evidence, a résumé and contact information.
The car-led opening establishes the portfolio's character; project evidence
follows in its own section rather than competing within the first viewport.

## Positioning

The portfolio combines working software and engineering case studies with a fully
interactive 3D car garage. The garage is an intentional part of the experience and
must remain available in the redesign.

## Operating Context

Visitors can read the portfolio on desktop and mobile, inspect project screenshots,
open applications, read implementation details and explore the garage. The site is
built with React, TypeScript, Vite and Three.js and is hosted at aidenjang.com.

## Capabilities and Constraints

- Preserve the full garage: orbiting, model selection, paint, lighting,
  model-specific features and sharing a setup.
- Preserve experience, project case studies, résumé, contact, credits and model
  attribution. Keep content available when the 3D scene cannot load.
- Preserve keyboard access, reduced-motion support and responsive behavior.
- Keep everythingisfine first and Iodine second in project order. These are the two
  featured projects; mrrp and worth belong with the smaller projects.
- Present Iodine as an open-source contribution, accurately distinguishing Aiden's
  contributions from ownership of the entire application.
- Use the recently approved captures in `public/projects/`. Do not substitute stale
  screenshots from individual app repositories. The approved Iodine image is an
  explicit exception.
- Show meaningful application states rather than a collection of landing pages.
- The approved owewell example uses Alex, not Sam. Keep private account information
  out of portfolio screenshots.
- Show redesign options before replacing the current portfolio interface.

## Evidence on Hand

- `src/data/workItems.ts`: project and contribution descriptions and links.
- `src/data/projectStories.ts`: engineering case studies.
- `src/data/projectPreviews.ts`: screenshot states and captions.
- `public/projects/`: approved screenshots of the applications and Iodine.
- `src/ui/sections/Experience.tsx`: professional experience.
- `src/ui/sections/Contact.tsx`: contact details and social links.
- `src/three/`: the existing garage and its interaction implementation.
- `docs/model-licenses.md`: third-party car model licenses and attribution.

## Brand Commitments

Preserve the showroom concept and full interactive garage. Keep the current
charcoal, ivory and Geist identity, open stage and car lighting. The owner found
the architectural prototype excessive and requested a simpler mock closer to the
current showroom. The subsequent project-led mock was also rejected as cluttered.
The owner wants the car to be the impactful focal point of the opening, with
projects below it and no extra scenery. References inform restraint and
hierarchy; they do not replace the portfolio's identity.

## Product Principles

- Help hiring teams assess engineering work from concrete evidence.
- Keep the garage fully explorable alongside accessible portfolio content.
- Describe project ownership, contributions and technical decisions accurately.
- Use current application imagery that represents the work visitors can open.

## Current Direction

The car-led showroom and project presentation polish have been applied. Keep the
approved `art/ui-mocks/showroom-refinement/` reference as the design record. No new
metrics, testimonials or hiring claims have been provided.
