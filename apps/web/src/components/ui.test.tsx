import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { StatusBadge, ScoreRing, QualityPill } from './ui'

describe('UI Components', () => {
  it('renders StatusBadge correctly', () => {
    render(<StatusBadge>Active</StatusBadge>)
    expect(screen.getByText('Active')).toBeDefined()
  })

  it('renders ScoreRing correctly', () => {
    render(<ScoreRing score={85} label="match score" />)
    expect(screen.getByText('85%')).toBeDefined()
    expect(screen.getByLabelText('85% match score')).toBeDefined()
  })

  it('renders QualityPill verified correctly', () => {
    render(<QualityPill verified={true} grade="A" />)
    expect(screen.getByText('A · Verified')).toBeDefined()
  })

  it('renders QualityPill unverified correctly', () => {
    render(<QualityPill verified={false} />)
    expect(screen.getByText('Not verified')).toBeDefined()
  })
})
