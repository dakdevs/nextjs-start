'use client'

import { Box, Button, Flex, Text, VStack } from '@chakra-ui/react'
import type { InferRouterContractOutputs } from '@orpc/contract'

import { adminContracts } from '~/domains/admin/contracts'

type UsersResult = InferRouterContractOutputs<
  typeof adminContracts.listUsersForAdminUserSupport
>
type AdminUser = UsersResult['users'][number]

const dateFormatter = new Intl.DateTimeFormat('en', {
  dateStyle: 'medium',
  timeZone: 'UTC',
})

function usersEmptyStateMessage(isPending: boolean) {
  return isPending ? 'Finding people…' : 'No people match that search.'
}

function AdminUserRow({
  user,
  onPasswordResetPrepared,
}: {
  readonly user: AdminUser
  readonly onPasswordResetPrepared: (user: AdminUser) => void
}) {
  return (
    <Flex
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
          Joined {dateFormatter.format(user.createdAt)} UTC ·{' '}
          {user.emailVerified ? 'Verified email' : 'Email not verified'}
        </Text>
      </Box>
      <Button
        data-admin-reset-user-id={user.id}
        bg="var(--muted)"
        color="var(--foreground)"
        minH="44px"
        onClick={() => {
          onPasswordResetPrepared(user)
        }}
        _hover={{ bg: 'var(--accent)' }}
      >
        Send reset email
      </Button>
    </Flex>
  )
}

export function AdminUserDirectory({
  hasNextPage,
  isFetchingNextPage,
  isPending,
  users,
  onLoadMore,
  onPasswordResetPrepared,
}: {
  readonly hasNextPage: boolean
  readonly isFetchingNextPage: boolean
  readonly isPending: boolean
  readonly users: readonly AdminUser[]
  readonly onLoadMore: () => void
  readonly onPasswordResetPrepared: (user: AdminUser) => void
}) {
  return (
    <VStack
      align="stretch"
      gap="3"
      mt="6"
    >
      {users.map((user) => {
        return (
          <AdminUserRow
            key={user.id}
            user={user}
            onPasswordResetPrepared={onPasswordResetPrepared}
          />
        )
      })}
      {users.length === 0 ? (
        <Box
          bg="var(--card)"
          borderRadius="2xl"
          p="8"
          textAlign="center"
        >
          <Text color="var(--muted-foreground)">
            {usersEmptyStateMessage(isPending)}
          </Text>
        </Box>
      ) : null}
      {hasNextPage ? (
        <Button
          alignSelf="center"
          bg="var(--muted)"
          color="var(--foreground)"
          minH="44px"
          disabled={isFetchingNextPage}
          onClick={onLoadMore}
          _hover={{ bg: 'var(--accent)' }}
        >
          {isFetchingNextPage ? 'Loading…' : 'Load more people'}
        </Button>
      ) : null}
    </VStack>
  )
}
