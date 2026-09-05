import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react'

const adminConfig = defineConfig({
  cssVarsPrefix: 'admin',
  cssVarsRoot: '.admin-chakra-scope',
  preflight: { scope: '.admin-chakra-scope' },
})

export const adminSystem = createSystem(defaultConfig, adminConfig)
