/* eslint-disable */
import { useCallback, useEffect, useState } from 'react'

export function useAsync<T>(loader: () => Promise<T>, dependencies: unknown[] = []) {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const run = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const next = await loader()
      setData(next)
      return next
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : 'Unable to load this section.'
      setError(message)
      return null
    } finally {
      setLoading(false)
    }
  }, dependencies)

  useEffect(() => {
    void run()
  }, [run])

  return { data, error, loading, reload: run, setData }
}
