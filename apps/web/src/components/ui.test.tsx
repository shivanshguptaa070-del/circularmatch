import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { StatusBadge, ScoreRing, QualityPill } from './ui'
import { MemoryRouter } from 'react-router-dom'

describe('UI Components', () => {
  it('renders StatusBadge correctly', () => {
    render(<StatusBadge>Active</StatusBadge>)
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('renders ScoreRing correctly', () => {
    render(<ScoreRing score={85} label="match score" />)
    expect(screen.getByText('85%')).toBeInTheDocument()
    expect(screen.getByLabelText('85% match score')).toBeInTheDocument()
  })

  it('renders QualityPill verified correctly', () => {
    render(<QualityPill verified={true} grade="A" />)
    expect(screen.getByText('A · Verified')).toBeInTheDocument()
  })

  it('renders QualityPill unverified correctly', () => {
    render(<QualityPill verified={false} />)
    expect(screen.getByText('Not verified')).toBeInTheDocument()
  })
})
