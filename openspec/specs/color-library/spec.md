# color-library Specification

## Purpose

Provides the typed Sanzo Wada color dataset (159 colors in six swatch groups, 348 combinations) and the derived values and lookups every page of the app is built from.

## Requirements

### Requirement: Source dataset is loaded unchanged

The library SHALL load the six swatch groups (a through f) from the existing swatch JSON. Each raw color has:
- a `name`;
- a `slug`;
- a `cmyk` tuple of four values from 0 to 100;
- a list of combination numbers.

Group order, color order within each group, and every raw value SHALL be preserved, with one exception: "Dull Violet Black" has its out-of-range magenta corrected from 106 to 100. A value outside 0–100 SHALL fail the build.

#### Scenario: Group sizes match the source data

- **WHEN** the dataset is loaded
- **THEN** there are six groups, holding 38, 49, 23, 23, 20 and 6 colors in that order, 159 colors in total

#### Scenario: Raw data is not altered

- **WHEN** a color is read from the library
- **THEN** its name, slug, CMYK values and combination list are the same as in the source JSON, except for the corrected magenta of Dull Violet Black

#### Scenario: Out-of-range CMYK fails the build

- **WHEN** a swatch JSON entry has a CMYK value below 0 or above 100
- **THEN** the build fails with an error naming the color

#### Scenario: Corrected Dull Violet Black

- **WHEN** Dull Violet Black is read from the library
- **THEN** its `cmyk_array` is `[95, 100, 38, 50]`, its `cmyk` is `C:95 / M:100 / Y:38 / K:50`, and its `hex` is still `#06004f`, the same as alpha's

### Requirement: Colors are enriched with derived values

For each color the library SHALL provide:
- `index`: its 1-based position
- `slug`: the color's stored slug (see the `swatch-slugs` capability)
- `cmyk_array`: the raw CMYK values
- `cmyk`: the string `C:<c> / M:<m> / Y:<y> / K:<k>`
- `hex`: the CMYK values divided by 100 and converted to a hex color
- `rgb_array`: the RGB of that hex
- `rgb`: the string `R:<r> / G:<g> / B:<b>`
- `use_count`: the number of combinations the color appears in

Every value SHALL be identical to what alpha computes for the same color, with two exceptions:
- the CMYK fields of the corrected Dull Violet Black;
- the slugs of the seven colors whose names contain `|`, `'` or ` - `.

#### Scenario: Derived values match alpha

- **WHEN** every color in the library is compared with alpha's runtime color list
- **THEN** all 159 colors have the same `index`, `slug`, `hex`, `rgb`, `rgb_array`, `cmyk`, `cmyk_array` and `use_count`, with only these differences:
  - Dull Violet Black's `cmyk` and `cmyk_array`;
  - the `slug` of the seven punctuated colors.

#### Scenario: Slugs keep alpha's punctuation

- **WHEN** "Eugenia Red | A" and "Hay's Russet" are read from the library
- **THEN** their slugs are `eugenia-red-a` and `hays-russet`, where alpha has `eugenia-red-|-a` and `hay's-russet`

### Requirement: Index numbering follows alpha's two lists

The library SHALL provide both lists alpha provides. In the grouped list, `index` restarts at 1 in each group. In the flat list of all 159 colors, `index` runs from 1 to 159 in group order.

#### Scenario: Grouped index restarts per group

- **WHEN** the first color of group b is read from the grouped list
- **THEN** its `index` is 1

#### Scenario: Flat index is continuous

- **WHEN** the first color of group b is read from the flat list
- **THEN** its `index` is 39

### Requirement: Colors can be looked up by slug

The library SHALL return the color whose slug matches a given slug, and SHALL report that nothing was found for a slug that matches no color. Every slug SHALL be unique.

#### Scenario: Known slug

- **WHEN** a color is looked up by the slug `hermosa-pink`
- **THEN** the library returns Hermosa Pink with all its derived values

#### Scenario: Unknown slug

- **WHEN** a color is looked up by a slug that no color has
- **THEN** the library reports that no color was found

### Requirement: Combinations are derived from color membership

A combination is never stored. The library SHALL derive combination `n` as every color whose combination list contains `n`, in flat-list order, giving each color's `hex`, `name` and `slug`. Combination numbers SHALL run from 1 to 348. The library SHALL expose the full range of valid numbers and SHALL report that nothing was found for any number outside it.

