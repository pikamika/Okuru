import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  Avatar,
  Button,
  EmptyState,
  FormField,
  Section,
  Sheet,
  TagInput,
  inputClass,
  useToast,
} from '@/components'
import { PlusIcon } from '@/components/icons'
import { AddOccasionSheet, MilestoneCard } from '@/features/occasions'
import { useCapture } from '@/features/capture'
import {
  useCreateGiftIdea,
  useCreateGiftProject,
  useDeleteGiftIdea,
  useDeleteOccasion,
  useGiftIdeasByPerson,
  useGiftProjectsByPerson,
  useOccasionsByPerson,
  usePendingMilestones,
  usePerson,
  useStartGiftProject,
  useThoughtsByPerson,
  useUpdatePerson,
} from '@/hooks'
import { formatDate, nextOccurrence, daysBetween, whenPhrase, toDateOnly } from '@/lib/dates'
import { ChevronLeftIcon } from '@/components/icons'
import { ThoughtStream } from './ThoughtStream'

export function PersonProfile() {
  const { personId } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const { openCapture } = useCapture()

  const { data: person, isLoading } = usePerson(personId)
  const { data: thoughts = [] } = useThoughtsByPerson(personId)
  const { data: occasions = [] } = useOccasionsByPerson(personId)
  const { data: ideas = [] } = useGiftIdeasByPerson(personId)
  const { data: projects = [] } = useGiftProjectsByPerson(personId)
  const { data: milestones = [] } = usePendingMilestones()

  const updatePerson = useUpdatePerson()
  const removeOccasion = useDeleteOccasion()
  const createIdea = useCreateGiftIdea()
  const removeIdea = useDeleteGiftIdea()
  const startProject = useStartGiftProject()
  const logPast = useCreateGiftProject()

  const [addingOccasion, setAddingOccasion] = useState(false)
  const [addingIdea, setAddingIdea] = useState(false)
  const [loggingGift, setLoggingGift] = useState(false)

  if (isLoading) return <p className="text-ink-faint">Opening the notebook…</p>
  if (!person) {
    return (
      <EmptyState
        title="We couldn’t find them"
        action={<Button onClick={() => navigate('/people')}>Back to people</Button>}
      />
    )
  }

  const myMilestones = milestones.filter((m) => m.personId === person.id)
  const upcoming = occasions
    .map((o) => ({ o, next: nextOccurrence(o.date, o.recurs) }))
    .sort((a, b) => (a.next?.getTime() ?? Infinity) - (b.next?.getTime() ?? Infinity))
  const given = projects
    .filter((p) => p.status === 'given')
    .sort((a, b) => (b.givenAt ?? '').localeCompare(a.givenAt ?? ''))
  const inProgress = projects.filter((p) => p.status === 'planning')

  async function newProject(title: string, giftIdeaId?: string) {
    const project = await startProject.mutateAsync({ personId: person!.id, title, giftIdeaId })
    navigate(`/gifts/${project.id}`)
  }

  return (
    <article className="anim-fade">
      <Link
        to="/people"
        className="text-ink-soft hover:text-ink mb-1 -ml-2 inline-flex min-h-11 items-center gap-1 rounded-full px-2 text-sm lg:hidden"
      >
        <ChevronLeftIcon width={18} height={18} /> People
      </Link>

      <header className="flex items-center gap-4">
        <Avatar name={person.name} size={64} />
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-display">{person.name}</h1>
          {person.relationship && <p className="text-ink-soft">{person.relationship}</p>}
        </div>
      </header>

      <Button
        className="mt-5 w-full sm:w-auto"
        onClick={() => openCapture({ personId: person.id })}
      >
        <PlusIcon width={18} height={18} /> Note something about {person.name}
      </Button>

      {myMilestones.length > 0 && (
        <div className="mt-8 flex flex-col gap-3">
          {myMilestones.map((m) => (
            <MilestoneCard key={m.id} suggestion={m} />
          ))}
        </div>
      )}

      <Section title="Good to know">
        <TagInput
          value={person.tags}
          onChange={(tags) => updatePerson.mutate({ id: person.id, patch: { tags } })}
        />
      </Section>

      <Section
        title="Moments"
        action={
          <Button variant="ghost" onClick={() => setAddingOccasion(true)}>
            Add
          </Button>
        }
      >
        {upcoming.length === 0 ? (
          <p className="text-ink-soft">No moments yet. A birthday is a good place to start.</p>
        ) : (
          <ul className="divide-line divide-y">
            {upcoming.map(({ o, next }) => (
              <li key={o.id} className="flex min-h-14 items-center justify-between gap-3 py-2">
                <div>
                  <p>{o.title}</p>
                  <p className="text-ink-faint text-sm">
                    {formatDate(o.date, o.yearKnown && o.recurs === 'none')}
                    {next && ` · ${whenPhrase(daysBetween(new Date(), next))}`}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeOccasion.mutate(o.id)}
                  className="text-ink-soft hover:bg-sunken min-h-11 rounded-full px-3 text-sm"
                  aria-label={`Remove ${o.title}`}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="What you’ve noticed">
        {thoughts.length === 0 ? (
          <p className="text-ink-soft">Nothing yet. Even a small thing is worth keeping.</p>
        ) : (
          <ThoughtStream thoughts={thoughts} occasions={occasions} ideas={ideas} />
        )}
      </Section>

      <Section
        title="Gift ideas"
        action={
          <Button variant="ghost" onClick={() => setAddingIdea(true)}>
            Add
          </Button>
        }
      >
        {ideas.length === 0 ? (
          <p className="text-ink-soft">
            No ideas saved. That’s fine. They tend to arrive on their own.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {ideas.map((g) => (
              <li key={g.id} className="border-line bg-card rounded-md border p-4">
                <p className="font-display text-lg">{g.title}</p>
                {g.note && <p className="text-ink-soft text-sm">{g.note}</p>}
                <div className="mt-1 -ml-3 flex gap-1">
                  <button
                    type="button"
                    onClick={() => void newProject(g.title, g.id)}
                    className="text-accent-strong hover:bg-accent-soft min-h-11 rounded-full px-3 text-sm"
                  >
                    Start a gift
                  </button>
                  <button
                    type="button"
                    onClick={() => removeIdea.mutate(g.id)}
                    className="text-ink-soft hover:bg-sunken min-h-11 rounded-full px-3 text-sm"
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
        <Button
          variant="soft"
          className="mt-3"
          onClick={() => void newProject(`A gift for ${person.name}`)}
        >
          Start a gift from scratch
        </Button>
      </Section>

      {inProgress.length > 0 && (
        <Section title="In the works">
          <ul className="flex flex-col gap-2">
            {inProgress.map((p) => (
              <li key={p.id}>
                <Link
                  to={`/gifts/${p.id}`}
                  className="border-line bg-card hover:bg-sunken flex min-h-12 items-center rounded-md border px-4"
                >
                  {p.title}
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section
        title="Gifts you’ve given"
        action={
          <Button variant="ghost" onClick={() => setLoggingGift(true)}>
            Log one
          </Button>
        }
      >
        {given.length === 0 ? (
          <p className="text-ink-soft">
            Nothing logged yet. Past gifts and how they landed can live here.
          </p>
        ) : (
          <ul className="flex flex-col gap-4">
            {given.map((p) => (
              <li key={p.id}>
                <Link to={`/gifts/${p.id}`} className="hover:bg-sunken block rounded-md px-1 py-1">
                  <p className="font-display text-lg">{p.title}</p>
                  {p.givenAt && <p className="text-ink-faint text-sm">{formatDate(p.givenAt)}</p>}
                  {p.reaction && <p className="text-ink-soft mt-1 italic">“{p.reaction}”</p>}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <AddOccasionSheet
        open={addingOccasion}
        personId={person.id}
        personName={person.name}
        onClose={() => setAddingOccasion(false)}
      />

      <IdeaSheet
        open={addingIdea}
        onClose={() => setAddingIdea(false)}
        onSave={async (title, note) => {
          await createIdea.mutateAsync({ personId: person.id, title, note, status: 'idea' })
          toast('Idea saved.')
          setAddingIdea(false)
        }}
      />

      <PastGiftSheet
        open={loggingGift}
        onClose={() => setLoggingGift(false)}
        onSave={async (title, date, reaction) => {
          await logPast.mutateAsync({
            personId: person.id,
            title,
            notes: '',
            status: 'given',
            givenAt: date || toDateOnly(new Date()),
            reaction: reaction || undefined,
          })
          toast('Logged.')
          setLoggingGift(false)
        }}
      />
    </article>
  )
}

function IdeaSheet({
  open,
  onClose,
  onSave,
}: {
  open: boolean
  onClose: () => void
  onSave: (title: string, note?: string) => Promise<void>
}) {
  const [title, setTitle] = useState('')
  const [note, setNote] = useState('')
  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    await onSave(title.trim(), note.trim() || undefined)
    setTitle('')
    setNote('')
  }
  return (
    <Sheet open={open} onClose={onClose} title="A gift idea">
      <form onSubmit={submit} className="flex flex-col gap-4">
        <FormField label="What is it?">
          {(p) => (
            <input
              {...p}
              data-autofocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={inputClass}
            />
          )}
        </FormField>
        <FormField label="Anything worth remembering? (optional)">
          {(p) => (
            <textarea
              {...p}
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className={inputClass}
            />
          )}
        </FormField>
        <Button type="submit" disabled={!title.trim()} className="self-end">
          Save idea
        </Button>
      </form>
    </Sheet>
  )
}

function PastGiftSheet({
  open,
  onClose,
  onSave,
}: {
  open: boolean
  onClose: () => void
  onSave: (title: string, date: string, reaction: string) => Promise<void>
}) {
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [reaction, setReaction] = useState('')
  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    await onSave(title.trim(), date, reaction.trim())
    setTitle('')
    setDate('')
    setReaction('')
  }
  return (
    <Sheet open={open} onClose={onClose} title="A gift you gave">
      <form onSubmit={submit} className="flex flex-col gap-4">
        <FormField label="What did you give?">
          {(p) => (
            <input
              {...p}
              data-autofocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={inputClass}
            />
          )}
        </FormField>
        <FormField label="Roughly when? (optional)">
          {(p) => (
            <input
              {...p}
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={inputClass}
            />
          )}
        </FormField>
        <FormField label="How did it land? (optional)">
          {(p) => (
            <textarea
              {...p}
              rows={2}
              value={reaction}
              onChange={(e) => setReaction(e.target.value)}
              placeholder="Really appreciated the handwritten card"
              className={inputClass}
            />
          )}
        </FormField>
        <Button type="submit" disabled={!title.trim()} className="self-end">
          Save
        </Button>
      </form>
    </Sheet>
  )
}
