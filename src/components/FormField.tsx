import { useId, type ReactNode } from 'react'

export function FormField({
  label,
  children,
  hint,
}: {
  label: string
  hint?: string
  children: (props: { id: string; 'aria-describedby'?: string }) => ReactNode
}) {
  const id = useId()
  const hintId = `${id}-hint`
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-ink-soft text-sm font-medium">
        {label}
      </label>
      {children({ id, 'aria-describedby': hint ? hintId : undefined })}
      {hint && (
        <p id={hintId} className="text-ink-faint text-xs">
          {hint}
        </p>
      )}
    </div>
  )
}

export const inputClass =
  'min-h-11 w-full rounded-md border border-line-strong bg-card px-3.5 py-2.5 text-base text-ink placeholder:text-ink-faint focus-visible:border-accent'
