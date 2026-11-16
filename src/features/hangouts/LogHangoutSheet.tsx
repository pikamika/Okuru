import { useState, type FormEvent } from 'react'
import { Button, FormField, Sheet, inputClass, useToast } from '@/components'
import { PersonPicker, type PersonChoice } from '@/features/capture'
import { useCreatePerson, useLogHangout } from '@/hooks'
import { cn } from '@/lib/cn'
import { toDateOnly } from '@/lib/dates'
import type { Person, Reflection } from '@/types'
import { REFLECTIONS } from './reflections'

interface Props {
  open: boolean
  onClose: () => void
  people: Person[]
  /** Set when logging from someone's own page; skips the picker. */
  person?: Person
}

export function LogHangoutSheet({ open, onClose, people, person }: Props) {
  return (
    <Sheet open={open} onClose={onClose} title="Log a hangout">
      <Form people={people} person={person} onClose={onClose} />
    </Sheet>
  )
}

/** Mounted only while the sheet is open, so each entry starts fresh. */
function Form({ people, person, onClose }: Omit<Props, 'open'>) {
  const [who, setWho] = useState<PersonChoice>(null)
  const [title, setTitle] = useState('')
  const [date, setDate] = useState(toDateOnly(new Date()))
  const [reflection, setReflection] = useState<Reflection | undefined>()
  const [takeaway, setTakeaway] = useState('')
  const log = useLogHangout()
  const createPerson = useCreatePerson()
  const toast = useToast()

  const chosen = REFLECTIONS.find((r) => r.value === reflection)
  const hasPerson = !!person || !!who
  const canSave = hasPerson && !!title.trim() && !!date && !log.isPending

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!canSave) return
    let personId = person?.id
    if (!personId && who?.kind === 'existing') personId = who.id
    if (!personId && who?.kind === 'new') {
      personId = (await createPerson.mutateAsync({ name: who.name })).id
    }
    if (!personId) return
    await log.mutateAsync({
      personId,
      title: title.trim(),
      happenedAt: date,
      reflection,
      takeaway: takeaway.trim() || undefined,
    })
    toast(takeaway.trim() ? 'Logged, and kept as something you’ve noticed.' : 'Logged.')
    onClose()
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      {!person && (
        <PersonPicker
          people={people}
          value={who}
          onChange={setWho}
          label="Who were you with?"
          addLabel={(name) => `Add “${name}”`}
        />
      )}
      <FormField label="What did you do?">
        {(p) => (
          <input
            {...p}
            data-autofocus={person ? true : undefined}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Brunch, a hike, dinner at theirs…"
            className={inputClass}
          />
        )}
      </FormField>
      <FormField label="When">
        {(p) => (
          <input
            {...p}
            type="date"
            value={date}
            max={toDateOnly(new Date())}
            onChange={(e) => setDate(e.target.value)}
            className={inputClass}
          />
        )}
      </FormField>

      <div className="flex flex-col gap-2">
        <p className="text-ink-soft text-sm font-medium">How did it land? (optional)</p>
        <div role="group" aria-label="Reflection" className="flex flex-wrap gap-2">
          {REFLECTIONS.map((r) => {
            const selected = reflection === r.value
            return (
              <button
                key={r.value}
                type="button"
                aria-pressed={selected}
                onClick={() => setReflection(selected ? undefined : r.value)}
                className={cn(
                  'min-h-11 rounded-full border px-4 text-[0.95rem] transition-colors',
                  selected
                    ? 'border-accent bg-accent-soft text-accent-strong'
                    : 'border-line-strong bg-card text-ink hover:bg-sunken',
                )}
              >
                {r.label}
              </button>
            )
          })}
        </div>
        {chosen && <p className="text-ink-faint text-sm">{chosen.hint}</p>}
      </div>

      <FormField
        label={chosen ? `${chosen.prompt} (optional)` : 'Anything worth remembering? (optional)'}
        hint="This is kept with what you’ve noticed, so it can find its way back to you."
      >
        {(p) => (
          <textarea
            {...p}
            rows={3}
            value={takeaway}
            onChange={(e) => setTakeaway(e.target.value)}
            placeholder="She orders the same thing every time. Turns out it’s her grandmother’s recipe."
            className={inputClass}
          />
        )}
      </FormField>

      <Button type="submit" disabled={!canSave} className="self-end">
        Save
      </Button>
    </form>
  )
}
