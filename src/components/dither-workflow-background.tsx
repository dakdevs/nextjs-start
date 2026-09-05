'use client'

import { DitherGradient } from '~/components/dither-kit/gradient'
import { fnv1a } from '~/components/dither-kit/pixel'

const brandHuePairs = [
  [28, 48],
  [44, 78],
  [156, 188],
  [204, 232],
  [262, 296],
] as const

const directions = ['up', 'right', 'down', 'left'] as const

export function DitherWorkflowBackground({ seed }: { readonly seed: string }) {
  const normalizedSeed = seed.trim().toLocaleLowerCase('en-US')
  const hash = fnv1a(`admin-workflow:v1:${normalizedSeed}`)
  const hues = brandHuePairs[hash % brandHuePairs.length] ?? brandHuePairs[0]
  const direction = directions[(hash >>> 8) % directions.length] ?? directions[0]

  return (
    <DitherGradient
      from={hues[0]}
      to={hues[1]}
      direction={direction}
      cell={4}
      opacity={0.18}
    />
  )
}
