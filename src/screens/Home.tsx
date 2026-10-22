import { ArrowRight, Check } from 'lucide-react'
import { Brand } from '../components/Brand'
import { Credit } from '../components/Credit'
import { ProgressSync } from '../components/ProgressSync'
import { QUESTION_BANK } from '../lib/bank'
import { useExamStore } from '../store'
import type { DomainId } from '../types'

const EXAM_GUIDE =
  'https://docs.aws.amazon.com/aws-certification/latest/cloud-practitioner-02/cloud-practitioner-02.html'

const LAST_VERIFIED = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).toLocaleString(
  'en-US',
  { month: 'long', year: 'numeric' },
)

const DOMAINS: { id: DomainId; name: string; weight: number }[] = [
  { id: 1, name: 'Cloud Concepts', weight: 24 },
  { id: 2, name: 'Security & Compliance', weight: 30 },
  { id: 3, name: 'Cloud Technology & Services', weight: 34 },
  { id: 4, name: 'Billing, Pricing & Support', weight: 12 },
]

export function Home({ onEnter }: { onEnter: () => void }) {
  const session = useExamStore((s) => s.session)
  const startExam = useExamStore((s) => s.startExam)
  const canSkipCorrect = useExamStore((s) => s.correctIds.length > 0)
  const canContinue = session !== null && session.view !== 'result'
  const bankSize = QUESTION_BANK.length

  return (
    <div className="flex min-h-dvh flex-col bg-neutral-100">
      <header className="border-b border-neutral-200 bg-white px-4 py-3 lg:px-8">
        <Brand />
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-4 py-10 lg:px-8">
        <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="text-sm text-neutral-500">Home › CLF-C02</p>
            <p className="mt-6 text-[11px] font-semibold tracking-[0.22em] text-neutral-500">
              FOUNDATIONAL
            </p>
            <h1 className="mt-3 text-3xl font-bold leading-tight text-neutral-900 md:text-4xl lg:text-[2.75rem] lg:leading-[1.15]">
              Free AWS Cloud Practitioner (CLF-C02) Practice Exams
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-neutral-600">
              Looking for a free CLF-C02 practice exam? Practice realistic AWS exam questions with
              randomized exams and unlimited free attempts.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <button
                type="button"
                onClick={() => {
                  startExam()
                  onEnter()
                }}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-orange-500 px-6 text-sm font-semibold text-neutral-900"
              >
                Start practice exam
                <ArrowRight className="h-4 w-4" />
              </button>
              {canSkipCorrect && (
                <button
                  type="button"
                  onClick={() => {
                    startExam('skip-correct')
                    onEnter()
                  }}
                  className="inline-flex min-h-12 items-center justify-center rounded-full border border-neutral-300 bg-white px-6 text-sm font-semibold text-neutral-900"
                >
                  Next exam
                </button>
              )}
              <button
                type="button"
                disabled={!canContinue}
                onClick={onEnter}
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-neutral-300 bg-white px-6 text-sm font-semibold text-neutral-900 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Continue exam
              </button>
            </div>

            {canSkipCorrect && (
              <p className="mt-4 max-w-xl text-sm text-neutral-500">
                Next exam leaves out questions you have answered correctly. Missed questions can
                still appear.
              </p>
            )}

            <ProgressSync className="mt-8 max-w-xl" />

            <p className="mt-5 flex items-start gap-2 text-sm text-neutral-500">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-neutral-700" strokeWidth={2.5} />
              <span>
                Aligned to the CLF-C02{' '}
                <a
                  href={EXAM_GUIDE}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2 hover:text-neutral-800"
                >
                  exam guide
                </a>
                . Last verified {LAST_VERIFIED}.
              </span>
            </p>
          </div>

          <aside className="rounded-2xl border border-neutral-200 bg-white p-5 md:p-6">
            <div className="flex items-center justify-between text-sm text-neutral-600">
              <span>CLF-C02 Exam blueprint</span>
              <span>4 domains</span>
            </div>
            <div className="mt-4 space-y-5 border-t border-neutral-200 pt-5">
              {DOMAINS.map((domain) => {
                const count = QUESTION_BANK.filter((q) => q.domain === domain.id).length
                return (
                  <div key={domain.id}>
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="font-medium text-neutral-900">{domain.name}</p>
                      <p className="text-sm tabular-nums text-neutral-500">{domain.weight}%</p>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-neutral-200">
                      <div
                        className="h-full rounded-full bg-neutral-400"
                        style={{ width: `${domain.weight}%` }}
                      />
                    </div>
                    <p className="mt-1.5 text-xs text-neutral-500">{count}+ questions</p>
                  </div>
                )
              })}
            </div>
            <p className="mt-6 border-t border-neutral-200 pt-4 text-sm text-neutral-500">
              65 questions · 90 min · pass 700/1000 · {bankSize.toLocaleString()}+ bank
            </p>
          </aside>
        </div>

        <div className="mt-12">
          <Credit />
        </div>
      </main>
    </div>
  )
}
