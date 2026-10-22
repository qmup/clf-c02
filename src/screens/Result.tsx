import { useMemo, useState } from 'react'
import { Brand } from '../components/Brand'
import { Credit } from '../components/Credit'
import { ProgressSync } from '../components/ProgressSync'
import { QuestionCard } from '../components/Question'
import { isCorrect, normalizeAnswer } from '../lib/score'
import { useExamStore } from '../store'
import type { ResultFilter } from '../types'

const FILTERS: { id: ResultFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'incorrect', label: 'Incorrect' },
]

export function Result({ onHome }: { onHome: () => void }) {
  const session = useExamStore((s) => s.session)
  const canSkipCorrect = useExamStore((s) => s.correctIds.length > 0)
  const [filter, setFilter] = useState<ResultFilter>('all')
  const result = session?.result
  const reviewed = useMemo(() => {
    if (!session) return []
    return session.questions.map((question, index) => {
      const selected = session.answers[question.id] ?? []
      return {
        question,
        index,
        selected,
        ok: isCorrect(question, selected),
      }
    })
  }, [session])

  if (!session || !result) return null

  const visible = filter === 'incorrect' ? reviewed.filter((item) => !item.ok) : reviewed

  return (
    <div className="min-h-dvh bg-neutral-100 pb-10">
      <header className="border-b border-neutral-200 bg-white px-4 py-3 lg:px-8">
        <Brand />
      </header>

      <div className="mx-auto max-w-3xl px-4 py-6">
        <section className="rounded-2xl border border-neutral-200 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
            Exam results
          </p>
          <h1
            className={[
              'mt-2 text-3xl font-bold',
              result.passed ? 'text-emerald-600' : 'text-red-600',
            ].join(' ')}
          >
            {result.passed ? 'PASS' : 'FAIL'}
          </h1>
          <p className="mt-2 text-4xl font-semibold tabular-nums text-neutral-900">
            {result.scaled}
          </p>
          <p className="mt-1 text-sm text-neutral-500">
            Scaled score (100–1000). Passing score is 700.
          </p>
          <p className="mt-3 text-sm text-neutral-700">
            {result.correct} / {result.scoredTotal} scored items correct. Score is based on
            50 scored items.
          </p>
        </section>

        <section className="mt-4 rounded-2xl border border-neutral-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-neutral-800">Domain performance</h2>
          <ul className="mt-3 space-y-3">
            {result.byDomain.map((domain) => {
              const pct = domain.total ? Math.round((100 * domain.correct) / domain.total) : 0
              return (
                <li key={domain.id}>
                  <div className="flex justify-between text-sm">
                    <span>
                      Domain {domain.id}: {domain.name}
                    </span>
                    <span className="tabular-nums">
                      {domain.correct}/{domain.total} ({pct}%)
                    </span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-neutral-200">
                    <div className="h-full bg-orange-500" style={{ width: `${pct}%` }} />
                  </div>
                </li>
              )
            })}
          </ul>
        </section>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => {
              useExamStore.getState().reset()
              onHome()
            }}
            className="min-h-12 flex-1 rounded-xl bg-orange-500 text-base font-semibold text-neutral-900"
          >
            New exam
          </button>
          {canSkipCorrect && (
            <button
              type="button"
              onClick={() => useExamStore.getState().startExam('skip-correct')}
              className="min-h-12 flex-1 rounded-xl border border-neutral-300 bg-white text-base font-semibold text-neutral-900"
            >
              Next exam
            </button>
          )}
        </div>

        <ProgressSync className="mt-4" />

        <div className="sticky top-0 z-10 mt-6 flex gap-2 bg-neutral-100 py-3">
          {FILTERS.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={filter === item.id}
              onClick={() => setFilter(item.id)}
              className={[
                'min-h-11 flex-1 rounded-full border text-sm font-medium',
                filter === item.id
                  ? 'border-neutral-900 bg-neutral-900 text-white'
                  : 'border-neutral-200 bg-white text-neutral-800',
              ].join(' ')}
            >
              {item.label}
            </button>
          ))}
        </div>

        <section className="space-y-4">
          {visible.length === 0 ? (
            <p className="rounded-2xl border border-neutral-200 bg-white p-5 text-sm text-neutral-600">
              No incorrect questions.
            </p>
          ) : (
            visible.map(({ question, index, selected, ok }) => {
              const expected = normalizeAnswer(question.answer).join(', ')
              const yours = [...selected].sort().join(', ')
              return (
                <article
                  key={question.id}
                  className="rounded-2xl border border-neutral-200 bg-white p-5"
                >
                  <div className="mb-2 flex items-center justify-between gap-2 text-xs font-semibold">
                    <span>Question {index + 1}</span>
                    <span className={ok ? 'text-emerald-600' : 'text-red-600'}>
                      {ok ? 'Correct' : 'Incorrect'}
                    </span>
                  </div>
                  <QuestionCard
                    question={question}
                    selected={selected}
                    onChange={() => undefined}
                    disabled
                    reveal
                  />
                  <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-500">
                    <span>Your response: {yours || '—'}</span>
                    <span>Correct response: {expected}</span>
                  </p>
                  <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-neutral-700">
                    {question.explanation}
                  </p>
                </article>
              )
            })
          )}
        </section>

        <div className="mt-8 pb-4">
          <Credit />
        </div>
      </div>
    </div>
  )
}
