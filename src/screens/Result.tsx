import { Brand } from '../components/Brand'
import { QuestionCard } from '../components/Question'
import { isCorrect, normalizeAnswer } from '../lib/score'
import { useExamStore } from '../store'

export function Result({ onHome }: { onHome: () => void }) {
  const session = useExamStore((s) => s.session)
  const result = session?.result
  if (!session || !result) return null

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

        <button
          type="button"
          onClick={() => {
            useExamStore.getState().reset()
            onHome()
          }}
          className="mt-4 min-h-12 w-full rounded-xl bg-orange-500 text-base font-semibold text-neutral-900"
        >
          New exam
        </button>

        <section className="mt-6 space-y-4">
          {session.questions.map((question, index) => {
            const selected = session.answers[question.id] ?? []
            const ok = isCorrect(question, selected)
            const expected = normalizeAnswer(question.answer).join(', ')
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
                <p className="mt-3 text-xs text-neutral-500">Correct response: {expected}</p>
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-neutral-700">
                  {question.explanation}
                </p>
              </article>
            )
          })}
        </section>

        <p className="mt-8 pb-4 text-center text-xs leading-relaxed text-neutral-500">
          Made by Quân Mụp to practice for the AWS Certified Cloud Practitioner exam.
        </p>
      </div>
    </div>
  )
}
