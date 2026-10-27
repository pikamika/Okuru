import { useState, type FormEvent, type KeyboardEvent } from 'react'
import { Button } from '@/components/Button'
import { inputClass } from '@/components/FormField'
import { MicIcon, ShareIcon } from '@/components/icons'
import { Sheet } from '@/components/Sheet'
import { useToast } from '@/components/toastContext'
import {
  useCreatePerson,
  useCreateThought,
  useGiftIdeasByPerson,
  useOccasionsByPerson,
  usePeople,
} from '@/hooks'
import { PersonPicker, type PersonChoice } from './PersonPicker'

interface Props {
  open: boolean
  initialPersonId?: string
  onClose: () => void
}

export function CaptureSheet({ open, initialPersonId, onClose }: Props) {
  return (
    <Sheet open={open} onClose={onClose} title="What did you notice?">
      <CaptureForm initialPersonId={initialPersonId} onClose={onClose} />
    </Sheet>
  )
}

/** Mounted only while the sheet is open, so every capture starts fresh. */
function CaptureForm({ initialPersonId, onClose }: Omit<Props, 'open'>) {
  const { data: people = [] } = usePeople()
  const createPerson = useCreatePerson()
  const createThought = useCreateThought()
  const toast = useToast()

  const [body, setBody] = useState('')
  const [who, setWho] = useState<PersonChoice>(
    initialPersonId ? { kind: 'existing', id: initialPersonId } : null,
  )
  const [occasionId, setOccasionId] = useState('')
  const [ideaId, setIdeaId] = useState('')

  const personId = who?.kind === 'existing' ? who.id : undefined
  const { data: occasions = [] } = useOccasionsByPerson(personId)
  const { data: ideas = [] } = useGiftIdeasByPerson(personId)

  const canSave = body.trim().length > 0 && who !== null
  const saving = createPerson.isPending || createThought.isPending

  async function save(e?: FormEvent) {
    e?.preventDefault()
    if (!canSave || !who || saving) return
    const person =
      who.kind === 'existing'
        ? people.find((p) => p.id === who.id)
        : await createPerson.mutateAsync({ name: who.name })
    if (!person) return
    await createThought.mutateAsync({
      personId: person.id,
      body: body.trim(),
      occasionId: occasionId || undefined,
      giftIdeaId: ideaId || undefined,
    })
    toast(`Kept in ${person.name}’s notebook.`)
    onClose()
  }

  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) void save()
  }

  return (
    <>
      <form onSubmit={save} onKeyDown={onKey} className="flex flex-col gap-4">
        <div>
          <label htmlFor="capture-body" className="sr-only">
            Your thought
          </label>
          <textarea
            id="capture-body"
            autoFocus
            rows={3}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="She keeps eyeing that running belt…"
            className={`${inputClass} font-display resize-none text-lg leading-relaxed`}
          />
        </div>

        <PersonPicker people={people} value={who} onChange={setWho} />

        {personId && (occasions.length > 0 || ideas.length > 0) && (
          <details className="border-line bg-card rounded-md border px-4">
            <summary className="text-ink-soft flex min-h-11 cursor-pointer items-center text-sm">
              Tie it to something (optional)
            </summary>
            <div className="flex flex-col gap-3 pb-4">
              {occasions.length > 0 && (
                <label className="text-ink-soft flex flex-col gap-1.5 text-sm">
                  An occasion
                  <select
                    value={occasionId}
                    onChange={(e) => setOccasionId(e.target.value)}
                    className={inputClass}
                  >
                    <option value="">None</option>
                    {occasions.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.title}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              {ideas.length > 0 && (
                <label className="text-ink-soft flex flex-col gap-1.5 text-sm">
                  A gift idea
                  <select
                    value={ideaId}
                    onChange={(e) => setIdeaId(e.target.value)}
                    className={inputClass}
                  >
                    <option value="">None</option>
                    {ideas.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.title}
                      </option>
                    ))}
                  </select>
                </label>
              )}
            </div>
          </details>
        )}

        <div className="flex items-center justify-between gap-3 pt-1">
          <div className="flex gap-1">
            <button
              type="button"
              aria-disabled="true"
              title="Voice capture is coming soon"
              onClick={(e) => e.preventDefault()}
              className="text-ink-faint flex min-h-11 items-center gap-1.5 rounded-full px-3 text-sm"
            >
              <MicIcon width={18} height={18} /> Voice
              <span className="bg-sunken rounded-full px-2 py-0.5 text-[0.7rem]">soon</span>
            </button>
            <button
              type="button"
              aria-disabled="true"
              title="Capture from the share sheet is coming soon"
              onClick={(e) => e.preventDefault()}
              className="text-ink-faint flex min-h-11 items-center gap-1.5 rounded-full px-3 text-sm"
            >
              <ShareIcon width={18} height={18} /> Share
              <span className="bg-sunken rounded-full px-2 py-0.5 text-[0.7rem]">soon</span>
            </button>
          </div>
          <Button type="submit" disabled={!canSave || saving}>
            Keep it
          </Button>
        </div>
      </form>
    </>
  )
}
