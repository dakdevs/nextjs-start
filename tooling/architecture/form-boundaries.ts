import { posix } from 'node:path'

import {
  type CallExpression,
  type ExportAllDeclaration,
  type ExportNamedDeclaration,
  type ImportDeclaration,
  type ImportDeclarationSpecifier,
  type ImportExpression,
  type JSXElementName,
  type JSXOpeningElement,
  type ModuleExportName,
  parseSync,
  Visitor,
} from 'oxc-parser'
import { z } from 'zod'

type BoundaryFailure = { file: string; message: string }
type SourceFile = { file: string; source: string }
type ControlName = 'form' | 'input' | 'select' | 'textarea'

export const dependencySectionsSchema = z.object({
  dependencies: z.record(z.string(), z.string()).optional(),
  devDependencies: z.record(z.string(), z.string()).optional(),
  optionalDependencies: z.record(z.string(), z.string()).optional(),
  peerDependencies: z.record(z.string(), z.string()).optional(),
})

type DependencySections = z.infer<typeof dependencySectionsSchema>

const formPackages = ['@tanstack/react-form', '@tanstack/form-core']
const competingFormPackages = [
  '@conform-to/react',
  '@final-form/react',
  '@formkit/react',
  '@hookform/resolvers',
  '@rvf/react',
  'final-form',
  'formik',
  'react-final-form',
  'react-hook-form',
  'redux-form',
  'uniforms',
]
const competingFormPackagePrefixes = [
  '@conform-to/',
  '@final-form/',
  '@formkit/',
  '@hookform/',
  '@rvf/',
]
const prohibitedTanStackImports = new Set([
  'AnyFormApi',
  'createForm',
  'createFormHook',
  'createFormHookContexts',
  'FormApi',
  'ReactFormApi',
  'ReactFormExtendedApi',
  'useForm',
])
const approvedTanStackImports = new Map<string, Set<string>>([
  ['src/modules/forms/contexts.ts', new Set(['createFormHookContexts'])],
  ['src/modules/forms/use-app-form.ts', new Set(['createFormHook'])],
])
const controlNames = new Set(['Field', 'Input', 'Select', 'Textarea'])
const controlByComponentName = new Map<string, ControlName>([
  ['Field', 'input'],
  ['Input', 'input'],
  ['Select', 'select'],
  ['Textarea', 'textarea'],
])
const controlByElementName = new Map<string, ControlName>([
  ['form', 'form'],
  ['input', 'input'],
  ['select', 'select'],
  ['textarea', 'textarea'],
])
const directControlModules = new Map<string, ControlName>([
  ['src/components/shadcn/input', 'input'],
  ['src/components/shadcn/select', 'select'],
  ['src/components/shadcn/textarea', 'textarea'],
  ['@base-ui/react/input', 'input'],
  ['@base-ui/react/select', 'select'],
  ['@base-ui/react/textarea', 'textarea'],
])
const allowedFormInfrastructure = new Map<string, Set<ControlName>>([
  ['src/modules/forms/form-components.tsx', new Set(['form'])],
  ['src/modules/forms/text-field.tsx', new Set(['input'])],
  ['src/modules/forms/textarea-field.tsx', new Set(['textarea'])],
  ['src/modules/forms/select-field.tsx', new Set(['select'])],
])

function normalizedPath(file: string) {
  return posix.normalize(file.replaceAll('\\', '/'))
}

function modulePath(packageName: string, file: string) {
  if (packageName.startsWith('~/')) {
    return `src/${packageName.slice(2)}`
  }

  if (packageName.startsWith('.')) {
    return posix.normalize(posix.join(posix.dirname(file), packageName))
  }

  return packageName
}

function isPackageOrSubpath(packageName: string, packageRoot: string) {
  return packageName === packageRoot || packageName.startsWith(`${packageRoot}/`)
}

function isTanStackFormPackage(packageName: string) {
  return formPackages.some((packageRoot) => {
    return isPackageOrSubpath(packageName, packageRoot)
  })
}

function isCompetingFormPackage(packageName: string) {
  return (
    competingFormPackages.some((packageRoot) => {
      return isPackageOrSubpath(packageName, packageRoot)
    }) ||
    competingFormPackagePrefixes.some((prefix) => {
      return packageName.startsWith(prefix)
    })
  )
}

function npmAliasPackageName(specification: string) {
  if (!specification.startsWith('npm:')) {
    return null
  }

  const target = specification.slice('npm:'.length)

  const versionMarker = target.startsWith('@')
    ? target.lastIndexOf('@')
    : target.indexOf('@')

  return versionMarker > 0 ? target.slice(0, versionMarker) : target
}

