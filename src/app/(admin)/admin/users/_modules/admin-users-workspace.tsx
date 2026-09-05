'use client'

import { Box, Button, Flex, Input, Text, VStack } from '@chakra-ui/react'
import { useInfiniteQuery, useMutation } from '@tanstack/react-query'
import { SearchIcon, SendIcon, XIcon } from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useQueryState } from 'nuqs'
import { useCallback, useDeferredValue, useEffect, useMemo, useState } from 'react'
import type { InferRouterContractOutputs } from '@orpc/contract'
import type { z } from 'zod'

import { adminMutationFailureMessage } from '~/app/(admin)/admin/_modules/admin-mutation-message'
import {
  AdminPage,
  AdminPageHeader,
  AdminSectionHeading,
} from '~/app/(admin)/admin/_modules/admin-page'
import { AdminUsersWebMcpTools } from '~/app/(admin)/admin/users/_modules/admin-users-webmcp-tools'
import {
  adminContracts,
  adminPaginatedSearchInputSchema,
} from '~/domains/admin/contracts'
import { rpc } from '~/orpc/client'

type UsersResult = InferRouterContractOutputs<
  typeof adminContracts.listUsersForAdminUserSupport
>
type AdminUser = UsersResult['users'][number]
type UsersInput = z.output<typeof adminPaginatedSearchInputSchema>

const initialUsersCursor: UsersResult['nextCursor'] = null

function usersPageInput(
  cursor: UsersResult['nextCursor'],
  query: string | undefined,
): UsersInput {
  const input: UsersInput = {}
  if (cursor !== null) input.cursor = cursor
  if (query !== undefined) input.query = query
  return input
}

function usersInfiniteOptions(initial: UsersResult, query: string | undefined) {
  const baseOptions = {
    getNextPageParam: (lastPage: UsersResult) => lastPage.nextCursor,
    initialPageParam: initialUsersCursor,
    input: (cursor: UsersResult['nextCursor']) => usersPageInput(cursor, query),
  }

  if (query === undefined)
    return rpc.admin.listUsersForAdminUserSupport.infiniteOptions({
      ...baseOptions,
      initialData: { pageParams: [initialUsersCursor], pages: [initial] },
    })

  return rpc.admin.listUsersForAdminUserSupport.infiniteOptions(baseOptions)
}

const dateFormatter = new Intl.DateTimeFormat('en', {
  dateStyle: 'medium',
})

function usersEmptyStateMessage(isPending: boolean) {
  return isPending ? 'Finding people…' : 'No people match that search.'
}

