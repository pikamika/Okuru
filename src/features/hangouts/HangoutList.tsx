import { useDeleteHangout } from '@/hooks'
import { formatDate } from '@/lib/dates'
import type { Hangout } from '@/types'
import { reflectionLabel } from './reflections'

export function HangoutList({ hangouts }: { hangouts: Hangout[] }) {
  const remove = useDeleteHangout()
  return (
    <ul className="divide-line divide-y">
      {hangouts.map((h) => (
        <li key={h.id} className="py-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-display text-lg">{h.title}</p>
              <p className="text-ink-faint text-sm">
                {formatDate(h.happenedAt)}
                {h.reflection && <> · {reflectionLabel(h.reflection)}</>}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Remove this hangout? Anything you kept as a thought stays.'))
                  remove.mutate(h.id)
              }}
              className="text-ink-soft hover:bg-sunken -mr-3 min-h-11 shrink-0 rounded-full px-3 text-sm"
              aria-label={`Remove ${h.title}`}
            >
              Remove
            </button>
          </div>
          {h.takeaway && <p className="text-ink-soft mt-1 italic">“{h.takeaway}”</p>}
        </li>
      ))}
    </ul>
  )
}
