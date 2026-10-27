import { useId, useState } from 'react'
import { cn } from '@/lib/cn'
import type { Person } from '@/types'
import { inputClass } from '@/components/FormField'

export type PersonChoice = { kind: 'existing'; id: string } | { kind: 'new'; name: string } | null

interface Props {
  people: Person[]
  value: PersonChoice
  onChange: (choice: PersonChoice) => void
}

/** Pick someone, or type to search. A name that isn't in the list can be added on the spot. */
export function PersonPicker({ people, value, onChange }: Props) {
  const [query, setQuery] = useState('')
  const id = useId()
  const q = query.trim()
  const matches = q ? people.filter((p) => p.name.toLowerCase().includes(q.toLowerCase())) : people
  const exact = people.some((p) => p.name.toLowerCase() === q.toLowerCase())

  const pill = (selected: boolean) =>
    cn(
      'min-h-11 shrink-0 rounded-full border px-4 text-[0.95rem] transition-colors',
      selected
        ? 'border-accent bg-accent-soft text-accent-strong'
        : 'border-line-strong bg-card text-ink hover:bg-sunken',
    )

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-ink-soft text-sm font-medium">
        Who is this about?
      </label>
      <input
        id={id}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search or type a name"
        autoComplete="off"
        className={inputClass}
      />
      <div role="group" aria-label="People" className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1">
        {matches.map((p) => {
          const selected = value?.kind === 'existing' && value.id === p.id
          return (
            <button
              key={p.id}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange({ kind: 'existing', id: p.id })}
              className={pill(selected)}
            >
              {p.name}
            </button>
          )
        })}
        {q && !exact && (
          <button
            type="button"
            aria-pressed={value?.kind === 'new'}
            onClick={() => onChange({ kind: 'new', name: q })}
            className={pill(value?.kind === 'new' && value.name === q)}
          >
            Add “{q}”
          </button>
        )}
      </div>
    </div>
  )
}
