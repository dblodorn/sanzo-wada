# Spec Delta

## Purpose

Gives every swatch and combination a share card: a pre-rendered image that link previews, social posts and agents can show in place of a bare URL.

## ADDED Requirements

### Requirement: Card URLs

The site SHALL serve a share card for each color at `/swatch/<slug>/card.png` (for each of the 159 color slugs) and for each combination at `/combination/<n>/card.png` (for each `n` from 1 to 348). A card for a slug or number outside the data set, including one of alpha's old punctuated slugs, SHALL return HTTP status 404.

#### Scenario: Swatch card is served

- **WHEN** `/swatch/hermosa-pink/card.png` is requested
- **THEN** the response has status 200 and the content type `image/png`

#### Scenario: Combination card is served

- **WHEN** `/combination/348/card.png` is requested
- **THEN** the response has status 200 and the content type `image/png`

#### Scenario: Unknown card

- **WHEN** `/swatch/not-a-color/card.png`, `/combination/0/card.png` or `/combination/349/card.png` is requested
- **THEN** the response has HTTP status 404

### Requirement: Card format

Every card SHALL be a PNG of 1200 × 630 pixels. Cards SHALL be generated at build time and served as static files, with no rendering per request. A card SHALL be served with a cache lifetime of at least one hour.

#### Scenario: Card dimensions

- **WHEN** any swatch or combination card is decoded
- **THEN** its width is 1200 pixels and its height is 630 pixels

#### Scenario: No per-request rendering

- **WHEN** the production build finishes
- **THEN** every one of the 507 cards is listed among the prerendered outputs

### Requirement: Swatch card content

A swatch card SHALL be filled with the color's hex value. It SHALL show the color's name and its hex value, and the line "Wada Sanzo — A Dictionary of Color Combinations", set in the site's `fff-regular` typeface. The text SHALL be drawn in the same light or dark color the swatch page uses on that color, so it stays legible on every swatch.

#### Scenario: Card shows the color

- **WHEN** the card for `hermosa-pink` is rendered
- **THEN** the pixels in the card's top-right corner are `#ffb3f0`, and the card shows the text "Hermosa Pink" and "#ffb3f0"

#### Scenario: Text is legible on dark and light colors

- **WHEN** the cards for the darkest and the lightest color are rendered
- **THEN** each uses the text color the swatch page uses for that color

### Requirement: Combination card content

A combination card SHALL show the combination's colors as side-by-side bars of equal width that fill the card, in the library's order (the order the combination page shows them). It SHALL show "Combination <n>", and each color's name and hex value on its bar, in that bar's legible text color. It SHALL also show the line "Wada Sanzo — A Dictionary of Color Combinations".

#### Scenario: Bars match the combination

- **WHEN** the card for combination 1 is rendered
- **THEN** it has two bars of equal width, filled with English Red and then Cerulian Blue, and it shows "Combination 1", both names and both hex values

#### Scenario: Four-color combination

- **WHEN** the card for a four-color combination is rendered
- **THEN** it has four bars of equal width, in the order the combination page shows them

### Requirement: Pages point to their cards

Each swatch and combination page SHALL include Open Graph and Twitter metadata in its pre-rendered HTML:
- `og:image`: the absolute URL of the page's card, with `og:image:width` 1200, `og:image:height` 630, `og:image:type` `image/png` and `og:image:alt` describing the card ("Hermosa Pink, #…" or "Combination 1: English Red #…, Cerulian Blue #…")
- `og:title`: the color's name, or "Combination <n>", followed by " | Wada Sanzo"
- `og:description`: for a swatch, its hex and the number of combinations it appears in; for a combination, its colors' names and hex values
- `og:url`: the absolute URL of the page
- `twitter:card`: `summary_large_image`

The absolute URLs SHALL use the origin of the deployment that serves the page: `https://sanzo-wada.dmbk.io` in production.

#### Scenario: Swatch page metadata

- **WHEN** `/swatch/hermosa-pink` is requested in production
- **THEN** its HTML contains `og:image` with the content `https://sanzo-wada.dmbk.io/swatch/hermosa-pink/card.png` and `twitter:card` with the content `summary_large_image`

#### Scenario: Metadata image resolves

- **WHEN** the `og:image` URL of any swatch or combination page is requested
- **THEN** it returns that page's card with status 200
