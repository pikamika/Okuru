import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, FormField, RelationshipPicker, inputClass } from '@/components'
import { Interests } from '@/features/me'
import { MBTI_TYPES } from '@/lib/mbti'
import { useCreateOccasion, useCreatePerson, useSetOnboarded, useUpdateProfile } from '@/hooks'
import type { UserProfile } from '@/types'

interface Draft {
  name: string
  relationships: string[]
  birthday: string
}

const emptyYou = (): UserProfile => ({ interests: [] })
const empty = (): Draft => ({ name: '', relationships: [], birthday: '' })

export function Onboarding() {
  const [step, setStep] = useState<'hello' | 'you' | 'people'>('hello')
  const [you, setYou] = useState<UserProfile>(emptyYou())
  const [drafts, setDrafts] = useState<Draft[]>([empty(), empty(), empty()])
  const [saving, setSaving] = useState(false)

  const navigate = useNavigate()
  const createPerson = useCreatePerson()
  const createOccasion = useCreateOccasion()
  const setOnboarded = useSetOnboarded()
  const updateProfile = useUpdateProfile()

  const filled = drafts.filter((d) => d.name.trim())

  async function finish(skip: boolean) {
    setSaving(true)
    if (!skip) {
      const hasYou =
        you.firstName || you.lastName || you.mbti || you.birthday || you.interests.length > 0
      if (hasYou) await updateProfile.mutateAsync(you)
      for (const d of filled) {
        const person = await createPerson.mutateAsync({
          name: d.name.trim(),
          relationships: d.relationships,
        })
        if (d.birthday) {
          await createOccasion.mutateAsync({
            personId: person.id,
            kind: 'birthday',
            title: `${person.name}’s birthday`,
            date: d.birthday,
            yearKnown: false,
            recurs: 'yearly',
          })
        }
      }
    }
    await setOnboarded.mutateAsync(true)
    navigate('/', { replace: true })
  }

  const set = (i: number, patch: Partial<Draft>) =>
    setDrafts((ds) => ds.map((d, idx) => (idx === i ? { ...d, ...patch } : d)))

  return (
    <div className="pt-safe pb-safe min-h-dvh">
      <div className="mx-auto flex min-h-dvh max-w-xl flex-col px-6 py-10">
        {step === 'hello' ? (
          <div className="anim-fade my-auto">
            <svg aria-hidden viewBox="0 0 120 40" className="text-accent mb-8 w-28" fill="none">
              <path
                d="M3 30C26 -6 50 44 74 14s30-10 43-8"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <circle cx="117" cy="6" r="3" fill="currentColor" />
            </svg>
            <h1 className="font-display text-display md:text-5xl">Make thoughtfulness tangible.</h1>
            <p className="text-ink-soft mt-4 text-lg leading-relaxed">
              Okuru is a small notebook for the people you care about. You jot down what you notice,
              and it finds its way back to you when a moment draws near.
            </p>
            <div className="mt-10 flex flex-col gap-2 sm:flex-row sm:items-center">
              <Button onClick={() => setStep('you')}>Begin</Button>
              <Button variant="ghost" onClick={() => void finish(true)} disabled={saving}>
                Skip for now
              </Button>
            </div>
          </div>
        ) : step === 'you' ? (
          <div className="anim-fade">
            <p className="eyebrow mb-1.5">First, you</p>
            <h1 className="font-display text-display">A little about you</h1>
            <p className="text-ink-soft mt-2">
              All optional. It helps the people you give to know you, and helps Okuru make
              suggestions that fit.
            </p>

            <div className="mt-8 flex flex-col gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="First name">
                  {(p) => (
                    <input
                      {...p}
                      autoComplete="given-name"
                      value={you.firstName ?? ''}
                      onChange={(e) => setYou({ ...you, firstName: e.target.value })}
                      className={inputClass}
                    />
                  )}
                </FormField>
                <FormField label="Last name">
                  {(p) => (
                    <input
                      {...p}
                      autoComplete="family-name"
                      value={you.lastName ?? ''}
                      onChange={(e) => setYou({ ...you, lastName: e.target.value })}
                      className={inputClass}
                    />
                  )}
                </FormField>
              </div>
              <FormField label="Your birthday (optional)" hint="The year doesn’t matter.">
                {(p) => (
                  <input
                    {...p}
                    type="date"
                    value={you.birthday ?? ''}
                    onChange={(e) => setYou({ ...you, birthday: e.target.value || undefined })}
                    className={inputClass}
                  />
                )}
              </FormField>
              <FormField
                label="Personality type (optional)"
                hint="MBTI, if you know it. Only ever a hint."
              >
                {(p) => (
                  <select
                    {...p}
                    value={you.mbti ?? ''}
                    onChange={(e) => setYou({ ...you, mbti: e.target.value || undefined })}
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
              <div className="flex flex-col gap-1.5">
                <p className="text-ink-soft text-sm font-medium">Interests (optional)</p>
                <Interests
                  value={you.interests}
                  onChange={(interests) => setYou({ ...you, interests })}
                />
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:items-center">
              <Button onClick={() => setStep('people')}>Next</Button>
              <Button variant="ghost" onClick={() => setStep('people')}>
                Skip this
              </Button>
            </div>
          </div>
        ) : (
          <div className="anim-fade">
            <p className="eyebrow mb-1.5">Two or three is plenty</p>
            <h1 className="font-display text-display">Who’s on your mind?</h1>
            <p className="text-ink-soft mt-2">
              Just a name and who they are to you. You can add the little things you notice later.
            </p>

            <div className="mt-8 flex flex-col gap-6">
              {drafts.map((d, i) => (
                <fieldset key={i} className="paper-card p-5">
                  <legend className="font-display px-2 text-lg">Person {i + 1}</legend>
                  <div className="flex flex-col gap-4">
                    <FormField label="Name">
                      {(p) => (
                        <input
                          {...p}
                          value={d.name}
                          onChange={(e) => set(i, { name: e.target.value })}
                          className={inputClass}
                        />
                      )}
                    </FormField>
                    <div>
                      <p className="text-ink-soft mb-1.5 text-sm font-medium">
                        Who are they to you? (pick any that fit)
                      </p>
                      <RelationshipPicker
                        value={d.relationships}
                        onChange={(relationships) => set(i, { relationships })}
                      />
                    </div>
                    <FormField label="Their birthday (optional)" hint="The year doesn’t matter.">
                      {(p) => (
                        <input
                          {...p}
                          type="date"
                          value={d.birthday}
                          onChange={(e) => set(i, { birthday: e.target.value })}
                          className={inputClass}
                        />
                      )}
                    </FormField>
                  </div>
                </fieldset>
              ))}
            </div>

            <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:items-center">
              <Button onClick={() => void finish(false)} disabled={filled.length === 0 || saving}>
                Start my notebook
              </Button>
              <Button variant="ghost" onClick={() => void finish(true)} disabled={saving}>
                Skip for now
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
