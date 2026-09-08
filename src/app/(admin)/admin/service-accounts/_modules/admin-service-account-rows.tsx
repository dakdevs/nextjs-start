'use client'

import { Box, Button, Flex, Text } from '@chakra-ui/react'
import { KeyRoundIcon } from 'lucide-react'
import type { InferRouterContractOutputs } from '@orpc/contract'

import { adminContracts } from '~/domains/admin/contracts'

type ServiceAccountsResult = InferRouterContractOutputs<
  typeof adminContracts.listServiceAccountsForAdminServiceAccounts
>
type ServiceAccount = ServiceAccountsResult['serviceAccounts'][number]

const dateFormatter = new Intl.DateTimeFormat('en', {
  dateStyle: 'medium',
  timeZone: 'UTC',
})

export function ServiceAccountRows({
  onRevoke,
  onRotate,
  pending,
  serviceAccounts,
}: {
  readonly onRevoke: (input: { readonly serviceAccountId: string }) => void
  readonly onRotate: (input: { readonly serviceAccountId: string }) => void
  readonly pending: boolean
  readonly serviceAccounts: readonly ServiceAccount[]
}) {
  if (serviceAccounts.length === 0) {
    return (
      <Box
        bg="var(--card)"
        borderRadius="2xl"
        p="8"
        textAlign="center"
      >
        <Text color="var(--muted-foreground)">No service accounts yet.</Text>
      </Box>
    )
  }

  return serviceAccounts.map((account) => {
    const isRevoked = account.revokedAt !== null

    return (
      <Flex
        key={account.id}
        align={{ base: 'stretch', md: 'center' }}
        bg="var(--card)"
        borderRadius="2xl"
        direction={{ base: 'column', md: 'row' }}
        gap="5"
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
            <KeyRoundIcon aria-hidden="true" />
          </Flex>
          <Box minW="0">
            <Flex
              align="center"
              gap="2"
              wrap="wrap"
            >
              <Text fontWeight="semibold">{account.name}</Text>
              <Box
                as="span"
                className="text-ui"
                bg={isRevoked ? 'var(--muted)' : 'var(--accent)'}
                borderRadius="full"
                px="2.5"
                py="1"
              >
                {isRevoked ? 'Revoked' : 'Active'}
              </Box>
            </Flex>
            <Text
              className="text-ui"
              color="var(--muted-foreground)"
              mt="2"
            >
              {account.scopes.join(', ')} · prefix {account.tokenPrefix} · created{' '}
              {dateFormatter.format(account.createdAt)} UTC
            </Text>
          </Box>
        </Flex>
        {isRevoked ? null : (
          <Flex
            gap="2"
            wrap="wrap"
          >
            <Button
              data-admin-rotate-service-account-id={account.id}
              bg="var(--muted)"
              color="var(--foreground)"
              disabled={pending}
              minH="44px"
              onClick={() => {
                onRotate({ serviceAccountId: account.id })
              }}
              _hover={{ bg: 'var(--accent)' }}
            >
              Rotate
            </Button>
            <Button
              data-admin-revoke-service-account-id={account.id}
              bg="transparent"
              color="var(--destructive)"
              disabled={pending}
              minH="44px"
              onClick={() => {
                onRevoke({ serviceAccountId: account.id })
              }}
              _hover={{ bg: 'var(--muted)' }}
            >
              Revoke
            </Button>
          </Flex>
        )}
      </Flex>
    )
  })
}
