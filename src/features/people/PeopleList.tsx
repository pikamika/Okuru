import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Avatar, Button, EmptyState } from '@/components'
import { PlusIcon } from '@/components/icons'
import { cn } from '@/lib/cn'
import { usePeople } from '@/hooks'
import { AddPersonSheet } from './AddPersonSheet'

export function PeopleList() {
  const { data: people = [], isLoading } = usePeople()
  const [adding, setAdding] = useState(false)

  return (
    <div>
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-ink-faint mb-1 text-sm">The people in your life</p>
          <h1 className="font-display text-[2rem] leading-tight">People</h1>
        </div>
        <Button variant="soft" onClick={() => setAdding(true)}>
          <PlusIcon width={18} height={18} /> Add
        </Button>
      </div>

      {!isLoading && people.length === 0 && (
        <EmptyState title="No one here yet">
          Add someone you care about, and start keeping what you notice about them.
        </EmptyState>
      )}

      <ul className="flex flex-col gap-1">
        {people.map((p) => (
          <li key={p.id}>
            <NavLink
              to={`/people/${p.id}`}
              className={({ isActive }) =>
                cn(
                  'flex min-h-16 items-center gap-4 rounded-md px-3 py-2 transition-colors',
                  isActive ? 'bg-accent-soft/60' : 'hover:bg-sunken',
                )
              }
            >
              <Avatar name={p.name} size={48} />
              <span className="min-w-0">
                <span className="font-display block text-lg leading-snug">{p.name}</span>
                {p.relationship && (
                  <span className="text-ink-soft block truncate text-sm">{p.relationship}</span>
                )}
              </span>
            </NavLink>
          </li>
        ))}
      </ul>

      <AddPersonSheet open={adding} onClose={() => setAdding(false)} />
    </div>
  )
}
