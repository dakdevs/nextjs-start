'use client'

import { Box, Button, Flex, Text } from '@chakra-ui/react'
import { useInfiniteQuery, useMutation } from '@tanstack/react-query'
import { SearchIcon, SendIcon, XIcon } from 'lucide-react'
import {
  AnimatePresence,
  domAnimation,
  LazyMotion,
  useReducedMotion,
} from 'motion/react'
import { div as MotionDiv } from 'motion/react-m'
import { useQueryState } from 'nuqs'
import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import type { InferRouterContractOutputs } from '@orpc/contract'
import type { z } from 'zod'

import { adminMutationFailureMessage } from '~/app/(admin)/admin/_modules/admin-mutation-message'
import {
  AdminPage,
  AdminPageHeader,
  AdminSectionHeading,
} from '~/app/(admin)/admin/_modules/admin-page'
import { AdminUserDirectory } from '~/app/(admin)/admin/users/_modules/admin-user-directory'
import { AdminUsersWebMcpTools } from '~/app/(admin)/admin/users/_modules/admin-users-webmcp-tools'
import {
  adminContracts,
  adminPaginatedSearchInputSchema,
} from '~/domains/admin/contracts'
import { rpc } from '~/orpc/client'
import { ReportedSubmissionError } from '~/modules/forms/reported-submission-error'
import { useAppForm } from '~/modules/forms/use-app-form'

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

  if (cursor !== null) {
    input.cursor = cursor
  }

  if (query !== undefined) {
    input.query = query
  }

  return input
}

function usersInfiniteOptions(initial: UsersResult, query: string | undefined) {
  const baseOptions = {
    getNextPageParam: (lastPage: UsersResult) => {
      return lastPage.nextCursor
    },
    initialPageParam: initialUsersCursor,
    input: (cursor: UsersResult['nextCursor']) => {
      return usersPageInput(cursor, query)
    },
  }

  if (query === undefined) {
    return rpc.admin.listUsersForAdminUserSupport.infiniteOptions({
      ...baseOptions,
      initialData: { pageParams: [initialUsersCursor], pages: [initial] },
    })
  }

  return rpc.admin.listUsersForAdminUserSupport.infiniteOptions(baseOptions)
}

export function AdminUsersWorkspace({ initial }: { readonly initial: UsersResult }) {
  const [query, setQuery] = useQueryState('q', { defaultValue: '' })

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)

  const [message, setMessage] = useState<string | null>(null)

  const publishedQueryRef = useRef(query)

  const searchForm = useAppForm({
    defaultValues: { query },
    listeners: {
      onChange: ({ formApi }) => {
        const nextQuery = formApi.getFieldValue('query')

        if (nextQuery !== publishedQueryRef.current) {
          void setQuery(nextQuery)
        }
      },
    },
    onSubmit: async ({ value }) => {
      await setQuery(value.query)
    },
  })

  useEffect(() => {
    publishedQueryRef.current = query

    if (searchForm.getFieldValue('query') !== query) {
      searchForm.setFieldValue('query', query)
    }
  }, [query, searchForm])

  const deferredQuery = useDeferredValue(query.trim())

  const searchQuery = deferredQuery === '' ? undefined : deferredQuery

  const reduceMotion = useReducedMotion() === true

  const usersQuery = useInfiniteQuery(usersInfiniteOptions(initial, searchQuery))

  const visibleUsers = useMemo(() => {
    return (
      usersQuery.data?.pages.flatMap((page) => {
        return page.users
      }) ?? []
    )
  }, [usersQuery.data?.pages])

  const selectedUser = visibleUsers.find((user) => {
    return user.id === selectedUserId
  })

  useEffect(() => {
    if (selectedUserId === null) {
      return
    }

    document.querySelector<HTMLElement>('#admin-reset-confirm')?.focus()
  }, [selectedUserId])

  const resetMutation = useMutation(
    rpc.admin.requestPasswordResetForAdminUserSupport.mutationOptions({
      onError: (error) => {
        setMessage(adminMutationFailureMessage(error))
      },
    }),
  )

  const resetForm = useAppForm({
    defaultValues: { userId: selectedUser?.id ?? '' },
    onSubmit: async ({ value }) => {
      setMessage(null)

      const result = await resetMutation.mutateAsync(value).then(
        (response) => {
          return response
        },
        () => {
          throw new ReportedSubmissionError()
        },
      )

      setMessage(
        `Password-reset email requested. Reference ${result.audit.correlationId}.`,
      )
    },
  })

  const prepareReset = useCallback(
    (user: AdminUser) => {
      resetMutation.reset()

      resetForm.reset({ userId: user.id })

      setMessage(null)

      setSelectedUserId(user.id)
    },
    [resetForm, resetMutation],
  )

  const prepareResetById = useCallback(
    ({ userId }: { readonly userId: string }) => {
      const user = visibleUsers.find((candidate) => {
        return candidate.id === userId
      })

      if (user !== undefined) {
        prepareReset(user)
      }
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
        <Flex
          align="center"
          bg="var(--input)"
          borderRadius="xl"
          gap="3"
          mt="4"
          px="4"
        >
          <SearchIcon aria-hidden="true" />
          <searchForm.AppForm>
            <searchForm.Form
              role="search"
              className="min-w-0 flex-1"
            >
              <searchForm.AppField name="query">
                {(field) => {
                  return (
                    <field.TextField
                      id="admin-user-search"
                      label="Search people"
                      className="border-0 bg-transparent px-0 shadow-none"
                      placeholder="Name or email"
                    />
                  )
                }}
              </searchForm.AppField>
            </searchForm.Form>
          </searchForm.AppForm>
        </Flex>
      </Box>

      <LazyMotion features={domAnimation}>
        <AnimatePresence initial={false}>
          {selectedUser === undefined ? null : (
            <MotionDiv
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
                <resetForm.AppForm>
                  <resetForm.Form>
                    <Flex
                      align="center"
                      justify="space-between"
                      gap="4"
                      mt="5"
                      wrap="wrap"
                    >
                      <resetForm.Feedback message={message} />
                      <resetForm.SubmitButton
                        id="admin-reset-confirm"
                        pendingLabel="Requesting…"
                      >
                        <SendIcon aria-hidden="true" />
                        Confirm reset email
                      </resetForm.SubmitButton>
                    </Flex>
                  </resetForm.Form>
                </resetForm.AppForm>
              </Box>
            </MotionDiv>
          )}
        </AnimatePresence>
      </LazyMotion>

      <AdminUserDirectory
        hasNextPage={usersQuery.hasNextPage}
        isFetchingNextPage={usersQuery.isFetchingNextPage}
        isPending={usersQuery.isPending}
        users={visibleUsers}
        onLoadMore={() => {
          void usersQuery.fetchNextPage()
        }}
        onPasswordResetPrepared={prepareReset}
      />
    </AdminPage>
  )
}
