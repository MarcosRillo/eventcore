'use client'

import { SWRConfig } from 'swr'

export const SWRProvider = ({ children }: { children: React.ReactNode }) => (
  <SWRConfig value={{
    revalidateOnFocus: false,
    errorRetryCount: 2,
    dedupingInterval: 5000,
  }}>
    {children}
  </SWRConfig>
)
