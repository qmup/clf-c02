const PREFIX = 'clf1:'

export function encodeProgress(ids: readonly string[]): string {
  const unique = [...new Set(ids)].filter(Boolean).sort()
  return PREFIX + unique.join(',')
}

export function decodeProgress(code: string, validIds: ReadonlySet<string>): string[] | null {
  const trimmed = code.trim()
  if (!trimmed.toLowerCase().startsWith(PREFIX)) return null
  const body = trimmed.slice(trimmed.indexOf(':') + 1)
  const tokens = body.split(/[^A-Za-z0-9_-]+/).map((token) => token.toLowerCase()).filter(Boolean)
  const ids = [...new Set(tokens.filter((id) => validIds.has(id)))]
  if (body.trim() && ids.length === 0) return null
  return ids
}

export function mergeCorrectIds(current: readonly string[], incoming: readonly string[]): string[] {
  return [...new Set([...current, ...incoming])].sort()
}
