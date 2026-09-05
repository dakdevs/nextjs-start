'use client'

import { SimpleGrid } from '@chakra-ui/react'
import { ActivityIcon, DatabaseIcon, KeyRoundIcon, UsersIcon } from 'lucide-react'
import type { InferRouterContractOutputs } from '@orpc/contract'

import { AdminHomeWebMcpTools } from '~/app/(admin)/admin/_modules/admin-home-webmcp-tools'
import { AdminPage, AdminPageHeader } from '~/app/(admin)/admin/_modules/admin-page'
import { AdminWorkflowCard } from '~/app/(admin)/admin/_modules/admin-workflow-card'
import { adminContracts } from '~/domains/admin/contracts'

type AdminHomeSummary = InferRouterContractOutputs<
  typeof adminContracts.getAdminHomeSummaryForAdminHome
>

export function AdminHome({ summary }: { readonly summary: AdminHomeSummary }) {
  return (
    <AdminPage>
      <AdminHomeWebMcpTools />
      <AdminPageHeader
        eyebrow="Operations"
        title="What needs attention?"
        description="Start with the outcome you need. Each workflow shows only the information and actions required to finish it safely."
      />
      <SimpleGrid
        columns={{ base: 1, sm: 2, xl: 4 }}
        gap="4"
        mt="10"
      >
        <AdminWorkflowCard
          title="Support a person"
          description="Find an account and send a secure password-reset email."
          href="/admin/users"
          icon={UsersIcon}
          metric={`${summary.userCount} people · ${summary.administratorCount} admins`}
        />
        <AdminWorkflowCard
          title="Understand the data"
          description="See what each domain stores and which security data stays hidden."
          href="/admin/data"
          icon={DatabaseIcon}
          metric="Curated catalog"
        />
        <AdminWorkflowCard
          title="Manage service access"
          description="Create, rotate, or revoke narrowly scoped machine credentials."
          href="/admin/service-accounts"
          icon={KeyRoundIcon}
          metric={`${summary.activeServiceAccountCount} active`}
        />
        <AdminWorkflowCard
          title="Review admin activity"
          description="Trace security-sensitive administrative outcomes."
          href="/admin/activity"
          icon={ActivityIcon}
          metric="Immutable history"
        />
      </SimpleGrid>
    </AdminPage>
  )
}
