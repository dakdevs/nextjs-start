import { NextResponse, type NextRequest } from 'next/server'

import { prefersMarkdown } from '~/modules/agent-content/prefers-markdown'

export function proxy(request: NextRequest) {
  const isDocumentRead =
    (request.method === 'GET' || request.method === 'HEAD') &&
    !request.headers.has('rsc') &&
    !request.headers.has('next-router-state-tree') &&
    !request.headers.has('next-action') &&
    !request.nextUrl.searchParams.has('_rsc')

  const destination = request.nextUrl.clone()

  destination.pathname = '/index.md'

  const response =
    isDocumentRead && prefersMarkdown(request.headers.get('accept'))
      ? NextResponse.rewrite(destination)
      : NextResponse.next()

  response.headers.append('Vary', 'Accept')

  response.headers.set('Cache-Control', 'private, no-store')

  response.headers.append(
    'Link',
    '</index.md>; rel="alternate"; type="text/markdown", </sitemap.md>; rel="describedby"; type="text/markdown"',
  )

  return response
}

export const config = { matcher: ['/'] }
