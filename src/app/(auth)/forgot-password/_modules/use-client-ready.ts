'use client'

import { useSyncExternalStore } from 'react'

const subscribe = () => () => {}
const getClientSnapshot = () => true
const getServerSnapshot = () => false

/** Lets controls fail closed until React owns their event handlers. */
export function useClientReady() {
  return useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot)
}
