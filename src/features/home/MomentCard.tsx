import { Link, useNavigate } from 'react-router-dom'
import { Avatar, Button, Knot } from '@/components'
import { useStartGiftProject } from '@/hooks'
import { agoPhrase, whenPhrase } from '@/lib/dates'
import type { Moment } from '@/lib/moments'

/**
 * One moment: the occasion, and the thought it brought back. The thread runs from the person
 * down through the thought and out the bottom, to carry on to whatever comes next.
 */
export function MomentCard({ moment, first }: { moment: Moment; first?: boolean }) {
  const { occasion, person, thought, giftIdea, daysAway } = moment
  const start = useStartGiftProject()
  const navigate = useNavigate()

  async function startGift() {
    const project = await start.mutateAsync({
      personId: person.id,
      occasionId: occasion.id,
      giftIdeaId: giftIdea?.id,
      title: giftIdea?.title ?? `A gift for ${person.name}`,
    })
    navigate(`/gifts/${project.id}`)
  }

  return (
    <article className="paper-card anim-rise relative p-5">
      {/* the thread arriving from the previous card */}
      {!first && (
        <span aria-hidden className="absolute top-0 left-[39px] h-5 w-[1.4px] bg-[var(--thread)]" />
      )}

      <div className="grid grid-cols-[40px_1fr] gap-x-4">
        <Avatar name={person.name} size={40} className="relative" />
        <div className="self-center">
          <h3 className="font-display text-title">{occasion.title}</h3>
          <p className="text-ink-soft text-sm">{whenPhrase(daysAway)}</p>
        </div>

        <div className="relative">
          <span
            aria-hidden
            className="absolute -top-1 -bottom-5 left-1/2 w-[1.4px] -translate-x-1/2 bg-[var(--thread)]"
          />
          <Knot tied className="absolute top-[0.9rem] left-1/2 -translate-x-1/2" />
        </div>
        <div className="pt-3">
          <p className="eyebrow">You noticed · {agoPhrase(thought.observedAt)}</p>
          <blockquote className="font-display text-quote mt-1.5 italic">
            “{thought.body}”
          </blockquote>
          {giftIdea && (
            <p className="bg-accent-soft text-accent-strong mt-3 inline-block rounded-full px-3 py-1 text-sm">
              Idea saved: {giftIdea.title}
            </p>
          )}
          <div className="mt-4 flex flex-wrap items-center gap-1">
            <Button onClick={() => void startGift()} disabled={start.isPending}>
              Start a gift
            </Button>
            <Link
              to={`/people/${person.id}`}
              className="text-ink-soft hover:bg-sunken inline-flex min-h-11 items-center rounded-full px-3 text-[0.95rem]"
            >
              {person.name}’s notebook
            </Link>
          </div>
        </div>
      </div>
    </article>
  )
}
