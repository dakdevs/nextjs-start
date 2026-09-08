'use client'

import { createServiceAccountForAdminServiceAccountsInputSchema } from '~/domains/admin/contracts'
import { withForm } from '~/modules/forms/use-app-form'

import { createServiceAccountFormOptions } from './admin-service-account-create-form-options'

function validateServiceAccountName({ value }: { readonly value: string }) {
  const parsed = createServiceAccountForAdminServiceAccountsInputSchema.safeParse({
    name: value,
    scopes: ['system:health:read'],
  })

  return parsed.success ? undefined : parsed.error.issues[0]?.message
}

export const ServiceAccountCreateNameField = withForm({
  ...createServiceAccountFormOptions,
  render: function ServiceAccountCreateNameField({ form }) {
    return (
      <form.AppField
        name="name"
        validators={{
          onChange: validateServiceAccountName,
          onSubmit: validateServiceAccountName,
        }}
      >
        {(field) => {
          return (
            <field.TextField
              id="admin-service-account-name"
              label="Service account name"
              maxLength={100}
              placeholder="Health monitor"
              required
            />
          )
        }}
      </form.AppField>
    )
  },
})
