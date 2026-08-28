import { Flag } from 'lucide-react'

interface Props {
  count: number
  currentIndex: number
  answered: boolean[]
  flagged: boolean[]
  dimmed?: boolean[]
  compact?: boolean
  onJump: (index: number) => void
}

export function ItemJumper({
  count,
  currentIndex,
  answered,
  flagged,
  dimmed,
  compact,
  onJump,
}: Props) {
  return (
    <div className={compact ? 'grid grid-cols-5 gap-1.5' : 'grid grid-cols-5 gap-2 sm:grid-cols-8 md:grid-cols-10'}>
      {Array.from({ length: count }, (_, index) => {
        const isCurrent = index === currentIndex
        const isAnswered = answered[index]
        const isFlagged = flagged[index]
        const isDimmed = dimmed?.[index]
        return (
          <button
            key={index}
            type="button"
            onClick={() => onJump(index)}
            className={[
              'relative rounded-md border text-xs font-medium tabular-nums',
              compact ? 'min-h-9' : 'min-h-11 text-sm',
              isDimmed ? 'opacity-30' : '',
              isCurrent
                ? 'border-orange-500 bg-white text-neutral-900 ring-1 ring-orange-500'
                : isAnswered
                  ? 'border-orange-200 bg-orange-100 text-neutral-900'
                  : 'border-neutral-200 bg-white text-neutral-700',
            ].join(' ')}
            aria-current={isCurrent ? 'true' : undefined}
            aria-label={`Question ${index + 1}${isFlagged ? ', flagged' : ''}${isAnswered ? ', answered' : ', incomplete'}`}
          >
            {index + 1}
            {isFlagged && (
              <Flag
                className="absolute right-0.5 top-0.5 h-2.5 w-2.5 fill-red-500 text-red-500"
                aria-hidden
              />
            )}
          </button>
        )
      })}
    </div>
  )
}

export function QuestionLegend() {
  return (
    <ul className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2 text-xs text-neutral-600">
      <li className="flex items-center gap-2">
        <span className="h-4 w-4 rounded-sm border border-orange-200 bg-orange-100" />
        Answered
      </li>
      <li className="flex items-center gap-2">
        <span className="h-4 w-4 rounded-sm border border-orange-500 bg-white" />
        Current
      </li>
      <li className="flex items-center gap-2">
        <span className="h-4 w-4 rounded-sm border border-neutral-200 bg-white" />
        Unanswered
      </li>
      <li className="flex items-center gap-2">
        <Flag className="h-3.5 w-3.5 fill-red-500 text-red-500" />
        Flagged
      </li>
    </ul>
  )
}
