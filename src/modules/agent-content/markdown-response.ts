export function markdownResponse(content: string) {
  return new Response(content, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'private, no-store',
      Vary: 'Accept',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}
