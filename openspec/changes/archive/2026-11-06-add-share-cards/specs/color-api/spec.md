# Spec Delta

## MODIFIED Requirements

### Requirement: Consistent resource shapes

A single resource SHALL be returned as `{ "data": <resource> }` and a list as `{ "data": [<resource>, ...], "count": <number of items> }`.

A color resource SHALL have every field a color has in `/assets/colors.json` (`index` from the flat list, `name`, `slug`, `cmyk_array`, `cmyk`, `rgb_array`, `rgb`, `hex`, `combinations`, `use_count`), with the same values, plus:
- `group`: its swatch group id, `a` to `f`
- `url`: the absolute URL of its page on the site
- `api_url`: the absolute URL of its `/api/v1/colors/{slug}` resource
- `card_url`: the absolute URL of its share card, `/swatch/{slug}/card.png`

A combination resource SHALL have:
- `number`
- `size`: its number of colors
- `colors`: its colors in the library's order, each with `name`, `slug`, `hex`, `url`, `api_url` and `card_url`
- `url`, `api_url` and `card_url` (`/combination/{n}/card.png`) for the combination itself

#### Scenario: Color list matches the public JSON

- **WHEN** `/api/v1/colors` is requested
- **THEN** `count` is 159, and each entry equals the entry at the same position in `/assets/colors.json` plus `group`, `url`, `api_url` and `card_url`

#### Scenario: Links resolve

- **WHEN** the `url`, `api_url` and `card_url` of any returned color or combination are requested
- **THEN** the `url` returns that resource's page with status 200, the `api_url` returns the same resource, and the `card_url` returns its share card as `image/png` with status 200