function moduleExportName(name: ModuleExportName) {
  return name.type === 'Literal' ? name.value : name.name
}

function controlForModule(packageName: string, file: string) {
  const resolvedPath = modulePath(packageName, file).replace(/\.(?:ts|tsx)$/u, '')

  for (const [moduleRoot, control] of directControlModules) {
    if (isPackageOrSubpath(resolvedPath, moduleRoot)) {
      return control
    }
  }

  return null
}

function isGeneratedControl(file: string) {
  return file.startsWith('src/components/shadcn/')
}

function allowsControl(file: string, control: ControlName) {
  return (
    isGeneratedControl(file) ||
    allowedFormInfrastructure.get(file)?.has(control) === true
  )
}

function importedName(specifier: ImportDeclarationSpecifier) {
  return specifier.type === 'ImportSpecifier'
    ? moduleExportName(specifier.imported)
    : null
}

function importedLocalName(specifier: ImportDeclarationSpecifier) {
  return specifier.local.name
}

function controlFromComponentName(name: string | null) {
  return name === null ? null : (controlByComponentName.get(name) ?? null)
}

function report(failures: BoundaryFailure[], file: string, message: string) {
  failures.push({ file, message })
}

function checkTanStackImport(
  declaration: ImportDeclaration,
  file: string,
  failures: BoundaryFailure[],
) {
  const packageName = declaration.source.value

  if (isCompetingFormPackage(packageName)) {
    report(
      failures,
      file,
      `remove competing form library ${packageName}; application forms use @tanstack/react-form`,
    )

    return
  }

  if (!isTanStackFormPackage(packageName)) {
    return
  }

  for (const specifier of declaration.specifiers) {
    const name = importedName(specifier)

    if (name === null || !prohibitedTanStackImports.has(name)) {
      if (name === null) {
        report(
          failures,
          file,
          `do not namespace-import ${packageName}; use the shared form API instead`,
        )
      }

      continue
    }

    if (approvedTanStackImports.get(file)?.has(name) === true) {
      continue
    }

    report(
      failures,
      file,
      `${name} from ${packageName} belongs only in the shared form infrastructure`,
    )
  }
}

function collectControlImport(
  specifier: ImportDeclarationSpecifier,
  directControl: ControlName | null,
  controlLibrary: boolean,
  file: string,
  controlledComponents: Set<string>,
  controlNamespaces: Set<string>,
  failures: BoundaryFailure[],
) {
  if (specifier.type === 'ImportNamespaceSpecifier' && controlLibrary) {
    controlNamespaces.add(importedLocalName(specifier))

    return
  }

  const name = importedName(specifier)

  const control = directControl ?? controlFromComponentName(name)

  if (control === null) {
    return
  }

  controlledComponents.add(importedLocalName(specifier))

  if (!allowsControl(file, control)) {
    report(
      failures,
      file,
      `import ${name ?? control} only through the registered shared form layer`,
    )
  }
}

function checkControlImport(
  declaration: ImportDeclaration,
  file: string,
  controlledComponents: Set<string>,
  controlNamespaces: Set<string>,
  failures: BoundaryFailure[],
) {
  if (isGeneratedControl(file)) {
    return
  }

  const packageName = declaration.source.value

  const directControl = controlForModule(packageName, file)

  const controlLibrary =
    packageName === '@chakra-ui/react' || packageName === '@base-ui/react'

  if (directControl === null && !controlLibrary) {
    return
  }

  for (const specifier of declaration.specifiers) {
    collectControlImport(
      specifier,
      directControl,
      controlLibrary,
      file,
      controlledComponents,
      controlNamespaces,
      failures,
    )
  }
}

function jsxName(name: JSXElementName) {
  if (name.type === 'JSXIdentifier') {
    return { object: null, property: name.name }
  }

  if (name.type !== 'JSXMemberExpression' || name.object.type !== 'JSXIdentifier') {
    return null
  }

  return { object: name.object.name, property: name.property.name }
}

function isRawControl(name: { object: string | null; property: string }) {
  return name.object === null && controlByElementName.has(name.property)
}

function isImportedControl(
  name: { object: string | null; property: string },
  controls: Set<string>,
) {
  return name.object === null && controls.has(name.property)
}

function isNamespacedControl(
  name: { object: string | null; property: string },
  namespaces: Set<string>,
) {
  return (
    name.object !== null &&
    namespaces.has(name.object) &&
    controlNames.has(name.property)
  )
}

