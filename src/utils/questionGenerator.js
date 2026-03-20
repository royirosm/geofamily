// questionGenerator.js
// Builds quiz questions for the Capitals module.
// Respects age mode: kids = 3 choices + common countries, explorer = 4 choices + all countries.

// Well-known countries for Kids mode — familiar names, clear capitals
const COMMON_COUNTRY_CODES = [
  'GB', 'FR', 'DE', 'IT', 'ES', 'PT', 'GR', 'CY', 'NL', 'BE',
  'AT', 'CH', 'SE', 'NO', 'DK', 'FI', 'PL', 'CZ', 'HU', 'RO',
  'US', 'CA', 'MX', 'BR', 'AR', 'CL', 'PE', 'CO',
  'RU', 'CN', 'JP', 'IN', 'AU', 'NZ',
  'EG', 'ZA', 'NG', 'KE', 'MA',
  'SA', 'TR', 'IL', 'JO', 'AE', 'IR', 'IQ',
  'UA', 'BY', 'RS', 'HR', 'BA', 'BG', 'MK',
]

/**
 * Generates an array of quiz questions.
 *
 * @param {Array}  countries - Full country list from useCountries()
 * @param {string} lang      - 'en' | 'el'
 * @param {string} ageMode   - 'kids' | 'explorer'
 * @param {number} count     - How many questions to generate (default 10)
 * @returns {Array} questions shaped as:
 *   { country, correctCapital, choices: [{ label, isCorrect }] }
 */
export function generateQuestions(countries, lang, ageMode, count = 10) {
  const isKids      = ageMode === 'kids'
  const choiceCount = isKids ? 3 : 4

  // Filter to the right pool
  const pool = isKids
    ? countries.filter(c => COMMON_COUNTRY_CODES.includes(c.code))
    : countries

  if (pool.length < choiceCount) return []

  // Shuffle and pick `count` countries as question subjects
  const shuffled  = [...pool].sort(() => Math.random() - 0.5)
  const selected  = shuffled.slice(0, count)

  return selected.map(country => {
    const correctCapital = country.capital[lang]

    // Pick wrong answers from the rest of the pool (different country, different capital)
    const wrongPool = pool
      .filter(c => c.code !== country.code)
      .sort(() => Math.random() - 0.5)
      .slice(0, choiceCount - 1)

    const wrongChoices = wrongPool.map(c => ({
      label:     c.capital[lang],
      isCorrect: false,
    }))

    const correctChoice = { label: correctCapital, isCorrect: true }

    // Mix correct answer into a random position
    const choices = [...wrongChoices, correctChoice].sort(() => Math.random() - 0.5)

    return {
      country,
      correctCapital,
      choices,
    }
  })
}
