'use client'

import { useMutation } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { isInferableError } from '@orpc/client'
import type { InferRouterContractOutputs } from '@orpc/contract'

import { Alert, AlertDescription } from '~/components/shadcn/alert'
import { FieldGroup } from '~/components/shadcn/field'
import { getAccountProfileForAccountScreenContract } from '~/domains/account/contracts/get-account-profile-for-account-screen'
import { updateAccountProfileForAccountScreenInputSchema } from '~/domains/account/contracts/update-account-profile-for-account-screen'
import { useAppForm } from '~/modules/forms/use-app-form'
import { ReportedSubmissionError } from '~/modules/forms/reported-submission-error'
import { rpc } from '~/orpc/client'

type AccountProfile = InferRouterContractOutputs<
  typeof getAccountProfileForAccountScreenContract
>

export function AccountProfileEditor({
  onProfileUpdated,
  profile,
}: {
  profile: AccountProfile
  onProfileUpdated: (profile: AccountProfile) => void
}) {
  const [message, setMessage] = useState<string | null>(null)

  const mutation = useMutation(
    rpc.account.updateAccountProfileForAccountScreen.mutationOptions({
      onSuccess: (updated) => {
        onProfileUpdated({ ...profile, ...updated })

        setMessage('Changes saved.')
      },
      onError: (error) => {
        setMessage(
          isInferableError(error) && error.code === 'INTERNAL_SERVER_ERROR'
            ? `Something went wrong. Error ID: ${error.data.errorId}`
            : 'Something went wrong. Please try again.',
        )
      },
    }),
  )

  const form = useAppForm({
    defaultValues: { name: profile.name, bio: profile.bio },
    validators: {
      onChange: updateAccountProfileForAccountScreenInputSchema,
      onBlur: updateAccountProfileForAccountScreenInputSchema,
      onSubmit: updateAccountProfileForAccountScreenInputSchema,
    },
    onSubmit: async ({ value }) => {
      setMessage(null)
      // The typed mutation callback owns the safe server-result message.

      await mutation.mutateAsync(value).catch(() => {
        throw new ReportedSubmissionError()
      })
    },
  })

  // Server/WebMCP profile changes replace the draft; passkey-only changes do not.
  useEffect(() => {
    form.reset({ name: profile.name, bio: profile.bio })
  }, [form, profile.name, profile.bio])

  return (
    <form.AppForm>
      <form.Form className="rounded-2xl bg-card p-6 sm:p-8">
        <FieldGroup>
          <form.AppField name="name">
            {(field) => {
              return (
                <field.TextField
                  label="Display name"
                  id="name"
                  autoComplete="name"
                  maxLength={100}
                  required
                />
              )
            }}
          </form.AppField>
          <div>
            <p className="text-ui font-medium">Email</p>
            <p className="mt-2 text-body">{profile.email}</p>
            <p className="mt-2 text-ui text-muted-foreground">
              Email changes belong to a future, dedicated account flow.
            </p>
          </div>
          <form.AppField name="bio">
            {(field) => {
              return (
                <field.TextareaField
                  label="Bio"
                  id="bio"
                  description="Up to 500 characters"
                  maxLength={500}
                  rows={5}
                />
              )
            }}
          </form.AppField>
        </FieldGroup>
        <div className="mt-7 flex flex-wrap items-center justify-between gap-3">
          <form.Feedback message={message} />
          <form.SubmitButton
            size="lg"
            pendingLabel="Saving…"
          >
            Save changes
          </form.SubmitButton>
        </div>
        {profile.emailVerified ? null : (
          <Alert className="mt-6 border-0 bg-muted">
            <AlertDescription>
              Your email is not verified yet. Check your inbox to finish setup.
            </AlertDescription>
          </Alert>
        )}
      </form.Form>
    </form.AppForm>
  )
}
