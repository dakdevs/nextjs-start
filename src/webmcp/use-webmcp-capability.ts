'use client'

import { useWebMCP } from 'usewebmcp'
import type { z } from 'zod'

import type { webMcpCapabilities } from '~/webmcp/capability-registry'
import { useWebMcpRuntimeReady } from '~/webmcp/webmcp-runtime-state'

type UseWebMcpCapabilityOptions<TInput extends z.ZodObject, TOutput> = {
  capability: (typeof webMcpCapabilities)[keyof typeof webMcpCapabilities] & {
    input: TInput
  }
  enabled?: boolean
  execute: (input: z.output<TInput>) => Promise<TOutput> | TOutput
}

/** The only adapter between feature tools and the browser WebMCP hook. */
export function useWebMcpCapability<TInput extends z.ZodObject, TOutput>({
  capability,
  enabled = true,
  execute,
}: UseWebMcpCapabilityOptions<TInput, TOutput>) {
  const isRuntimeReady = useWebMcpRuntimeReady()
  return useWebMCP(
    {
      name: capability.name,
      description: capability.description,
      enabled: isRuntimeReady && enabled,
      inputSchema: capability.input,
      annotations: capability.annotations,
      execute: (input) => Promise.resolve(execute(capability.input.parse(input))),
    },
    [capability, enabled, execute, isRuntimeReady],
  )
}
