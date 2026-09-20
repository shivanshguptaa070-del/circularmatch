import { describe, it, expect, beforeEach, vi } from 'vitest'
import { get, post, del } from './api'
import type { Material, BuyerRequirement, MatchCard } from '../types'

describe('api demo fallback and resilience', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('correctly falls back to verified demo materials when offline / network fails in demo mode', async () => {
    localStorage.setItem('cm_demo', 'buyer')
    // Mock global fetch to throw "Failed to fetch" (exact browser network error)
    globalThis.fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'))

    const response = await get<Material[]>('/api/reference/materials')
    expect(response.data_mode).toBe('demo')
    expect(Array.isArray(response.data)).toBe(true)
    expect(response.data.length).toBeGreaterThan(0)
    expect(response.data[0].canonical_name).toContain('PET')
  })

  it('correctly loads demo buyer requirements and matches when network fails', async () => {
    localStorage.setItem('cm_demo', 'buyer')
    globalThis.fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'))

    // 1. Fetch requirements list
    const reqResponse = await get<BuyerRequirement[]>('/api/buyer-requirements?mine=true')
    expect(reqResponse.data.length).toBeGreaterThan(0)
    const petReq = reqResponse.data.find((r) => r.id === 'req-pet-top')
    expect(petReq).toBeDefined()

    // 2. Fetch matches for selected requirement
    const matchResponse = await get<{ requirement: BuyerRequirement; matches: MatchCard[] }>(
      '/api/buyer-requirements/req-pet-top/matches',
    )
    expect(matchResponse.data.matches.length).toBeGreaterThan(0)
    expect(matchResponse.data.matches[0].total_score).toBeGreaterThan(80)
    expect(matchResponse.data.matches[0].eligibility_status).toBe('eligible')
  })

  it('supports creating and archiving demo requirements offline during presentation', async () => {
    localStorage.setItem('cm_demo', 'buyer')
    globalThis.fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'))

    const created = await post<{ requirement: BuyerRequirement }>('/api/buyer-requirements', {
      material_id: 'mat-cotton-textile',
      material_category: 'Textile',
      minimum_quantity_kg_week: 1200,
      maximum_quantity_kg_week: 3500,
      city: 'Noida',
    })

    expect(created.data.requirement.material_category).toBe('Textile')

    // Archiving
    const archived = await del<{ message: string }>(`/api/buyer-requirements/${created.data.requirement.id}`)
    expect(archived.data.message).toBe('Archived')
  })

  it('serves seller dashboard summary KPIs and charts without errors', async () => {
    localStorage.setItem('cm_demo', 'seller')
    globalThis.fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'))

    const summary = await get<any>('/api/dashboard/summary')
    expect(summary.data.role).toBe('generator')
    expect(summary.data.kpis.total_waste_listed_kg_week).toBeGreaterThan(0)
    expect(summary.data.charts.waste_by_category.length).toBeGreaterThan(0)
  })
})
