import type { DomainId, Question } from '../types'

const SCORED_QUOTA: Record<DomainId, number> = { 1: 12, 2: 15, 3: 17, 4: 6 }
const UNSCORED_QUOTA: Record<DomainId, number> = { 1: 4, 2: 4, 3: 5, 4: 2 }

function shuffle<T>(items: T[]): T[] {
  const next = [...items]
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[next[i], next[j]] = [next[j]!, next[i]!]
  }
  return next
}

export function sampleExam(bank: Question[]): {
  questions: Question[]
  unscoredIds: string[]
} {
  const scored: Question[] = []
  const unscored: Question[] = []

  for (const domain of [1, 2, 3, 4] as const) {
    const pool = shuffle(bank.filter((q) => q.domain === domain))
    const scoredN = SCORED_QUOTA[domain]
    const unscoredN = UNSCORED_QUOTA[domain]
    scored.push(...pool.slice(0, scoredN))
    unscored.push(...pool.slice(scoredN, scoredN + unscoredN))
  }

  return {
    questions: shuffle([...scored, ...unscored]),
    unscoredIds: unscored.map((q) => q.id),
  }
}
