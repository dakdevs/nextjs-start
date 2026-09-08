import type { ReactDoctorConfig } from 'react-doctor/api'

export default {
  blocking: 'warning',
  buckets: {
    'compiler-cleanup': 'error',
  },
  categories: {
    Accessibility: 'error',
    Bugs: 'error',
    Maintainability: 'error',
    Performance: 'error',
    Security: 'error',
  },
  ignore: {
    // @workflow/next regenerates these route adapters during Next builds.
    // They are ignored by its emitted nested .gitignore and have no authored
    // source counterpart to review here.
    files: ['src/app/.well-known/workflow/**'],
    overrides: [
      {
        files: ['src/modules/forms/form-components.tsx'],
        rules: ['react-doctor/no-prevent-default'],
      },
    ],
  },
  respectInlineDisables: false,
  scope: 'full',
  surfaces: {
    ciFailure: {
      includeFileContexts: ['story', 'test'],
      includeTags: ['design', 'migration-hint', 'test-noise'],
    },
    score: {
      includeFileContexts: ['story', 'test'],
      includeTags: ['design', 'migration-hint', 'test-noise'],
    },
  },
  warnings: true,
} satisfies ReactDoctorConfig
