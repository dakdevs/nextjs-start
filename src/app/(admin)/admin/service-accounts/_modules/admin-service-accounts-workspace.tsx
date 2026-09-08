'use client'

import { Box, Button, Flex, Text, VStack } from '@chakra-ui/react'
import { PlusIcon, RotateCwIcon } from 'lucide-react'
import type { InferRouterContractOutputs } from '@orpc/contract'

import { AdminPage, AdminPageHeader } from '~/app/(admin)/admin/_modules/admin-page'
import { ServiceAccountCreateNameField } from '~/app/(admin)/admin/service-accounts/_modules/admin-service-account-create-form'
import { AdminServiceAccountsWebMcpTools } from '~/app/(admin)/admin/service-accounts/_modules/admin-service-accounts-webmcp-tools'
import { adminContracts } from '~/domains/admin/contracts'

import {
  RevealedServiceAccountSecret,
  ServiceAccountFormActions,
  ServiceAccountWorkflowPanel,
} from './admin-service-account-workflow-panel'
import { ServiceAccountRows } from './admin-service-account-rows'
import { useServiceAccountWorkflow } from './use-service-account-workflow'

type ServiceAccountsResult = InferRouterContractOutputs<
  typeof adminContracts.listServiceAccountsForAdminServiceAccounts
>

const workflowConfirmLabels = {
  create: 'Confirm creation',
  rotate: 'Confirm rotation',
  revoke: 'Confirm revocation',
} as const

export function AdminServiceAccountsWorkspace({
  initial,
}: {
  readonly initial: ServiceAccountsResult
}) {
  const {
    createForm,
    closeWorkflow,
    isWorkflowBusy,
    message,
    prepareCreate,
    prepareRevoke,
    prepareRotate,
    revealedSecret,
    revokeForm,
    rotateForm,
    selectedAccount,
    serviceAccounts,
    setMessage,
    workflow,
  } = useServiceAccountWorkflow(initial)

  const workflowForm =
    workflow?.kind === 'create' ? (
      <createForm.AppForm>
        <createForm.Form>
          <Box mt="5">
            <ServiceAccountCreateNameField form={createForm} />
          </Box>
          <ServiceAccountFormActions>
            <createForm.Feedback message={message} />
            <createForm.SubmitButton
              id="admin-service-account-confirm"
              pendingLabel="Working…"
              disabled={isWorkflowBusy}
            >
              {workflowConfirmLabels.create}
            </createForm.SubmitButton>
          </ServiceAccountFormActions>
        </createForm.Form>
      </createForm.AppForm>
    ) : workflow?.kind === 'rotate' ? (
      <rotateForm.AppForm>
        <rotateForm.Form>
          <ServiceAccountFormActions>
            <rotateForm.Feedback message={message} />
            <rotateForm.SubmitButton
              id="admin-service-account-confirm"
              pendingLabel="Working…"
              disabled={isWorkflowBusy}
            >
              <RotateCwIcon aria-hidden="true" />
              {workflowConfirmLabels.rotate}
            </rotateForm.SubmitButton>
          </ServiceAccountFormActions>
        </rotateForm.Form>
      </rotateForm.AppForm>
    ) : workflow?.kind === 'revoke' ? (
      <revokeForm.AppForm>
        <revokeForm.Form>
          <ServiceAccountFormActions>
            <revokeForm.Feedback message={message} />
            <revokeForm.SubmitButton
              id="admin-service-account-confirm"
              pendingLabel="Working…"
              variant="destructive"
              disabled={isWorkflowBusy}
            >
              {workflowConfirmLabels.revoke}
            </revokeForm.SubmitButton>
          </ServiceAccountFormActions>
        </revokeForm.Form>
      </revokeForm.AppForm>
    ) : null

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
          disabled={isWorkflowBusy}
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
        selectedAccount={selectedAccount}
        workflow={workflow}
        pending={isWorkflowBusy}
        onClose={closeWorkflow}
      >
        {workflowForm}
      </ServiceAccountWorkflowPanel>

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
          pending={isWorkflowBusy}
          onRotate={(input) => {
            prepareRotate(input)
          }}
          onRevoke={(input) => {
            prepareRevoke(input)
          }}
        />
      </VStack>
    </AdminPage>
  )
}
