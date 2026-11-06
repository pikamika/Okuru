import { useId, useState, type KeyboardEvent } from 'react'
import { cn } from '@/lib/cn'
import { inputClass } from './FormField'

const RELATIONSHIP_PRESETS = [
  'Family',
  'Partner',
  'Close friend',
  'Friend',
  'Colleague',
  'Neighbour',
  'Mentor',
]

interface Props {
  value: string[]
  onChange: (next: string[]) => void
}

/** Pick as many as are true. Anything not in the list can be added in your own words. */
export function RelationshipPicker({ value, onChange }: Props) {
  const [custom, setCustom] = useState('')
  const id = useId()
  const options = [
    ...RELATIONSHIP_PRESETS,
    ...value.filter((v) => !RELATIONSHIP_PRESETS.includes(v)),
  ]

  const toggle = (label: string) =>
    onChange(value.includes(label) ? value.filter((v) => v !== label) : [...value, label])

  const addCustom = () => {
    const label = custom.trim()
    setCustom('')
    if (!label) return
    const existing = options.find((o) => o.toLowerCase() === label.toLowerCase())
    const name = existing ?? label
    if (!value.includes(name)) onChange([...value, name])
  }
  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addCustom()
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div role="group" aria-label="Who are they to you" className="flex flex-wrap gap-2">
        {options.map((o) => {
          const on = value.includes(o)
          return (
            <button
              key={o}
              type="button"
              aria-pressed={on}
              onClick={() => toggle(o)}
              className={cn(
                'min-h-11 rounded-full border px-4 text-[0.95rem] transition-colors',
                on
                  ? 'border-accent bg-accent-soft text-accent-strong'
                  : 'border-line-strong bg-card text-ink hover:bg-sunken',
              )}
            >
              {o}
            </button>
          )
        })}
      </div>
      <div>
        <label htmlFor={id} className="sr-only">
          Add your own
        </label>
        <input
          id={id}
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          onKeyDown={onKey}
          onBlur={addCustom}
          placeholder="Something else? Type it and press Enter"
          className={inputClass}
        />
      </div>
    </div>
  )
}
