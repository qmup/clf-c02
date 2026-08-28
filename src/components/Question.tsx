import type { OptionKey, Question } from '../types'
import { requiredCount, selectLabel } from '../lib/score'

interface Props {
  question: Question
  selected: OptionKey[]
  onChange: (keys: OptionKey[]) => void
  disabled?: boolean
  reveal?: boolean
}

export function QuestionCard({ question, selected, onChange, disabled, reveal }: Props) {
  const keys = (Object.keys(question.options) as OptionKey[]).filter(
    (key) => question.options[key],
  )
  const instruction = selectLabel(question)
  const correct = Array.isArray(question.answer) ? question.answer : [question.answer]
  const max = requiredCount(question)

  function pick(key: OptionKey) {
    if (disabled) return
    if (!question.isMultiAnswer) {
      onChange([key])
      return
    }
    if (selected.includes(key)) {
      onChange(selected.filter((item) => item !== key))
      return
    }
    if (selected.length >= max) return
    onChange([...selected, key])
  }

  return (
    <div>
      <p className="text-[17px] leading-relaxed text-neutral-900">{question.question}</p>
      {instruction && (
        <p className="mt-2 text-sm font-medium text-neutral-600">{instruction}</p>
      )}
      <ul className="mt-5 space-y-2.5">
        {keys.map((key) => {
          const active = selected.includes(key)
          const isRight = reveal && correct.includes(key)
          const isWrong = reveal && active && !correct.includes(key)
          return (
            <li key={key}>
              <button
                type="button"
                disabled={disabled && !reveal}
                onClick={() => pick(key)}
                aria-label={`${key}. ${question.options[key]}`}
                className={[
                  'flex w-full min-h-12 items-center gap-3 rounded-xl border px-4 py-3 text-left text-[15px]',
                  isRight
                    ? 'border-emerald-500 bg-emerald-50'
                    : isWrong
                      ? 'border-red-400 bg-red-50'
                      : active
                        ? 'border-orange-400 bg-orange-50'
                        : 'border-neutral-200 bg-white',
                ].join(' ')}
              >
                <span className="w-5 shrink-0 font-bold text-neutral-900">{key}</span>
                <span className="text-neutral-800">{question.options[key]}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
