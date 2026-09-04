const child = Bun.spawn(
  [
    'bunx',
    'effect-tsgo',
    'diagnostics',
    '--project',
    'tsconfig.json',
    '--strict',
    '--severity',
    'error,warning',
  ],
  { stderr: 'pipe', stdout: 'pipe' },
)

const [stdout, stderr, exitCode] = await Promise.all([
  new Response(child.stdout).text(),
  new Response(child.stderr).text(),
  child.exited,
])

process.stdout.write(stdout)
process.stderr.write(stderr)

if (exitCode !== 0) throw new Error(`Effect diagnostics failed (${exitCode})`)

const summary = /Checked (\d+) files out of (\d+) files\./u.exec(`${stdout}\n${stderr}`)
const checkedFiles = Number(summary?.[1] ?? 0)
const totalFiles = Number(summary?.[2] ?? 0)

if (checkedFiles === 0 || totalFiles === 0) {
  throw new Error(
    'Effect diagnostics checked no files. Keep @effect/language-service enabled in tsconfig.json.',
  )
}
