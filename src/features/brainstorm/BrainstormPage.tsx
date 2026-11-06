import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Button, EmptyState, Page, inputClass, useToast } from '@/components'
import { ChevronLeftIcon } from '@/components/icons'
import type { BrainstormContext } from '@/data/agent'
import {
  useBrainstormMessages,
  useConnectionsByPerson,
  useGiftIdeasByPerson,
  useGiftProject,
  useOccasionsByPerson,
  usePeople,
  usePerson,
  useSendBrainstormMessage,
  useThoughtsByPerson,
  useUpdateGiftProject,
} from '@/hooks'
import { cn } from '@/lib/cn'
import type { GiftProject, Suggestion } from '@/types'

const STARTERS = [
  'Help me find an idea',
  'Something to do together',
  'Something handmade',
  'What should I put inside?',
]

export function BrainstormPage() {
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
  return <Chat key={project.id} project={project} personName={person.name} />
}

function Chat({ project, personName }: { project: GiftProject; personName: string }) {
  const toast = useToast()
  const { data: person } = usePerson(project.personId)
  const { data: everyone = [] } = usePeople()
  const { data: thoughts = [] } = useThoughtsByPerson(project.personId)
  const { data: ideas = [] } = useGiftIdeasByPerson(project.personId)
  const { data: occasions = [] } = useOccasionsByPerson(project.personId)
  const { data: links = [] } = useConnectionsByPerson(project.personId)
  const { data: messages = [] } = useBrainstormMessages(project.id)
  const send = useSendBrainstormMessage(project.id)
  const updateProject = useUpdateGiftProject()

  const [draft, setDraft] = useState('')
  const [added, setAdded] = useState<Set<string>>(new Set())
  const endRef = useRef<HTMLDivElement>(null)

  const context = useMemo<BrainstormContext | null>(() => {
    if (!person) return null
    return {
      person,
      project,
      occasion: occasions.find((o) => o.id === project.occasionId),
      thoughts,
      ideas,
      connections: links.map((c) => {
        const otherId = c.personId === person.id ? c.otherPersonId : c.personId
        const name = everyone.find((p) => p.id === otherId)?.name ?? c.otherName ?? 'Someone'
        return { name, label: c.label }
      }),
    }
  }, [person, project, occasions, thoughts, ideas, links, everyone])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages.length, send.isPending])

  function ask(text: string) {
    const body = text.trim()
    if (!body || !context || send.isPending) return
    setDraft('')
    send.mutate({ text: body, context })
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    ask(draft)
  }

  function applySuggestion(s: Suggestion) {
    if (s.kind === 'gift') {
      updateProject.mutate({ id: project.id, patch: { title: s.text } })
      toast('Set as the gift')
    } else {
      const line = `• ${s.text}`
      const notes = project.notes.trim() ? `${project.notes.trim()}\n${line}` : line
      updateProject.mutate({ id: project.id, patch: { notes } })
      toast('Added to your notes')
    }
    setAdded((prev) => new Set(prev).add(s.id))
  }

  return (
    <Page className="flex min-h-[calc(100dvh-6rem)] flex-col">
      <header className="mb-4">
        <Link
          to={`/gifts/${project.id}`}
          className="text-ink-soft hover:text-ink mb-1 -ml-2 inline-flex min-h-11 items-center gap-1 rounded-full px-2 text-sm"
        >
          <ChevronLeftIcon width={18} height={18} />
          {project.title}
        </Link>
        <p className="eyebrow mb-1.5">For {personName}</p>
        <h1 className="font-display text-display">Think it through</h1>
        <p className="text-ink-faint mt-2 text-sm">
          Preview: replies are scripted for now. They use what you’ve noted about {personName}.
        </p>
      </header>

      <div className="flex flex-1 flex-col gap-5" aria-live="polite">
        {messages.length === 0 && (
          <div className="anim-fade">
            <p className="text-ink-soft">
              Tell me what you’re thinking, or start with one of these.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {STARTERS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => ask(s)}
                  className="border-line-strong bg-card hover:bg-sunken min-h-11 rounded-full border px-4 text-sm"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m) => (
          <div key={m.id} className={cn('flex flex-col gap-3', m.role === 'user' && 'items-end')}>
            <p
              className={cn(
                'max-w-[85%] rounded-lg px-4 py-3 leading-relaxed',
                m.role === 'user' ? 'bg-accent text-on-accent' : 'bg-card border-line border',
              )}
            >
              {m.text}
            </p>
            {m.suggestions && m.suggestions.length > 0 && (
              <ul className="flex w-full flex-col gap-2">
                {m.suggestions.map((s) => (
                  <li key={s.id} className="border-line bg-card rounded-md border p-4">
                    <p className="font-display text-lg">{s.text}</p>
                    {s.why && <p className="text-ink-soft text-sm">{s.why}</p>}
                    <button
                      type="button"
                      disabled={added.has(s.id)}
                      onClick={() => applySuggestion(s)}
                      className="text-accent-strong hover:bg-accent-soft disabled:text-ink-faint mt-1 -ml-3 min-h-11 rounded-full px-3 text-sm disabled:hover:bg-transparent"
                    >
                      {added.has(s.id)
                        ? s.kind === 'gift'
                          ? 'Set as the gift'
                          : 'Added to notes'
                        : s.kind === 'gift'
                          ? 'Use as the gift'
                          : 'Add to notes'}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}

        {send.isPending && (
          <p className="text-ink-faint anim-fade" role="status">
            Thinking…
          </p>
        )}
        <div ref={endRef} />
      </div>

      <form
        onSubmit={onSubmit}
        className="bg-paper/95 pb-safe sticky bottom-[calc(var(--tab-height)+env(safe-area-inset-bottom))] mt-6 flex gap-2 py-3 backdrop-blur md:bottom-0"
      >
        <label htmlFor="brainstorm-input" className="sr-only">
          Message
        </label>
        <input
          id="brainstorm-input"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={`What are you thinking for ${personName}?`}
          className={inputClass}
          autoComplete="off"
        />
        <Button type="submit" disabled={!draft.trim() || send.isPending}>
          Send
        </Button>
      </form>
    </Page>
  )
}
