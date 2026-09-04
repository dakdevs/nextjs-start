import { describe, expect, it } from 'vitest'

import { webMcpCapabilities } from '~/webmcp/capability-registry'

describe('browser WebMCP capability registry', () => {
  it('maps the account read and update to their exact shared oRPC contracts', () => {
    expect(webMcpCapabilities.getAccountProfile).toMatchObject({
      auth: 'authenticated',
      classification: 'shared-orpc',
      route: '/account',
      transport: 'shared-orpc',
      annotations: { readOnlyHint: true, untrustedContentHint: true },
    })
    expect(webMcpCapabilities.updateAccountProfile).toMatchObject({
      auth: 'authenticated',
      classification: 'shared-orpc',
      route: '/account',
      transport: 'shared-orpc',
      annotations: { idempotentHint: false, untrustedContentHint: true },
    })
  })

  it('requires human UI confirmation before a passkey ceremony', () => {
    expect(webMcpCapabilities.beginPasskeyEnrollment).toMatchObject({
      confirmation: 'human-ui',
      origin: 'same-origin',
      risk: 'credential',
      transport: 'ui-initiation',
    })
    expect(webMcpCapabilities.prepareSignOut).toMatchObject({
      auth: 'authenticated',
      confirmation: 'human-ui',
      classification: 'exempt',
      transport: 'ui-initiation',
    })
  })
})
