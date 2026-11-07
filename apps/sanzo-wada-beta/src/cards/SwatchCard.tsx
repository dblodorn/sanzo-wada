import type { Color } from '@/colors'
import { textColorOn } from '@/styles/textColor'
import { CARD_SIZE, CREDIT } from './card'

// Satori markup: inline styles only, and flex on every element with children
export default function SwatchCard({ name, hex }: Pick<Color, 'name' | 'hex'>) {
  const ink = textColorOn(hex)
  return (
    <div
      style={{
        ...CARD_SIZE,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 60,
        backgroundColor: hex,
        color: ink,
        fontFamily: 'fff-regular',
      }}
    >
      <div style={{ fontSize: 28 }}>{CREDIT}</div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: 96, lineHeight: 1.05 }}>{name}</div>
        <div style={{ fontSize: 48, marginTop: 16 }}>{hex}</div>
      </div>
    </div>
  )
}
