import { useState } from 'react'
import { Button, inputClass, useToast } from '@/components'
import { useAnswerMilestone } from '@/hooks'
import type { MilestoneSuggestion } from '@/types'

/** A question, never an assumption. The user can always say "Not sure" or "Not relevant". */
export function MilestoneCard({ suggestion }: { suggestion: MilestoneSuggestion }) {
  const [date, setDate] = useState('')
  const answer = useAnswerMilestone()
  const toast = useToast()
  const dateId = `milestone-date-${suggestion.id}`

  return (
    <article className="anim-rise border-line-strong bg-sunken/50 rounded-lg border border-dashed p-5">
      <p className="font-display text-quote">{suggestion.prompt}</p>
      <div className="mt-4 flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor={dateId} className="text-ink-soft text-sm">
            Roughly when?
          </label>
          <input
            id={dateId}
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={`${inputClass} w-auto`}
          />
        </div>
        <Button
          disabled={!date || answer.isPending}
          onClick={() =>
            answer.mutate(
              { suggestion, answer: { status: 'confirmed', date } },
              { onSuccess: () => toast('Added to their moments.') },
            )
          }
        >
          Add it
        </Button>
      </div>
      <div className="mt-2 flex gap-1">
        <Button
          variant="ghost"
          onClick={() => answer.mutate({ suggestion, answer: { status: 'not_sure' } })}
        >
          Not sure
        </Button>
        <Button
          variant="ghost"
          onClick={() => answer.mutate({ suggestion, answer: { status: 'not_relevant' } })}
        >
          Not relevant
        </Button>
      </div>
    </article>
  )
}
