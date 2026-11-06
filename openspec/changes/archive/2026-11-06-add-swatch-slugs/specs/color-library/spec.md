# Spec Delta

## MODIFIED Requirements

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
