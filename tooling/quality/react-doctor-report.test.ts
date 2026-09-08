import { describe, expect, it } from 'vitest'

import doctorConfig from '../../doctor.config'

import {
  formatReactDoctorDiagnostics,
  parseReactDoctorJson,
  validateReactDoctorReport,
} from './react-doctor-report'

const rootDirectory = '/repository'

function validReport() {
  return {
    diagnostics: [],
    diff: null,
    directory: rootDirectory,
    elapsedMilliseconds: 10,
    error: null,
    mode: 'full',
    ok: true,
    projects: [
      {
        analyzedFileCount: 2,
        analyzedFiles: ['src/app/page.tsx', 'src/components/button.tsx'],
        complete: true,
        diagnostics: [],
        directory: rootDirectory,
        elapsedMilliseconds: 9,
        framework: 'nextjs',
        packageRoot: rootDirectory,
        project: {
          reactMajorVersion: 19,
          reactVersion: '19.2.8',
          rootDirectory,
          sourceFileCount: 2,
        },
        scannedFileCount: 2,
        score: { label: 'Excellent', score: 100 },
        skippedChecks: [],
      },
    ],
    reactDetected: true,
    schemaVersion: 3,
    summary: {
      affectedFileCount: 0,
      errorCount: 0,
      score: 100,
      scoreLabel: 'Excellent',
      totalDiagnosticCount: 0,
      warningCount: 0,
    },
    version: '0.9.13',
  }
}

function parsedValidReport() {
  return parseReactDoctorJson(JSON.stringify(validReport()))
}

function onlyProject(report: ReturnType<typeof parsedValidReport>) {
  const project = report.projects[0]

  if (project === undefined) {
    throw new Error('Test fixture has no project.')
  }

  return project
}

describe('React Doctor report gate', () => {
  it('accepts a complete, score-100, diagnostic-free root scan', () => {
    expect(validateReactDoctorReport(parsedValidReport(), rootDirectory)).toMatchObject(
      {
        schemaVersion: 3,
        summary: { score: 100 },
      },
    )
  })

  it.each([
    [
      'score below 100',
      (report: ReturnType<typeof parsedValidReport>) => {
        report.summary.score = 99
      },
    ],
    [
      'warning despite score 100',
      (report: ReturnType<typeof parsedValidReport>) => {
        report.summary.warningCount = 1
      },
    ],
    [
      'error despite score 100',
      (report: ReturnType<typeof parsedValidReport>) => {
        report.summary.errorCount = 1
      },
    ],
    [
      'partial source coverage',
      (report: ReturnType<typeof parsedValidReport>) => {
        onlyProject(report).project.sourceFileCount = 3
      },
    ],
    [
      'incomplete project',
      (report: ReturnType<typeof parsedValidReport>) => {
        onlyProject(report).complete = false
      },
    ],
    [
      'skipped check',
      (report: ReturnType<typeof parsedValidReport>) => {
        onlyProject(report).skippedChecks.push('lint')
      },
    ],
    [
      'missing project score',
      (report: ReturnType<typeof parsedValidReport>) => {
        onlyProject(report).score = null
      },
    ],
    [
      'stale baseline mode',
      (report: ReturnType<typeof parsedValidReport>) => {
        report.baseline = { baseRef: 'stale' }
      },
    ],
    [
      'project mismatch',
      (report: ReturnType<typeof parsedValidReport>) => {
        onlyProject(report).packageRoot = '/other-project'
      },
    ],
  ])('rejects %s', (_, mutate) => {
    const report = parsedValidReport()

    mutate(report)

    expect(() => {
      return validateReactDoctorReport(report, rootDirectory)
    }).toThrow(/React Doctor/u)
  })

  it('excludes only compiler-generated Workflow routes', () => {
    expect(doctorConfig.ignore?.files).toEqual(['src/app/.well-known/workflow/**'])
  })

  it('prints every raw top-level and project diagnostic', () => {
    const report = parsedValidReport()

    const diagnostic = {
      category: 'Bugs',
      column: 1,
      filePath: 'src/app/page.tsx',
      help: 'Fix the first issue.',
      id: 'top-level',
      line: 1,
      message: 'First issue',
      normalizedFilePath: 'src/app/page.tsx',
      plugin: 'react-doctor',
      rule: 'first-rule',
      severity: 'error' as const,
      tags: [],
    }

    report.diagnostics.push(diagnostic)

    onlyProject(report).diagnostics.push({
      ...diagnostic,
      help: 'Fix the second issue.',
      id: 'project-level',
      message: 'Second issue',
    })

    const formatted = formatReactDoctorDiagnostics(report)

    expect(formatted).toContain('First issue')

    expect(formatted).toContain('Fix the first issue.')

    expect(formatted).toContain('Second issue')

    expect(formatted).toContain('Fix the second issue.')
  })

  it('rejects malformed JSON and an incompatible schema version before validation', () => {
    expect(() => {
      return parseReactDoctorJson('{')
    }).toThrow(/JSON/u)

    const incompatibleReport = validReport()

    incompatibleReport.schemaVersion = 2

    expect(() => {
      return parseReactDoctorJson(JSON.stringify(incompatibleReport))
    }).toThrow(/schemaVersion/u)
  })
})
