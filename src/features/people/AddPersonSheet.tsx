import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, FormField, Sheet, inputClass, useToast } from '@/components'
import { useCreatePerson } from '@/hooks'

export function AddPersonSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [name, setName] = useState('')
  const [relationship, setRelationship] = useState('')
  const create = useCreatePerson()
  const navigate = useNavigate()
  const toast = useToast()

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    const person = await create.mutateAsync({
      name: name.trim(),
      relationship: relationship.trim() || undefined,
    })
    setName('')
    setRelationship('')
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
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
            />
          )}
        </FormField>
        <FormField label="Who are they to you? (optional)">
          {(p) => (
            <input
              {...p}
              value={relationship}
              onChange={(e) => setRelationship(e.target.value)}
              placeholder="sister, old friend, neighbour…"
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
