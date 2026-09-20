import { describe, expect, it } from 'vitest'
import { calculateDistance, formatDistance, formatTimeLeft } from './distance'

describe('calculateDistance', () => {
  it('returns 0 for the same point', () => {
    expect(calculateDistance(12.5, 99.9, 12.5, 99.9)).toBe(0)
  })

  it('is symmetric', () => {
    const a = calculateDistance(12.5455, 99.9514, 13.7563, 100.5018)
    const b = calculateDistance(13.7563, 100.5018, 12.5455, 99.9514)
    expect(a).toBe(b)
  })

  it('matches roughly one degree of latitude (~111.2 km)', () => {
    // 1 degree of latitude ~= 111,195 m with R = 6371e3
    const d = calculateDistance(0, 0, 1, 0)
    expect(d).toBeGreaterThan(111000)
    expect(d).toBeLessThan(111400)
  })

  it('returns meters as an integer', () => {
    const d = calculateDistance(12.1, 99.1, 12.2, 99.2)
    expect(Number.isInteger(d)).toBe(true)
    expect(d).toBeGreaterThan(0)
  })
})

describe('formatDistance', () => {
  it('formats sub-kilometer distances in meters', () => {
    expect(formatDistance(0)).toBe('0 m away')
    expect(formatDistance(999)).toBe('999 m away')
  })

  it('formats kilometer distances with one decimal', () => {
    expect(formatDistance(1000)).toBe('1.0 km away')
    expect(formatDistance(1500)).toBe('1.5 km away')
  })
})

describe('formatTimeLeft', () => {
  it('reports expired for past timestamps', () => {
    expect(formatTimeLeft(new Date(Date.now() - 1000).toISOString())).toBe('Expired')
  })

  it('reports hours and minutes for future timestamps', () => {
    const future = new Date(Date.now() + (2 * 60 + 30) * 60 * 1000).toISOString()
    expect(formatTimeLeft(future)).toBe('Expires in 2h 30m')
  })
})
