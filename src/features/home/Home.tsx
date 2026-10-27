import { Link } from 'react-router-dom'
import { Button, EmptyState, Page, ThreadBridge } from '@/components'
import { PlusIcon } from '@/components/icons'
import { useCapture } from '@/features/capture'
import { MilestoneCard } from '@/features/occasions'
import { useMoments, usePendingMilestones, usePeople } from '@/hooks'
import { MomentCard } from './MomentCard'

function greeting() {
  const h = new Date().getHours()
  if (h < 5) return 'Still up?'
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

export function Home() {
  const { moments, isLoading } = useMoments()
  const { data: people = [] } = usePeople()
  const { data: milestones = [] } = usePendingMilestones()
  const { openCapture } = useCapture()
  const milestone = milestones[0]

  return (
    <Page>
      <header className="mb-8">
        <p className="eyebrow mb-1.5">{greeting()}</p>
        <h1 className="font-display text-display">
          {moments.length > 0 ? 'Here’s what you’ve been noticing' : 'A quiet stretch'}
        </h1>
      </header>

      {!isLoading && moments.length === 0 && (
        <EmptyState
          title="Nothing coming up"
          action={
            <Button variant="soft" onClick={() => openCapture()}>
              <PlusIcon width={18} height={18} /> Note something
            </Button>
          }
        >
          When a moment draws near, the thoughts you’ve kept will find their way back here.
        </EmptyState>
      )}

      <div>
        {moments.map((m, i) => (
          <div key={m.occasion.id}>
            <MomentCard moment={m} first={i === 0} />
            <ThreadBridge />
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => openCapture()}
        className="border-line-strong text-ink-soft hover:bg-sunken flex min-h-16 w-full items-center gap-4 rounded-lg border border-dashed pr-5 pl-[29px] text-left transition-colors"
      >
        <PlusIcon className="text-accent" />
        <span className="font-display text-title">Noticed something lately?</span>
      </button>

      {milestone && (
        <section className="mt-8" aria-label="A question">
          <MilestoneCard suggestion={milestone} />
        </section>
      )}

      {people.length > 0 && (
        <p className="text-ink-faint mt-6 text-center text-sm">
          <Link
            to="/people"
            className="decoration-line-strong hover:text-ink underline underline-offset-4"
          >
            Browse everyone in your notebook
          </Link>
        </p>
      )}
    </Page>
  )
}
