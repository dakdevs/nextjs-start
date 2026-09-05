import { describe, expect, it, vi } from 'vitest'

import { createAdminDataWebMcpExecutors } from '~/app/(admin)/admin/data/_modules/admin-data-webmcp-tools'

describe('admin data browser WebMCP tools', () => {
  it('executes each exact visible admin data projection', async () => {
    const getDataCatalog = vi.fn<() => Promise<{ domains: never[] }>>(() =>
      Promise.resolve({ domains: [] }),
    )
    const listAccountProfiles = vi.fn<() => Promise<{ recentProfiles: never[] }>>(() =>
      Promise.resolve({ recentProfiles: [] }),
    )
    const listFailedQueueEvents = vi.fn<() => Promise<{ recentEvents: never[] }>>(() =>
      Promise.resolve({ recentEvents: [] }),
    )
    const listWorkflowReceipts = vi.fn<() => Promise<{ recentReceipts: never[] }>>(() =>
      Promise.resolve({ recentReceipts: [] }),
    )

    const executors = createAdminDataWebMcpExecutors({
      getDataCatalog,
      listAccountProfiles,
      listFailedQueueEvents,
      listWorkflowReceipts,
    })

    await expect(
      Promise.all([
        executors.getDataCatalog(),
        executors.listAccountProfiles(),
        executors.listFailedQueueEvents(),
        executors.listWorkflowReceipts(),
      ]),
    ).resolves.toEqual([
      { domains: [] },
      { recentProfiles: [] },
      { recentEvents: [] },
      { recentReceipts: [] },
    ])
    expect(getDataCatalog).toHaveBeenCalledOnce()
    expect(listAccountProfiles).toHaveBeenCalledOnce()
    expect(listFailedQueueEvents).toHaveBeenCalledOnce()
    expect(listWorkflowReceipts).toHaveBeenCalledOnce()
  })
})
