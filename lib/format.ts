export function num(n: number) {
  return Math.round(n).toLocaleString('ko-KR')
}

export function won(n: number) {
  return `${num(n)}원`
}

export function percent(part: number, total: number) {
  if (total === 0) return '0'
  const v = Math.round((part / total) * 1000) / 10
  return Number.isInteger(v) ? String(v) : v.toFixed(1)
}
