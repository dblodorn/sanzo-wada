# Spec Delta

## ADDED Requirements

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
