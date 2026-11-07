import { apiDocs } from '@/api/docs'
import { siteOrigin } from '@/lib/origin'
import { Api } from '@/views'

export default function Page() {
  return <Api docs={apiDocs(siteOrigin())} />
}
