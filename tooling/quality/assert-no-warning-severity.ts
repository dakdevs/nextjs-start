import config from '../../oxlint.config'
import { z } from 'zod'

const warningSeverities = new Set(['warn', 'warning', 1])
const severitySchema = z.union([z.string(), z.number()])
const violations: string[] = []

function checkRules(prefix: string, rules = config.rules) {
  for (const [name, setting] of Object.entries(rules ?? {})) {
    const severity = Array.isArray(setting) ? setting[0] : setting

    const parsedSeverity = severitySchema.safeParse(severity)
    if (parsedSeverity.success && warningSeverities.has(parsedSeverity.data)) {
      violations.push(`${prefix}${name}`)
    }
  }
}

function checkCategories(prefix: string, categories = config.categories) {
  for (const [name, severity] of Object.entries(categories ?? {})) {
    const parsedSeverity = severitySchema.safeParse(severity)
    if (parsedSeverity.success && warningSeverities.has(parsedSeverity.data)) {
      violations.push(`${prefix}category:${name}`)
    }
  }
}

checkRules('root:')
checkCategories('root:')

for (const [index, override] of (config.overrides ?? []).entries()) {
  checkRules(`override:${index}:`, override.rules)
}

if (violations.length > 0) {
  throw new Error(`Oxlint warning severities are forbidden:\n${violations.join('\n')}`)
}

process.stdout.write('Oxlint config has no warning severities.\n')
