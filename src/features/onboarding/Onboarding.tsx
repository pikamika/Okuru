import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, FormField, RelationshipPicker, inputClass } from '@/components'
import { useCreateOccasion, useCreatePerson, useSetOnboarded } from '@/hooks'

interface Draft {
  name: string
  relationships: string[]
  birthday: string
}

const empty = (): Draft => ({ name: '', relationships: [], birthday: '' })

export function Onboarding() {
  const [step, setStep] = useState<'hello' | 'people'>('hello')
  const [drafts, setDrafts] = useState<Draft[]>([empty(), empty(), empty()])
  const [saving, setSaving] = useState(false)

  const navigate = useNavigate()
  const createPerson = useCreatePerson()
  const createOccasion = useCreateOccasion()
  const setOnboarded = useSetOnboarded()

  const filled = drafts.filter((d) => d.name.trim())

  async function finish(skip: boolean) {
    setSaving(true)
    if (!skip) {
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
              <Button onClick={() => setStep('people')}>Begin with a few people</Button>
              <Button variant="ghost" onClick={() => void finish(true)} disabled={saving}>
                Skip for now
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
