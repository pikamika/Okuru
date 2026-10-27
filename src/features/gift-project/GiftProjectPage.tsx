import { useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import type { GiftProject, Person } from '@/types'
import {
  Button,
  EmptyState,
  FormField,
  Page,
  PageHeader,
  Section,
  ThreadProgress,
  inputClass,
  useToast,
} from '@/components'
import {
  useChecklist,
  useCreateChecklistItem,
  useGiftProject,
  useOccasionsByPerson,
  usePerson,
  useUpdateChecklistItem,
  useUpdateGiftProject,
} from '@/hooks'
import { cn } from '@/lib/cn'
import { daysBetween, formatDate, nextOccurrence, toDateOnly, whenPhrase } from '@/lib/dates'

export function GiftProjectPage() {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const { data: project, isLoading } = useGiftProject(projectId)
  const { data: person } = usePerson(project?.personId)

  if (isLoading)
    return (
      <Page>
        <p className="text-ink-faint">Opening…</p>
      </Page>
    )
  if (!project || !person) {
    return (
      <Page>
        <EmptyState
          title="We couldn’t find that gift"
          action={<Button onClick={() => navigate('/people')}>Back to people</Button>}
        />
      </Page>
    )
  }

  return <GiftProjectForm key={project.id} project={project} person={person} />
}

function GiftProjectForm({ project, person }: { project: GiftProject; person: Person }) {
  const toast = useToast()
  const { data: occasions = [] } = useOccasionsByPerson(project.personId)
  const { data: items = [] } = useChecklist(project.id)
  const updateProject = useUpdateGiftProject()
  const updateItem = useUpdateChecklistItem(project.id)
  const addItem = useCreateChecklistItem(project.id)

  const [title, setTitle] = useState(project.title)
  const [budget, setBudget] = useState(
    project.budgetCents != null ? String(project.budgetCents / 100) : '',
  )
  const [notes, setNotes] = useState(project.notes)
  const [newStep, setNewStep] = useState('')
  const [reaction, setReaction] = useState(project.reaction ?? '')

  const patch = (p: Parameters<typeof updateProject.mutate>[0]['patch']) =>
    updateProject.mutate({ id: project.id, patch: p })

  const occasion = occasions.find((o) => o.id === project.occasionId)
  const next = occasion ? nextOccurrence(occasion.date, occasion.recurs) : null
  const daysLeft = next ? daysBetween(new Date(), next) : null
  const doneCount = items.filter((i) => i.done).length
  const given = project.status === 'given'

  async function submitStep(e: FormEvent) {
    e.preventDefault()
    const label = newStep.trim()
    if (!label) return
    await addItem.mutateAsync({
      projectId: project.id,
      kind: 'custom',
      label,
      done: false,
      sortOrder: items.length,
    })
    setNewStep('')
  }

  return (
    <Page>
      <PageHeader
        title={project.title}
        eyebrow={`For ${person.name}${occasion ? ` · ${occasion.title}` : ''}`}
        back={{ to: `/people/${person.id}`, label: person.name }}
      />

      <div className="anim-fade flex flex-col gap-1">
        <ThreadProgress done={doneCount} total={items.length} />
        <p className="text-ink-soft mt-2 text-sm">
          {given
            ? `Given ${project.givenAt ? formatDate(project.givenAt) : ''}`.trim()
            : items.length === 0
              ? 'Add a few steps when you’re ready.'
              : `${doneCount} of ${items.length} steps done`}
          {!given && daysLeft != null && ` · ${occasion?.title} is ${whenPhrase(daysLeft)}`}
        </p>
      </div>

      <Section title="The idea">
        <div className="flex flex-col gap-4">
          <FormField label="What is it?">
            {(p) => (
              <input
                {...p}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={() =>
                  title.trim() && title !== project.title && patch({ title: title.trim() })
                }
                className={inputClass}
              />
            )}
          </FormField>
          <FormField label="Budget (optional)">
            {(p) => (
              <input
                {...p}
                inputMode="decimal"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                onBlur={() => {
                  const n = parseFloat(budget)
                  patch({ budgetCents: Number.isFinite(n) ? Math.round(n * 100) : undefined })
                }}
                placeholder="40"
                className={inputClass}
              />
            )}
          </FormField>
        </div>
      </Section>

      <Section title="Preparing">
        <ul className="flex flex-col">
          {items.map((i) => (
            <li key={i.id}>
              <label className="flex min-h-12 cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={i.done}
                  onChange={(e) =>
                    updateItem.mutate({ id: i.id, patch: { done: e.target.checked } })
                  }
                  className="size-5 accent-[var(--accent)]"
                />
                <span className={cn('text-[1.02rem]', i.done && 'text-ink-faint line-through')}>
                  {i.label}
                </span>
              </label>
            </li>
          ))}
        </ul>
        <form onSubmit={submitStep} className="mt-2 flex gap-2">
          <label htmlFor="new-step" className="sr-only">
            Add a step
          </label>
          <input
            id="new-step"
            value={newStep}
            onChange={(e) => setNewStep(e.target.value)}
            placeholder="Add a step"
            className={inputClass}
          />
          <Button type="submit" variant="soft" disabled={!newStep.trim()}>
            Add
          </Button>
        </form>
      </Section>

      <Section title="Notes">
        <FormField label="Anything to remember">
          {(p) => (
            <textarea
              {...p}
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={() => notes !== project.notes && patch({ notes })}
              placeholder="Wrapping ideas, where you saw it, what to write on the card…"
              className={inputClass}
            />
          )}
        </FormField>
      </Section>

      {given ? (
        <Section title="How it landed">
          <FormField label="Optional">
            {(p) => (
              <textarea
                {...p}
                rows={2}
                value={reaction}
                onChange={(e) => setReaction(e.target.value)}
                onBlur={() => patch({ reaction: reaction.trim() || undefined })}
                className={inputClass}
              />
            )}
          </FormField>
        </Section>
      ) : (
        <div className="mt-10">
          <Button
            onClick={() => {
              patch({ status: 'given', givenAt: toDateOnly(new Date()) })
              toast('Given. How lovely.')
            }}
          >
            I gave it
          </Button>
        </div>
      )}
    </Page>
  )
}
