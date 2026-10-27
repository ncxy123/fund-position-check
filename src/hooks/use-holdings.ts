import { useEffect, useState } from 'react'
import type { Holding } from '@/lib/portfolio'

const STORAGE_KEY = 'fund-health-holdings-v1'

function readHoldings(): Holding[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) return parsed as Holding[]
  } catch {
    return []
  }
  return []
}

export function useHoldings() {
  const [holdings, setHoldings] = useState<Holding[]>(readHoldings)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(holdings))
    } catch {
      return
    }
  }, [holdings])

  return [holdings, setHoldings] as const
}
