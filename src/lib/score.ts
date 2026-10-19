import type { DomainId, ExamResult, OptionKey, Question } from '../types'
import { DOMAIN_NAMES, PASSING_SCORE, SCORED_COUNT } from '../types'

export function requiredCount(question: Question): number {
  return Array.isArray(question.answer) ? question.answer.length : 1
}

export function normalizeAnswer(answer: OptionKey | OptionKey[]): OptionKey[] {
  return (Array.isArray(answer) ? answer : [answer]).slice().sort()
}

export function isAnswered(question: Question, selected: OptionKey[] | undefined): boolean {
  const n = selected?.length ?? 0
  if (n === 0) return false
  if (question.isMultiAnswer) return n === requiredCount(question)
  return n === 1
}

export function isCorrect(question: Question, selected: OptionKey[] | undefined): boolean {
  const got = (selected ?? []).slice().sort()
  const expected = normalizeAnswer(question.answer)
  return got.length === expected.length && got.every((key, i) => key === expected[i])
}

export function correctQuestionIds(
  questions: Question[],
  answers: Record<string, OptionKey[]>,
): string[] {
  return questions.filter((question) => isCorrect(question, answers[question.id])).map((q) => q.id)
}

export function scoreExam(
  questions: Question[],
  unscoredIds: string[],
  answers: Record<string, OptionKey[]>,
): ExamResult {
  const unscored = new Set(unscoredIds)
  const tallies: Record<DomainId, { correct: number; total: number }> = {
    1: { correct: 0, total: 0 },
    2: { correct: 0, total: 0 },
    3: { correct: 0, total: 0 },
    4: { correct: 0, total: 0 },
  }

  let correct = 0
  for (const question of questions) {
    if (unscored.has(question.id)) continue
    tallies[question.domain].total += 1
    if (isCorrect(question, answers[question.id])) {
      correct += 1
      tallies[question.domain].correct += 1
    }
  }

  const total = SCORED_COUNT
  const scaled = Math.round(100 + (900 * correct) / total)

  return {
    scaled,
    passed: scaled >= PASSING_SCORE,
    correct,
    scoredTotal: total,
    byDomain: ([1, 2, 3, 4] as const).map((id) => ({
      id,
      name: DOMAIN_NAMES[id],
      correct: tallies[id].correct,
      total: tallies[id].total,
    })),
  }
}

export function formatRemaining(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000))
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function selectLabel(question: Question): string | null {
  if (!question.isMultiAnswer) return null
  const n = requiredCount(question)
  if (n === 2) return 'Select TWO.'
  if (n === 3) return 'Select THREE.'
  return `Select ${n}.`
}
