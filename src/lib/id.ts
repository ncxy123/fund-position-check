let sequence = 0

export function createId(): string {
  sequence += 1
  return `h_${Date.now()}_${sequence}`
}
