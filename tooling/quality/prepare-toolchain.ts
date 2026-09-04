import { access } from 'node:fs/promises'

const pluginConfig = 'node_modules/@dakdevs/oxlint-plugin/dist/config/index.js'

async function run(command: string[]) {
  const process = Bun.spawn(command, {
    stderr: 'inherit',
    stdout: 'inherit',
  })
  const exitCode = await process.exited

  if (exitCode !== 0) {
    throw new Error(`Toolchain preparation failed: ${command.join(' ')}`)
  }
}

async function pluginIsBuilt() {
  try {
    await access(pluginConfig)
    return true
  } catch {
    return false
  }
}

if (!(await pluginIsBuilt())) {
  await run([
    'bunx',
    'tsc',
    '-p',
    'node_modules/@dakdevs/oxlint-plugin/tsconfig.build.json',
  ])
  await run([
    'node',
    'node_modules/@dakdevs/oxlint-plugin/scripts/make-cli-executable.mjs',
  ])
}

await run(['bunx', 'effect-tsgo', 'patch', '--no-typescript', '--oxlint'])
