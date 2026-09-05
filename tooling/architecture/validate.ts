import { relative, resolve } from 'node:path'

const sourceFiles = new Bun.Glob('src/**/*.{css,ts,tsx}')
const failures: string[] = []
const rawFontSizeUtility = /\btext-(?:xs|sm|base|lg|xl|[2-9]xl|\[[^\]\s]+\])/u
const allowedFormControlFontSize = 'font-size: max(16px, var(--text-body)) !important;'

function report(file: string, message: string) {
  failures.push(`${relative(process.cwd(), file)}: ${message}`)
}

for await (const file of sourceFiles.scan({ absolute: true })) {
  const source = await Bun.file(file).text()

  if (source.includes('process.env') && !file.endsWith('/src/config/env.ts')) {
    report(file, 'read configuration through ~/config/env')
  }

  if (
    source.includes('document.modelContext') &&
    !file.endsWith('/src/webmcp/browser-adapter.ts')
  ) {
    report(file, 'native WebMCP access belongs only in browser-adapter.ts')
  }

  const isClientModule = /^['"]use client['"]/u.test(source.trimStart())
  if (isClientModule && /from ['"]~\/domains\/[^'"]+\/server\//u.test(source)) {
    report(file, 'Client Components cannot import domain server implementations')
  }

  if (/~\/components\/ui(?:\/|['"])/u.test(source)) {
    report(file, 'ShadCN components belong under ~/components/shadcn')
  }

  const isAdminUi = file.includes('/src/app/(admin)/admin/')
  if (source.includes("from '@chakra-ui/react'") && !isAdminUi) {
    report(file, 'Chakra UI is scoped to src/app/(admin)/admin')
  }
  if (isAdminUi && /from ['"]~\/components\/shadcn\//u.test(source)) {
    report(file, 'admin UI uses its route-scoped Chakra system, not ShadCN')
  }

  if (
    /(?:bg|border|text)-(?:blue|gray|green|neutral|red|slate|stone|zinc)-\d{2,3}/u.test(
      source,
    )
  ) {
    report(file, 'use semantic design tokens instead of raw palette utilities')
  }

  if (rawFontSizeUtility.test(source) || /\bfontSize\s*(?:=|:)/u.test(source)) {
    report(file, 'use only text-ui, text-body, text-title, or rare text-display')
  }

  if (
    source.includes('font-size:') &&
    !(
      file.endsWith('/src/app/globals.css') &&
      source.includes(allowedFormControlFontSize)
    )
  ) {
    report(file, 'declare font sizes only through the four global typography roles')
  }

  if (/\btransition-all\b|transition\s*:\s*all\b/u.test(source)) {
    report(file, 'transition only the properties that actually change')
  }

  for (const formTag of source.matchAll(/<form\b[^>]*>/gsu)) {
    if (!/\bmethod=/u.test(formTag[0])) {
      report(file, 'forms must declare an intentional HTTP method')
    }
  }
}

const globalStylesPath = resolve('src/app/globals.css')
const globalStyles = await Bun.file(globalStylesPath).text()
const expectedTypographyRoles = ['body', 'display', 'title', 'ui']
const typographyRoles = new Set(
  [...globalStyles.matchAll(/--text-([a-z][a-z-]*):/gu)].flatMap((match) => {
    const role = match[1]
    return role === undefined || role.includes('--') ? [] : [role]
  }),
)

if (
  !globalStyles.includes('--text-*: initial;') ||
  typographyRoles.size !== expectedTypographyRoles.length ||
  expectedTypographyRoles.some((role) => !typographyRoles.has(role))
) {
  report(globalStylesPath, 'define exactly the ui, body, title, and display type roles')
}

if (
  !globalStyles.includes(allowedFormControlFontSize) ||
  !globalStyles.includes('min-block-size: 44px;') ||
  !globalStyles.includes('min-inline-size: 44px;')
) {
  report(
    globalStylesPath,
    'keep the 16px form-control and 44px coarse-pointer mobile safeguards',
  )
}

if (failures.length > 0) {
  throw new Error(`Architecture validation failed:\n${failures.join('\n')}`)
}

process.stdout.write('Architecture boundaries are valid.\n')
