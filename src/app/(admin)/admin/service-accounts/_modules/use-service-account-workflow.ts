'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useSelector } from '@tanstack/react-form'
import { useEffect, useState } from 'react'
import type { InferRouterContractOutputs } from '@orpc/contract'

import { adminMutationFailureMessage } from '~/app/(admin)/admin/_modules/admin-mutation-message'
import { createServiceAccountFormOptions } from '~/app/(admin)/admin/service-accounts/_modules/admin-service-account-create-form-options'
import { adminContracts } from '~/domains/admin/contracts'
import { ReportedSubmissionError } from '~/modules/forms/reported-submission-error'
import { useAppForm } from '~/modules/forms/use-app-form'
import { rpc } from '~/orpc/client'

type ServiceAccountsResult = InferRouterContractOutputs<
  typeof adminContracts.listServiceAccountsForAdminServiceAccounts
>
type PreparedWorkflow =
  | { readonly kind: 'create' }
  | { readonly kind: 'rotate'; readonly serviceAccountId: string }
  | { readonly kind: 'revoke'; readonly serviceAccountId: string }

const createMutationKey = ['service-accounts', 'create'] as const
const rotateMutationKey = ['service-accounts', 'rotate'] as const
const revokeMutationKey = ['service-accounts', 'revoke'] as const

function preparationResult<Status extends string>(status: Status) {
  return { status }
}

function useServiceAccountWorkflowFocus(workflow: PreparedWorkflow | null) {
  useEffect(() => {
    if (workflow === null) {
      return
    }

    document.querySelector<HTMLElement>('#admin-service-account-confirm')?.focus()
  }, [workflow])
}

function selectedServiceAccount(
  workflow: PreparedWorkflow | null,
  serviceAccounts: ServiceAccountsResult['serviceAccounts'],
) {
  return workflow?.kind === 'rotate' || workflow?.kind === 'revoke'
    ? serviceAccounts.find((account) => {
        return account.id === workflow.serviceAccountId
      })
    : undefined
}

