import type { Combination } from '@/colors'
import { textColorOn } from '@/styles/textColor'
import { CARD_SIZE, CREDIT } from './card'

const PAD = 60

// Satori markup: inline styles only, and flex on every element with children
export default function CombinationCard({ number, colors }: Combination) {
  const nameSize = colors.length > 3 ? 36 : 44
  // "Combination" is one unbreakable word; at four bars it must fit 210px
  const titleSize = colors.length > 3 ? 36 : 48
  // Satori only wraps text to an explicit width, so each bar and its text get one
  const barWidth = CARD_SIZE.width / colors.length
  const textWidth = barWidth - PAD * 1.5
  return (
    <div style={{ ...CARD_SIZE, display: 'flex', fontFamily: 'fff-regular' }}>
      {colors.map((color, i) => (
        <div
          key={color.slug}
          style={{
            width: barWidth,
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: `${PAD}px ${PAD / 2}px ${PAD}px ${PAD}px`,
            backgroundColor: color.hex,
            color: textColorOn(color.hex),
          }}
        >
          {i === 0 ? (
            // The title and credit wrap within the first bar, so later bars never cover them
            <div style={{ display: 'flex', flexDirection: 'column', width: textWidth }}>
              <div
                style={{ fontSize: titleSize, lineHeight: 1.1 }}
              >{`Combination ${number}`}</div>
              <div style={{ fontSize: 22, lineHeight: 1.3, marginTop: 12 }}>{CREDIT}</div>
            </div>
          ) : (
            <div />
          )}
          <div style={{ display: 'flex', flexDirection: 'column', width: textWidth }}>
            <div style={{ fontSize: nameSize, lineHeight: 1.1 }}>{color.name}</div>
            <div style={{ fontSize: 28, marginTop: 12 }}>{color.hex}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
