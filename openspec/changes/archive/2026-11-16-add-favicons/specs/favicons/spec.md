# Spec Delta

## Purpose

Gives every page a favicon drawn from the color library, so a browser tab shows the color or combination it holds and the landing page shows a different color on each visit.

## ADDED Requirements

### Requirement: Icon URLs

The site SHALL serve a favicon for each color at `/swatch/<slug>/favicon.svg` (for each of the 159 color slugs) and for each combination at `/combination/<n>/favicon.svg` (for each `n` from 1 to 348). An icon for a slug or number outside the data set, including one of alpha's old punctuated slugs, SHALL return HTTP status 404.

#### Scenario: Swatch icon is served

- **WHEN** `/swatch/hermosa-pink/favicon.svg` is requested
- **THEN** the response has status 200 and the content type `image/svg+xml`

#### Scenario: Combination icon is served

- **WHEN** `/combination/348/favicon.svg` is requested
- **THEN** the response has status 200 and the content type `image/svg+xml`

#### Scenario: Unknown icon

- **WHEN** `/swatch/not-a-color/favicon.svg`, `/combination/0/favicon.svg` or `/combination/349/favicon.svg` is requested
- **THEN** the response has HTTP status 404

### Requirement: Icon format

Every icon SHALL be a square SVG image that is filled edge to edge, with no border, margin, text or transparent area. Icons SHALL be generated at build time from the color library and served as static files, with no rendering per request. An icon SHALL be served with a cache lifetime of at least one hour.

#### Scenario: Icon is square

- **WHEN** any swatch or combination icon is parsed
- **THEN** its `viewBox` has equal width and height, and its shapes cover the whole `viewBox`

#### Scenario: No per-request rendering

- **WHEN** the production build finishes
- **THEN** every one of the 507 icons is listed among the prerendered outputs

### Requirement: Swatch icon content

A swatch icon SHALL be a square filled entirely with the color's hex value, the same value the swatch page shows.

#### Scenario: Icon shows the color

- **WHEN** `/swatch/hermosa-pink/favicon.svg` is requested
- **THEN** the icon is a single square filled with `#ffb3f0`

### Requirement: Combination icon content

A combination icon SHALL show the combination's colors as side-by-side vertical bars of equal width that together fill the square, in the library's order (the order the combination page and its share card show them).

#### Scenario: Bars match the combination

- **WHEN** the icon for any combination is parsed
- **THEN** it has one bar per color in the combination, the bars have equal width and full height, and their fills from left to right are the combination's hex values in the library's order

### Requirement: Swatch and combination pages link their icon

Each `/swatch/<slug>` page SHALL link `/swatch/<slug>/favicon.svg` as its favicon, and each `/combination/<n>` page SHALL link `/combination/<n>/favicon.svg`, in their pre-rendered HTML. Moving to one of these pages within the app SHALL replace the previous page's favicon with the new page's.

#### Scenario: Swatch page favicon

- **WHEN** the HTML of `/swatch/hermosa-pink` is requested
- **THEN** it contains a `<link rel="icon">` whose `href` is `/swatch/hermosa-pink/favicon.svg` (relative or absolute) with type `image/svg+xml`

#### Scenario: Combination page favicon

- **WHEN** the HTML of `/combination/1` is requested
- **THEN** it contains a `<link rel="icon">` whose `href` is `/combination/1/favicon.svg`

#### Scenario: Navigating between pages

- **WHEN** a visitor on `/swatch/hermosa-pink` follows a link to `/combination/1` in the app
- **THEN** the document's favicon becomes `/combination/1/favicon.svg` and no `<link rel="icon">` for `/swatch/hermosa-pink/favicon.svg` remains

### Requirement: Random icon on other pages

The landing page (`/`), `/about`, `/api` and the 404 page SHALL use the swatch icon of a color picked at random from all 159 colors, with each color equally likely. A new color SHALL be picked each time one of these pages is shown, whether it is loaded directly or reached by navigating within the app. The pre-rendered HTML of these pages SHALL link the swatch icon of one fixed color, so the page has a favicon before any script runs and when scripts are disabled. Picking the color SHALL NOT change anything else the page shows.

#### Scenario: Fallback in the HTML

- **WHEN** the HTML of `/` is requested
- **THEN** it contains a `<link rel="icon">` whose `href` is `/swatch/<slug>/favicon.svg` for one of the 159 color slugs

#### Scenario: Random color after load

- **WHEN** `/` is loaded in a browser and its scripts have run
- **THEN** the document has exactly one `<link rel="icon">`, and its `href` is `/swatch/<slug>/favicon.svg` for one of the 159 color slugs

#### Scenario: Color changes between visits

- **WHEN** `/` is loaded in a browser 20 times
- **THEN** more than one distinct icon color is seen

#### Scenario: Leaving a color page

- **WHEN** a visitor on `/swatch/hermosa-pink` follows the "Index" link to `/`
- **THEN** the favicon is replaced with a randomly picked swatch icon, and no `<link rel="icon">` for `/swatch/hermosa-pink/favicon.svg` remains

#### Scenario: Other pages

- **WHEN** `/about`, `/api` or an unknown path such as `/swatch/not-a-color` is loaded in a browser and its scripts have run
- **THEN** the document's favicon is `/swatch/<slug>/favicon.svg` for one of the 159 color slugs