export function useServiceAccountWorkflow(initial: ServiceAccountsResult) {
  const queryClient = useQueryClient()

  const [serviceAccounts, setServiceAccounts] = useState(initial.serviceAccounts)

  const [workflow, setWorkflow] = useState<PreparedWorkflow | null>(null)

  const [message, setMessage] = useState<string | null>(null)

  const [revealedSecret, setRevealedSecret] = useState<{
    readonly name: string
    readonly token: string
  } | null>(null)

  useServiceAccountWorkflowFocus(workflow)

  const createMutationOptions = {
    ...rpc.admin.createServiceAccountForAdminServiceAccounts.mutationOptions({
      onError: (error) => {
        setMessage(adminMutationFailureMessage(error))
      },
    }),
    mutationKey: createMutationKey,
  }

  const rotateMutationOptions = {
    ...rpc.admin.rotateServiceAccountForAdminServiceAccounts.mutationOptions({
      onError: (error) => {
        setMessage(adminMutationFailureMessage(error))
      },
    }),
    mutationKey: rotateMutationKey,
  }

  const revokeMutationOptions = {
    ...rpc.admin.revokeServiceAccountForAdminServiceAccounts.mutationOptions({
      onError: (error) => {
        setMessage(adminMutationFailureMessage(error))
      },
    }),
    mutationKey: revokeMutationKey,
  }

  const createMutation = useMutation(createMutationOptions)

  const rotateMutation = useMutation(rotateMutationOptions)

  const revokeMutation = useMutation(revokeMutationOptions)

  const createForm = useAppForm({
    ...createServiceAccountFormOptions,
    onSubmit: async ({ value }) => {
      setMessage(null)

      const result = await createMutation
        .mutateAsync({
          name: value.name,
          scopes: ['system:health:read'],
        })
        .then(
          (response) => {
            return response
          },
          () => {
            throw new ReportedSubmissionError()
          },
        )

      setServiceAccounts((current) => {
        return [result.serviceAccount, ...current]
      })

      setRevealedSecret({ name: result.serviceAccount.name, token: result.token })

      setWorkflow(null)

      setMessage(`Service account created. Reference ${result.audit.correlationId}.`)
    },
  })

  const rotateForm = useAppForm({
    defaultValues: { serviceAccountId: '' },
    onSubmit: async ({ value }) => {
      setMessage(null)

      const result = await rotateMutation.mutateAsync(value).then(
        (response) => {
          return response
        },
        () => {
          throw new ReportedSubmissionError()
        },
      )

      setServiceAccounts((current) => {
        return current.map((account) => {
          return account.id === result.serviceAccount.id
            ? result.serviceAccount
            : account
        })
      })

      setRevealedSecret({ name: result.serviceAccount.name, token: result.token })

      setWorkflow(null)

      setMessage(
        `Service-account credential rotated. Reference ${result.audit.correlationId}.`,
      )
    },
  })

  const revokeForm = useAppForm({
    defaultValues: { serviceAccountId: '' },
    onSubmit: async ({ value }) => {
      setMessage(null)

      const result = await revokeMutation.mutateAsync(value).then(
        (response) => {
          return response
        },
        () => {
          throw new ReportedSubmissionError()
        },
      )

      const revokedAt = new Date()

      setServiceAccounts((current) => {
        return current.map((account) => {
          return account.id === value.serviceAccountId
            ? Object.assign({}, account, { revokedAt })
            : account
        })
      })

      setWorkflow(null)

      setMessage(`Service account revoked. Reference ${result.audit.correlationId}.`)
    },
  })

  const createFormSubmitting = useSelector(createForm.store, (state) => {
    return state.isSubmitting
  })

  const rotateFormSubmitting = useSelector(rotateForm.store, (state) => {
    return state.isSubmitting
  })

  const revokeFormSubmitting = useSelector(revokeForm.store, (state) => {
    return state.isSubmitting
  })

  const isCredentialMutationPending =
    createMutation.isPending || rotateMutation.isPending || revokeMutation.isPending

  const isWorkflowBusy =
    isCredentialMutationPending ||
    createFormSubmitting ||
    rotateFormSubmitting ||
    revokeFormSubmitting

  const isCredentialMutationInFlight = () => {
    return (
      createForm.state.isSubmitting ||
      rotateForm.state.isSubmitting ||
      revokeForm.state.isSubmitting ||
      queryClient.isMutating({ mutationKey: createMutationKey }) > 0 ||
      queryClient.isMutating({ mutationKey: rotateMutationKey }) > 0 ||
      queryClient.isMutating({ mutationKey: revokeMutationKey }) > 0
    )
  }

  const prepareCreate = (input?: { readonly name?: string }) => {
    if (isCredentialMutationInFlight()) {
      return preparationResult(
        'A service-account change is already in progress. Wait for it to finish before preparing another action.',
      )
    }

    createForm.reset({ name: input?.name ?? '' }, { keepDefaultValues: true })

    setMessage(null)

    setRevealedSecret(null)

    setWorkflow({ kind: 'create' })

    return preparationResult(
      'The service-account form is ready for a person to review and confirm in the admin UI.',
    )
  }

  const prepareRotate = ({
    serviceAccountId,
  }: {
    readonly serviceAccountId: string
  }) => {
    if (isCredentialMutationInFlight()) {
      return preparationResult(
        'A service-account change is already in progress. Wait for it to finish before preparing another action.',
      )
    }

    if (
      !serviceAccounts.some((account) => {
        return account.id === serviceAccountId
      })
    ) {
      return preparationResult('That service account is no longer available.')
    }

    rotateForm.reset({ serviceAccountId }, { keepDefaultValues: true })

    setMessage(null)

    setRevealedSecret(null)

    setWorkflow({ kind: 'rotate', serviceAccountId })

    return preparationResult(
      'The service-account rotation is ready for a person to review and confirm in the admin UI.',
    )
  }

  const prepareRevoke = ({
    serviceAccountId,
  }: {
    readonly serviceAccountId: string
  }) => {
    if (isCredentialMutationInFlight()) {
      return preparationResult(
        'A service-account change is already in progress. Wait for it to finish before preparing another action.',
      )
    }

    if (
      !serviceAccounts.some((account) => {
        return account.id === serviceAccountId
      })
    ) {
      return preparationResult('That service account is no longer available.')
    }

    revokeForm.reset({ serviceAccountId }, { keepDefaultValues: true })

    setMessage(null)

    setRevealedSecret(null)

    setWorkflow({ kind: 'revoke', serviceAccountId })

    return preparationResult(
      'The service-account revocation is ready for a person to review and confirm in the admin UI.',
    )
  }

  return {
    createForm,
    isWorkflowBusy,
    message,
    prepareCreate,
    prepareRevoke,
    prepareRotate,
    revealedSecret,
    revokeForm,
    rotateForm,
    selectedAccount: selectedServiceAccount(workflow, serviceAccounts),
    serviceAccounts,
    closeWorkflow: () => {
      if (isCredentialMutationInFlight()) {
        return
      }

      setWorkflow(null)

      setMessage(null)
    },
    setMessage,
    workflow,
  }
}
