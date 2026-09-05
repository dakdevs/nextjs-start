'use client'

import createCache from '@emotion/cache'
import { CacheProvider } from '@emotion/react'
import { ChakraProvider } from '@chakra-ui/react'
import { useServerInsertedHTML } from 'next/navigation'
import { useState, type ReactNode } from 'react'

import { adminSystem } from '~/app/(admin)/admin/_modules/admin-system'

function AdminEmotionRegistry({ children }: { readonly children: ReactNode }) {
  const [{ cache, flush }] = useState(() => {
    const cache = createCache({ key: 'admin' })
    cache.compat = true
    const previousInsert = cache.insert
    let inserted: string[] = []

    cache.insert = (...arguments_) => {
      const serialized = arguments_[1]
      if (cache.inserted[serialized.name] === undefined) {
        inserted.push(serialized.name)
      }
      return previousInsert(...arguments_)
    }

    const flush = () => {
      const names = inserted
      inserted = []
      return names
    }

    return { cache, flush }
  })

  useServerInsertedHTML(() => {
    const names = flush()
    if (names.length === 0) return null

    const styles = names.map((name) => cache.inserted[name]).join('')
    return (
      <style
        data-emotion={`${cache.key} ${names.join(' ')}`}
        // Emotion generates this CSS from trusted Chakra style objects.
        dangerouslySetInnerHTML={{ __html: styles }}
      />
    )
  })

  return <CacheProvider value={cache}>{children}</CacheProvider>
}

export function AdminProviders({ children }: { readonly children: ReactNode }) {
  return (
    <AdminEmotionRegistry>
      <ChakraProvider value={adminSystem}>{children}</ChakraProvider>
    </AdminEmotionRegistry>
  )
}
