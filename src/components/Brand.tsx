import { Check } from 'lucide-react'

export function Brand() {
  return (
    <div className="flex items-center gap-2">
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-500 text-black">
        <Check className="h-4 w-4" strokeWidth={3} />
      </span>
      <span className="text-base font-bold tracking-tight text-neutral-900">CLF-C02</span>
    </div>
  )
}
