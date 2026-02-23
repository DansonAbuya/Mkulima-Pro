'use client'

import { useEffect } from 'react'

export function PwaRegister() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        // updateViaCache: 'none' makes browsers re-check sw.js rather than using a cached copy
        // @ts-expect-error updateViaCache is supported in modern browsers
        .register('/sw.js', { updateViaCache: 'none' })
        .then((reg) => reg.update().catch(() => {}))
        .catch(() => {})
    }
  }, [])
  return null
}
