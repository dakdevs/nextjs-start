'use client'

import { Box, Button, Flex, Input, Text, VStack } from '@chakra-ui/react'
import { useMutation } from '@tanstack/react-query'
import { CopyIcon, KeyRoundIcon, PlusIcon, RotateCwIcon, XIcon } from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useCallback, useEffect, useState } from 'react'
import type { InferRouterContractOutputs } from '@orpc/contract'

import { adminMutationFailureMessage } from '~/app/(admin)/admin/_modules/admin-mutation-message'
import { AdminPage, AdminPageHeader } from '~/app/(admin)/admin/_modules/admin-page'
import { AdminServiceAccountsWebMcpTools } from '~/app/(admin)/admin/service-accounts/_modules/admin-service-accounts-webmcp-tools'
import { adminContracts } from '~/domains/admin/contracts'
import { rpc } from '~/orpc/client'

type ServiceAccountsResult = InferRouterContractOutputs<
  typeof adminContracts.listServiceAccountsForAdminServiceAccounts
>
type ServiceAccount = ServiceAccountsResult['serviceAccounts'][number]
type PreparedWorkflow =
  | { readonly kind: 'create' }
  | { readonly kind: 'rotate'; readonly serviceAccountId: string }
  | { readonly kind: 'revoke'; readonly serviceAccountId: string }

const dateFormatter = new Intl.DateTimeFormat('en', { dateStyle: 'medium' })

const workflowDescriptions = {
  create:
    'The only starter scope is system:health:read. Add future scopes only for a documented machine consumer.',
  rotate: 'The current token stops working immediately. The replacement appears once.',
  revoke: 'This token stops working immediately. Revocation cannot be undone.',
} as const

const workflowConfirmLabels = {
  create: 'Confirm creation',
  rotate: 'Confirm rotation',
  revoke: 'Confirm revocation',
} as const

function workflowTitle(
  workflow: PreparedWorkflow,
  selectedAccount: ServiceAccount | undefined,
) {
  if (workflow.kind === 'create') return 'Create a health-monitor credential'
  if (workflow.kind === 'rotate')
    return `Rotate ${selectedAccount?.name ?? 'this service account'}?`
  return `Revoke ${selectedAccount?.name ?? 'this service account'}?`
}

