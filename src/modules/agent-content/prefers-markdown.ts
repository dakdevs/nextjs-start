import Negotiator from 'negotiator'

export function prefersMarkdown(accept: string | null) {
  const negotiation = new Negotiator({ headers: { accept: accept ?? '*/*' } })

  // Wildcard requests retain the browser representation. Explicit Markdown
  // preferences still honor quality values, exclusions, and header order.
  return negotiation.mediaType(['text/html', 'text/markdown']) === 'text/markdown'
}
