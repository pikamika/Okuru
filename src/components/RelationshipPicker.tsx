import { useId, useState, type KeyboardEvent } from 'react'
import { cn } from '@/lib/cn'
import { inputClass } from './FormField'

interface Group {
  label: string
  /** Shown once the group is picked, to say more about it. */
  more?: { prompt: string; options: string[] }
}

/** Most entries are friends, so Friend comes first. */
const GROUPS: Group[] = [
  {
    label: 'Friend',
    more: {
      prompt: 'What kind of friend?',
      options: [
        'Close friend',
        'Childhood friend',
        'High school friend',
        'College friend',
        'Work friend',
        'Through a friend',
      ],
    },
  },
  {
    label: 'Family',
    more: {
      prompt: 'Which family?',
      options: [
        'Mother',
        'Father',
        'Sister',
        'Brother',
        'Grandparent',
        'Aunt',
        'Uncle',
        'Cousin',
        'In-law',
      ],
    },
  },
  { label: 'Partner' },
  {
    label: 'Colleague',
    more: {
      prompt: 'What kind of colleague?',
      options: ['Manager', 'Teammate', 'Former colleague'],
    },
  },
  { label: 'Neighbour' },
  { label: 'Mentor' },
]

const KNOWN = new Set(GROUPS.flatMap((g) => [g.label, ...(g.more?.options ?? [])]))

interface Props {
  value: string[]
  onChange: (next: string[]) => void
}

/** Pick as many as are true. Anything not in the list can be added in your own words. */
export function RelationshipPicker({ value, onChange }: Props) {
  const [custom, setCustom] = useState('')
  const id = useId()
  // Anything typed in, or saved before these groups existed, shows as its own pill.
  const extras = value.filter((v) => !KNOWN.has(v))
  const options = [...GROUPS.map((g) => g.label), ...extras]

  const toggle = (label: string) =>
    onChange(value.includes(label) ? value.filter((v) => v !== label) : [...value, label])

  /** Turning a group off also drops the details chosen under it. */
  const toggleGroup = (group: Group) => {
    if (!value.includes(group.label)) return onChange([...value, group.label])
    const details = group.more?.options ?? []
    onChange(value.filter((v) => v !== group.label && !details.includes(v)))
  }

  const addCustom = () => {
    const label = custom.trim()
    setCustom('')
    if (!label) return
    const existing = [...KNOWN, ...extras].find((o) => o.toLowerCase() === label.toLowerCase())
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
              onClick={() => {
                const group = GROUPS.find((g) => g.label === o)
                return group ? toggleGroup(group) : toggle(o)
              }}
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
      {GROUPS.filter((g) => g.more && value.includes(g.label)).map((g) => (
        <div key={g.label} className="anim-fade border-line-strong ml-3 border-l-2 pl-4">
          <p className="text-ink-soft mb-2 text-sm">{g.more?.prompt} (optional)</p>
          <div role="group" aria-label={g.more?.prompt} className="flex flex-wrap gap-2">
            {g.more?.options.map((o) => {
              const on = value.includes(o)
              return (
                <button
                  key={o}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggle(o)}
                  className={cn(
                    'min-h-11 rounded-full border px-3.5 text-sm transition-colors',
                    on
                      ? 'border-accent bg-accent-soft text-accent-strong'
                      : 'border-line bg-card text-ink-soft hover:bg-sunken',
                  )}
                >
                  {o}
                </button>
              )
            })}
          </div>
        </div>
      ))}
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
