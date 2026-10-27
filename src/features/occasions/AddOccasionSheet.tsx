import { useState, type FormEvent } from 'react'
import { Button, FormField, Sheet, inputClass, useToast } from '@/components'
import { useCreateOccasion } from '@/hooks'
import type { OccasionKind } from '@/types'

interface Props {
  open: boolean
  personId: string
  personName: string
  onClose: () => void
}

const kinds: Array<{ value: OccasionKind; label: string }> = [
  { value: 'birthday', label: 'Birthday' },
  { value: 'anniversary', label: 'Anniversary' },
  { value: 'milestone', label: 'Milestone' },
  { value: 'custom', label: 'Something else' },
]

export function AddOccasionSheet({ open, personId, personName, onClose }: Props) {
  const [kind, setKind] = useState<OccasionKind>('birthday')
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [yearKnown, setYearKnown] = useState(true)
  const [recurs, setRecurs] = useState(true)
  const create = useCreateOccasion()
  const toast = useToast()

  const effectiveTitle = title.trim() || (kind === 'birthday' ? `${personName}’s birthday` : '')

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!date || !effectiveTitle) return
    await create.mutateAsync({
      personId,
      kind,
      title: effectiveTitle,
      date,
      yearKnown,
      recurs: recurs ? 'yearly' : 'none',
    })
    setTitle('')
    setDate('')
    toast('Added.')
    onClose()
  }

  return (
    <Sheet open={open} onClose={onClose} title="A moment to remember">
      <form onSubmit={submit} className="flex flex-col gap-4">
        <FormField label="What kind?">
          {(p) => (
            <select
              {...p}
              value={kind}
              onChange={(e) => setKind(e.target.value as OccasionKind)}
              className={inputClass}
            >
              {kinds.map((k) => (
                <option key={k.value} value={k.value}>
                  {k.label}
                </option>
              ))}
            </select>
          )}
        </FormField>
        <FormField label="Name it">
          {(p) => (
            <input
              {...p}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={kind === 'birthday' ? `${personName}’s birthday` : 'Her first marathon'}
              className={inputClass}
            />
          )}
        </FormField>
        <FormField label="Date">
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
        <label className="flex min-h-11 items-center gap-3 text-[0.95rem]">
          <input
            type="checkbox"
            checked={!yearKnown}
            onChange={(e) => setYearKnown(!e.target.checked)}
            className="size-5 accent-[var(--accent)]"
          />
          I don’t know the year
        </label>
        <label className="flex min-h-11 items-center gap-3 text-[0.95rem]">
          <input
            type="checkbox"
            checked={recurs}
            onChange={(e) => setRecurs(e.target.checked)}
            className="size-5 accent-[var(--accent)]"
          />
          Happens every year
        </label>
        <Button
          type="submit"
          disabled={!date || !effectiveTitle || create.isPending}
          className="self-end"
        >
          Add
        </Button>
      </form>
    </Sheet>
  )
}
