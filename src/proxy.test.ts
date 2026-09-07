import { NextRequest } from 'next/server'
import { unstable_doesMiddlewareMatch } from 'next/experimental/testing/server'
import { describe, expect, it } from 'vitest'

import { config, proxy } from './proxy'

describe('home document negotiation', () => {
  it.each([
    ['/', true],
    ['/account', false],
    ['/admin/users', false],
    ['/sign-in', false],
    ['/api/auth/session', false],
    ['/rpc/account', false],
    ['/.well-known/workflow/v1/flow', false],
    ['/_next/static/app.js', false],
    ['/index.md', false],
    ['/missing', false],
    ['/missing.md', false],
    ['/account.md', false],
    ['/admin.md', false],
  ])('limits negotiation to published content at %s', (url, expected) => {
    expect(unstable_doesMiddlewareMatch({ config, nextConfig: {}, url })).toBe(expected)
  })

  it.each(['GET', 'HEAD'])('rewrites a Markdown %s read', (method) => {
    const response = proxy(
      new NextRequest('https://example.test/?source=docs', {
        method,
        headers: { accept: 'text/markdown' },
      }),
    )
    expect(response.headers.get('x-middleware-rewrite')).toBe(
      'https://example.test/index.md?source=docs',
    )
    expect(response.headers.get('vary')).toContain('Accept')
    expect(response.headers.get('cache-control')).toBe('private, no-store')
  })

  it.each([
    { method: 'POST', headers: { accept: 'text/markdown' } },
    { headers: { accept: 'text/markdown', rsc: '1' } },
    { headers: { accept: 'text/markdown', 'next-router-state-tree': '[]' } },
    { headers: { accept: 'text/markdown', 'next-action': 'action' } },
    { headers: { accept: 'text/html' } },
  ])('leaves non-document traffic on its original route: %j', (init) => {
    const response = proxy(new NextRequest('https://example.test/', init))
    expect(response.headers.has('x-middleware-rewrite')).toBe(false)
    expect(response.headers.get('vary')).toContain('Accept')
  })

  it('does not rewrite an RSC query', () => {
    const response = proxy(
      new NextRequest('https://example.test/?_rsc=abc', {
        headers: { accept: 'text/markdown' },
      }),
    )
    expect(response.headers.has('x-middleware-rewrite')).toBe(false)
  })
})
