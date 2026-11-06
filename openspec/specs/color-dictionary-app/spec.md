# color-dictionary-app Specification

## Purpose

The beta web app for Sanzo Wada's *A Dictionary of Color Combinations*. Every page is pre-rendered and should look and behave the same as alpha, so production can later be cut over from alpha without visitors noticing a difference.

## Requirements

### Requirement: Routes match alpha

The app SHALL serve the same URLs as alpha:
- `/` (landing)
- `/about`
- `/swatch/<slug>` for each of the 159 color slugs
- `/combination/<n>` for each `n` from 1 to 348

Slugs that contain `|` or `'` SHALL resolve at both their literal and percent-encoded forms, so existing links to alpha keep working.

#### Scenario: Every alpha URL resolves

- **WHEN** each of the 509 alpha page URLs (2 fixed pages, 159 swatches, 348 combinations) is requested from beta
- **THEN** each returns HTTP 200 with the matching page

#### Scenario: Punctuated slug

- **WHEN** `/swatch/eugenia-red-|-a` or `/swatch/hay's-russet` is requested, either literally or percent-encoded
- **THEN** the page for that color is returned

### Requirement: All pages are statically pre-rendered

Every page SHALL be generated at build time as static HTML. The HTML SHALL already include the page's content and its styles, with no runtime data fetching and no rendering per request. A URL outside the data set SHALL return the app's 404 page with HTTP status 404.

#### Scenario: Content and styles in the initial HTML

- **WHEN** any page is requested with JavaScript disabled
- **THEN** the response contains the page's text, links and color backgrounds, and it is styled as it is once JavaScript runs

#### Scenario: Unknown swatch or combination

- **WHEN** `/swatch/not-a-color`, `/combination/0` or `/combination/349` is requested
- **THEN** the response has HTTP status 404

### Requirement: Visual parity with alpha

