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

  it('maps every admin read to its route-specific shared oRPC projection', () => {
    expect(webMcpCapabilities.getAdminHomeSummary).toMatchObject({
      auth: 'administrator',
      classification: 'shared-orpc',
      route: '/admin',
      transport: 'shared-orpc',
    })
    expect(webMcpCapabilities.listAdminUsers).toMatchObject({
      auth: 'administrator',
      classification: 'shared-orpc',
      route: '/admin/users',
      transport: 'shared-orpc',
      annotations: { readOnlyHint: true, untrustedContentHint: true },
    })
    expect(webMcpCapabilities.getAdminDataCatalog).toMatchObject({
      auth: 'administrator',
      classification: 'shared-orpc',
      route: '/admin/data',
      transport: 'shared-orpc',
    })
    const adminDataReads = [
      webMcpCapabilities.getAdminDataCatalog,
      webMcpCapabilities.listAdminAccountProfiles,
      webMcpCapabilities.listAdminFailedQueueEvents,
      webMcpCapabilities.listAdminWorkflowReceipts,
    ]
    for (const capability of adminDataReads) {
      expect(capability).toMatchObject({
        auth: 'administrator',
        classification: 'shared-orpc',
        confirmation: 'none',
        route: '/admin/data',
        transport: 'shared-orpc',
        annotations: { idempotentHint: true, readOnlyHint: true },
      })
    }
    expect(webMcpCapabilities.listAdminAccountProfiles.annotations).toMatchObject({
      untrustedContentHint: true,
    })
    expect(webMcpCapabilities.listAdminFailedQueueEvents.annotations).toMatchObject({
      untrustedContentHint: true,
    })
    expect(webMcpCapabilities.listAdminServiceAccounts).toMatchObject({
      auth: 'administrator',
      classification: 'shared-orpc',
      route: '/admin/service-accounts',
      transport: 'shared-orpc',
      annotations: { readOnlyHint: true, untrustedContentHint: true },
    })
    expect(webMcpCapabilities.listAdminActivity).toMatchObject({
      auth: 'administrator',
      classification: 'shared-orpc',
      route: '/admin/activity',
      transport: 'shared-orpc',
      annotations: { readOnlyHint: true, untrustedContentHint: true },
    })
  })

  it('makes admin credential operations human-confirmed UI handoffs', () => {
    const sensitiveCapabilities = [
      webMcpCapabilities.prepareAdminPasswordReset,
      webMcpCapabilities.prepareCreateServiceAccount,
      webMcpCapabilities.prepareRotateServiceAccount,
      webMcpCapabilities.prepareRevokeServiceAccount,
    ]

    for (const capability of sensitiveCapabilities) {
      expect(capability).toMatchObject({
        auth: 'administrator',
        classification: 'exempt',
        confirmation: 'human-ui',
        origin: 'same-origin',
        transport: 'ui-initiation',
      })
    }
    expect(webMcpCapabilities.prepareRevokeServiceAccount.annotations).toMatchObject({
      destructiveHint: true,
    })
  })
})
