import chroma from 'chroma-js'
import { colors } from './theme.json'

// Text on a color: light grey where it contrasts enough, else the theme's black.
// Shared by the swatch page and the share cards so they always agree.
export const textColorOn = (hex: string): string =>
  chroma.contrast(hex, colors.grey) > 2 ? colors.grey : colors.black
