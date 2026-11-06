import { useState, type FormEvent } from 'react'
import { Button, FormField, Sheet, inputClass, useToast } from '@/components'
import { PersonPicker, type PersonChoice } from '@/features/capture'
import { useCreateConnection } from '@/hooks'
import type { Person } from '@/types'

const CONNECTION_LABELS = [
  'Sibling',
  'Partner',
  'Family',
  'Same friend group',
  'Friends',
  'Colleagues',
  'Housemates',
]
const OTHER = '__other'

interface Props {
  open: boolean
  onClose: () => void
  person: Person
  /** Everyone else in the notebook. */
  others: Person[]
}

export function AddConnectionSheet({ open, onClose, person, others }: Props) {
  return (
    <Sheet open={open} onClose={onClose} title={`Who does ${person.name} know?`}>
      <AddConnectionForm person={person} others={others} onClose={onClose} />
    </Sheet>
  )
}

/** Mounted only while the sheet is open, so each add starts fresh. */
function AddConnectionForm({ person, others, onClose }: Omit<Props, 'open'>) {
  const [who, setWho] = useState<PersonChoice>(null)
  const [label, setLabel] = useState('')
  const [custom, setCustom] = useState('')
  const [note, setNote] = useState('')
  const create = useCreateConnection()
  const toast = useToast()

  const finalLabel = (label === OTHER ? custom : label).trim() || undefined

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!who) return
    await create.mutateAsync({
      personId: person.id,
      ...(who.kind === 'existing' ? { otherPersonId: who.id } : { otherName: who.name }),
      label: finalLabel,
      note: note.trim() || undefined,
    })
    toast('Connection noted.')
    onClose()
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <PersonPicker
        people={others}
        value={who}
        onChange={setWho}
        label="Who?"
        addLabel={(name) => `Just note “${name}”`}
      />
      <p className="text-ink-faint -mt-2 text-xs">
        Not in Okuru? Type a name to note them anyway. You can add them as a person later.
      </p>
      <FormField label="How are they connected? (optional)">
        {(p) => (
          <select
            {...p}
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className={inputClass}
          >
            <option value="">Not sure yet</option>
            {CONNECTION_LABELS.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
            <option value={OTHER}>Something else…</option>
          </select>
        )}
      </FormField>
      {label === OTHER && (
        <FormField label="In your words">
          {(p) => (
            <input
              {...p}
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              placeholder="Old flatmates, cousins…"
              className={inputClass}
            />
          )}
        </FormField>
      )}
      <FormField label="Notes (optional)">
        {(p) => (
          <textarea
            {...p}
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="How they know each other, how close they are…"
            className={inputClass}
          />
        )}
      </FormField>
      <Button type="submit" disabled={!who || create.isPending} className="self-end">
        Save
      </Button>
    </form>
  )
}