function checkJsxControl(
  openingElement: JSXOpeningElement,
  file: string,
  controlledComponents: Set<string>,
  controlNamespaces: Set<string>,
  failures: BoundaryFailure[],
) {
  const name = jsxName(openingElement.name)

  if (name === null) {
    return
  }

  const rawControl = isRawControl(name)

  const importedControl = isImportedControl(name, controlledComponents)

  const namespacedControl = isNamespacedControl(name, controlNamespaces)

  if (!rawControl && !importedControl && !namespacedControl) {
    return
  }

  const control =
    name.object === null
      ? controlByElementName.get(name.property)
      : controlFromComponentName(name.property)

  if (control === undefined || control === null) {
    return
  }

  if (allowsControl(file, control)) {
    return
  }

  report(
    failures,
    file,
    control === 'form'
      ? 'use form.AppForm instead of a raw native form'
      : `use a registered AppField instead of direct ${name.property} control markup`,
  )
}

function checkExport(
  declaration: ExportNamedDeclaration | ExportAllDeclaration,
  file: string,
  failures: BoundaryFailure[],
) {
  const source = declaration.source

  if (source === null) {
    return
  }

  const packageName = source.value

  if (isCompetingFormPackage(packageName)) {
    report(
      failures,
      file,
      `remove competing form library ${packageName}; application forms use @tanstack/react-form`,
    )
  } else if (isTanStackFormPackage(packageName)) {
    report(
      failures,
      file,
      `do not re-export ${packageName}; import the shared form API instead`,
    )
  }
}

function stringArgument(node: CallExpression | ImportExpression) {
  if (node.type === 'ImportExpression') {
    if (node.source.type !== 'Literal') {
      return null
    }

    const parsed = z.string().safeParse(node.source.value)

    return parsed.success ? parsed.data : null
  }

  const argument = node.arguments[0]

  if (argument?.type !== 'Literal') {
    return null
  }

  const parsed = z.string().safeParse(argument.value)

  return parsed.success ? parsed.data : null
}

function checkDynamicImport(
  node: CallExpression | ImportExpression,
  file: string,
  failures: BoundaryFailure[],
) {
  const packageName = stringArgument(node)

  const isRequire =
    node.type === 'CallExpression' &&
    node.callee.type === 'Identifier' &&
    node.callee.name === 'require'

  if (packageName === null || (node.type === 'CallExpression' && !isRequire)) {
    return
  }

  if (isCompetingFormPackage(packageName)) {
    report(
      failures,
      file,
      `remove competing form library ${packageName}; application forms use @tanstack/react-form`,
    )
  } else if (isTanStackFormPackage(packageName)) {
    report(
      failures,
      file,
      `do not dynamically load ${packageName}; use the static shared form API instead`,
    )
  }
}

function sourceFailures({ file, source }: SourceFile) {
  const normalizedFile = normalizedPath(file)

  const parsed = parseSync(normalizedFile, source)

  const failures: BoundaryFailure[] = parsed.errors.map((error) => {
    return {
      file: normalizedFile,
      message: `could not parse source for form-boundary checks: ${error.message}`,
    }
  })

  const controlledComponents = new Set<string>()

  const controlNamespaces = new Set<string>()

  const visitor = new Visitor({
    ImportDeclaration: (node) => {
      checkTanStackImport(node, normalizedFile, failures)

      checkControlImport(
        node,
        normalizedFile,
        controlledComponents,
        controlNamespaces,
        failures,
      )
    },
    ExportNamedDeclaration: (node) => {
      checkExport(node, normalizedFile, failures)
    },
    ExportAllDeclaration: (node) => {
      checkExport(node, normalizedFile, failures)
    },
    CallExpression: (node) => {
      checkDynamicImport(node, normalizedFile, failures)
    },
    ImportExpression: (node) => {
      checkDynamicImport(node, normalizedFile, failures)
    },
    JSXOpeningElement: (node) => {
      checkJsxControl(
        node,
        normalizedFile,
        controlledComponents,
        controlNamespaces,
        failures,
      )
    },
  })

  visitor.visit(parsed.program)

  return failures
}

export function findFormBoundaryFailures(
  sources: SourceFile[],
  packageJson: DependencySections,
) {
  const failures = sources.flatMap(sourceFailures)

  for (const dependencies of Object.values(packageJson)) {
    if (dependencies === undefined) {
      continue
    }

    for (const [name, specification] of Object.entries(dependencies)) {
      const aliasTarget = npmAliasPackageName(specification)

      if (
        !isCompetingFormPackage(name) &&
        (aliasTarget === null || !isCompetingFormPackage(aliasTarget))
      ) {
        continue
      }

      report(
        failures,
        'package.json',
        `remove competing form dependency ${name}; application forms use @tanstack/react-form`,
      )
    }
  }

  return failures
}
