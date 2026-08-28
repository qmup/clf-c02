import { useMemo, useState } from 'react'
import { Brand } from '../components/Brand'
import { ItemJumper } from '../components/ItemJumper'
import { isAnswered } from '../lib/score'
import { useExamStore } from '../store'
import type { ReviewFilter } from '../types'

const FILTERS: { id: ReviewFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'incomplete', label: 'Incomplete' },
  { id: 'flagged', label: 'Flagged' },
]

export function Review() {
  const [confirmEnd, setConfirmEnd] = useState(false)
  const session = useExamStore((s) => s.session)
  const answered = useMemo(
    () => session?.questions.map((q) => isAnswered(q, session.answers[q.id])) ?? [],
    [session],
  )
  const flaggedBits = useMemo(
    () => session?.questions.map((q) => session.flagged.includes(q.id)) ?? [],
    [session],
  )

  if (!session) return null

  const incomplete = answered.filter((v) => !v).length
  const flaggedCount = session.flagged.length

  const visible = session.questions.map((_, index) => {
    if (session.reviewFilter === 'incomplete') return !answered[index]
    if (session.reviewFilter === 'flagged') return flaggedBits[index]
    return true
  })

  return (
    <div className="flex min-h-dvh flex-col bg-neutral-100">
      <header className="border-b border-neutral-200 bg-white px-4 py-3 lg:px-8">
        <Brand />
        <h1 className="mt-3 text-lg font-semibold text-neutral-900">Review answers</h1>
        <p className="text-sm text-neutral-500">
          {incomplete} incomplete · {flaggedCount} flagged
        </p>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-5">
        <div className="mb-4 flex gap-2">
          {FILTERS.map((filter) => (
            <button
              key={filter.id}
              type="button"
              onClick={() => useExamStore.getState().setReviewFilter(filter.id)}
              className={[
                'min-h-11 flex-1 rounded-full border text-sm font-medium',
                session.reviewFilter === filter.id
                  ? 'border-neutral-900 bg-neutral-900 text-white'
                  : 'border-neutral-200 bg-white text-neutral-800',
              ].join(' ')}
            >
              {filter.label}
            </button>
          ))}
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-white p-4">
          <ItemJumper
            count={session.questions.length}
            currentIndex={session.currentIndex}
            answered={answered}
            flagged={flaggedBits}
            dimmed={visible.map((v) => !v)}
            onJump={(index) => useExamStore.getState().goExam(index)}
          />
        </div>
      </main>

      <footer className="sticky bottom-0 flex gap-3 border-t border-neutral-200 bg-white px-4 py-3">
        <button
          type="button"
          onClick={() => useExamStore.getState().goExam()}
          className="min-h-12 flex-1 rounded-xl border border-neutral-300 bg-white text-sm font-medium"
        >
          Return to exam
        </button>
        <button
          type="button"
          onClick={() => setConfirmEnd(true)}
          className="min-h-12 flex-1 rounded-xl bg-neutral-900 text-sm font-semibold text-white"
        >
          End exam
        </button>
      </footer>

      {confirmEnd && (
        <div className="fixed inset-0 z-20 flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-lg">
            <h2 className="text-lg font-semibold">End exam?</h2>
            <p className="mt-2 text-sm text-neutral-600">
              You will not be able to change your answers after this.
            </p>
            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmEnd(false)}
                className="min-h-11 flex-1 rounded-xl border border-neutral-300 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => useExamStore.getState().submit()}
                className="min-h-11 flex-1 rounded-xl bg-neutral-900 text-sm font-semibold text-white"
              >
                End exam
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
