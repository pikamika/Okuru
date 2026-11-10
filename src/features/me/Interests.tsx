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
  const add = () => {
    const label = text.trim()
    setText('')
    if (!label || value.some((v) => v.toLowerCase() === label.toLowerCase())) return
    onChange([...value, label])
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
        onChange={(e) => setText(e.target.value)}
        onKeyDown={onKey}
        onBlur={add}
        placeholder="Climbing, ceramics, jazz… type and press Enter"
        className={inputClass}
      />
    </div>
  )
}
