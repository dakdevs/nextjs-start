import { z } from 'zod'
import type { ToolAnnotations } from '@mcp-b/webmcp-types'

import { updateAccountProfileForAccountScreenInputSchema } from '~/domains/account/contracts/update-account-profile-for-account-screen'
import {
  createServiceAccountForAdminServiceAccountsInputSchema,
  requestPasswordResetForAdminUserSupportInputSchema,
  serviceAccountIdForAdminServiceAccountsInputSchema,
} from '~/domains/admin/contracts'

type CapabilityRisk = 'navigation' | 'read' | 'reversible-mutation' | 'credential'
type CapabilityTransport = 'shared-orpc' | 'ui-initiation' | 'none'
type CapabilityRoute =
  | 'global'
  | '/account'
  | '/admin'
  | '/admin/activity'
  | '/admin/data'
  | '/admin/service-accounts'
  | '/admin/users'

type Capability = {
  name: string
  title: string
  description: string
  feature: 'admin-operations' | 'authentication' | 'account-profile'
  route: CapabilityRoute
  auth: 'public' | 'authenticated' | 'administrator'
  risk: CapabilityRisk
  confirmation: 'none' | 'human-ui'
  origin: 'same-origin'
  transport: CapabilityTransport
  classification: 'shared-orpc' | 'dedicated-orpc' | 'exempt'
  exemption?: string
  annotations: ToolAnnotations
  input: z.ZodObject
}

const emptyInput = z.object({}).strict()

