import {
  getTodayDateString,
  generateSeedFromDate,
  createSeededRandom,
  getTodaysChallengePoems
} from '@/utils/dailyChallenge'

describe('dailyChallenge utilities', () => {
  it('should generate today date string in YYYY-MM-DD format', () => {
    const dateString = getTodayDateString()
    expect(dateString).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('should generate same seed from same date string', () => {
    const seed1 = generateSeedFromDate('2025-01-01')
    const seed2 = generateSeedFromDate('2025-01-01')
    expect(seed1).toBe(seed2)
  })

  it('should generate different seeds from different date strings', () => {
    const seed1 = generateSeedFromDate('2025-01-01')
    const seed2 = generateSeedFromDate('2025-01-02')
    expect(seed1).not.toBe(seed2)
  })

  it('should create seeded random generator', () => {
    const random = createSeededRandom(12345)
    const num1 = random()
    const num2 = random()

    expect(num1).toBeGreaterThanOrEqual(0)
    expect(num1).toBeLessThan(1)
    expect(num2).toBeGreaterThanOrEqual(0)
    expect(num2).toBeLessThan(1)
    expect(num1).not.toBe(num2)
  })

  it('should select exactly 5 poems for daily challenge', () => {
    const poems = Array.from({ length: 100 }, (_, i) => ({
      id: i + 1,
      question: `Question ${i + 1}`,
      answer: `Answer ${i + 1}`,
      author: `Author ${i + 1}`
    }))

    const selectedPoems = getTodaysChallengePoems(poems)
    expect(selectedPoems).toHaveLength(5)
  })

  it('should select same poems on same day', () => {
    const poems = Array.from({ length: 100 }, (_, i) => ({
      id: i + 1,
      question: `Question ${i + 1}`,
      answer: `Answer ${i + 1}`,
      author: `Author ${i + 1}`
    }))

    const selected1 = getTodaysChallengePoems(poems)
    const selected2 = getTodaysChallengePoems(poems)

    expect(selected1.map(p => p.id)).toEqual(selected2.map(p => p.id))
  })

  // Note: localStorage tests are skipped in unit tests as localStorage is a browser API
  // These functions are tested through component integration tests instead
})
