import { useId, useState } from 'react'
import { QUESTION_BANK } from '../lib/bank'
import { decodeProgress, encodeProgress } from '../lib/progress'
import { useExamStore } from '../store'

const VALID_IDS = new Set(QUESTION_BANK.map((question) => question.id))

export function ProgressSync({ className = '' }: { className?: string }) {
  const fieldId = useId()
  const correctIds = useExamStore((s) => s.correctIds)
  const [code, setCode] = useState('')
  const [status, setStatus] = useState('')
  const [error, setError] = useState(false)

  async function copyCode() {
    const next = encodeProgress(correctIds)
    setCode(next)
    setError(false)
    try {
      await navigator.clipboard.writeText(next)
      setStatus('Copied. Paste this code on the other device.')
    } catch {
      setStatus('Select the code and copy it, then paste it on the other device.')
    }
  }

  function mergeCode() {
    const incoming = decodeProgress(code, VALID_IDS)
    if (!incoming) {
      setError(true)
      setStatus('Paste a progress code from the other device.')
      return
    }
    const before = new Set(useExamStore.getState().correctIds)
    const added = incoming.some((id) => !before.has(id))
    useExamStore.getState().mergeCorrectIds(incoming)
    setError(false)
    setStatus(
      added
        ? 'Merged. Next exam will skip these questions too.'
        : 'This code is already on this device.',
    )
  }

  return (
    <section className={['rounded-2xl border border-neutral-200 bg-white p-4', className].filter(Boolean).join(' ')}>
      <p className="text-sm leading-relaxed text-neutral-500">
        Paste a code from another device, or copy one to take with you. Next exam skips questions
        answered correctly on either device.
      </p>
      <label htmlFor={fieldId} className="mt-3 block text-xs font-medium text-neutral-600">
        Progress code
      </label>
      <textarea
        id={fieldId}
        value={code}
        rows={3}
        spellCheck={false}
        onChange={(event) => setCode(event.target.value)}
        placeholder="clf1:..."
        className="mt-1 w-full resize-y rounded-xl border border-neutral-200 px-3 py-2 font-mono text-xs text-neutral-800"
      />
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          disabled={correctIds.length === 0}
          onClick={() => void copyCode()}
          className="min-h-10 flex-1 rounded-full border border-neutral-300 bg-white px-4 text-sm font-semibold text-neutral-900 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Copy code
        </button>
        <button
          type="button"
          onClick={mergeCode}
          className="min-h-10 flex-1 rounded-full bg-neutral-900 px-4 text-sm font-semibold text-white"
        >
          Merge code
        </button>
      </div>
      {status && (
        <p role="status" className={['mt-2 text-sm', error ? 'text-red-600' : 'text-neutral-600'].join(' ')}>
          {status}
        </p>
      )}
    </section>
  )
}
