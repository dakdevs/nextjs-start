import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { useAppForm } from '~/modules/forms/use-app-form'
import { ServiceAccountCreateNameField } from './admin-service-account-create-form'
import { createServiceAccountFormOptions } from './admin-service-account-create-form-options'

function CreateServiceAccountForm({
  onSubmit,
}: {
  readonly onSubmit: (value: { readonly name: string }) => void
}) {
  const form = useAppForm({
    ...createServiceAccountFormOptions,
    onSubmit: ({ value }) => {
      onSubmit(value)
    },
  })

  return (
    <form.AppForm>
      <form.Form aria-label="Create service account">
        <ServiceAccountCreateNameField form={form} />
        <form.SubmitButton pendingLabel="Creating">Confirm creation</form.SubmitButton>
      </form.Form>
    </form.AppForm>
  )
}

afterEach(cleanup)

describe('service-account creation form', () => {
  it('blocks an untouched empty name before submission', async () => {
    const onSubmit = vi.fn<(value: { readonly name: string }) => void>()

    render(<CreateServiceAccountForm onSubmit={onSubmit} />)

    fireEvent.submit(screen.getByRole('form', { name: 'Create service account' }))

    expect(
      await screen.findByText('Too small: expected string to have >=1 characters'),
    ).toBeVisible()

    expect(onSubmit).not.toHaveBeenCalled()
  })
})
