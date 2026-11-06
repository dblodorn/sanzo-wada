# Spec Delta

## MODIFIED Requirements

### Requirement: Routes match alpha

The app SHALL serve these URLs:
- `/` (landing)
- `/about`
- `/swatch/<slug>` for each of the 159 color slugs
- `/combination/<n>` for each `n` from 1 to 348

Every swatch slug is URL-safe, so a swatch URL needs no percent-encoding. Each of alpha's seven punctuated swatch URLs SHALL redirect to its normalized slug, in both its literal and its percent-encoded form, so existing links to alpha keep working.

#### Scenario: Every alpha URL resolves

- **WHEN** each of the 509 page URLs (2 fixed pages, 159 swatches, 348 combinations) is requested from beta, using the normalized slug for the seven punctuated colors
- **THEN** each returns HTTP 200 with the matching page

#### Scenario: Punctuated slug

- **WHEN** `/swatch/eugenia-red-|-a` or `/swatch/hay's-russet` is requested, either literally or percent-encoded
- **THEN** the response permanently redirects to `/swatch/eugenia-red-a` or `/swatch/hays-russet`, and that page returns HTTP 200

### Requirement: Document metadata and static assets match alpha

Every page SHALL have alpha's title "WADA SANZO | DICTIONARY OF COLOR COMBINATIONS", its meta description, its viewport settings and a white page background. These files alpha serves under `/assets/` SHALL be served at the same paths: `fonts.css`, the font files and `swada-colors.jpg`.

`/assets/colors.json` SHALL be generated from the color library at build time and served as static JSON. It SHALL have alpha's shape: a `colors` array whose entries have the fields `index`, `name`, `slug`, `cmyk_array`, `cmyk`, `rgb_array`, `rgb`, `hex`, `combinations` and `use_count`. It SHALL contain all 159 colors in flat-list order, with the same values the pages show.

#### Scenario: JSON API path

- **WHEN** `/assets/colors.json` is requested
- **THEN** a JSON document with a `colors` array of 159 entries is returned, with the content type `application/json`

#### Scenario: Previously missing colors are present

- **WHEN** the JSON is searched for Citrine and Chromium Green
- **THEN** both are present with the same `index`, `slug`, `hex` and `combinations` as their swatch pages

#### Scenario: JSON matches the library

- **WHEN** each entry in `/assets/colors.json` is compared with the library's flat list
- **THEN** every field of every entry is equal, and slugs use the normalized form (for example `hays-russet`)
