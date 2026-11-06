// Alpha derived slugs from names and kept their punctuation. Beta stores
// normalized slugs, so these seven alpha URLs redirect to the new ones.
export const legacySlugs: Readonly<Record<string, string>> = {
  'eugenia-red-|-a': 'eugenia-red-a',
  'eugenia-red-|-b': 'eugenia-red-b',
  "hay's-russet": 'hays-russet',
  "pale-king's-blue": 'pale-kings-blue',
  "vandar-poel's-blue": 'vandar-poels-blue',
  'grayish-lavender---a': 'grayish-lavender-a',
  'grayish-lavender---b': 'grayish-lavender-b',
}