Each page SHALL look the same as its alpha counterpart: the same layout, typography (`fff-regular`, `fff-italic`), colors, spacing, borders, sticky headers, hover effects and transitions. This SHALL hold below 500px, between 500px and 1240px, and above 1240px (the ranges set by alpha's media queries), including the root font-size steps at 960px, 1550px and 1750px.

#### Scenario: Side-by-side comparison

- **WHEN** the same URL is opened in alpha and in beta at 375px, 1024px and 1440px wide
- **THEN** the two renders don't differ visibly once fonts have loaded

### Requirement: Landing page offers swatch and list views

The landing page SHALL show:
- the title "Wada Sanzo | A Dictionary of Color Combinations." linking to `/`
- a sticky menu with a swatch view button, a list view button, a JSON link to `/assets/colors.json` and an ABOUT link to `/about`

The swatch view SHALL be shown first. The two buttons SHALL switch between the views, and the active one SHALL be marked.

The swatch view SHALL show six sections headed "SWATCH COLLECTION 1" to "SWATCH COLLECTION 6". Each section is a grid of color tiles, and each tile shows the color's in-group index, name and hex, and links to that color's swatch page.

The list view SHALL show one row per color, all 159 in flat order, filled with the color. Each row shows the flat index, the name linking to the swatch page, and the hex in uppercase. At widths of 1240px and above, rows SHALL also show links to the color's combinations, the CMYK string, the RGB string and the use count.

#### Scenario: Default view

- **WHEN** a visitor opens `/`
- **THEN** the swatch view is shown with six collections and the swatch view button is marked active

#### Scenario: Switch to list view

- **WHEN** the visitor clicks the list view button
- **THEN** the color list replaces the swatches, and the list view button is marked active

#### Scenario: List columns depend on width

- **WHEN** the list view is open in a window at least 1240px wide
- **THEN** each row shows combinations, CMYK, RGB and use count
- **WHEN** the window is resized below 1240px
- **THEN** those four columns are hidden

### Requirement: Responsive labels follow window width

Once the page is running in the browser, the landing menu labels SHALL follow the window width and update on resize:
- at 1240px and above: "Swatch View", "List View" and "JSON API"
- below 1240px: "Swatches", "List" and "JSON"

#### Scenario: Resize across the breakpoint

- **WHEN** a window 1300px wide is resized to 800px
- **THEN** the labels change from "Swatch View", "List View" and "JSON API" to "Swatches", "List" and "JSON"

### Requirement: Swatch page shows a color and its combinations

`/swatch/<slug>` SHALL show:
- a sticky header with the color name, its copyable hex and an "Index" link to `/`
- a section filled with the color, headed "Combinations:", that lists a link to `/combination/<n>` for each combination the color appears in

Text on the colored section SHALL use the grey token (`#dbdbdb`) when its contrast against the color is greater than 2, and the black token (`#1b3644`) otherwise.

#### Scenario: Swatch detail

- **WHEN** a visitor opens `/swatch/hermosa-pink`
- **THEN** the page shows "Hermosa Pink", its hex, and links to combinations 176, 227 and 273 on a Hermosa Pink background

### Requirement: Combination page shows the colors with prev/next links

`/combination/<n>` SHALL show:
- a sticky header with "Combination: <n>", a copyable hex for each color in the combination, and Prev/Next links to `/combination/<n-1>` and `/combination/<n+1>`
- an "Index" link to `/`
- a full-screen row of equal-width color bars, one per color, each linking to that color's swatch page and showing the color name on hover

Prev SHALL be hidden on combination 1 and Next SHALL be hidden on combination 348.

#### Scenario: Middle combination

- **WHEN** a visitor opens `/combination/100`
- **THEN** the page shows both Prev (to 99) and Next (to 101), and one color bar per color in combination 100

#### Scenario: Range ends

- **WHEN** a visitor opens `/combination/1` or `/combination/348`
- **THEN** Prev is hidden on 1 and Next is hidden on 348

### Requirement: Hex values can be copied

Clicking a hex value in a swatch or combination header SHALL copy it to the clipboard. A centred "<hex> Copied" notice, filled with that color, SHALL then fade up for about 1.15s, and the copied state SHALL reset after 2.5s.

#### Scenario: Copy a hex

- **WHEN** the visitor clicks a hex value
- **THEN** the hex is on the clipboard and the "<hex> Copied" notice is shown

### Requirement: About page content

`/about` SHALL show the same Wada Sanzō biography as alpha, with its Japanese text marked `lang="ja-jp"`, followed by the Colophon credits and links, under the title header.

#### Scenario: About page

- **WHEN** a visitor opens `/about`
- **THEN** the biography and Colophon match alpha's text and links

### Requirement: Navigation behaves like alpha

Moving between pages in the app SHALL load the new page without a full reload and SHALL scroll to the top of it.

#### Scenario: Scroll reset

- **WHEN** a visitor scrolled down the landing page clicks a swatch tile
- **THEN** the swatch page opens scrolled to the top

### Requirement: Document metadata and static assets match alpha

Every page SHALL have alpha's title "WADA SANZO | DICTIONARY OF COLOR COMBINATIONS", its meta description, its viewport settings and a white page background. The files alpha serves under `/assets/` (`colors.json`, `fonts.css`, the font files and `swada-colors.jpg`) SHALL be served at the same paths.

#### Scenario: JSON API path

- **WHEN** `/assets/colors.json` is requested
- **THEN** the same file alpha serves is returned

### Requirement: Standalone Vercel deployment

The app SHALL deploy as its own Vercel project, built from the monorepo with only the beta app's build. Building or deploying beta SHALL NOT build alpha or change alpha's Netlify deployment.

#### Scenario: Beta deploy leaves alpha alone

- **WHEN** a commit triggers the beta Vercel build
- **THEN** only `sanzo-wada-beta` is built, and alpha's Netlify site is unchanged
