import { homeContent } from '~/app/_modules/home-content'

export function publicContentIndex() {
  return `# Public content index

Request a canonical page with Accept: text/markdown, or follow its Markdown link.

## Overview

- [${homeContent.title}](/) ([Markdown](/index.md)): ${homeContent.description}
`
}
