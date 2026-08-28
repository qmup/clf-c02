import { QUESTION_BANK } from '../lib/bank'
import { Brand } from '../components/Brand'
import { Credit } from '../components/Credit'
import { useExamStore } from '../store'

export function Home({ onEnter }: { onEnter: () => void }) {
  const session = useExamStore((s) => s.session)
  const startExam = useExamStore((s) => s.startExam)
  const canContinue = session !== null && session.view !== 'result'

  return (
    <div className="flex min-h-dvh flex-col bg-neutral-100">
      <header className="border-b border-neutral-200 bg-white px-4 py-3">
        <Brand />
      </header>
      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-4 py-10">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
          AWS Certification
        </p>
        <h1 className="mt-2 text-2xl font-bold leading-tight text-neutral-900 md:text-3xl">
          Certified Cloud Practitioner
        </h1>
        <p className="mt-1 text-neutral-600">CLF-C02 practice exam</p>

        <dl className="mt-8 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-xl border border-neutral-200 bg-white p-3">
            <dt className="text-neutral-500">Questions</dt>
            <dd className="mt-1 text-lg font-semibold">65</dd>
          </div>
          <div className="rounded-xl border border-neutral-200 bg-white p-3">
            <dt className="text-neutral-500">Time</dt>
            <dd className="mt-1 text-lg font-semibold">90 minutes</dd>
          </div>
          <div className="rounded-xl border border-neutral-200 bg-white p-3">
            <dt className="text-neutral-500">Passing score</dt>
            <dd className="mt-1 text-lg font-semibold">700 / 1000</dd>
          </div>
          <div className="rounded-xl border border-neutral-200 bg-white p-3">
            <dt className="text-neutral-500">Question bank</dt>
            <dd className="mt-1 text-lg font-semibold">{QUESTION_BANK.length.toLocaleString()}</dd>
          </div>
        </dl>

        <p className="mt-6 text-sm leading-relaxed text-neutral-600">
          Multiple choice and multiple response. Flag items, move freely, then review before
          you submit. Score is based on 50 scored items; 15 unidentified unscored items are
          included, matching the real exam.
        </p>

        <div className="mt-8 flex flex-col gap-3">
          {canContinue && (
            <button
              type="button"
              onClick={onEnter}
              className="min-h-12 rounded-xl bg-neutral-900 text-base font-semibold text-white"
            >
              Continue exam
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              startExam()
              onEnter()
            }}
            className={
              canContinue
                ? 'min-h-12 rounded-xl border border-neutral-300 bg-white text-base font-semibold'
                : 'min-h-12 rounded-xl bg-orange-500 text-base font-semibold text-neutral-900'
            }
          >
            Start exam
          </button>
        </div>

        <p className="mt-10">
          <Credit />
        </p>
      </div>
    </div>
  )
}