function ServiceAccountWorkflowPanel({
  isPending,
  message,
  name,
  onClose,
  onNameChange,
  onSubmit,
  selectedAccount,
  workflow,
}: {
  readonly isPending: boolean
  readonly message: string | null
  readonly name: string
  readonly onClose: () => void
  readonly onNameChange: (name: string) => void
  readonly onSubmit: () => void
  readonly selectedAccount: ServiceAccount | undefined
  readonly workflow: PreparedWorkflow | null
}) {
  const shouldReduceMotion = useReducedMotion()
  const reduceMotion = shouldReduceMotion === true

  return (
    <AnimatePresence initial={false}>
      {workflow === null ? null : (
        <motion.div
          key={`${workflow.kind}:${'serviceAccountId' in workflow ? workflow.serviceAccountId : 'new'}`}
          initial={{ opacity: 0, y: reduceMotion ? 0 : 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: reduceMotion ? 0 : -4 }}
          transition={{ duration: reduceMotion ? 0 : 0.18, ease: 'easeOut' }}
        >
          <Box
            id="admin-service-account-workflow"
            bg="var(--accent)"
            borderRadius="2xl"
            p={{ base: '5', sm: '6' }}
            mt="8"
            role="region"
            aria-labelledby="admin-service-account-workflow-heading"
          >
            <Flex
              align="start"
              justify="space-between"
              gap="4"
            >
              <Box>
                <Text
                  id="admin-service-account-workflow-heading"
                  fontWeight="semibold"
                >
                  {workflowTitle(workflow, selectedAccount)}
                </Text>
                <Text
                  className="text-ui"
                  color="var(--muted-foreground)"
                  lineHeight="tall"
                  mt="2"
                >
                  {workflowDescriptions[workflow.kind]}
                </Text>
              </Box>
              <Button
                aria-label="Close service-account workflow"
                bg="transparent"
                minH="44px"
                minW="44px"
                p="0"
                onClick={onClose}
              >
                <XIcon aria-hidden="true" />
              </Button>
            </Flex>
            <form
              method="post"
              onSubmit={(event) => {
                event.preventDefault()
                onSubmit()
              }}
            >
              {workflow.kind === 'create' ? (
                <Box mt="5">
                  <label
                    className="text-body font-medium"
                    htmlFor="admin-service-account-name"
                  >
                    Service account name
                  </label>
                  <Input
                    id="admin-service-account-name"
                    value={name}
                    bg="var(--background)"
                    border="0"
                    borderRadius="xl"
                    maxLength={100}
                    minH="48px"
                    mt="2"
                    placeholder="Health monitor"
                    required
                    onChange={(event) => {
                      onNameChange(event.target.value)
                    }}
                  />
                </Box>
              ) : null}
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
                  id="admin-service-account-confirm"
                  type="submit"
                  bg={
                    workflow.kind === 'revoke'
                      ? 'var(--destructive)'
                      : 'var(--foreground)'
                  }
                  color="var(--background)"
                  minH="44px"
                  disabled={isPending}
                  _hover={{ opacity: 0.88 }}
                >
                  {workflow.kind === 'rotate' ? (
                    <RotateCwIcon aria-hidden="true" />
                  ) : null}
                  {isPending ? 'Working…' : workflowConfirmLabels[workflow.kind]}
                </Button>
              </Flex>
            </form>
          </Box>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function RevealedServiceAccountSecret({
  onCopied,
  secret,
}: {
  readonly onCopied: () => void
  readonly secret: { readonly name: string; readonly token: string } | null
}) {
  if (secret === null) return null

  return (
    <Box
      bg="var(--foreground)"
      color="var(--background)"
      borderRadius="2xl"
      p={{ base: '5', sm: '6' }}
      mt="8"
    >
      <Text fontWeight="semibold">Copy {secret.name}&apos;s token now</Text>
      <Text
        className="text-ui"
        opacity="0.72"
        lineHeight="tall"
        mt="2"
      >
        This is the only time the application will show it. If it is lost, rotate the
        credential.
      </Text>
      <Flex
        align={{ base: 'stretch', sm: 'center' }}
        direction={{ base: 'column', sm: 'row' }}
        gap="3"
        mt="5"
      >
        <Input
          aria-label="One-time service-account token"
          value={secret.token}
          readOnly
          bg="color-mix(in oklab, var(--background) 12%, transparent)"
          border="0"
          minH="48px"
          fontFamily="mono"
        />
        <Button
          bg="var(--background)"
          color="var(--foreground)"
          minH="44px"
          flexShrink="0"
          onClick={() => {
            void navigator.clipboard.writeText(secret.token).then(onCopied)
          }}
        >
          <CopyIcon aria-hidden="true" />
          Copy token
        </Button>
      </Flex>
    </Box>
  )
}

function ServiceAccountRows({
  onRevoke,
  onRotate,
  serviceAccounts,
}: {
  readonly onRevoke: (input: { readonly serviceAccountId: string }) => void
  readonly onRotate: (input: { readonly serviceAccountId: string }) => void
  readonly serviceAccounts: readonly ServiceAccount[]
}) {
  if (serviceAccounts.length === 0)
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
              {dateFormatter.format(account.createdAt)}
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

export function AdminServiceAccountsWorkspace({
  initial,
}: {
  readonly initial: ServiceAccountsResult
}) {
  const [serviceAccounts, setServiceAccounts] = useState(initial.serviceAccounts)
  const [workflow, setWorkflow] = useState<PreparedWorkflow | null>(null)
  const [name, setName] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [revealedSecret, setRevealedSecret] = useState<{
    readonly name: string
    readonly token: string
  } | null>(null)

  useEffect(() => {
    if (workflow === null) return
    document.querySelector<HTMLElement>('#admin-service-account-confirm')?.focus()
  }, [workflow])

  const prepareCreate = useCallback((input?: { readonly name?: string }) => {
    setName(input?.name ?? '')
    setMessage(null)
    setRevealedSecret(null)
    setWorkflow({ kind: 'create' })
  }, [])

  const prepareRotate = useCallback(
    ({ serviceAccountId }: { readonly serviceAccountId: string }) => {
      if (!serviceAccounts.some((account) => account.id === serviceAccountId)) return
      setMessage(null)
      setRevealedSecret(null)
      setWorkflow({ kind: 'rotate', serviceAccountId })
    },
    [serviceAccounts],
  )

  const prepareRevoke = useCallback(
    ({ serviceAccountId }: { readonly serviceAccountId: string }) => {
      if (!serviceAccounts.some((account) => account.id === serviceAccountId)) return
      setMessage(null)
      setRevealedSecret(null)
      setWorkflow({ kind: 'revoke', serviceAccountId })
    },
    [serviceAccounts],
  )

  const createMutation = useMutation(
    rpc.admin.createServiceAccountForAdminServiceAccounts.mutationOptions({
      onSuccess: (result) => {
        setServiceAccounts((current) => [result.serviceAccount, ...current])
        setRevealedSecret({ name: result.serviceAccount.name, token: result.token })
        setWorkflow(null)
        setName('')
        setMessage(`Service account created. Reference ${result.audit.correlationId}.`)
      },
      onError: (error) => {
        setMessage(adminMutationFailureMessage(error))
      },
    }),
  )

  const rotateMutation = useMutation(
    rpc.admin.rotateServiceAccountForAdminServiceAccounts.mutationOptions({
      onSuccess: (result) => {
        setServiceAccounts((current) =>
          current.map((account) =>
            account.id === result.serviceAccount.id ? result.serviceAccount : account,
          ),
        )
        setRevealedSecret({ name: result.serviceAccount.name, token: result.token })
        setWorkflow(null)
        setMessage(
          `Service-account credential rotated. Reference ${result.audit.correlationId}.`,
        )
      },
      onError: (error) => {
        setMessage(adminMutationFailureMessage(error))
      },
    }),
  )

  const revokeMutation = useMutation(
    rpc.admin.revokeServiceAccountForAdminServiceAccounts.mutationOptions({
      onSuccess: (result) => {
        if (workflow?.kind === 'revoke') {
          const revokedAt = new Date()
          setServiceAccounts((current) =>
            current.map((account) =>
              account.id === workflow.serviceAccountId
                ? Object.assign({}, account, { revokedAt })
                : account,
            ),
          )
        }
        setWorkflow(null)
        setMessage(`Service account revoked. Reference ${result.audit.correlationId}.`)
      },
      onError: (error) => {
        setMessage(adminMutationFailureMessage(error))
      },
    }),
  )

  const selectedAccount =
    workflow?.kind === 'rotate' || workflow?.kind === 'revoke'
      ? serviceAccounts.find((account) => account.id === workflow.serviceAccountId)
      : undefined
  const isPending =
    createMutation.isPending || rotateMutation.isPending || revokeMutation.isPending

  return (
    <AdminPage>
      <AdminServiceAccountsWebMcpTools
        onCreatePrepared={prepareCreate}
        onRotatePrepared={prepareRotate}
        onRevokePrepared={prepareRevoke}
      />
      <Flex
        align={{ base: 'stretch', sm: 'end' }}
        direction={{ base: 'column', sm: 'row' }}
        gap="5"
        justify="space-between"
      >
        <AdminPageHeader
          eyebrow="Service accounts"
          title="Manage machine access"
          description="Issue one narrow credential for a real machine consumer. Secrets appear once, are stored only as digests, and never enter browser WebMCP."
        />
        <Button
          bg="var(--foreground)"
          color="var(--background)"
          minH="44px"
          flexShrink="0"
          onClick={() => {
            prepareCreate()
          }}
          _hover={{ opacity: 0.88 }}
        >
          <PlusIcon aria-hidden="true" />
          Create service account
        </Button>
      </Flex>

      <ServiceAccountWorkflowPanel
        isPending={isPending}
        message={message}
        name={name}
        selectedAccount={selectedAccount}
        workflow={workflow}
        onClose={() => {
          setWorkflow(null)
          setMessage(null)
        }}
        onNameChange={setName}
        onSubmit={() => {
          setMessage(null)
          if (workflow?.kind === 'create') {
            createMutation.mutate({ name, scopes: ['system:health:read'] })
          } else if (workflow?.kind === 'rotate') {
            rotateMutation.mutate({ serviceAccountId: workflow.serviceAccountId })
          } else if (workflow?.kind === 'revoke') {
            revokeMutation.mutate({ serviceAccountId: workflow.serviceAccountId })
          }
        }}
      />

      <RevealedServiceAccountSecret
        secret={revealedSecret}
        onCopied={() => {
          setMessage('Token copied.')
        }}
      />

      <Text
        aria-live="polite"
        className="text-ui"
        color="var(--muted-foreground)"
        mt="5"
      >
        {workflow === null ? message : null}
      </Text>

      <VStack
        align="stretch"
        gap="3"
        mt="6"
      >
        <ServiceAccountRows
          serviceAccounts={serviceAccounts}
          onRotate={prepareRotate}
          onRevoke={prepareRevoke}
        />
      </VStack>
    </AdminPage>
  )
}