#### Scenario: Every combination has colors

- **WHEN** combinations 1 to 348 are derived
- **THEN** each one has between two and four colors

#### Scenario: Combination order matches alpha

- **WHEN** a combination is derived
- **THEN** its colors appear in the same order as on alpha's page for that combination

#### Scenario: Out-of-range number

- **WHEN** combination 0, 349 or a non-numeric value is requested
- **THEN** the library reports that no combination was found

### Requirement: The library is fully typed

The raw color, enriched color, swatch group and combination shapes, and every function the library exposes, SHALL have static types. A strict type check of code that uses the library SHALL pass without escape hatches (no `any`) at the library's public boundary.

#### Scenario: Misuse is caught at compile time

- **WHEN** code reads a field the enriched color doesn't have, or passes a number where a slug is expected
- **THEN** the type check fails

### Requirement: Colors report their swatch group

The library SHALL give each color the id of the swatch group it belongs to, `a` through `f`, matching the source file it comes from (`swatches_a.json` is group `a`). It SHALL also list the groups in order, with each group's id, its number of colors and its colors.

#### Scenario: Group of a color

- **WHEN** the first color of the second source file is read
- **THEN** its group is `b`

#### Scenario: Group listing

- **WHEN** the groups are listed
- **THEN** there are six groups, `a` to `f`, with 38, 49, 23, 23, 20 and 6 colors

### Requirement: Colors can be searched by name

The library SHALL return the colors whose name contains a given text. Matching SHALL ignore case, and both the name and the text SHALL be compared with apostrophes removed and every other run of punctuation or spaces treated as a single space. An optional group id SHALL limit the results to that group. Results SHALL be in flat-list order. An empty text with no group SHALL return every color.

#### Scenario: Case-insensitive substring

- **WHEN** colors are searched for `RED`
- **THEN** 19 colors are returned, starting with Coral Red, Spinel Red and Eugenia Red | A

#### Scenario: Punctuation is ignored

- **WHEN** colors are searched for `hays russet`
- **THEN** Hay's Russet is returned

#### Scenario: Search within a group

- **WHEN** colors are searched for `red` in group `a`
- **THEN** only the matching colors from group `a` are returned

#### Scenario: No match

- **WHEN** colors are searched for text that no name contains
- **THEN** an empty list is returned

### Requirement: Combinations can be found by the colors they contain

Given one or more color slugs, the library SHALL return every combination that contains all of those colors, in ascending combination number, each with its colors as defined for derived combinations. An optional size (2, 3 or 4) SHALL limit the results to combinations with that many colors. If a given slug matches no color, the library SHALL report which slug was not found instead of returning results.

#### Scenario: Combinations with one color

- **WHEN** combinations containing `hermosa-pink` are requested
- **THEN** combinations 176, 227 and 273 are returned

#### Scenario: Combinations with several colors

- **WHEN** combinations containing two colors are requested
- **THEN** every returned combination contains both colors, and no combination containing both is left out

#### Scenario: Filter by size

- **WHEN** combinations containing a color are requested with size 2
- **THEN** only the combinations of exactly two colors are returned

#### Scenario: Unknown color

- **WHEN** combinations containing a slug that no color has are requested
- **THEN** the library reports that slug as not found

### Requirement: Nearest colors can be found for any hex value

Given a hex color, the library SHALL rank all 159 colors by their CIEDE2000 color difference from it, nearest first, breaking ties by flat-list index. It SHALL return the requested number of colors, from 1 to 20, defaulting to 5, each with its distance rounded to two decimal places. The hex value SHALL be accepted as `#rrggbb`, `rrggbb`, `#rgb` or `rgb` in any letter case. Any other value SHALL be reported as invalid.

#### Scenario: Exact match ranks first

- **WHEN** the nearest colors to `#ffb3f0` are requested
- **THEN** the first result is Hermosa Pink with a distance of 0

#### Scenario: Short and unprefixed forms

- **WHEN** the nearest colors to `FFF`, `#fff` and `#FFFFFF` are requested
- **THEN** the three results are identical

#### Scenario: Result count

- **WHEN** the nearest colors are requested with a count of 3
- **THEN** exactly three colors are returned, in ascending distance

#### Scenario: Invalid hex

- **WHEN** the nearest colors to `#12345` or `blue` are requested
- **THEN** the library reports that the hex value is invalid
