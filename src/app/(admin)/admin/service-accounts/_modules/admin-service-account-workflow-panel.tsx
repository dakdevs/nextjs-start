'use client'

import { Box, Button, Flex, Text } from '@chakra-ui/react'
import { CopyIcon, XIcon } from 'lucide-react'
import {
  AnimatePresence,
  domAnimation,
  LazyMotion,
  useReducedMotion,
} from 'motion/react'
import { div as MotionDiv } from 'motion/react-m'
import type { ReactNode } from 'react'
import type { useServiceAccountWorkflow } from './use-service-account-workflow'

type WorkflowState = ReturnType<typeof useServiceAccountWorkflow>
type ServiceAccount = NonNullable<WorkflowState['selectedAccount']>
type PreparedWorkflow = NonNullable<WorkflowState['workflow']>

const workflowDescriptions = {
  create:
    'The only starter scope is system:health:read. Add future scopes only for a documented machine consumer.',
  rotate: 'The current token stops working immediately. The replacement appears once.',
  revoke: 'This token stops working immediately. Revocation cannot be undone.',
} as const

function workflowTitle(
  workflow: PreparedWorkflow,
  selectedAccount: ServiceAccount | undefined,
) {
  if (workflow.kind === 'create') {
    return 'Create a health-monitor credential'
  }

  if (workflow.kind === 'rotate') {
    return `Rotate ${selectedAccount?.name ?? 'this service account'}?`
  }

  return `Revoke ${selectedAccount?.name ?? 'this service account'}?`
}

export function ServiceAccountWorkflowPanel({
  children,
  onClose,
  pending,
  selectedAccount,
  workflow,
}: {
  readonly children: ReactNode
  readonly onClose: () => void
  readonly pending: boolean
  readonly selectedAccount: ServiceAccount | undefined
  readonly workflow: PreparedWorkflow | null
}) {
  const shouldReduceMotion = useReducedMotion()

  const reduceMotion = shouldReduceMotion === true

  return (
    <LazyMotion features={domAnimation}>
      <AnimatePresence initial={false}>
        {workflow === null ? null : (
          <MotionDiv
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
                  disabled={pending}
                  onClick={onClose}
                >
                  <XIcon aria-hidden="true" />
                </Button>
              </Flex>
              {children}
            </Box>
          </MotionDiv>
        )}
      </AnimatePresence>
    </LazyMotion>
  )
}

export function RevealedServiceAccountSecret({
  onCopied,
  secret,
}: {
  readonly onCopied: () => void
  readonly secret: { readonly name: string; readonly token: string } | null
}) {
  if (secret === null) {
    return null
  }

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
        <output
          aria-label="One-time service-account token"
          className="block min-h-12 flex-1 rounded-lg bg-[color-mix(in_oklab,var(--background)_12%,transparent)] px-3 py-2 font-mono text-body break-all"
        >
          {secret.token}
        </output>
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

export function ServiceAccountFormActions({
  children,
}: {
  readonly children: ReactNode
}) {
  return (
    <Flex
      align="center"
      justify="space-between"
      gap="4"
      mt="5"
      wrap="wrap"
    >
      {children}
    </Flex>
  )
}
