import type {
  ChecklistItem,
  GiftIdea,
  GiftProject,
  MilestoneSuggestion,
  Occasion,
  Person,
  Thought,
} from '@/types'
import { addDays, newId, toDateOnly } from '@/lib/dates'

export interface Db {
  people: Person[]
  thoughts: Thought[]
  occasions: Occasion[]
  giftIdeas: GiftIdea[]
  giftProjects: GiftProject[]
  checklist: ChecklistItem[]
  milestones: MilestoneSuggestion[]
  settings: { onboarded: boolean }
}

/** Sample data, dated relative to today so Home always has something real to resurface. */
export function buildSeed(): Db {
  const today = new Date()
  const ago = (days: number) => addDays(today, -days).toISOString()
  const ahead = (days: number) => toDateOnly(addDays(today, days))
  const stamp = ago(200)
  const base = { createdAt: stamp, updatedAt: stamp }

  const priya = newId()
  const mum = newId()
  const daniel = newId()
  const hana = newId()

  const people: Person[] = [
    {
      ...base,
      id: priya,
      name: 'Priya',
      relationship: 'Close friend',
      tags: [
        { kind: 'interest', label: 'running' },
        { kind: 'interest', label: 'medicine' },
        { kind: 'brand', label: 'Hoka' },
      ],
    },
    {
      ...base,
      id: mum,
      name: 'Mum',
      relationship: 'Mother',
      tags: [
        { kind: 'interest', label: 'gardening' },
        { kind: 'interest', label: 'ceramics' },
        { kind: 'size', label: 'ring size 6' },
      ],
    },
    {
      ...base,
      id: daniel,
      name: 'Daniel',
      relationship: 'Brother',
      tags: [{ kind: 'interest', label: 'coffee' }],
    },
    { ...base, id: hana, name: 'Hana', relationship: 'Neighbour', tags: [] },
  ]

  const t = (
    personId: string,
    body: string,
    daysAgo: number,
    extra: Partial<Thought> = {},
  ): Thought => ({
    id: newId(),
    personId,
    body,
    source: 'typed',
    observedAt: ago(daysAgo),
    createdAt: ago(daysAgo),
    updatedAt: ago(daysAgo),
    ...extra,
  })

  const priyaBelt = t(
    priya,
    'She keeps eyeing a running belt. Said her phone bounces around on long runs.',
    130,
  )
  const priyaMed = t(
    priya,
    'Started med school this autumn. Tired, but lit up when she talked about it.',
    160,
  )
  const mumMug = t(
    mum,
    'Picked up every mug at the market stall and put them all back. Loved the speckled one.',
    75,
  )
  const mumCard = t(mum, 'Kept my handwritten card from last year on the fridge. All year.', 210)
  const mumGarden = t(
    mum,
    'Mentioned her tomato plants are struggling in the shade this summer.',
    30,
  )
  const danCoffee = t(
    daniel,
    'Complaining his coffee at home never tastes like the café’s. Maybe a better grinder?',
    18,
  )
  const hanaThought = t(
    hana,
    'Brought over soup when I was sick. Never asked for anything back.',
    45,
  )

  const thoughts = [priyaBelt, priyaMed, mumMug, mumCard, mumGarden, danCoffee, hanaThought]

  const o = (
    personId: string,
    kind: Occasion['kind'],
    title: string,
    date: string,
    recurs: Occasion['recurs'],
    yearKnown = true,
  ): Occasion => ({ ...base, id: newId(), personId, kind, title, date, recurs, yearKnown })

  const occasions: Occasion[] = [
    o(priya, 'custom', 'Priya’s half marathon', ahead(21), 'none'),
    o(priya, 'birthday', 'Priya’s birthday', ahead(120), 'yearly'),
    o(mum, 'birthday', 'Mum’s birthday', ahead(38), 'yearly'),
    o(daniel, 'custom', 'Daniel’s housewarming', ahead(9), 'none'),
  ]

  const giftIdeas: GiftIdea[] = [
    {
      ...base,
      id: newId(),
      personId: priya,
      title: 'Running belt',
      note: 'Slim one that fits a phone.',
      sourceThoughtId: priyaBelt.id,
      status: 'idea',
    },
    {
      ...base,
      id: newId(),
      personId: mum,
      title: 'Speckled stoneware mug',
      sourceThoughtId: mumMug.id,
      status: 'idea',
    },
  ]

  const pastGift: GiftProject = {
    ...base,
    id: newId(),
    personId: mum,
    title: 'Pressed-flower frame',
    notes: 'Framed flowers from her own garden.',
    status: 'given',
    givenAt: toDateOnly(addDays(today, -330)),
    reaction: 'Really appreciated the handwritten card tucked inside.',
  }

  const milestones: MilestoneSuggestion[] = [
    {
      ...base,
      id: newId(),
      personId: priya,
      sourceThoughtId: priyaMed.id,
      prompt: 'You noted Priya started med school. Do you know when she finishes?',
      proposedKind: 'milestone',
      proposedTitle: 'Priya finishes med school',
      status: 'pending',
    },
  ]

  return {
    people,
    thoughts,
    occasions,
    giftIdeas,
    giftProjects: [pastGift],
    checklist: [],
    milestones,
    settings: { onboarded: false },
  }
}
