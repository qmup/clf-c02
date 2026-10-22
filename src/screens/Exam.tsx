import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Flag, LayoutGrid } from 'lucide-react'
import { Brand } from '../components/Brand'
import { ItemJumper, QuestionLegend } from '../components/ItemJumper'
import { QuestionCard } from '../components/Question'
import { formatRemaining, isAnswered } from '../lib/score'
import { useExamStore } from '../store'
import type { OptionKey } from '../types'

export function Exam() {
  const session = useExamStore((s) => s.session)
  const [remaining, setRemaining] = useState(() =>
    session ? session.endsAt - Date.now() : 0,
  )
  const [sheet, setSheet] = useState(false)
  const [warn, setWarn] = useState(false)
  const warned = useRef(false)

  useEffect(() => {
    if (!session) return
    const tick = () => {
      const left = session.endsAt - Date.now()
      setRemaining(left)
      if (left <= 5 * 60 * 1000 && left > 0 && !warned.current) {
        warned.current = true
        setWarn(true)
      }
      if (left <= 0) useExamStore.getState().submit()
    }
    tick()
    const id = window.setInterval(tick, 250)
    return () => window.clearInterval(id)
  }, [session])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
      if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return
      const target = e.target as HTMLElement | null
      if (target?.closest('input, textarea, select, [contenteditable="true"]')) return
      const { session: current, setIndex } = useExamStore.getState()
      if (!current) return
      e.preventDefault()
      setIndex(current.currentIndex + (e.key === 'ArrowRight' ? 1 : -1))
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const answered = useMemo(
    () => session?.questions.map((q) => isAnswered(q, session.answers[q.id])) ?? [],
    [session],
  )
  const flaggedBits = useMemo(
    () => session?.questions.map((q) => session.flagged.includes(q.id)) ?? [],
    [session],
  )

  if (!session) return null

  const question = session.questions[session.currentIndex]
  if (!question) return null

  const flagged = session.flagged.includes(question.id)
  const selected = session.answers[question.id] ?? []
  const answeredCount = answered.filter(Boolean).length
  const total = session.questions.length
  const lowTime = remaining <= 5 * 60 * 1000
  const atEnd = session.currentIndex === total - 1

  function goNext() {
    if (atEnd) useExamStore.getState().goReview()
    else useExamStore.getState().setIndex(session!.currentIndex + 1)
  }

  return (
    <div className="min-h-dvh bg-neutral-100">
      <header className="border-b border-neutral-200 bg-white">
        <div className="flex items-center justify-between px-4 py-3 lg:hidden">
          <Brand />
        </div>
        <div className="flex items-center justify-between gap-3 px-4 py-3 lg:px-8">
          <div className="min-w-0">
            <p className="text-sm text-neutral-800 lg:text-base">
              Question{' '}
              <span className="font-bold">{session.currentIndex + 1}</span> of{' '}
              <span className="font-bold">{total}</span>
            </p>
            <p className="hidden text-sm text-neutral-500 lg:block">
              {answeredCount} answered
            </p>
          </div>
          <p
            className={[
              'text-xl font-bold tabular-nums tracking-wide lg:text-2xl',
              lowTime ? 'text-red-600' : 'text-neutral-900',
            ].join(' ')}
          >
            {formatRemaining(remaining)}
          </p>
          <button
            type="button"
            onClick={() => useExamStore.getState().goReview()}
            className="min-h-10 rounded-full border border-neutral-300 px-4 text-sm font-medium text-neutral-900"
          >
            Submit exam
          </button>
        </div>
      </header>

      {warn && (
        <div className="bg-red-600 px-4 py-2 text-center text-sm text-white">
          5 minutes remaining.
          <button type="button" className="ml-3 underline" onClick={() => setWarn(false)}>
            Dismiss
          </button>
        </div>
      )}

      <div className="px-4 pt-3 lg:hidden">
        <button
          type="button"
          onClick={() => setSheet(true)}
          className="flex min-h-12 w-full items-center justify-between rounded-xl border border-neutral-200 bg-white px-3 text-sm font-medium text-neutral-800"
        >
          <span className="inline-flex items-center gap-2">
            <LayoutGrid className="h-4 w-4" />
            View all questions
          </span>
          <span className="tabular-nums text-neutral-500">
            {answeredCount}/{total}
          </span>
        </button>
      </div>

      <div className="mx-auto flex max-w-6xl gap-6 px-4 py-4 lg:px-8 lg:py-6">
        <div className="min-w-0 flex-1">
          <div className="rounded-2xl border border-neutral-200 bg-white p-5 md:p-6">
            <QuestionCard
              question={question}
              selected={selected}
              onChange={(keys: OptionKey[]) =>
                useExamStore.getState().setAnswer(question.id, keys)
              }
            />
            <button
              type="button"
              onClick={() => useExamStore.getState().toggleFlag(question.id)}
              className={[
                'mt-5 inline-flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm font-medium',
                flagged ? 'bg-orange-100 text-orange-800' : 'bg-neutral-100 text-neutral-700',
              ].join(' ')}
            >
              <Flag className="h-4 w-4" fill={flagged ? 'currentColor' : 'none'} />
              Flag for review
            </button>
          </div>

          <div className="mt-4 flex gap-3">
            <button
              type="button"
              disabled={session.currentIndex === 0}
              onClick={() => useExamStore.getState().setIndex(session.currentIndex - 1)}
              className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-neutral-300 bg-white text-sm font-medium text-neutral-900 disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>
            <button
              type="button"
              onClick={goNext}
              className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-neutral-300 bg-white text-sm font-medium text-neutral-900"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <aside className="hidden w-72 shrink-0 lg:block">
          <div className="sticky top-4 rounded-2xl border border-neutral-200 bg-white p-4">
            <h2 className="mb-3 text-sm font-semibold text-neutral-900">Questions</h2>
            <ItemJumper
              compact
              count={total}
              currentIndex={session.currentIndex}
              answered={answered}
              flagged={flaggedBits}
              onJump={(index) => useExamStore.getState().setIndex(index)}
            />
            <QuestionLegend />
          </div>
        </aside>
      </div>

      {sheet && (
        <div className="fixed inset-0 z-30 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Close question list"
            onClick={() => setSheet(false)}
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[85dvh] overflow-y-auto rounded-t-2xl bg-white p-4 pb-8">
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-neutral-300" />
            <h2 className="mb-3 text-base font-semibold">Questions</h2>
            <ItemJumper
              compact
              count={total}
              currentIndex={session.currentIndex}
              answered={answered}
              flagged={flaggedBits}
              onJump={(index) => {
                useExamStore.getState().setIndex(index)
                setSheet(false)
              }}
            />
            <QuestionLegend />
          </div>
        </div>
      )}
    </div>
  )
}
