export type OptionKey = 'A' | 'B' | 'C' | 'D' | 'E'
export type DomainId = 1 | 2 | 3 | 4
export type View = 'home' | 'exam' | 'review' | 'result'
export type ReviewFilter = 'all' | 'incomplete' | 'flagged'
export type ExamMode = 'standard' | 'skip-correct'
export type ResultFilter = 'all' | 'incorrect'

export interface Question {
  id: string
  domain: DomainId
  question: string
  options: Partial<Record<OptionKey, string>>
  answer: OptionKey | OptionKey[]
  isMultiAnswer: boolean
  explanation: string
}

export interface DomainBreakdown {
  id: DomainId
  name: string
  correct: number
  total: number
}

export interface ExamResult {
  scaled: number
  passed: boolean
  correct: number
  scoredTotal: number
  byDomain: DomainBreakdown[]
}

export interface ExamSession {
  questions: Question[]
  unscoredIds: string[]
  answers: Record<string, OptionKey[]>
  flagged: string[]
  currentIndex: number
  startedAt: number
  endsAt: number
  view: 'exam' | 'review' | 'result'
  result: ExamResult | null
  reviewFilter: ReviewFilter
}

export const DOMAIN_NAMES: Record<DomainId, string> = {
  1: 'Cloud Concepts',
  2: 'Security and Compliance',
  3: 'Cloud Technology and Services',
  4: 'Billing, Pricing, and Support',
}

export const OPTION_KEYS: OptionKey[] = ['A', 'B', 'C', 'D', 'E']
export const EXAM_SECONDS = 90 * 60
export const PASSING_SCORE = 700
export const SCORED_COUNT = 50
export const EXAM_QUESTION_COUNT = 65
