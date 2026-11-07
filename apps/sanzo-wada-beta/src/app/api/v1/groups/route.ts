import { list } from '@/api/http'
import { allGroupResources } from '@/api/resources'

export { DELETE, OPTIONS, PATCH, POST, PUT } from '@/api/http'

export function GET() {
  return list(allGroupResources())
}
