import { access } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'

import { z } from 'zod'

const requiredFeatureHeadings = [
  '## Problem and value',
  '## Goals',
  '## Non-goals and not valuable now',
  '## Users and entry points',
  '## Core happy path',
  '## Invariants and decisions',
  '## WebMCP parity',
  '## Success and open questions',
  '## Links',
]

const changeManifestSchema = z.object({
  version: z.literal(1),
  id: z.string().min(8),
  status: z.string().min(3),
  summary: z.string().min(20),
  impact: z.object({
    features: z.array(z.string()).min(1),
    architecture: z.array(z.string()),
    technology: z.array(z.string()),
    designSystem: z.boolean(),
  }),
  verification: z.array(z.string()).min(1),
  date: z.iso.date(),
})

const markdownLink = /\[[^\]]+\]\(([^)]+)\)/gu
const failures: string[] = []
const markdownFiles = [...new Bun.Glob('docs/**/*.md').scanSync()]

async function pathExists(path: string) {
  try {
    await access(path)
    return true
  } catch {
    return false
  }
}

for (const file of markdownFiles) {
  const source = await Bun.file(file).text()
  const lines = source.split('\n').length

  if (lines > 150) failures.push(`${file}: ${lines} lines exceeds the 150-line cap`)

  if (file.startsWith('docs/features/')) {
    for (const heading of requiredFeatureHeadings) {
      if (!source.includes(heading)) failures.push(`${file}: missing ${heading}`)
    }
  }

  for (const match of source.matchAll(markdownLink)) {
    const target = match[1]?.split('#')[0]
    if (target === undefined || target === '' || /^(?:#|https?:|mailto:)/u.test(target))
      continue

    const absoluteTarget = resolve(dirname(file), target)
    if (!(await pathExists(absoluteTarget))) {
      failures.push(`${file}: broken link ${target}`)
    }
  }
}

const featureIds = new Set(
  markdownFiles
    .filter((file) => file.startsWith('docs/features/'))
    .map((file) => file.slice('docs/features/'.length, -'.md'.length)),
)

for (const file of new Bun.Glob('.changes/*.json').scanSync()) {
  const parsed = changeManifestSchema.safeParse(await Bun.file(file).json())
  if (!parsed.success) {
    failures.push(`${file}: ${z.prettifyError(parsed.error)}`)
    continue
  }

  for (const featureId of parsed.data.impact.features) {
    if (!featureIds.has(featureId))
      failures.push(`${file}: unknown feature ${featureId}`)
  }
}

if (failures.length > 0) {
  throw new Error(`Documentation validation failed:\n${failures.join('\n')}`)
}

process.stdout.write(
  `Validated ${markdownFiles.length} authored docs and ${featureIds.size} features.\n`,
)
