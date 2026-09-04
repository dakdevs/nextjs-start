import { z } from 'zod'
import type { ToolAnnotations } from '@mcp-b/webmcp-types'

import { updateAccountProfileForAccountScreenInputSchema } from '~/domains/account/contracts/update-account-profile-for-account-screen'

type CapabilityRisk = 'navigation' | 'read' | 'reversible-mutation' | 'credential'
type CapabilityTransport = 'shared-orpc' | 'ui-initiation' | 'none'
type CapabilityRoute = 'global' | '/account'

type Capability = {
  name: string
  title: string
  description: string
  feature: 'authentication' | 'account-profile'
  route: CapabilityRoute
  auth: 'public' | 'authenticated'
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
} as const satisfies Record<string, Capability>
