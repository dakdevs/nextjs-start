import { expect, test } from '@playwright/test'

test('a reader discovers the home content and consumes its Markdown representation', async ({
  page,
  request,
}) => {
  const html = await page.goto('/')
  expect(html?.headers()['content-type']).toContain('text/html')
  expect(html?.headers()['vary']?.toLowerCase()).toContain('accept')
  await expect(
    page.getByRole('heading', { name: 'Build the product, not the foundation again.' }),
  ).toBeVisible()
  await expect(
    page.locator('link[rel="alternate"][type="text/markdown"]'),
  ).toHaveAttribute('href', '/index.md')

  const index = await request.get('/sitemap.md')
  expect(index.status()).toBe(200)
  expect(await index.text()).toContain('([Markdown](/index.md))')
  expect(await index.text()).not.toMatch(/\/admin|\/account|\/docs\/|token=/u)

  const markdown = await request.get('/', { headers: { accept: 'text/markdown' } })
  expect(markdown.status()).toBe(200)
  expect(markdown.headers()['content-type']).toBe('text/markdown; charset=utf-8')
  expect(markdown.headers()['vary']?.toLowerCase()).toContain('accept')
  expect(markdown.headers()['cache-control']).toContain('no-store')
  const content = await markdown.text()
  expect(content).toContain('# Build the product, not the foundation again.')
  expect(content).toContain('purpose-built contracts, durable backend boundaries')
  expect(content).not.toMatch(/<html|<script|__next/u)
  expect(await (await request.get('/index.md')).text()).toBe(content)
  expect(await (await request.get('/llms.txt')).text()).toBe(await index.text())
  const head = await request.head('/', { headers: { accept: 'text/markdown' } })
  expect(head.headers()['content-type']).toContain('text/markdown')
  expect(await head.text()).toBe('')
})
