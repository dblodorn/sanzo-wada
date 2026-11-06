import { Landing } from '@/views'
import { allColors, swatchGroups } from '@/colors'

export default function Page() {
  return <Landing color_list={swatchGroups} color_list_flat={allColors} />
}
