import { useState, type KeyboardEvent } from 'react'
import { inputClass } from '@/components'
import { CloseIcon } from '@/components/icons'

export function Interests({
  value,
  onChange,
}: {
  value: string[]
  onChange: (next: string[]) => void
}) {
  const [text, setText] = useState('')

  /** "Volleyball, Dogs" becomes two interests. Blanks and repeats are dropped. */
  const commit = (raw: string) => {
    const next = [...value]
    for (const part of raw.split(',')) {
      const label = part.trim()
      if (label && !next.some((v) => v.toLowerCase() === label.toLowerCase())) next.push(label)
    }
    if (next.length !== value.length) onChange(next)
  }
  const add = () => {
    commit(text)
    setText('')
  }
  /** Typing a comma turns what came before it into badges straight away. */
  const onType = (raw: string) => {
    const cut = raw.lastIndexOf(',')
    if (cut === -1) return setText(raw)
    commit(raw.slice(0, cut))
    setText(raw.slice(cut + 1).trimStart())
  }
  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      add()
    }
  }
  return (
    <div className="flex flex-col gap-3">
      {value.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {value.map((v) => (
            <li
              key={v}
              className="border-line-strong bg-card flex min-h-11 items-center gap-1 rounded-full border pr-1 pl-4"
            >
              {v}
              <button
                type="button"
                aria-label={`Remove ${v}`}
                onClick={() => onChange(value.filter((x) => x !== v))}
                className="text-ink-soft hover:bg-sunken grid size-9 place-items-center rounded-full"
              >
                <CloseIcon width={16} height={16} />
              </button>
            </li>
          ))}
        </ul>
      )}
      <label htmlFor="interest-input" className="sr-only">
        Add an interest
      </label>
      <input
        id="interest-input"
        value={text}
        onChange={(e) => onType(e.target.value)}
        onKeyDown={onKey}
        onBlur={add}
        placeholder="Volleyball, dogs, jazz… separate with commas"
        className={inputClass}
      />
    </div>
  )
}
