export function toNumber(value: unknown): number {
  const parsed = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

export function formatMoney(value: unknown): string {
  return toNumber(value).toLocaleString('zh-CN', { maximumFractionDigits: 2 })
}

export function formatRate(value: unknown, digits = 2): string {
  return `${(toNumber(value) * 100).toFixed(digits)}%`
}

export function formatSignedRate(value: unknown, digits = 2): string {
  const amount = toNumber(value)
  return `${amount > 0 ? '+' : ''}${(amount * 100).toFixed(digits)}%`
}

export function formatWeight(value: unknown, digits = 1): string {
  return `${(toNumber(value) * 100).toFixed(digits)}%`
}
