import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, FormField, RelationshipPicker, Sheet, inputClass, useToast } from '@/components'
import { useCreatePerson } from '@/hooks'

export function AddPersonSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [name, setName] = useState('')
  const [relationships, setRelationships] = useState<string[]>([])
  const [notes, setNotes] = useState('')
  const create = useCreatePerson()
  const navigate = useNavigate()
  const toast = useToast()

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    const person = await create.mutateAsync({
      name: name.trim(),
      relationships,
      notes: notes.trim() || undefined,
    })
    setName('')
    setRelationships([])
    setNotes('')
    toast(`${person.name} has a notebook now.`)
    onClose()
    navigate(`/people/${person.id}`)
  }

  return (
    <Sheet open={open} onClose={onClose} title="Someone you care about">
      <form onSubmit={submit} className="flex flex-col gap-4">
        <FormField label="Name">
          {(p) => (
            <input
              {...p}
              data-autofocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
            />
          )}
        </FormField>
        <div className="flex flex-col gap-1.5">
          <p className="text-ink-soft text-sm font-medium">
            Who are they to you? (pick any that fit)
          </p>
          <RelationshipPicker value={relationships} onChange={setRelationships} />
        </div>
        <FormField label="Notes (optional)" hint="Anything specific about who they are to you.">
          {(p) => (
            <textarea
              {...p}
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Met at university. Always remembers my birthday."
              className={inputClass}
            />
          )}
        </FormField>
        <Button type="submit" disabled={!name.trim() || create.isPending} className="self-end">
          Start their notebook
        </Button>
      </form>
    </Sheet>
  )
}
