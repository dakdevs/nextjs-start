import { describe, expect, it } from 'vitest'

import { prefersMarkdown } from './prefers-markdown'

describe('document format preferences', () => {
  it.each([
    [null, false],
    ['*/*', false],
    ['text/*', false],
    ['text/html', false],
    ['application/json', false],
    ['text/markdown', true],
    ['TEXT/MARKDOWN', true],
    ['text/markdown, text/html, */*', true],
    ['text/html, text/markdown', false],
    ['text/markdown;q=0, text/html', false],
    ['text/markdown;q=0, */*', false],
    ['text/markdown;q=0.2, text/html;q=0.9', false],
    ['text/html;q=0.2, text/markdown;q=0.9', true],
    ['text/markdown;q=0.2, */*;q=0.9', false],
    ['text/markdownish', false],
  ])('negotiates %s to Markdown: %s', (accept, expected) => {
    expect(prefersMarkdown(accept)).toBe(expected)
  })
})
