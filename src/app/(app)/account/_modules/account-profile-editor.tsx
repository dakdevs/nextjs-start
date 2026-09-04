'use client'

import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { isInferableError } from '@orpc/client'
import type { InferRouterContractOutputs } from '@orpc/contract'

import { Alert, AlertDescription } from '~/components/shadcn/alert'
import { Button } from '~/components/shadcn/button'
import { getFormText } from '~/components/form-data'
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '~/components/shadcn/field'
import { Input } from '~/components/shadcn/input'
import { Textarea } from '~/components/shadcn/textarea'
import { getAccountProfileForAccountScreenContract } from '~/domains/account/contracts/get-account-profile-for-account-screen'
import { rpc } from '~/orpc/client'

type AccountProfile = InferRouterContractOutputs<
  typeof getAccountProfileForAccountScreenContract
>
type AccountProfileEditorProps = {
  profile: AccountProfile
  onProfileUpdated: (profile: AccountProfile) => void
}

export function AccountProfileEditor({
  onProfileUpdated,
  profile,
}: AccountProfileEditorProps) {
  const [message, setMessage] = useState<string | null>(null)
  const [previousProfile, setPreviousProfile] = useState(profile)
  const [draft, setDraft] = useState({ name: profile.name, bio: profile.bio })

  if (profile !== previousProfile) {
    setPreviousProfile(profile)
    setDraft({ name: profile.name, bio: profile.bio })
  }

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

  const updateProfile = (formData: FormData) => {
    setMessage(null)
    mutation.mutate({
      name: getFormText(formData, 'name'),
      bio: getFormText(formData, 'bio'),
    })
  }

  return (
    <form
      className="rounded-2xl bg-card p-6 sm:p-8"
      method="post"
      onSubmit={(event) => {
        event.preventDefault()
        updateProfile(new FormData(event.currentTarget))
      }}
    >
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="name">Display name</FieldLabel>
          <Input
            id="name"
            name="name"
            value={draft.name}
            maxLength={100}
            required
            onChange={(event) => {
              setDraft((current) => ({ ...current, name: event.target.value }))
            }}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            value={profile.email}
            readOnly
            aria-describedby="email-description"
          />
          <FieldDescription id="email-description">
            Email changes belong to a future, dedicated account flow.
          </FieldDescription>
        </Field>
        <Field>
          <div className="flex items-baseline justify-between gap-4">
            <FieldLabel htmlFor="bio">Bio</FieldLabel>
            <span className="text-xs text-muted-foreground">Up to 500 characters</span>
          </div>
          <Textarea
            id="bio"
            name="bio"
            value={draft.bio}
            maxLength={500}
            rows={5}
            onChange={(event) => {
              setDraft((current) => ({ ...current, bio: event.target.value }))
            }}
          />
        </Field>
      </FieldGroup>
      <div className="mt-7 flex flex-wrap items-center justify-between gap-3">
        <div
          aria-live="polite"
          className="text-sm text-muted-foreground"
        >
          {message}
        </div>
        <Button
          type="submit"
          size="lg"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? 'Saving…' : 'Save changes'}
        </Button>
      </div>
      {profile.emailVerified ? null : (
        <Alert className="mt-6 border-0 bg-muted">
          <AlertDescription>
            Your email is not verified yet. Check your inbox to finish setup.
          </AlertDescription>
        </Alert>
      )}
    </form>
  )
}
