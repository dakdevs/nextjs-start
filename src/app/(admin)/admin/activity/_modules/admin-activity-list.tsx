'use client'

import { Box, Button, Flex, Input, Text, VStack } from '@chakra-ui/react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { CheckCircle2Icon, SearchIcon } from 'lucide-react'
import { useQueryState } from 'nuqs'
import { useDeferredValue, useMemo } from 'react'
import type { InferRouterContractOutputs } from '@orpc/contract'
import type { z } from 'zod'

import { AdminPage, AdminPageHeader } from '~/app/(admin)/admin/_modules/admin-page'
import { AdminActivityWebMcpTools } from '~/app/(admin)/admin/activity/_modules/admin-activity-webmcp-tools'
import {
  adminContracts,
  adminPaginatedSearchInputSchema,
} from '~/domains/admin/contracts'
import { rpc } from '~/orpc/client'

type ActivityResult = InferRouterContractOutputs<
  typeof adminContracts.listAdminActivityForAdminActivityScreen
>
type ActivityInput = z.output<typeof adminPaginatedSearchInputSchema>

const initialActivityCursor: ActivityResult['nextCursor'] = null

function activityPageInput(
  cursor: ActivityResult['nextCursor'],
  query: string | undefined,
): ActivityInput {
  const input: ActivityInput = {}
  if (cursor !== null) input.cursor = cursor
  if (query !== undefined) input.query = query
  return input
}

function activityInfiniteOptions(initial: ActivityResult, query: string | undefined) {
  const baseOptions = {
    getNextPageParam: (lastPage: ActivityResult) => lastPage.nextCursor,
    initialPageParam: initialActivityCursor,
    input: (cursor: ActivityResult['nextCursor']) => activityPageInput(cursor, query),
  }

  if (query === undefined)
    return rpc.admin.listAdminActivityForAdminActivityScreen.infiniteOptions({
      ...baseOptions,
      initialData: { pageParams: [initialActivityCursor], pages: [initial] },
    })

  return rpc.admin.listAdminActivityForAdminActivityScreen.infiniteOptions(baseOptions)
}

const dateTimeFormatter = new Intl.DateTimeFormat('en', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

export function AdminActivityList({ activity }: { readonly activity: ActivityResult }) {
  const [query, setQuery] = useQueryState('q', { defaultValue: '' })
  const deferredQuery = useDeferredValue(query.trim())
  const searchQuery = deferredQuery === '' ? undefined : deferredQuery
  const activityQuery = useInfiniteQuery(activityInfiniteOptions(activity, searchQuery))
  const events = useMemo(
    () => activityQuery.data?.pages.flatMap((page) => page.events) ?? [],
    [activityQuery.data?.pages],
  )

  return (
    <AdminPage>
      <AdminActivityWebMcpTools />
      <AdminPageHeader
        eyebrow="Activity"
        title="Review admin outcomes"
        description="Security-sensitive administrative work leaves a concise, immutable trail without recording credentials, reset links, or secret values."
      />
      <Box
        bg="var(--card)"
        borderRadius="2xl"
        p={{ base: '5', sm: '6' }}
        mt="10"
      >
        <label
          className="sr-only"
          htmlFor="admin-activity-search"
        >
          Search admin activity
        </label>
        <Flex
          align="center"
          bg="var(--input)"
          borderRadius="xl"
          gap="3"
          px="4"
        >
          <SearchIcon aria-hidden="true" />
          <Input
            id="admin-activity-search"
            value={query}
            aria-label="Search admin activity"
            bg="transparent"
            border="0"
            minH="48px"
            px="0"
            placeholder="Action name"
            onChange={(event) => {
              void setQuery(event.target.value)
            }}
          />
        </Flex>
      </Box>
      <VStack
        align="stretch"
        gap="3"
        mt="6"
      >
        {events.map((event) => (
          <Flex
            key={event.id}
            align={{ base: 'start', sm: 'center' }}
            bg="var(--card)"
            borderRadius="2xl"
            direction={{ base: 'column', sm: 'row' }}
            gap="4"
            justify="space-between"
            p={{ base: '5', sm: '6' }}
          >
            <Flex
              align="start"
              gap="4"
              minW="0"
            >
              <Flex
                align="center"
                justify="center"
                bg="var(--muted)"
                borderRadius="xl"
                boxSize="44px"
                flexShrink="0"
              >
                <CheckCircle2Icon aria-hidden="true" />
              </Flex>
              <Box minW="0">
                <Text
                  fontWeight="semibold"
                  overflowWrap="anywhere"
                >
                  {event.action}
                </Text>
                <Text
                  className="text-ui"
                  color="var(--muted-foreground)"
                  mt="1"
                >
                  {event.outcome} · {dateTimeFormatter.format(event.createdAt)}
                </Text>
                <Text
                  className="text-ui"
                  color="var(--muted-foreground)"
                  mt="2"
                  overflowWrap="anywhere"
                >
                  Actor {event.actorUserId ?? 'system'}
                  {event.subjectUserId === null
                    ? ''
                    : ` · Subject ${event.subjectUserId}`}
                </Text>
                <Text
                  className="text-ui"
                  color="var(--muted-foreground)"
                  mt="1"
                  overflowWrap="anywhere"
                >
                  Target {event.targetKind}:{event.targetId}
                </Text>
              </Box>
            </Flex>
            <Box
              as="code"
              className="text-ui"
              color="var(--muted-foreground)"
              overflowWrap="anywhere"
            >
              Ref {event.correlationId}
            </Box>
          </Flex>
        ))}
        {events.length === 0 ? (
          <Box
            bg="var(--card)"
            borderRadius="2xl"
            p="8"
            textAlign="center"
          >
            <Text color="var(--muted-foreground)">
              {activityQuery.isPending
                ? 'Finding activity…'
                : 'No admin activity matches that search.'}
            </Text>
          </Box>
        ) : null}
        {activityQuery.hasNextPage ? (
          <Button
            alignSelf="center"
            bg="var(--muted)"
            color="var(--foreground)"
            minH="44px"
            disabled={activityQuery.isFetchingNextPage}
            onClick={() => {
              void activityQuery.fetchNextPage()
            }}
            _hover={{ bg: 'var(--accent)' }}
          >
            {activityQuery.isFetchingNextPage ? 'Loading…' : 'Load more activity'}
          </Button>
        ) : null}
      </VStack>
    </AdminPage>
  )
}
