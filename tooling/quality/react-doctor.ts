import { realpath } from 'node:fs/promises'
import { z } from 'zod'

import {
  formatReactDoctorDiagnostics,
  parseReactDoctorJson,
  validateReactDoctorReport,
} from './react-doctor-report'

const rootDirectory = await realpath(process.cwd())
const reactDoctorVersion = '0.9.13'
z.looseObject({ version: z.literal(reactDoctorVersion) }).parse(
  await Bun.file(`${rootDirectory}/node_modules/react-doctor/package.json`).json(),
)
const child = Bun.spawn(
  [
    'bunx',
    '--no-install',
    'react-doctor',
    '.',
    '--scope',
    'full',
    '--blocking',
    'warning',
    '--no-respect-inline-disables',
    '--yes',
    '--json',
  ],
  {
    cwd: rootDirectory,
    stderr: 'pipe',
    stdout: 'pipe',
  },
)
const [exitCode, stdout, stderr] = await Promise.all([
  child.exited,
  new Response(child.stdout).text(),
  new Response(child.stderr).text(),
])

function parseReportOrThrow(stdout: string, stderr: string, exitCode: number) {
  try {
    return parseReactDoctorJson(stdout)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown parsing failure.'

    throw new Error(
      `React Doctor did not emit a valid schema-v3 JSON report (exit ${exitCode}): ${message}\n${stderr}`,
      { cause: error },
    )
  }
}

const report = parseReportOrThrow(stdout, stderr, exitCode)

try {
  validateReactDoctorReport(report, rootDirectory)
} catch (error) {
  const message = error instanceof Error ? error.message : 'Unknown validation failure.'

  throw new Error(
    `${message}\nReact Doctor diagnostics:\n${formatReactDoctorDiagnostics(report)}\n${stderr}`,
    { cause: error },
  )
}

if (exitCode !== 0) {
  throw new Error(`React Doctor failed (${exitCode}).\n${stderr}`)
}

process.stdout.write('React Doctor completed a full, clean score-100 scan.\n')
