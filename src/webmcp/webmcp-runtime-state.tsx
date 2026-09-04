'use client'

import { createContext, useContext, type ReactNode } from 'react'

const WebMcpRuntimeContext = createContext(false)

export function WebMcpRuntimeProvider({
  children,
  isReady,
}: {
  children: ReactNode
  isReady: boolean
}) {
  return (
    <WebMcpRuntimeContext.Provider value={isReady}>
      {children}
    </WebMcpRuntimeContext.Provider>
  )
}

export function useWebMcpRuntimeReady() {
  return useContext(WebMcpRuntimeContext)
}
