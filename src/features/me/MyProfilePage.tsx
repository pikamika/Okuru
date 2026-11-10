import { useState, type FormEvent, type KeyboardEvent } from 'react'
import { Link } from 'react-router-dom'
import { Avatar, Button, FormField, Page, Section, inputClass, useToast } from '@/components'
import { CloseIcon, PlusIcon } from '@/components/icons'
import { isSupabaseConfigured } from '@/data/supabase/client'
import { useAuth } from '@/features/auth'
import {
  useCreateSelfConnection,
  useDeleteReceivedGift,
  useDeleteSelfConnection,
  usePeople,
  useProfile,
  useReceivedGifts,
  useSelfConnections,
  useUpdateProfile,
  useUpdateSelfConnection,
} from '@/hooks'
import { formatDate } from '@/lib/dates'
import { MBTI_TYPES } from '@/lib/mbti'
import type { Person, ReceivedGift, SelfConnection, UserProfile } from '@/types'
import { AddReceivedGiftSheet } from './AddReceivedGiftSheet'

export function MyProfilePage() {
  const { data: profile } = useProfile()
  if (!profile) {
    return (
      <Page>
        <p className="text-ink-faint">Opening…</p>
      </Page>
    )
  }
  return <MyProfile profile={profile} />
}

function MyProfile({ profile }: { profile: UserProfile }) {
  const { session, signOut } = useAuth()
  const update = useUpdateProfile()
  const email = session?.user.email
  const [first, setFirst] = useState(profile.firstName ?? '')
  const [last, setLast] = useState(profile.lastName ?? '')
  const [notes, setNotes] = useState(profile.notes ?? '')
  const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(' ')

  const saveText = (key: 'firstName' | 'lastName' | 'notes', value: string) => {
    const next = value.trim() || undefined
    if (next !== profile[key]) update.mutate({ [key]: next })
  }

  return (
    <Page>
      <header className="mb-2 flex items-center gap-4">
        <Avatar name={fullName || email || 'You'} size={64} />
        <div className="min-w-0 flex-1">
          <p className="eyebrow mb-1.5">Your profile</p>
          <h1 className="font-display text-display">{fullName || 'You'}</h1>
          {email && <p className="text-ink-soft truncate">{email}</p>}
        </div>
      </header>

      <Section title="About you">
        <div className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="First name">
              {(p) => (
                <input
                  {...p}
                  autoComplete="given-name"
                  value={first}
                  onChange={(e) => setFirst(e.target.value)}
                  onBlur={() => saveText('firstName', first)}
                  className={inputClass}
                />
              )}
            </FormField>
            <FormField label="Last name">
              {(p) => (
                <input
                  {...p}
                  autoComplete="family-name"
                  value={last}
                  onChange={(e) => setLast(e.target.value)}
                  onBlur={() => saveText('lastName', last)}
                  className={inputClass}
                />
              )}
            </FormField>
          </div>
          {email && (
            <FormField label="Email" hint="This is how you sign in.">
              {(p) => (
                <input {...p} value={email} readOnly className={`${inputClass} text-ink-soft`} />
              )}
            </FormField>
          )}
          <FormField
            label="Personality type (optional)"
            hint="MBTI, if you know it. Only ever a hint."
          >
            {(p) => (
              <select
                {...p}
                value={profile.mbti ?? ''}
                onChange={(e) => update.mutate({ mbti: e.target.value || undefined })}
                className={inputClass}
              >
                <option value="">Not sure</option>
                {MBTI_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            )}
          </FormField>
          <FormField label="Notes">
            {(p) => (
              <textarea
                {...p}
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                onBlur={() => saveText('notes', notes)}
                placeholder="Anything about you that helps the people who give you gifts"
                className={inputClass}
              />
            )}
          </FormField>
        </div>
      </Section>

      <Section title="Interests">
        <Interests
          value={profile.interests}
          onChange={(interests) => update.mutate({ interests })}
        />
      </Section>

      <MyConnections />
      <ReceivedGifts />

      {isSupabaseConfigured && session && (
        <div className="mt-12">
          <Button variant="soft" onClick={() => void signOut()}>
            Sign out
          </Button>
        </div>
      )}
    </Page>
  )
}

function Interests({ value, onChange }: { value: string[]; onChange: (next: string[]) => void }) {
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

function MyConnections() {
  const { data: people = [] } = usePeople()
  const { data: links = [] } = useSelfConnections()
  const create = useCreateSelfConnection()
  const [personId, setPersonId] = useState('')
  const [label, setLabel] = useState('')

  const linked = new Set(links.map((l) => l.personId))
  const available = people.filter((p) => !linked.has(p.id))

  async function add(e: FormEvent) {
    e.preventDefault()
    if (!personId) return
    await create.mutateAsync({ personId, label: label.trim() || undefined })
    setPersonId('')
    setLabel('')
  }

  return (
    <Section title="Connections">
      {links.length === 0 ? (
        <p className="text-ink-soft">
          The people closest to you, in your own words. They stay on your profile only.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {links.map((l) => (
            <ConnectionRow key={l.id} link={l} person={people.find((p) => p.id === l.personId)} />
          ))}
        </ul>
      )}
      {available.length > 0 ? (
        <form onSubmit={add} className="mt-4 flex flex-col gap-2 sm:flex-row">
          <label htmlFor="self-link-person" className="sr-only">
            Person
          </label>
          <select
            id="self-link-person"
            value={personId}
            onChange={(e) => setPersonId(e.target.value)}
            className={inputClass}
          >
            <option value="">Add someone…</option>
            {available.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <label htmlFor="self-link-label" className="sr-only">
            How are they connected to you
          </label>
          <input
            id="self-link-label"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Best friend, climbing partner…"
            className={inputClass}
          />
          <Button type="submit" variant="soft" disabled={!personId || create.isPending}>
            <PlusIcon width={18} height={18} /> Add
          </Button>
        </form>
      ) : (
        <p className="text-ink-faint mt-3 text-sm">
          {people.length === 0 ? (
            <>
              Add people in your{' '}
              <Link to="/people" className="underline">
                notebook
              </Link>{' '}
              first.
            </>
          ) : (
            'Everyone in your notebook is here.'
          )}
        </p>
      )}
    </Section>
  )
}

function ConnectionRow({ link, person }: { link: SelfConnection; person?: Person }) {
  const update = useUpdateSelfConnection()
  const remove = useDeleteSelfConnection()
  const [label, setLabel] = useState(link.label ?? '')
  const [note, setNote] = useState(link.note ?? '')
  const name = person?.name ?? 'Someone'
  return (
    <li className="border-line bg-card rounded-lg border p-4">
      <div className="flex items-center gap-3">
        <Avatar name={name} size={40} />
        {person ? (
          <Link
            to={`/people/${person.id}`}
            className="font-display text-title min-w-0 flex-1 truncate hover:underline"
          >
            {name}
          </Link>
        ) : (
          <p className="font-display text-title min-w-0 flex-1 truncate">{name}</p>
        )}
        <button
          type="button"
          onClick={() => remove.mutate(link.id)}
          className="text-ink-soft hover:bg-sunken min-h-11 rounded-full px-3 text-sm"
        >
          Remove
        </button>
      </div>
      <div className="mt-3 flex flex-col gap-3">
        <FormField label="How are they connected to you?">
          {(p) => (
            <input
              {...p}
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              onBlur={() =>
                label.trim() !== (link.label ?? '') &&
                update.mutate({ id: link.id, patch: { label: label.trim() || undefined } })
              }
              className={inputClass}
            />
          )}
        </FormField>
        <FormField label="Notes">
          {(p) => (
            <textarea
              {...p}
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              onBlur={() =>
                note.trim() !== (link.note ?? '') &&
                update.mutate({ id: link.id, patch: { note: note.trim() || undefined } })
              }
              className={inputClass}
            />
          )}
        </FormField>
      </div>
    </li>
  )
}

function ReceivedGifts() {
  const { data: gifts = [] } = useReceivedGifts()
  const { data: people = [] } = usePeople()
  const remove = useDeleteReceivedGift()
  const toast = useToast()
  const [adding, setAdding] = useState(false)

  const sorted = [...gifts].sort((a, b) =>
    (b.receivedAt ?? b.createdAt).localeCompare(a.receivedAt ?? a.createdAt),
  )

  return (
    <Section
      title="Gifts you’ve received"
      action={
        <Button variant="ghost" onClick={() => setAdding(true)}>
          Log one
        </Button>
      }
    >
      {sorted.length === 0 ? (
        <p className="text-ink-soft">
          Things people have given you, and how they felt. It’s nice to remember.
        </p>
      ) : (
        <ul className="flex flex-col gap-4">
          {sorted.map((g) => (
            <ReceivedGiftRow
              key={g.id}
              gift={g}
              from={people.find((p) => p.id === g.fromPersonId)}
              onRemove={() => {
                remove.mutate(g.id)
                toast('Removed')
              }}
            />
          ))}
        </ul>
      )}
      <AddReceivedGiftSheet open={adding} onClose={() => setAdding(false)} people={people} />
    </Section>
  )
}

function ReceivedGiftRow({
  gift: g,
  from,
  onRemove,
}: {
  gift: ReceivedGift
  from?: Person
  onRemove: () => void
}) {
  const giver = from?.name ?? g.fromName
  const meta = [giver && `From ${giver}`, g.occasion, g.receivedAt && formatDate(g.receivedAt)]
    .filter(Boolean)
    .join(' · ')
  return (
    <li className="border-line bg-card rounded-md border p-4">
      <p className="font-display text-lg">{g.title}</p>
      {meta && (
        <p className="text-ink-faint text-sm">
          {from ? (
            <>
              From{' '}
              <Link to={`/people/${from.id}`} className="underline">
                {from.name}
              </Link>
              {meta.slice(`From ${from.name}`.length)}
            </>
          ) : (
            meta
          )}
        </p>
      )}
      {g.note && <p className="text-ink-soft mt-1">{g.note}</p>}
      <button
        type="button"
        onClick={onRemove}
        className="text-ink-soft hover:bg-sunken mt-1 -ml-3 min-h-11 rounded-full px-3 text-sm"
      >
        Remove
      </button>
    </li>
  )
}
