import { newId } from '@/lib/dates'
import type { Suggestion, SuggestionKind } from '@/types'
import type { AgentReply, AgentService, BrainstormContext } from '.'

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))
const suggest = (kind: SuggestionKind, text: string, why?: string): Suggestion => ({
  id: newId(),
  kind,
  text,
  why,
})
const clip = (s: string, n = 90) => (s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s)

const EXPERIENCES = [
  'A day out planned around something they love, with you along',
  'Tickets to a show, match or class they would not buy themselves',
  'A weekend away where someone else handles every detail',
]
const HANDMADE = [
  'A small handmade book of memories and in-jokes',
  'A framed photo from a trip or night you both remember',
  'A playlist with a handwritten track list',
]
const THINGS_TO_KEEP = [
  'A good version of something they use every day',
  'A book that matches what they have been curious about lately',
  'A notebook or journal, with the first page already started',
]
const CONTENT_PROMPTS = [
  'Something you would like to try together this year',
  'A place you have never been that looks interesting',
  'A small thing worth doing this month',
  'A trip where someone else plans everything',
  'Something you are objectively bad at and want to enjoy anyway',
  'A memory worth recreating',
]

/** Scripted stand-in for the real agent. It reads the same context a model would. */
export const mockAgent: AgentService = {
  async brainstorm(ctx, history, userText): Promise<AgentReply> {
    await wait(700)
    const text = userText.toLowerCase()
    const first = history.filter((m) => m.role === 'user').length <= 1

    if (/\b(inside|notebook|prompts?|bucket|fill|contents|write in|what to put)\b/.test(text)) {
      return contentReply(ctx)
    }
    if (/\b(experience|do together|trip|day out|activity)\b/.test(text)) {
      return {
        text: `Here are a few things to do rather than to own. Which of these sounds like ${ctx.person.name}?`,
        suggestions: EXPERIENCES.map((t) => suggest('gift', t)),
      }
    }
    if (/\b(handmade|homemade|personal|sentimental|diy)\b/.test(text)) {
      return {
        text: 'Here are some more personal directions. The best ones lean on something only you noticed.',
        suggestions: HANDMADE.map((t) => suggest('gift', t)),
      }
    }
    if (/\b(cheap|budget|under|less|affordable)\b/.test(text)) {
      const cents = ctx.project.budgetCents
      return {
        text: cents
          ? `Keeping it near $${Math.round(cents / 100)}, these lean on thought rather than price.`
          : 'Keeping it small, these lean on thought rather than price.',
        suggestions: HANDMADE.map((t) => suggest('gift', t)),
      }
    }
    return first ? openingReply(ctx) : followUpReply(ctx)
  },
}

function openingReply(ctx: BrainstormContext): AgentReply {
  const { person, thoughts, ideas, occasion, connections } = ctx
  const interests = person.tags.filter((t) => t.kind === 'interest').map((t) => t.label)
  const suggestions: Suggestion[] = []

  for (const idea of ideas.slice(0, 2)) {
    const source = thoughts.find((t) => t.id === idea.sourceThoughtId)
    suggestions.push(
      suggest('gift', idea.title, source ? `You noted: “${clip(source.body)}”` : idea.note),
    )
  }
  for (const t of thoughts) {
    if (suggestions.length >= 3) break
    if (ideas.some((i) => i.sourceThoughtId === t.id)) continue
    suggestions.push(
      suggest('gift', 'Something that builds on this', `You noted: “${clip(t.body)}”`),
    )
  }
  for (const interest of interests) {
    if (suggestions.length >= 3) break
    suggestions.push(suggest('gift', `Something for their ${interest}`, 'One of their interests.'))
  }
  for (const fallback of THINGS_TO_KEEP) {
    if (suggestions.length >= 3) break
    suggestions.push(suggest('gift', fallback))
  }

  const known = [
    thoughts.length > 0 &&
      `${thoughts.length} thing${thoughts.length === 1 ? '' : 's'} you have noticed`,
    person.mbti && `their MBTI (${person.mbti})`,
    connections.length > 0 &&
      `${connections.length} connection${connections.length === 1 ? '' : 's'}`,
  ].filter(Boolean)
  const intro =
    known.length > 0
      ? `I am working from ${known.join(', ')}${occasion ? `, and ${occasion.title}` : ''}.`
      : `I do not have much about ${person.name} yet, so these are starting points.`

  return {
    text: `${intro} Here is where I would start. Does it feel like something to use, to do, or to keep?`,
    suggestions,
  }
}

function followUpReply(ctx: BrainstormContext): AgentReply {
  return {
    text: `Got it. I can look at this a few ways: something to do together, something handmade, or what to put inside the gift. Tell me which, or describe what you have in mind for ${ctx.person.name}.`,
    suggestions: [],
  }
}

function contentReply(ctx: BrainstormContext): AgentReply {
  const fromThoughts = ctx.thoughts
    .slice(0, 2)
    .map((t) => suggest('content', `A nod to this: ${clip(t.body, 70)}`, 'Something you noticed.'))
  return {
    text: 'Here are some prompts or items you could put inside. A handful works better than a long list, so pick what suits them.',
    suggestions: [
      ...fromThoughts,
      ...CONTENT_PROMPTS.slice(0, 5 - fromThoughts.length).map((t) => suggest('content', t)),
    ],
  }
}
