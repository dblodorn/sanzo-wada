# Spec Delta

## MODIFIED Requirements

### Requirement: Document metadata and static assets match alpha

Every page SHALL have alpha's title "WADA SANZO | DICTIONARY OF COLOR COMBINATIONS", its meta description, its viewport settings and a white page background. Swatch and combination pages SHALL also carry the Open Graph and Twitter metadata that points to their share cards (see the `share-cards` capability). Every page SHALL also link a favicon (see the `favicons` capability). Neither the share metadata nor the favicon SHALL change the `<title>`, the meta description or anything the page shows. These files alpha serves under `/assets/` SHALL be served at the same paths: `fonts.css`, the font files and `swada-colors.jpg`.

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

#### Scenario: Share metadata keeps alpha's title

- **WHEN** `/swatch/hermosa-pink` is requested
- **THEN** its `<title>` is "WADA SANZO | DICTIONARY OF COLOR COMBINATIONS" and its `og:title` is "Hermosa Pink | Wada Sanzo"

#### Scenario: Favicon keeps alpha's title

- **WHEN** `/swatch/hermosa-pink` or `/` is requested
- **THEN** its HTML links a favicon, and its `<title>` is still "WADA SANZO | DICTIONARY OF COLOR COMBINATIONS"
