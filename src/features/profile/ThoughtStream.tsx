import { useState } from 'react'
import { ThreadItem, ThreadList, inputClass } from '@/components'
import { useDeleteThought, useUpdateThought } from '@/hooks'
import { agoPhrase } from '@/lib/dates'
import type { GiftIdea, Occasion, Thought } from '@/types'

interface Props {
  thoughts: Thought[]
  occasions: Occasion[]
  ideas: GiftIdea[]
}

function ThoughtCard({
  thought,
  occasions,
  ideas,
}: { thought: Thought } & Omit<Props, 'thoughts'>) {
  const [linking, setLinking] = useState(false)
  const update = useUpdateThought()
  const remove = useDeleteThought()
  const occasion = occasions.find((o) => o.id === thought.occasionId)
  const idea = ideas.find((g) => g.id === thought.giftIdeaId)
  const canLink = occasions.length > 0 || ideas.length > 0

  return (
    <div>
      <p className="font-display text-quote">{thought.body}</p>
      <p className="text-ink-faint mt-1 text-sm">
        <time dateTime={thought.observedAt}>{agoPhrase(thought.observedAt)}</time>
        {occasion && <> · for {occasion.title}</>}
        {idea && <> · idea: {idea.title}</>}
      </p>
      <div className="-ml-3 flex gap-1">
        {canLink && (
          <button
            type="button"
            onClick={() => setLinking((v) => !v)}
            aria-expanded={linking}
            className="text-ink-soft hover:bg-sunken min-h-11 rounded-full px-3 text-sm"
          >
            {occasion || idea ? 'Change link' : 'Link to…'}
          </button>
        )}
        <button
          type="button"
          onClick={() => {
            if (window.confirm('Remove this thought?')) remove.mutate(thought.id)
          }}
          className="text-ink-soft hover:bg-sunken min-h-11 rounded-full px-3 text-sm"
        >
          Remove
        </button>
      </div>
      {linking && (
        <div className="anim-fade mb-2 flex flex-col gap-2 sm:flex-row">
          {occasions.length > 0 && (
            <label className="text-ink-soft flex-1 text-sm">
              <span className="sr-only">Occasion</span>
              <select
                value={thought.occasionId ?? ''}
                onChange={(e) =>
                  update.mutate({
                    id: thought.id,
                    patch: { occasionId: e.target.value || undefined },
                  })
                }
                className={inputClass}
              >
                <option value="">No occasion</option>
                {occasions.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.title}
                  </option>
                ))}
              </select>
            </label>
          )}
          {ideas.length > 0 && (
            <label className="text-ink-soft flex-1 text-sm">
              <span className="sr-only">Gift idea</span>
              <select
                value={thought.giftIdeaId ?? ''}
                onChange={(e) =>
                  update.mutate({
                    id: thought.id,
                    patch: { giftIdeaId: e.target.value || undefined },
                  })
                }
                className={inputClass}
              >
                <option value="">No gift idea</option>
                {ideas.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.title}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>
      )}
    </div>
  )
}

export function ThoughtStream({ thoughts, occasions, ideas }: Props) {
  return (
    <ThreadList>
      {thoughts.map((t) => (
        <ThreadItem
          key={t.id}
          tied={!!t.occasionId || !!t.giftIdeaId || ideas.some((g) => g.sourceThoughtId === t.id)}
        >
          <ThoughtCard thought={t} occasions={occasions} ideas={ideas} />
        </ThreadItem>
      ))}
    </ThreadList>
  )
}
