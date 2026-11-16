import type { Reflection } from '@/types'

export const REFLECTIONS: { value: Reflection; label: string; prompt: string; hint: string }[] = [
  {
    value: 'learned',
    label: 'Learned something new',
    prompt: 'What did you learn?',
    hint: 'Something you didn’t know about them before.',
  },
  {
    value: 'confirmed',
    label: 'Confirmed a hunch',
    prompt: 'What did it confirm?',
    hint: 'Something you suspected that turned out to be true.',
  },
  {
    value: 'surprised',
    label: 'Surprised me',
    prompt: 'What surprised you?',
    hint: 'Something that didn’t fit what you thought you knew.',
  },
]

export const reflectionLabel = (r: Reflection) => REFLECTIONS.find((x) => x.value === r)?.label ?? r