export const webMcpCapabilities = {
  navigateAccount: {
    name: 'navigate_account',
    title: 'Open account',
    description: 'Open the signed-in account page.',
    feature: 'authentication',
    route: 'global',
    auth: 'public',
    risk: 'navigation',
    confirmation: 'none',
    origin: 'same-origin',
    transport: 'none',
    classification: 'exempt',
    exemption: 'Navigation does not read or mutate application data.',
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
    input: emptyInput,
  },
  getAccountProfile: {
    name: 'get_account_profile',
    title: 'Get account profile',
    description: 'Read the account screen profile.',
    feature: 'account-profile',
    route: '/account',
    auth: 'authenticated',
    risk: 'read',
    confirmation: 'none',
    origin: 'same-origin',
    transport: 'shared-orpc',
    classification: 'shared-orpc',
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
      untrustedContentHint: true,
    },
    input: emptyInput,
  },
  updateAccountProfile: {
    name: 'update_account_profile',
    title: 'Update account profile',
    description: 'Update the display name and bio on this account.',
    feature: 'account-profile',
    route: '/account',
    auth: 'authenticated',
    risk: 'reversible-mutation',
    confirmation: 'none',
    origin: 'same-origin',
    transport: 'shared-orpc',
    classification: 'shared-orpc',
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: false,
      untrustedContentHint: true,
    },
    input: updateAccountProfileForAccountScreenInputSchema,
  },
  beginPasskeyEnrollment: {
    name: 'begin_passkey_enrollment',
    title: 'Begin passkey enrollment',
    description: 'Open the normal account UI to add a passkey.',
    feature: 'authentication',
    route: '/account',
    auth: 'authenticated',
    risk: 'credential',
    confirmation: 'human-ui',
    origin: 'same-origin',
    transport: 'ui-initiation',
    classification: 'exempt',
    exemption:
      'Credential creation must remain a browser and human-confirmed ceremony.',
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: false,
    },
    input: emptyInput,
  },
  prepareSignOut: {
    name: 'prepare_sign_out',
    title: 'Prepare to sign out',
    description: 'Focus the normal sign-out control for human confirmation.',
    feature: 'authentication',
    route: 'global',
    auth: 'authenticated',
    risk: 'credential',
    confirmation: 'human-ui',
    origin: 'same-origin',
    transport: 'ui-initiation',
    classification: 'exempt',
    exemption: 'Ending a session remains a human-confirmed UI action.',
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
    input: emptyInput,
  },
  getAdminHomeSummary: {
    name: 'get_admin_home_summary',
    title: 'Get admin workflow summary',
    description: 'Read the exact summary shown on the admin workflow home.',
    feature: 'admin-operations',
    route: '/admin',
    auth: 'administrator',
    risk: 'read',
    confirmation: 'none',
    origin: 'same-origin',
    transport: 'shared-orpc',
    classification: 'shared-orpc',
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
    input: emptyInput,
  },
  listAdminUsers: {
    name: 'list_admin_users',
    title: 'List users for support',
    description: 'Read the safe user list shown in admin user support.',
    feature: 'admin-operations',
    route: '/admin/users',
    auth: 'administrator',
    risk: 'read',
    confirmation: 'none',
    origin: 'same-origin',
    transport: 'shared-orpc',
    classification: 'shared-orpc',
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
      untrustedContentHint: true,
    },
    input: emptyInput,
  },
  prepareAdminPasswordReset: {
    name: 'prepare_admin_password_reset',
    title: 'Prepare a password reset',
    description:
      'Select a user in the normal admin UI for a person to confirm a password-reset request.',
    feature: 'admin-operations',
    route: '/admin/users',
    auth: 'administrator',
    risk: 'credential',
    confirmation: 'human-ui',
    origin: 'same-origin',
    transport: 'ui-initiation',
    classification: 'exempt',
    exemption:
      'A password-reset request changes credential access and requires human confirmation in the admin UI.',
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: false,
      untrustedContentHint: true,
    },
    input: requestPasswordResetForAdminUserSupportInputSchema,
  },
  getAdminDataCatalog: {
    name: 'get_admin_data_catalog',
    title: 'Get admin data catalog',
    description: 'Read the safe table catalog shown in the admin data view.',
    feature: 'admin-operations',
    route: '/admin/data',
    auth: 'administrator',
    risk: 'read',
    confirmation: 'none',
    origin: 'same-origin',
    transport: 'shared-orpc',
    classification: 'shared-orpc',
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
    input: emptyInput,
  },
  listAdminAccountProfiles: {
    name: 'list_admin_account_profiles',
    title: 'List recent account profiles',
    description:
      'Read the most recent 50 account-profile projections shown in admin data.',
    feature: 'admin-operations',
    route: '/admin/data',
    auth: 'administrator',
    risk: 'read',
    confirmation: 'none',
    origin: 'same-origin',
    transport: 'shared-orpc',
    classification: 'shared-orpc',
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
      untrustedContentHint: true,
    },
    input: emptyInput,
  },
  listAdminFailedQueueEvents: {
    name: 'list_admin_failed_queue_events',
    title: 'List recent failed queue events',
    description:
      'Read the most recent 50 safe failed-queue event projections shown in admin data.',
    feature: 'admin-operations',
    route: '/admin/data',
    auth: 'administrator',
    risk: 'read',
    confirmation: 'none',
    origin: 'same-origin',
    transport: 'shared-orpc',
    classification: 'shared-orpc',
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
      untrustedContentHint: true,
    },
    input: emptyInput,
  },
  listAdminWorkflowReceipts: {
    name: 'list_admin_workflow_receipts',
    title: 'List recent workflow receipts',
    description:
      'Read the most recent 50 workflow receipt projections shown in admin data.',
    feature: 'admin-operations',
    route: '/admin/data',
    auth: 'administrator',
    risk: 'read',
    confirmation: 'none',
    origin: 'same-origin',
    transport: 'shared-orpc',
    classification: 'shared-orpc',
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
      untrustedContentHint: true,
    },
    input: emptyInput,
  },
  listAdminServiceAccounts: {
    name: 'list_admin_service_accounts',
    title: 'List service accounts',
    description: 'Read the safe service-account list shown in admin.',
    feature: 'admin-operations',
    route: '/admin/service-accounts',
    auth: 'administrator',
    risk: 'read',
    confirmation: 'none',
    origin: 'same-origin',
    transport: 'shared-orpc',
    classification: 'shared-orpc',
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
      untrustedContentHint: true,
    },
    input: emptyInput,
  },
  prepareCreateServiceAccount: {
    name: 'prepare_create_service_account',
    title: 'Prepare a service account',
    description:
      'Prefill the normal service-account form for a person to review and confirm.',
    feature: 'admin-operations',
    route: '/admin/service-accounts',
    auth: 'administrator',
    risk: 'credential',
    confirmation: 'human-ui',
    origin: 'same-origin',
    transport: 'ui-initiation',
    classification: 'exempt',
    exemption:
      'Creating a service-account credential requires human review and confirmation in the admin UI.',
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: false,
    },
    input: createServiceAccountForAdminServiceAccountsInputSchema,
  },
  prepareRotateServiceAccount: {
    name: 'prepare_rotate_service_account',
    title: 'Prepare a service-account rotation',
    description:
      'Select a service account in the normal admin UI for a person to review and confirm rotation.',
    feature: 'admin-operations',
    route: '/admin/service-accounts',
    auth: 'administrator',
    risk: 'credential',
    confirmation: 'human-ui',
    origin: 'same-origin',
    transport: 'ui-initiation',
    classification: 'exempt',
    exemption:
      'Rotating a service-account credential requires human review and confirmation in the admin UI.',
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: false,
    },
    input: serviceAccountIdForAdminServiceAccountsInputSchema,
  },
  prepareRevokeServiceAccount: {
    name: 'prepare_revoke_service_account',
    title: 'Prepare a service-account revocation',
    description:
      'Select a service account in the normal admin UI for a person to review and confirm revocation.',
    feature: 'admin-operations',
    route: '/admin/service-accounts',
    auth: 'administrator',
    risk: 'credential',
    confirmation: 'human-ui',
    origin: 'same-origin',
    transport: 'ui-initiation',
    classification: 'exempt',
    exemption:
      'Revoking a service-account credential requires human review and confirmation in the admin UI.',
    annotations: {
      readOnlyHint: false,
      destructiveHint: true,
      idempotentHint: true,
      openWorldHint: false,
    },
    input: serviceAccountIdForAdminServiceAccountsInputSchema,
  },
  listAdminActivity: {
    name: 'list_admin_activity',
    title: 'List admin activity',
    description: 'Read the safe audit activity shown in the admin activity view.',
    feature: 'admin-operations',
    route: '/admin/activity',
    auth: 'administrator',
    risk: 'read',
    confirmation: 'none',
    origin: 'same-origin',
    transport: 'shared-orpc',
    classification: 'shared-orpc',
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
      untrustedContentHint: true,
    },
    input: emptyInput,
  },
} as const satisfies Record<string, Capability>
