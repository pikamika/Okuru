import { useState, type FormEvent } from 'react'
import { Button, FormField, Sheet, inputClass, useToast } from '@/components'
import { PersonPicker, type PersonChoice } from '@/features/capture'
import { useCreateReceivedGift } from '@/hooks'
import type { Person } from '@/types'

interface Props {
  open: boolean
  onClose: () => void
  people: Person[]
}

export function AddReceivedGiftSheet({ open, onClose, people }: Props) {
  return (
    <Sheet open={open} onClose={onClose} title="A gift you received">
      <Form people={people} onClose={onClose} />
    </Sheet>
  )
}

/** Mounted only while the sheet is open, so each entry starts fresh. */
function Form({ people, onClose }: Omit<Props, 'open'>) {
  const [title, setTitle] = useState('')
  const [from, setFrom] = useState<PersonChoice>(null)
  const [date, setDate] = useState('')
  const [occasion, setOccasion] = useState('')
  const [note, setNote] = useState('')
  const create = useCreateReceivedGift()
  const toast = useToast()

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    await create.mutateAsync({
      title: title.trim(),
      ...(from?.kind === 'existing'
        ? { fromPersonId: from.id }
        : from?.kind === 'new'
          ? { fromName: from.name }
          : {}),
      receivedAt: date || undefined,
      occasion: occasion.trim() || undefined,
      note: note.trim() || undefined,
    })
    toast('Saved.')
    onClose()
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <FormField label="What was it?">
        {(p) => (
          <input
            {...p}
            data-autofocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="A hand-bound notebook"
            className={inputClass}
          />
        )}
      </FormField>
      <PersonPicker
        people={people}
        value={from}
        onChange={setFrom}
        label="Who gave it to you? (optional)"
        addLabel={(name) => `Just note “${name}”`}
      />
      <FormField label="Occasion (optional)">
        {(p) => (
          <input
            {...p}
            value={occasion}
            onChange={(e) => setOccasion(e.target.value)}
            placeholder="Birthday, a housewarming…"
            className={inputClass}
          />
        )}
      </FormField>
      <FormField label="When (optional)">
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
      <FormField label="How did it feel? (optional)">
        {(p) => (
          <textarea
            {...p}
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Why it stuck with you"
            className={inputClass}
          />
        )}
      </FormField>
      <Button type="submit" disabled={!title.trim() || create.isPending} className="self-end">
        Save
      </Button>
    </form>
  )
}
