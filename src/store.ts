import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { QUESTION_BANK } from './lib/bank'
import { sampleExam } from './lib/sampleExam'
import { correctQuestionIds, scoreExam } from './lib/score'
import type { ExamMode, ExamSession, OptionKey, ReviewFilter } from './types'
import { EXAM_SECONDS } from './types'

interface ExamStore {
  session: ExamSession | null
  lastCorrectIds: string[]
  startExam: (mode?: ExamMode) => void
  setAnswer: (id: string, keys: OptionKey[]) => void
  toggleFlag: (id: string) => void
  setIndex: (index: number) => void
  setReviewFilter: (filter: ReviewFilter) => void
  goReview: () => void
  goExam: (index?: number) => void
  submit: () => void
  reset: () => void
}

function newSession(excludeIds?: ReadonlySet<string>): ExamSession {
  const { questions, unscoredIds } = sampleExam(QUESTION_BANK, excludeIds)
  const now = Date.now()
  return {
    questions,
    unscoredIds,
    answers: {},
    flagged: [],
    currentIndex: 0,
    startedAt: now,
    endsAt: now + EXAM_SECONDS * 1000,
    view: 'exam',
    result: null,
    reviewFilter: 'all',
  }
}

export const useExamStore = create<ExamStore>()(
  persist(
    (set, get) => ({
      session: null,
      lastCorrectIds: [],
      startExam: (mode = 'standard') => {
        const excludeIds =
          mode === 'skip-correct' && get().lastCorrectIds.length > 0
            ? new Set(get().lastCorrectIds)
            : undefined
        set({ session: newSession(excludeIds) })
      },
      setAnswer: (id, keys) => {
        const session = get().session
        if (!session || session.view === 'result') return
        set({
          session: {
            ...session,
            answers: { ...session.answers, [id]: keys },
          },
        })
      },
      toggleFlag: (id) => {
        const session = get().session
        if (!session || session.view === 'result') return
        const flagged = session.flagged.includes(id)
          ? session.flagged.filter((item) => item !== id)
          : [...session.flagged, id]
        set({ session: { ...session, flagged } })
      },
      setIndex: (index) => {
        const session = get().session
        if (!session || session.view === 'result') return
        set({
          session: {
            ...session,
            currentIndex: Math.min(Math.max(0, index), session.questions.length - 1),
          },
        })
      },
      setReviewFilter: (filter) => {
        const session = get().session
        if (!session) return
        set({ session: { ...session, reviewFilter: filter } })
      },
      goReview: () => {
        const session = get().session
        if (!session || session.view === 'result') return
        set({ session: { ...session, view: 'review' } })
      },
      goExam: (index) => {
        const session = get().session
        if (!session || session.view === 'result') return
        set({
          session: {
            ...session,
            view: 'exam',
            currentIndex:
              index === undefined
                ? session.currentIndex
                : Math.min(Math.max(0, index), session.questions.length - 1),
          },
        })
      },
      submit: () => {
        const session = get().session
        if (!session || session.view === 'result') return
        set({
          lastCorrectIds: correctQuestionIds(session.questions, session.answers),
          session: {
            ...session,
            view: 'result',
            result: scoreExam(session.questions, session.unscoredIds, session.answers),
          },
        })
      },
      reset: () => set({ session: null }),
    }),
    { name: 'clf-c02-exam' },
  ),
)
