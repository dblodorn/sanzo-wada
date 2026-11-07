# Spec Delta

## MODIFIED Requirements

### Requirement: Routes match alpha

The app SHALL serve these URLs:
- `/` (landing)
- `/about`
- `/swatch/<slug>` for each of the 159 color slugs
- `/combination/<n>` for each `n` from 1 to 348

It SHALL also serve `/api`, the API documentation page, which alpha did not have.

Every swatch slug is URL-safe, so a swatch URL needs no percent-encoding. Each of alpha's seven punctuated swatch URLs SHALL redirect to its normalized slug, in both its literal and its percent-encoded form, so existing links to alpha keep working.

#### Scenario: Every alpha URL resolves

- **WHEN** each of the 509 page URLs (2 fixed pages, 159 swatches, 348 combinations) is requested from beta, using the normalized slug for the seven punctuated colors
- **THEN** each returns HTTP 200 with the matching page

#### Scenario: API documentation page resolves

- **WHEN** `/api` is requested
- **THEN** it returns HTTP 200 with the API documentation page

#### Scenario: Punctuated slug

- **WHEN** `/swatch/eugenia-red-|-a` or `/swatch/hay's-russet` is requested, either literally or percent-encoded
- **THEN** the response permanently redirects to `/swatch/eugenia-red-a` or `/swatch/hays-russet`, and that page returns HTTP 200
