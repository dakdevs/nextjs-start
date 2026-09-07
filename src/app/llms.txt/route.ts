import { markdownResponse } from '~/modules/agent-content/markdown-response'
import { publicContentIndex } from '~/modules/agent-content/public-content-index'

export function GET() {
  return markdownResponse(publicContentIndex())
}