export function AdminUsersWorkspace({ initial }: { readonly initial: UsersResult }) {
  const [query, setQuery] = useQueryState('q', { defaultValue: '' })
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const deferredQuery = useDeferredValue(query.trim())
  const searchQuery = deferredQuery === '' ? undefined : deferredQuery
  const reduceMotion = useReducedMotion() === true

  const usersQuery = useInfiniteQuery(usersInfiniteOptions(initial, searchQuery))
  const visibleUsers = useMemo(
    () => usersQuery.data?.pages.flatMap((page) => page.users) ?? [],
    [usersQuery.data?.pages],
  )

  const selectedUser = visibleUsers.find((user) => user.id === selectedUserId)
  useEffect(() => {
    if (selectedUserId === null) return
    document.querySelector<HTMLElement>('#admin-reset-confirm')?.focus()
  }, [selectedUserId])

  const resetMutation = useMutation(
    rpc.admin.requestPasswordResetForAdminUserSupport.mutationOptions({
      onSuccess: ({ audit }) => {
        setMessage(`Password-reset email requested. Reference ${audit.correlationId}.`)
      },
      onError: (error) => {
        setMessage(adminMutationFailureMessage(error))
      },
    }),
  )

  const prepareReset = useCallback(
    (user: AdminUser) => {
      resetMutation.reset()
      setMessage(null)
      setSelectedUserId(user.id)
    },
    [resetMutation],
  )

  const prepareResetById = useCallback(
    ({ userId }: { readonly userId: string }) => {
      const user = visibleUsers.find((candidate) => candidate.id === userId)
      if (user !== undefined) prepareReset(user)
    },
    [prepareReset, visibleUsers],
  )

  return (
    <AdminPage>
      <AdminUsersWebMcpTools onPasswordResetPrepared={prepareResetById} />
      <AdminPageHeader
        eyebrow="People"
        title="Support a person"
        description="Find the right account and initiate a secure recovery email. Passwords, reset links, and session tokens are never visible here."
      />

      <Box
        bg="var(--card)"
        borderRadius="2xl"
        p={{ base: '5', sm: '6' }}
        mt="10"
      >
        <AdminSectionHeading description="Search by display name or email address.">
          Find an account
        </AdminSectionHeading>
        <label
          className="sr-only"
          htmlFor="admin-user-search"
        >
          Search people
        </label>
        <Flex
          align="center"
          bg="var(--input)"
          borderRadius="xl"
          gap="3"
          mt="4"
          px="4"
        >
          <SearchIcon aria-hidden="true" />
          <Input
            id="admin-user-search"
            value={query}
            aria-label="Search people"
            bg="transparent"
            border="0"
            minH="48px"
            px="0"
            placeholder="Name or email"
            onChange={(event) => {
              void setQuery(event.target.value)
            }}
          />
        </Flex>
      </Box>

      <AnimatePresence initial={false}>
        {selectedUser === undefined ? null : (
          <motion.div
            key={selectedUser.id}
            initial={{ opacity: 0, y: reduceMotion ? 0 : 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduceMotion ? 0 : -4 }}
            transition={{ duration: reduceMotion ? 0 : 0.18, ease: 'easeOut' }}
          >
            <Box
              id="admin-reset-workflow"
              bg="var(--accent)"
              borderRadius="2xl"
              p={{ base: '5', sm: '6' }}
              mt="4"
              role="region"
              aria-labelledby="admin-reset-heading"
            >
              <Flex
                align="start"
                justify="space-between"
                gap="4"
              >
                <Box>
                  <Text
                    id="admin-reset-heading"
                    className="text-body"
                    fontWeight="semibold"
                  >
                    Send a reset email to {selectedUser.name}?
                  </Text>
                  <Text
                    className="text-ui"
                    color="var(--muted-foreground)"
                    mt="2"
                  >
                    {selectedUser.email}
                  </Text>
                  <Text
                    className="text-ui"
                    color="var(--muted-foreground)"
                    mt="2"
                  >
                    They receive a provider-issued, single-use recovery handoff. You
                    will not see the link.
                  </Text>
                </Box>
                <Button
                  aria-label="Close password-reset workflow"
                  bg="transparent"
                  minH="44px"
                  minW="44px"
                  p="0"
                  onClick={() => {
                    setSelectedUserId(null)
                    setMessage(null)
                  }}
                >
                  <XIcon aria-hidden="true" />
                </Button>
              </Flex>
              <form
                method="post"
                onSubmit={(event) => {
                  event.preventDefault()
                  setMessage(null)
                  resetMutation.mutate({ userId: selectedUser.id })
                }}
              >
                <Flex
                  align="center"
                  justify="space-between"
                  gap="4"
                  mt="5"
                  wrap="wrap"
                >
                  <Text
                    aria-live="polite"
                    className="text-ui"
                    color="var(--muted-foreground)"
                  >
                    {message}
                  </Text>
                  <Button
                    id="admin-reset-confirm"
                    type="submit"
                    bg="var(--foreground)"
                    color="var(--background)"
                    minH="44px"
                    disabled={resetMutation.isPending || resetMutation.isSuccess}
                    _hover={{ opacity: 0.88 }}
                  >
                    <SendIcon aria-hidden="true" />
                    {resetMutation.isPending ? 'Requesting…' : 'Confirm reset email'}
                  </Button>
                </Flex>
              </form>
            </Box>
          </motion.div>
        )}
      </AnimatePresence>

      <VStack
        align="stretch"
        gap="3"
        mt="6"
      >
        {visibleUsers.map((user) => (
          <Flex
            key={user.id}
            align={{ base: 'stretch', sm: 'center' }}
            bg="var(--card)"
            borderRadius="2xl"
            direction={{ base: 'column', sm: 'row' }}
            gap="4"
            justify="space-between"
            p={{ base: '5', sm: '6' }}
          >
            <Box minW="0">
              <Flex
                align="center"
                gap="2"
                wrap="wrap"
              >
                <Text fontWeight="semibold">{user.name}</Text>
                <Box
                  as="span"
                  className="text-ui"
                  bg={user.role === 'admin' ? 'var(--accent)' : 'var(--muted)'}
                  borderRadius="full"
                  px="2.5"
                  py="1"
                >
                  {user.role}
                </Box>
              </Flex>
              <Text
                color="var(--muted-foreground)"
                mt="1"
                overflowWrap="anywhere"
              >
                {user.email}
              </Text>
              <Text
                className="text-ui"
                color="var(--muted-foreground)"
                mt="2"
              >
                Joined {dateFormatter.format(user.createdAt)} ·{' '}
                {user.emailVerified ? 'Verified email' : 'Email not verified'}
              </Text>
            </Box>
            <Button
              data-admin-reset-user-id={user.id}
              bg="var(--muted)"
              color="var(--foreground)"
              minH="44px"
              onClick={() => {
                prepareReset(user)
              }}
              _hover={{ bg: 'var(--accent)' }}
            >
              Send reset email
            </Button>
          </Flex>
        ))}
        {visibleUsers.length === 0 ? (
          <Box
            bg="var(--card)"
            borderRadius="2xl"
            p="8"
            textAlign="center"
          >
            <Text color="var(--muted-foreground)">
              {usersEmptyStateMessage(usersQuery.isPending)}
            </Text>
          </Box>
        ) : null}
        {usersQuery.hasNextPage ? (
          <Button
            alignSelf="center"
            bg="var(--muted)"
            color="var(--foreground)"
            minH="44px"
            disabled={usersQuery.isFetchingNextPage}
            onClick={() => {
              void usersQuery.fetchNextPage()
            }}
            _hover={{ bg: 'var(--accent)' }}
          >
            {usersQuery.isFetchingNextPage ? 'Loading…' : 'Load more people'}
          </Button>
        ) : null}
      </VStack>
    </AdminPage>
  )
}
