'use client'

import { useSyncExternalStore } from 'react'

const subscribe = () => {
  return () => {}
}
const getClientSnapshot = () => {
  return true
}
const getServerSnapshot = () => {
  return false
}

/** Lets controls fail closed until React owns their event handlers. */
export function useClientReady() {
  return useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot)
}
