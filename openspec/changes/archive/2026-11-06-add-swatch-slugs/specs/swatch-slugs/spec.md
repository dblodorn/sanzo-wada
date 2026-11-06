# Spec Delta

## Purpose

Gives every color in the beta app a stored, URL-safe slug that is validated when the data loads. It also keeps alpha's old punctuated swatch URLs working by redirecting them to the new slugs.

## ADDED Requirements

### Requirement: Each color carries a stored slug

Every color in beta's swatch data SHALL have a `slug` field stored next to its `name`. The library SHALL use the stored slug as the color's slug and SHALL NOT derive one from the name. A color without a `slug` SHALL fail the build with an error naming the color and its group.

#### Scenario: Slug comes from the data

- **WHEN** Hermosa Pink is read from the library
- **THEN** its `slug` is the `hermosa-pink` stored in the swatch data

#### Scenario: Missing slug fails the build

- **WHEN** a swatch JSON entry has no `slug` field
- **THEN** the build fails with an error naming the color and its group

### Requirement: Slugs are normalized

Every slug SHALL contain only the lowercase letters a–z, the digits 0–9 and single hyphens. It SHALL NOT start or end with a hyphen or contain two hyphens in a row. Slugs are written from the color name with these rules:
- the name is lowercased;
- apostrophes are removed;
- each run of other characters that aren't letters or digits (spaces, `/`, `|`, `-`) becomes one hyphen.

For the 152 colors whose names have no `|`, `'` or ` - `, these rules give the same slug alpha uses.

#### Scenario: Punctuated names get clean slugs

- **WHEN** the slugs of the seven colors with punctuated names are read
- **THEN** they are:
  - `eugenia-red-a` and `eugenia-red-b` (Eugenia Red | A, Eugenia Red | B)
  - `grayish-lavender-a` and `grayish-lavender-b` (Grayish Lavender - A, Grayish Lavender - B)
  - `hays-russet` (Hay's Russet)
  - `pale-kings-blue` (Pale King's Blue)
  - `vandar-poels-blue` (Vandar Poel's Blue)

#### Scenario: Other slugs are unchanged

- **WHEN** any of the other 152 colors is read
- **THEN** its slug equals the slug alpha generates for it, for example `deep-violet-plumbeous` for "Deep Violet / Plumbeous"

#### Scenario: Malformed slug fails the build

- **WHEN** a swatch JSON entry has a slug with an uppercase letter, a space, punctuation other than single hyphens, or a leading or trailing hyphen
- **THEN** the build fails with an error naming the color and the bad slug

### Requirement: Slugs are unique

No two colors SHALL share a slug. A duplicate SHALL fail the build with an error naming the slug and both colors.

#### Scenario: Duplicate slug fails the build

- **WHEN** two swatch JSON entries have the same slug
- **THEN** the build fails with an error naming the slug and both colors

### Requirement: Legacy punctuated slugs redirect

Each of alpha's seven punctuated swatch URLs SHALL permanently redirect (HTTP 308) to the swatch URL with the normalized slug. This SHALL work whether the URL is requested literally or percent-encoded:

| Legacy slug | Normalized slug |
|---|---|
| `eugenia-red-\|-a` | `eugenia-red-a` |
| `eugenia-red-\|-b` | `eugenia-red-b` |
| `grayish-lavender---a` | `grayish-lavender-a` |
| `grayish-lavender---b` | `grayish-lavender-b` |
| `hay's-russet` | `hays-russet` |
| `pale-king's-blue` | `pale-kings-blue` |
| `vandar-poel's-blue` | `vandar-poels-blue` |

#### Scenario: Literal legacy URL

- **WHEN** `/swatch/hay's-russet` is requested
- **THEN** the response is a 308 redirect to `/swatch/hays-russet`

#### Scenario: Percent-encoded legacy URL

- **WHEN** `/swatch/eugenia-red-%7C-a` or `/swatch/hay%27s-russet` is requested
- **THEN** the response is a 308 redirect to `/swatch/eugenia-red-a` or `/swatch/hays-russet`

#### Scenario: Legacy hyphen run

- **WHEN** `/swatch/grayish-lavender---a` is requested
- **THEN** the response is a 308 redirect to `/swatch/grayish-lavender-a`
