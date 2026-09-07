import { homeContent } from '~/app/_modules/home-content'
import { markdownResponse } from '~/modules/agent-content/markdown-response'

export function GET() {
  return markdownResponse(
    `# ${homeContent.title}\n\n${homeContent.eyebrow}\n\n${homeContent.description}\n\n[Canonical page](/) · [Content index](/sitemap.md)\n`,
  )
}
