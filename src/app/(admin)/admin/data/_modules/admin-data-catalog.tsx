'use client'

import { Box, Flex, SimpleGrid, Text, VStack } from '@chakra-ui/react'
import { EyeOffIcon, Rows3Icon } from 'lucide-react'
import type { InferRouterContractOutputs } from '@orpc/contract'
import type { ReactNode } from 'react'

import {
  AdminPage,
  AdminPageHeader,
  AdminSectionHeading,
} from '~/app/(admin)/admin/_modules/admin-page'
import { AdminDataWebMcpTools } from '~/app/(admin)/admin/data/_modules/admin-data-webmcp-tools'
import { adminContracts } from '~/domains/admin/contracts'

type DataCatalog = InferRouterContractOutputs<
  typeof adminContracts.getDataCatalogForAdminDataCatalog
>
type AccountProfiles = InferRouterContractOutputs<
  typeof adminContracts.listAccountProfilesForAdminDataCatalog
>
type FailedQueueEvents = InferRouterContractOutputs<
  typeof adminContracts.listFailedQueueEventsForAdminDataCatalog
>
type WorkflowReceipts = InferRouterContractOutputs<
  typeof adminContracts.listWorkflowReceiptsForAdminDataCatalog
>

const dateTimeFormatter = new Intl.DateTimeFormat('en', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

function RecentDataSection({
  children,
  description,
  title,
}: {
  readonly children: ReactNode
  readonly description: string
  readonly title: string
}) {
  return (
    <Box mt="12">
      <AdminSectionHeading description={description}>{title}</AdminSectionHeading>
      <VStack
        align="stretch"
        gap="3"
        mt="4"
      >
        {children}
      </VStack>
    </Box>
  )
}

function EmptyRecentData({ children }: { readonly children: ReactNode }) {
  return (
    <Box
      bg="var(--card)"
      borderRadius="2xl"
      p={{ base: '5', sm: '6' }}
    >
      <Text color="var(--muted-foreground)">{children}</Text>
    </Box>
  )
}

export function AdminDataCatalog({
  catalog,
  recentEvents,
  recentProfiles,
  recentReceipts,
}: {
  readonly catalog: DataCatalog
  readonly recentEvents: FailedQueueEvents['recentEvents']
  readonly recentProfiles: AccountProfiles['recentProfiles']
  readonly recentReceipts: WorkflowReceipts['recentReceipts']
}) {
  return (
    <AdminPage>
      <AdminDataWebMcpTools />
      <AdminPageHeader
        eyebrow="Data"
        title="Understand what the application stores"
        description="This catalog covers every persisted table. Safe operational counts are visible; credential and security stores stay deliberately opaque."
      />
      <SimpleGrid
        columns={{ base: 1, md: 2 }}
        gap="4"
        mt="10"
      >
        {catalog.domains.map((domain) => {
          const isHidden = domain.visibility === 'security-hidden'
          const Icon = isHidden ? EyeOffIcon : Rows3Icon
          return (
            <Box
              key={domain.tableName}
              bg="var(--card)"
              borderRadius="2xl"
              p={{ base: '5', sm: '6' }}
            >
              <Flex
                align="start"
                justify="space-between"
                gap="5"
              >
                <Box>
                  <Text
                    className="text-ui"
                    color="var(--muted-foreground)"
                    fontWeight="medium"
                  >
                    {domain.category}
                  </Text>
                  <Text
                    fontWeight="semibold"
                    mt="2"
                  >
                    {domain.displayName}
                  </Text>
                </Box>
                <Flex
                  align="center"
                  justify="center"
                  bg="var(--muted)"
                  borderRadius="xl"
                  boxSize="44px"
                  flexShrink="0"
                >
                  <Icon aria-hidden="true" />
                </Flex>
              </Flex>
              <Text
                color="var(--muted-foreground)"
                lineHeight="tall"
                mt="4"
              >
                {domain.reason}
              </Text>
              <Flex
                align="baseline"
                justify="space-between"
                gap="4"
                mt="6"
              >
                <Box
                  as="code"
                  className="text-ui"
                  color="var(--muted-foreground)"
                >
                  {domain.tableName}
                </Box>
                <Text
                  className="text-ui"
                  fontWeight="semibold"
                >
                  {isHidden ? 'Security-hidden' : `${domain.rowCount ?? 0} rows`}
                </Text>
              </Flex>
            </Box>
          )
        })}
      </SimpleGrid>

      <RecentDataSection
        title="Recent account profiles"
        description="Most recent 50 profile updates. This is profile content only; account credentials and authentication records remain hidden."
      >
        {recentProfiles.length === 0 ? (
          <EmptyRecentData>No account profiles have been updated yet.</EmptyRecentData>
        ) : (
          recentProfiles.map((profile) => (
            <Box
              key={profile.accountId}
              bg="var(--card)"
              borderRadius="2xl"
              p={{ base: '5', sm: '6' }}
            >
              <Flex
                align={{ base: 'start', sm: 'center' }}
                justify="space-between"
                gap="4"
              >
                <Box minW="0">
                  <Text
                    className="text-ui"
                    color="var(--muted-foreground)"
                  >
                    Account ID
                  </Text>
                  <Text
                    fontFamily="mono"
                    mt="1"
                    overflowWrap="anywhere"
                  >
                    {profile.accountId}
                  </Text>
                </Box>
                <Text
                  className="text-ui"
                  color="var(--muted-foreground)"
                  flexShrink="0"
                >
                  {dateTimeFormatter.format(profile.updatedAt)}
                </Text>
              </Flex>
              <Text
                color="var(--muted-foreground)"
                lineHeight="tall"
                mt="4"
                overflowWrap="anywhere"
              >
                {profile.bio.length === 0 ? 'No bio provided.' : profile.bio}
              </Text>
            </Box>
          ))
        )}
      </RecentDataSection>

      <RecentDataSection
        title="Recent failed queue events"
        description="Most recent 50 failures. Payloads, credentials, and authentication material are never displayed."
      >
        {recentEvents.length === 0 ? (
          <EmptyRecentData>No failed queue events are awaiting review.</EmptyRecentData>
        ) : (
          recentEvents.map((event) => (
            <Box
              key={event.messageId}
              bg="var(--card)"
              borderRadius="2xl"
              p={{ base: '5', sm: '6' }}
            >
              <Flex
                align={{ base: 'start', sm: 'center' }}
                justify="space-between"
                gap="4"
              >
                <Box minW="0">
                  <Text
                    fontWeight="semibold"
                    overflowWrap="anywhere"
                  >
                    {event.consumerName}
                  </Text>
                  <Text
                    className="text-ui"
                    color="var(--muted-foreground)"
                    mt="1"
                  >
                    {event.deliveryCount} delivery attempts · {event.failureCode}
                  </Text>
                </Box>
                <Text
                  className="text-ui"
                  color="var(--muted-foreground)"
                  flexShrink="0"
                >
                  {dateTimeFormatter.format(event.failedAt)}
                </Text>
              </Flex>
              <Text
                className="text-ui"
                color="var(--muted-foreground)"
                mt="4"
                overflowWrap="anywhere"
              >
                Message ID: {event.messageId}
              </Text>
            </Box>
          ))
        )}
      </RecentDataSection>

      <RecentDataSection
        title="Recent workflow receipts"
        description="Most recent 50 confirmation receipts for completed workflow side effects."
      >
        {recentReceipts.length === 0 ? (
          <EmptyRecentData>
            No workflow receipts have been recorded yet.
          </EmptyRecentData>
        ) : (
          recentReceipts.map((receipt) => (
            <Box
              key={receipt.eventId}
              bg="var(--card)"
              borderRadius="2xl"
              p={{ base: '5', sm: '6' }}
            >
              <Flex
                align={{ base: 'start', sm: 'center' }}
                justify="space-between"
                gap="4"
              >
                <Box minW="0">
                  <Text fontWeight="semibold">Workflow receipt</Text>
                  <Text
                    className="text-ui"
                    color="var(--muted-foreground)"
                    mt="1"
                    overflowWrap="anywhere"
                  >
                    Subject: {receipt.subjectId}
                  </Text>
                </Box>
                <Text
                  className="text-ui"
                  color="var(--muted-foreground)"
                  flexShrink="0"
                >
                  {dateTimeFormatter.format(receipt.recordedAt)}
                </Text>
              </Flex>
              <Text
                className="text-ui"
                color="var(--muted-foreground)"
                mt="4"
                overflowWrap="anywhere"
              >
                Correlation ID: {receipt.correlationId}
              </Text>
            </Box>
          ))
        )}
      </RecentDataSection>
    </AdminPage>
  )
}
