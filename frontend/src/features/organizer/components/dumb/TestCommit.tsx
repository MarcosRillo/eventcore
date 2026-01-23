'use client'

// Imports desordenados a propósito para probar simple-import-sort
import { useState } from 'react'

import { Button } from '@/components/ui/Button'

interface Props {
  label?: string
}

export const TestCommit = ({ label = 'Test' }: Props) => {
  const [count, setCount] = useState(0)

  return (
    <div>
      <p>{label}: {count}</p>
      <Button onClick={() => setCount(count + 1)}>Increment</Button>
    </div>
  )
}
