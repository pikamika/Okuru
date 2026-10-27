import { useId, useState, type KeyboardEvent } from 'react'
import type { PersonTag, PersonTagKind } from '@/types'
import { CloseIcon } from './icons'
import { inputClass } from './FormField'

const kindLabels: Record<PersonTagKind, string> = {
  interest: 'Interest',
  brand: 'Brand',
  size: 'Size',
  other: 'Other',
}

interface Props {
  value: PersonTag[]
  onChange: (next: PersonTag[]) => void
  label?: string
}

export function TagInput({ value, onChange, label = 'Add a detail' }: Props) {
  const [text, setText] = useState('')
  const [kind, setKind] = useState<PersonTagKind>('interest')
  const id = useId()

  const add = () => {
    const label = text.trim()
    if (!label || value.some((t) => t.label.toLowerCase() === label.toLowerCase()))
      return setText('')
    onChange([...value, { kind, label }])
    setText('')
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
          {value.map((t) => (
            <li
              key={`${t.kind}-${t.label}`}
              className="bg-sunken flex items-center gap-1 rounded-full py-1 pr-1 pl-3 text-sm"
            >
              <span className="sr-only">{kindLabels[t.kind]}: </span>
              <span>{t.label}</span>
              <button
                type="button"
                aria-label={`Remove ${t.label}`}
                onClick={() => onChange(value.filter((x) => x !== t))}
                className="text-ink-soft hover:bg-line grid size-8 place-items-center rounded-full"
              >
                <CloseIcon width={14} height={14} />
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex gap-2">
        <label htmlFor={`${id}-kind`} className="sr-only">
          Kind of detail
        </label>
        <select
          id={`${id}-kind`}
          value={kind}
          onChange={(e) => setKind(e.target.value as PersonTagKind)}
          className={`${inputClass} w-28! shrink-0`}
        >
          {(Object.keys(kindLabels) as PersonTagKind[]).map((k) => (
            <option key={k} value={k}>
              {kindLabels[k]}
            </option>
          ))}
        </select>
        <label htmlFor={`${id}-text`} className="sr-only">
          {label}
        </label>
        <input
          id={`${id}-text`}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKey}
          onBlur={add}
          placeholder="ceramics, size 9, Aesop…"
          className={inputClass}
        />
      </div>
    </div>
  )
}
