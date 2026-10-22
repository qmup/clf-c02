import { useEffect, useMemo, useState } from 'react'
import { LayoutGrid } from 'lucide-react'
import { Brand } from '../components/Brand'
import { Credit } from '../components/Credit'
import { ItemJumper, ResultLegend } from '../components/ItemJumper'
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
  const visible = useMemo(
    () => (filter === 'incorrect' ? reviewed.filter((item) => !item.ok) : reviewed),
    [filter, reviewed],
  )
  const correctBits = useMemo(() => reviewed.map((item) => item.ok), [reviewed])
  const flaggedBits = useMemo(
    () => session?.questions.map((q) => session.flagged.includes(q.id)) ?? [],
    [session],
  )
  const [currentIndex, setCurrentIndex] = useState(-1)
  const [pendingJump, setPendingJump] = useState<number | null>(null)
  const [sheet, setSheet] = useState(false)

  useEffect(() => {
    let frame = 0
    function update() {
      frame = 0
      let current = -1
      for (const node of document.querySelectorAll<HTMLElement>('[data-result-index]')) {
        if (node.getBoundingClientRect().top > 120) break
        current = Number(node.dataset.resultIndex)
      }
      setCurrentIndex(current)
    }
    function onScroll() {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(frame)
    }
  }, [visible])

  useEffect(() => {
    if (pendingJump === null) return
    document
      .querySelector(`[data-result-index="${pendingJump}"]`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setCurrentIndex(pendingJump)
    setPendingJump(null)
  }, [pendingJump, visible])

  if (!session || !result) return null

  function jumpTo(index: number) {
    if (filter === 'incorrect' && reviewed[index]?.ok) setFilter('all')
    setPendingJump(index)
    setSheet(false)
  }

  const jumper = (
    <>
      <ItemJumper
        compact
        count={reviewed.length}
        currentIndex={currentIndex}
        answered={correctBits}
        flagged={flaggedBits}
        correct={correctBits}
        onJump={jumpTo}
      />
      <ResultLegend />
    </>
  )

  return (
    <div className="min-h-dvh bg-neutral-100 pb-24 lg:pb-10">
      <header className="border-b border-neutral-200 bg-white px-4 py-3 lg:px-8">
        <div className="flex items-center justify-between gap-3">
          <Brand />
          <button
            type="button"
            onClick={() => {
              useExamStore.getState().reset()
              onHome()
            }}
            className="inline-flex min-h-10 items-center justify-center rounded-full border border-neutral-300 px-4 text-sm font-semibold text-neutral-900"
          >
            Back to menu
          </button>
        </div>
      </header>

      <div className="mx-auto flex max-w-6xl gap-6 px-4 py-6 lg:px-8">
        <div className="min-w-0 flex-1">
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
                    data-result-index={index}
                    className="scroll-mt-20 rounded-2xl border border-neutral-200 bg-white p-5"
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

        <aside className="hidden w-72 shrink-0 lg:block">
          <div className="sticky top-4 max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-2xl border border-neutral-200 bg-white p-4">
            <h2 className="mb-3 text-sm font-semibold text-neutral-900">Questions</h2>
            {jumper}
          </div>
        </aside>
      </div>

      <button
        type="button"
        onClick={() => setSheet(true)}
        className="fixed bottom-4 right-4 z-20 inline-flex min-h-12 items-center gap-2 rounded-full bg-neutral-900 px-4 text-sm font-medium text-white shadow-lg lg:hidden"
      >
        <LayoutGrid className="h-4 w-4" />
        Questions
      </button>

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
            {jumper}
          </div>
        </div>
      )}
    </div>
  )
}
