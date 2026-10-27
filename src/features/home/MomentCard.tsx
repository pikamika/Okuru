import { Link, useNavigate } from 'react-router-dom'
import { Avatar, Button, ThreadCurve } from '@/components'
import { useStartGiftProject } from '@/hooks'
import { agoPhrase, whenPhrase } from '@/lib/dates'
import type { Moment } from '@/lib/moments'

export function MomentCard({ moment }: { moment: Moment }) {
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
    <article className="anim-rise border-line bg-card shadow-card rounded-lg border p-5">
      <div className="flex items-center gap-3">
        <Avatar name={person.name} size={40} />
        <div>
          <h3 className="font-display text-lg leading-snug">{occasion.title}</h3>
          <p className="text-ink-soft text-sm">{whenPhrase(daysAway)}</p>
        </div>
      </div>

      <div className="mt-3 flex gap-3">
        <ThreadCurve className="mt-1 shrink-0" />
        <div>
          <p className="text-ink-faint text-sm">You noticed, {agoPhrase(thought.observedAt)}</p>
          <blockquote className="font-display mt-1 text-[1.2rem] leading-relaxed italic">
            “{thought.body}”
          </blockquote>
          {giftIdea && (
            <p className="bg-accent-soft text-accent-strong mt-2 inline-block rounded-full px-3 py-1 text-sm">
              Idea saved: {giftIdea.title}
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button onClick={() => void startGift()} disabled={start.isPending}>
          Start a gift
        </Button>
        <Link
          to={`/people/${person.id}`}
          className="text-ink-soft hover:bg-sunken inline-flex min-h-11 items-center rounded-full px-4 text-[0.95rem]"
        >
          {person.name}’s notebook
        </Link>
      </div>
    </article>
  )
}
