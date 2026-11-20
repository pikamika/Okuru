import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { Interests } from './Interests'

function Harness({ initial = [] }: { initial?: string[] }) {
  const [value, setValue] = useState(initial)
  return <Interests value={value} onChange={setValue} />
}

const input = () => screen.getByLabelText('Add an interest')

describe('Interests', () => {
  it('turns comma-separated text into separate badges', async () => {
    render(<Harness />)
    await userEvent.type(input(), 'Volleyball, Dogs{Enter}')
    expect(screen.getByText('Volleyball')).toBeInTheDocument()
    expect(screen.getByText('Dogs')).toBeInTheDocument()
  })

  it('makes a badge as soon as a comma is typed', async () => {
    render(<Harness />)
    await userEvent.type(input(), 'Jazz,')
    expect(screen.getByText('Jazz')).toBeInTheDocument()
    expect(input()).toHaveValue('')
  })

  it('ignores blanks and repeats regardless of case', async () => {
    render(<Harness initial={['Jazz']} />)
    await userEvent.type(input(), 'jazz, , JAZZ{Enter}')
    expect(screen.getAllByRole('listitem')).toHaveLength(1)
  })

  it('removes a badge', async () => {
    render(<Harness initial={['Jazz', 'Dogs']} />)
    await userEvent.click(screen.getByRole('button', { name: 'Remove Jazz' }))
    expect(screen.queryByText('Jazz')).not.toBeInTheDocument()
    expect(screen.getByText('Dogs')).toBeInTheDocument()
  })
})
