// questionGenerator.js
// Generates a quiz round of N questions from the country list.
// When a progress map is supplied (from usePlayerProgress), questions are
// weighted by SRS strength so weaker/newer countries appear more often.
//
// Weighting table:
//   'new'    → weight 8  (high priority — introduce gradually)
//   'weak'   → weight 6  (needs more practice)
//   'medium' → weight 3  (seen but not solid)
//   'strong' → weight 1  (mostly learned — still appears occasionally)
//
// Without a progress map (guest / first run) all countries have equal weight.
//
// Each question has:
//   - country:        the country being asked about
//   - correctCapital: string
//   - choices:        array of { label, isCorrect } — shuffled
//
// Usage:
//   generateQuestions(countries, lang, ageMode, count)
//   generateQuestions(countries, lang, ageMode, count, progressMap)

// ── Config ────────────────────────────────────────────────────────────────────

const STRENGTH_WEIGHTS = {
  new:    8,
  weak:   6,
  medium: 3,
  strong: 1,
}

// Countries considered "common" for Kids mode
// (ISO 3166-1 alpha-3 codes from RestCountries)
const COMMON_COUNTRIES = new Set([
  'FRA','DEU','ITA','ESP','GBR','USA','CAN','BRA','ARG','MEX',
  'RUS','CHN','JPN','IND','AUS','ZAF','EGY','NGA','KEN','MAR',
  'GRC','CYP','TUR','ISR','SAU','ARE','THA','KOR','IDN','NZL',
  'SWE','NOR','DNK','FIN','POL','NLD','BEL','CHE','AUT','PRT',
])

// ── Helpers ───────────────────────────────────────────────────────────────────

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Weighted random selection — picks `count` unique items from `pool`
// Each item in pool: { item, weight }
function weightedSample(pool, count) {
  const selected = []
  const remaining = [...pool]

  for (let i = 0; i < count && remaining.length > 0; i++) {
    const totalWeight = remaining.reduce((sum, e) => sum + e.weight, 0)
    let rand = Math.random() * totalWeight
    let idx  = 0
    for (; idx < remaining.length - 1; idx++) {
      rand -= remaining[idx].weight
      if (rand <= 0) break
    }
    selected.push(remaining[idx].item)
    remaining.splice(idx, 1)
  }

  return selected
}

// ── Main export ───────────────────────────────────────────────────────────────

export function generateQuestions(countries, lang, ageMode, count, progressMap = {}) {
  const isKids = ageMode === 'kids'
  const choicesPerQuestion = isKids ? 3 : 4

  // 1. Filter countries — Kids mode uses common set only; Explorer uses all
  //    Also require: has a capital and a flag
  const eligible = countries.filter(c =>
    c.capital &&
    c.flag &&
    (!isKids || COMMON_COUNTRIES.has(c.code))
  )

  if (eligible.length < choicesPerQuestion) return []

  // 2. Build weighted pool for question selection
  const pool = eligible.map(country => {
    const record   = progressMap[country.code]
    const strength = record?.strength ?? 'new'
    return { item: country, weight: STRENGTH_WEIGHTS[strength] }
  })

  // 3. Sample `count` countries (weighted, no duplicates)
  const actualCount   = Math.min(count, eligible.length)
  const selectedCountries = weightedSample(pool, actualCount)

  // 4. Build questions
  return selectedCountries.map(country => {
    // Wrong choices: random sample from eligible (excluding correct country)
    const others  = eligible.filter(c => c.code !== country.code)
    const wrongs  = shuffle(others).slice(0, choicesPerQuestion - 1)

    const choices = shuffle([
      { label: country.capital, isCorrect: true },
      ...wrongs.map(c => ({ label: c.capital, isCorrect: false })),
    ])

    return {
      country,
      correctCapital: country.capital,
      choices,
    }
  })
}
