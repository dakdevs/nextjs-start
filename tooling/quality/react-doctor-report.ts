import { z } from 'zod'

const scoreSchema = z.looseObject({
  label: z.string(),
  score: z.number(),
})

const diagnosticSchema = z.looseObject({
  category: z.string(),
  column: z.number(),
  filePath: z.string(),
  help: z.string(),
  id: z.string(),
  line: z.number(),
  message: z.string(),
  normalizedFilePath: z.string(),
  plugin: z.string(),
  rule: z.string(),
  severity: z.enum(['error', 'warning']),
  tags: z.array(z.string()),
})

const projectSchema = z.looseObject({
  reactMajorVersion: z.number().int().positive().nullable(),
  reactVersion: z.string().nullable(),
  rootDirectory: z.string(),
  sourceFileCount: z.number().int().nonnegative(),
})

const projectEntrySchema = z.strictObject({
  analyzedFileCount: z.number().int().nonnegative(),
  analyzedFiles: z.array(z.string()),
  complete: z.boolean(),
  diagnostics: z.array(diagnosticSchema),
  directory: z.string(),
  elapsedMilliseconds: z.number().nonnegative(),
  framework: z.string(),
  packageRoot: z.string(),
  project: projectSchema,
  scannedFileCount: z.number().int().nonnegative(),
  score: scoreSchema.nullable(),
  skippedCheckReasons: z.record(z.string(), z.string()).optional(),
  skippedChecks: z.array(z.string()),
})

const reportSchema = z.strictObject({
  baseline: z.unknown().optional(),
  baselineDegraded: z.boolean().optional(),
  diagnostics: z.array(diagnosticSchema),
  diff: z.null(),
  directory: z.string(),
  elapsedMilliseconds: z.number().nonnegative(),
  error: z
    .looseObject({
      chain: z.array(z.string()),
      message: z.string(),
      name: z.string(),
    })
    .nullable(),
  mode: z.literal('full'),
  ok: z.boolean(),
  projects: z.array(projectEntrySchema),
  reactDetected: z.boolean(),
  schemaVersion: z.literal(3),
  skippedProjects: z
    .array(
      z.looseObject({
        directory: z.string(),
        reason: z.string(),
      }),
    )
    .optional(),
  summary: z.strictObject({
    affectedFileCount: z.number().int().nonnegative(),
    errorCount: z.number().int().nonnegative(),
    score: z.number().nullable(),
    scoreLabel: z.string().nullable(),
    totalDiagnosticCount: z.number().int().nonnegative(),
    warningCount: z.number().int().nonnegative(),
  }),
  version: z.string(),
})

type ReactDoctorReport = z.infer<typeof reportSchema>
type ReactDoctorProject = ReactDoctorReport['projects'][number]

function isExpectedDirectory(directory: string, expectedRoot: string) {
  return directory === expectedRoot
}

function hasRequiredSourceCoverage(analyzedFiles: readonly string[]) {
  return (
    analyzedFiles.some((file) => {
      return file === 'src' || file.startsWith('src/')
    }) &&
    analyzedFiles.some((file) => {
      return file === 'src/app' || file.startsWith('src/app/')
    })
  )
}

export function parseReactDoctorJson(source: string) {
  return reportSchema.parse(JSON.parse(source))
}

function requireExpectedRootProject(project: ReactDoctorProject, expectedRoot: string) {
  if (
    !isExpectedDirectory(project.directory, expectedRoot) ||
    !isExpectedDirectory(project.packageRoot, expectedRoot) ||
    !isExpectedDirectory(project.project.rootDirectory, expectedRoot)
  ) {
    throw new Error('React Doctor scanned a project other than the repository root.')
  }
}

function requireReactRuntime(project: ReactDoctorProject) {
  if (
    project.project.reactVersion === null ||
    project.project.reactMajorVersion === null
  ) {
    throw new Error('React Doctor did not resolve the project React runtime.')
  }
}

function requireCompleteProject(project: ReactDoctorProject) {
  if (!project.complete) {
    throw new Error('React Doctor did not complete its project scan.')
  }

  if (
    project.skippedChecks.length > 0 ||
    Object.keys(project.skippedCheckReasons ?? {}).length > 0
  ) {
    throw new Error('React Doctor skipped one or more checks.')
  }
}

function requireSourceCoverage(project: ReactDoctorProject) {
  if (
    project.analyzedFiles.length === 0 ||
    project.analyzedFileCount !== project.analyzedFiles.length ||
    project.project.sourceFileCount !== project.scannedFileCount ||
    project.scannedFileCount !== project.analyzedFileCount ||
    !hasRequiredSourceCoverage(project.analyzedFiles)
  ) {
    throw new Error(
      'React Doctor did not analyze the expected application source files.',
    )
  }
}

function requirePerfectResults(report: ReactDoctorReport, project: ReactDoctorProject) {
  if (report.diagnostics.length > 0 || project.diagnostics.length > 0) {
    throw new Error('React Doctor reported diagnostics.')
  }

  if (
    report.summary.errorCount !== 0 ||
    report.summary.warningCount !== 0 ||
    report.summary.totalDiagnosticCount !== 0 ||
    report.summary.score !== 100 ||
    project.score?.score !== 100
  ) {
    throw new Error('React Doctor did not produce a clean score of 100.')
  }
}

function requireHealthyScan(report: ReactDoctorReport) {
  if (!report.ok) {
    throw new Error('React Doctor reported an unsuccessful scan.')
  }

  if (!report.reactDetected) {
    throw new Error('React Doctor did not detect a React runtime.')
  }

  if (report.error !== null) {
    throw new Error(`React Doctor failed: ${report.error.message}`)
  }

  if (report.baseline !== undefined || report.baselineDegraded === true) {
    throw new Error('React Doctor did not run a clean full scan.')
  }

  if ((report.skippedProjects?.length ?? 0) > 0) {
    throw new Error('React Doctor skipped a project.')
  }
}

function requireSingleExpectedProject(report: ReactDoctorReport, expectedRoot: string) {
  const project = report.projects[0]

  if (report.projects.length !== 1 || project === undefined) {
    throw new Error('React Doctor must scan exactly one root project.')
  }

  if (!isExpectedDirectory(report.directory, expectedRoot)) {
    throw new Error('React Doctor scanned a project other than the repository root.')
  }

  requireExpectedRootProject(project, expectedRoot)

  return project
}

export function validateReactDoctorReport(
  report: ReactDoctorReport,
  expectedRoot: string,
): ReactDoctorReport {
  requireHealthyScan(report)

  const project = requireSingleExpectedProject(report, expectedRoot)

  requireReactRuntime(project)

  requireCompleteProject(project)

  requireSourceCoverage(project)

  requirePerfectResults(report, project)

  return report
}

export function formatReactDoctorDiagnostics(report: ReactDoctorReport) {
  const diagnostics = [
    ...report.diagnostics,
    ...report.projects.flatMap((project) => {
      return project.diagnostics
    }),
  ]

  if (diagnostics.length === 0) {
    return 'No diagnostics were reported.'
  }

  return diagnostics
    .map((diagnostic) => {
      return JSON.stringify(diagnostic)
    })
    .join('\n')
}
