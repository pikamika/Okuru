import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Avatar, Button, EmptyState, FormField, inputClass, useToast } from '@/components'
import { ChevronLeftIcon, PlusIcon } from '@/components/icons'
import {
  useConnectionsByPerson,
  useDeleteConnection,
  usePeople,
  usePerson,
  usePromoteConnection,
  useUpdateConnection,
} from '@/hooks'
import type { Connection, Person } from '@/types'
import { AddConnectionSheet } from './AddConnectionSheet'

export function ConnectionsPage() {
  const { personId } = useParams()
  const { data: person, isLoading } = usePerson(personId)
  const { data: people = [] } = usePeople()
  const { data: connections = [] } = useConnectionsByPerson(personId)
  const [adding, setAdding] = useState(false)

  if (isLoading) return <p className="text-ink-faint">Opening…</p>
  if (!person) return <EmptyState title="We couldn’t find them" />

  return (
    <article className="anim-fade">
      <Link
        to={`/people/${person.id}`}
        className="text-ink-soft hover:text-ink mb-1 -ml-2 inline-flex min-h-11 items-center gap-1 rounded-full px-2 text-sm"
      >
        <ChevronLeftIcon width={18} height={18} /> {person.name}
      </Link>

      <header className="mb-2 flex items-end justify-between gap-4">
        <div>
          <p className="eyebrow mb-1.5">{person.name}</p>
          <h1 className="font-display text-display">Connections</h1>
        </div>
        <Button variant="soft" onClick={() => setAdding(true)}>
          <PlusIcon width={18} height={18} /> Add
        </Button>
      </header>
      <p className="text-ink-soft mb-8">
        Who {person.name} is close to: siblings, friends from the same circle, anyone who might know
        each other.
      </p>

      {connections.length === 0 ? (
        <EmptyState title="No connections yet">
          Note a sibling, a friend group, or someone {person.name} would get on with.
        </EmptyState>
      ) : (
        <ul className="flex flex-col gap-4">
          {connections.map((c) => (
            <ConnectionCard key={c.id} connection={c} currentId={person.id} people={people} />
          ))}
        </ul>
      )}

      <AddConnectionSheet
        open={adding}
        onClose={() => setAdding(false)}
        person={person}
        others={people.filter((p) => p.id !== person.id)}
      />
    </article>
  )
}

function ConnectionCard({
  connection: c,
  currentId,
  people,
}: {
  connection: Connection
  currentId: string
  people: Person[]
}) {
  const update = useUpdateConnection()
  const remove = useDeleteConnection()
  const promote = usePromoteConnection()
  const toast = useToast()
  const [note, setNote] = useState(c.note ?? '')

  const otherId = c.personId === currentId ? c.otherPersonId : c.personId
  const other = otherId ? people.find((p) => p.id === otherId) : undefined
  const name = other?.name ?? c.otherName ?? 'Someone'

  return (
    <li className="border-line bg-card rounded-lg border p-4">
      <div className="flex items-center gap-3">
        <Avatar name={name} size={40} />
        <div className="min-w-0 flex-1">
          {other ? (
            <Link to={`/people/${other.id}`} className="font-display text-title hover:underline">
              {name}
            </Link>
          ) : (
            <p className="font-display text-title">{name}</p>
          )}
          <p className="text-ink-soft text-sm">
            {c.label ?? 'Connected'}
            {!other && ' · not in your people yet'}
          </p>
        </div>
      </div>

      <div className="mt-3">
        <FormField label="Notes">
          {(p) => (
            <textarea
              {...p}
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              onBlur={() =>
                note.trim() !== (c.note ?? '') &&
                update.mutate({ id: c.id, patch: { note: note.trim() || undefined } })
              }
              placeholder="Add a note"
              className={inputClass}
            />
          )}
        </FormField>
      </div>

      <div className="mt-1 -ml-3 flex flex-wrap gap-1">
        {!other && (
          <Button
            variant="ghost"
            onClick={() =>
              promote.mutate(c, { onSuccess: () => toast(`${name} has a notebook now.`) })
            }
          >
            Add to your people
          </Button>
        )}
        <Button
          variant="ghost"
          onClick={() => {
            if (window.confirm('Remove this connection?')) remove.mutate(c.id)
          }}
        >
          Remove
        </Button>
      </div>
    </li>
  )
}
