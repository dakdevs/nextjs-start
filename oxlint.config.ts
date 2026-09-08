import { defineConfig } from '@dakdevs/oxlint-plugin/config'

import type { OxlintConfig } from 'oxlint'

// Explicitly approved host-boundary exceptions. Never disable Effect correctness
// rules or either mandatory brace rule. See docs/technologies/effect-lint-boundaries.md.
export const effectBoundaryOverrides = [
  // Framework-owned call signatures and plain pure boundary helpers are not pipeable Effect APIs.
  {
    files: [
      'next.config.ts',
      'src/auth/ban-policy.ts',
      'src/auth/user-access.ts',
      'src/orpc/procedures.ts',
      'tooling/architecture/form-boundaries.ts',
      'tooling/quality/react-doctor-report.ts',
      'tooling/test/with-postgres.ts',
    ],
    rules: { 'effecttsgo/missing-pipeable-signature': 'off' },
  },
  // Validated environment ingestion and framework/test startup require host environment access.
  {
    files: [
      'e2e/00-admin-operations.spec.ts',
      'next.config.ts',
      'playwright.config.ts',
      'src/config/env.ts',
      'tooling/test/app-origin.ts',
    ],
    rules: { 'effecttsgo/process-env': 'off' },
  },
  // Framework callbacks, browser submissions, test runners, and CLI orchestration own Promise lifecycles.
  {
    files: [
      'e2e/00-admin-operations.spec.ts',
      'e2e/account-profile.spec.ts',
      'e2e/agent-content.spec.ts',
      'e2e/form-composition.spec.ts',
      'e2e/theme-menu.spec.ts',
      'src/app/(admin)/admin/_modules/admin-screen-load.ts',
      'src/app/(admin)/admin/activity/page.tsx',
      'src/app/(admin)/admin/data/_modules/admin-data-webmcp-tools.test.tsx',
      'src/app/(admin)/admin/data/page.tsx',
      'src/app/(admin)/admin/layout.tsx',
      'src/app/(admin)/admin/page.tsx',
      'src/app/(admin)/admin/service-accounts/_modules/admin-service-account-create-form.test.tsx',
      'src/app/(admin)/admin/service-accounts/_modules/use-service-account-workflow.ts',
      'src/app/(admin)/admin/service-accounts/page.tsx',
      'src/app/(admin)/admin/users/_modules/admin-users-workspace.tsx',
      'src/app/(admin)/admin/users/page.tsx',
      'src/app/(app)/account/_modules/account-profile-editor.tsx',
      'src/app/(app)/account/_modules/passkey-enrollment.tsx',
      'src/app/(app)/account/layout.tsx',
      'src/app/(app)/account/page.tsx',
      'src/app/(auth)/forgot-password/_modules/forgot-password-form.tsx',
      'src/app/(auth)/reset-password/_modules/reset-password-form.tsx',
      'src/app/(auth)/reset-password/page.tsx',
      'src/app/(auth)/sign-in/_modules/sign-in-form.tsx',
      'src/app/(auth)/sign-up/_modules/sign-up-form.tsx',
      'src/app/(auth)/verify-email/_modules/verify-email-panel.tsx',
      'src/app/(auth)/verify-email/page.tsx',
      'src/app/api/queues/account-profile-updated/route.ts',
      'src/app/api/service/health/route.ts',
      'src/app/page.tsx',
      'src/app/rpc/**/route.ts',
      'src/auth/auth.ts',
      'src/auth/rate-limit.integration.test.ts',
      'src/auth/session.ts',
      'src/auth/user-access.integration.test.ts',
      'src/auth/user-access.ts',
      'src/domains/account/server/account-profile-repository.integration.test.ts',
      'src/domains/admin/server/admin-reference.integration.test.ts',
      'src/modules/forms/form-composition.test.tsx',
      'src/modules/sign-out-button.tsx',
      'src/orpc/router.integration.test.ts',
      'src/orpc/server-client.ts',
      'src/orpc/unexpected-error-interceptor.ts',
      'src/queues/account-profile-updated-handler.integration.test.ts',
      'src/queues/account-profile-updated-handler.test.ts',
      'src/queues/account-profile-updated.test.ts',
      'src/queues/outbox/postgres-transactional-outbox.integration.test.ts',
      'src/queues/outbox/service.test.ts',
      'src/queues/postgres-processed-event-store.integration.test.ts',
      'src/workflows/profile-update-audit.ts',
      'src/workflows/profile-update-audit.workflow.test.ts',
      'test/browser/form-fixture.tsx',
      'test/browser/forms-entry.tsx',
      'tooling/docs/validate.ts',
      'tooling/quality/env-policy.test.ts',
      'tooling/quality/prepare-toolchain.ts',
      'tooling/test/run-with-postgres.ts',
      'tooling/test/with-postgres.ts',
      'tooling/verify.ts',
    ],
    rules: { 'effecttsgo/async-function': 'off' },
  },
  // Tests use deferred Promises to observe real pending-state and process-completion behavior.
  {
    files: [
      'e2e/form-composition.spec.ts',
      'src/queues/account-profile-updated.test.ts',
      'tooling/quality/env-policy.test.ts',
    ],
    rules: { 'effecttsgo/new-promise': 'off' },
  },
  // Host tooling and the local mailbox adapter require filesystem, path, and process APIs.
  {
    files: [
      'e2e/00-admin-operations.spec.ts',
      'e2e/account-profile.spec.ts',
      'e2e/form-composition.spec.ts',
      'src/domains/admin/server/admin-reference.integration.test.ts',
      'src/email/development-mailbox.ts',
      'tooling/architecture/form-boundaries.ts',
      'tooling/architecture/validate.ts',
      'tooling/docs/validate.ts',
      'tooling/quality/env-policy.test.ts',
      'tooling/quality/prepare-toolchain.ts',
      'tooling/quality/react-doctor.ts',
    ],
    rules: { 'effecttsgo/node-builtin-import': 'off' },
  },
  // Request/auth/browser boundaries create synchronous correlation IDs using host cryptography.
  {
    files: [
      'e2e/00-admin-operations.spec.ts',
      'e2e/account-profile.spec.ts',
      'src/app/api/service/health/route.ts',
      'src/app/rpc/**/route.ts',
      'src/auth/auth.ts',
      'src/email/development-mailbox.ts',
      'src/modules/forms/form-components.tsx',
      'src/observability/use-client-boundary-error.ts',
      'src/orpc/router.integration.test.ts',
      'src/orpc/server-client.ts',
      'src/orpc/unexpected-error-interceptor.ts',
    ],
    rules: { 'effecttsgo/crypto-random-uuid': 'off' },
  },
  // UI and persisted auth/workflow boundaries exchange native Dates; tests use fixed Date fixtures.
  {
    files: [
      'src/app/(admin)/admin/service-accounts/_modules/use-service-account-workflow.ts',
      'src/auth/ban-policy.test.ts',
      'src/auth/user-access.integration.test.ts',
      'src/auth/user-access.ts',
      'src/domains/admin/server/admin-reference.integration.test.ts',
      'src/email/development-mailbox.ts',
      'src/orpc/router.integration.test.ts',
      'src/queues/account-profile-updated-handler.integration.test.ts',
      'src/queues/account-profile-updated-handler.test.ts',
      'src/workflows/profile-update-audit.ts',
      'src/workflows/profile-update-audit.workflow.test.ts',
    ],
    rules: { 'effecttsgo/global-date': 'off' },
  },
  // The form boundary distinguishes an already-reported native Error without logging twice.
  {
    files: ['src/modules/forms/reported-submission-error.ts'],
    rules: { 'effecttsgo/extends-native-error': 'off' },
  },
  // The browser error boundary logs sanitized correlation information outside a server Effect runtime.
  {
    files: [
      'src/modules/forms/form-components.tsx',
      'src/observability/use-client-boundary-error.ts',
    ],
    rules: { 'effecttsgo/global-console': 'off' },
  },
  // The browser fixture exercises the native HTTP seam.
  {
    files: ['test/browser/forms-entry.tsx'],
    rules: { 'effecttsgo/global-fetch': 'off' },
  },
  // The Workflow compiler requires async step declarations even for a pure step.
  {
    files: ['src/workflows/profile-update-audit.ts'],
    rules: { 'require-await': 'off', 'typescript/require-await': 'off' },
  },
] satisfies NonNullable<OxlintConfig['overrides']>

const config = defineConfig({
  overrides: effectBoundaryOverrides,
  ignorePatterns: [
    '.next/**',
    '.workflow-vitest/**',
    'coverage/**',
    'drizzle/**',
    'env.d.ts',
    'node_modules/**',
    'playwright-report/**',
    'test-results/**',
  ],
})

function promoteWarnings(rules: typeof config.rules) {
  if (rules === undefined) {
    return
  }

  for (const [name, setting] of Object.entries(rules)) {
    if (Array.isArray(setting)) {
      if (setting[0] === 'warn' || setting[0] === 1) {
        setting[0] = 'error'
      }

      continue
    }

    if (setting === 'warn' || setting === 1) {
      rules[name] = 'error'
    }
  }
}

promoteWarnings(config.rules)
for (const override of config.overrides ?? []) {
  promoteWarnings(override.rules)
}

export default config
