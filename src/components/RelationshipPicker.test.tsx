import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { RelationshipPicker } from './RelationshipPicker'

function Harness({ initial = [] }: { initial?: string[] }) {
  const [value, setValue] = useState(initial)
  return (
    <>
      <RelationshipPicker value={value} onChange={setValue} />
      <output data-testid="value">{value.join('|')}</output>
    </>
  )
}
const value = () => screen.getByTestId('value').textContent

describe('RelationshipPicker', () => {
  it('lists Friend before Family', () => {
    render(<Harness />)
    const names = screen.getAllByRole('button').map((b) => b.textContent)
    expect(names.indexOf('Friend')).toBeLessThan(names.indexOf('Family'))
  })

  it('only shows detail options once the group is picked', async () => {
    render(<Harness />)
    expect(screen.queryByRole('button', { name: 'Cousin' })).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Family' }))
    await userEvent.click(screen.getByRole('button', { name: 'Cousin' }))
    expect(value()).toBe('Family|Cousin')
  })

  it('drops the details when the group is switched off', async () => {
    render(<Harness initial={['Family', 'Cousin']} />)
    await userEvent.click(screen.getByRole('button', { name: 'Family' }))
    expect(value()).toBe('')
  })

  it('adds your own word once, matching case with a known option', async () => {
    render(<Harness />)
    const box = screen.getByLabelText('Add your own')
    await userEvent.type(box, 'mentor{Enter}')
    await userEvent.type(box, 'Book club{Enter}')
    expect(value()).toBe('Mentor|Book club')
  })
})
