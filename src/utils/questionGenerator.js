// questionGenerator.js
// Generates a quiz round of N questions from the country list.
// When a progress map is supplied (from usePlayerProgress), questions are
// weighted by SRS strength so weaker/newer countries appear more often.
//
// Weighting table (5-step scale):
//   'new'        → weight 10  (never seen — highest priority)
//   'beginner'   → weight 8
//   'learner'    → weight 6
//   'practising' → weight 4
//   'advanced'   → weight 2
//   'master'     → weight 1   (mostly learned — still appears occasionally)
//
// Without a progress map all countries have equal weight (treated as 'new').
// capital field is { en, el } — always resolve to a string using lang.

import { STRENGTH_WEIGHTS } from '../hooks/usePlayerProgress'

// Countries considered "common" for Kids mode (ISO 3166-1 alpha-2 codes)
const COMMON_COUNTRIES = new Set([
  'FR','DE','IT','ES','GB','US','CA','BR','AR','MX',
  'RU','CN','JP','IN','AU','ZA','EG','NG','KE','MA',
  'GR','CY','TR','IL','SA','AE','TH','KR','ID','NZ',
  'SE','NO','DK','FI','PL','NL','BE','CH','AT','PT',
])

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Weighted random selection — picks `count` unique items from pool
function weightedSample(pool, count) {
  const selected  = []
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

export function generateQuestions(countries, lang, ageMode, count, progressMap = {}) {
  const isKids = ageMode === 'kids'
  const choicesPerQuestion = isKids ? 3 : 4

  // Resolve capital to a display string — capital is { en, el } object
  function cap(country) {
    if (!country.capital) return ''
    if (typeof country.capital === 'object') {
      return country.capital[lang] ?? country.capital.en ?? ''
    }
    return country.capital
  }

  // Filter — must have capital + flag; Kids mode uses common set only
  const eligible = countries.filter(c =>
    c.capital &&
    c.flag &&
    (!isKids || COMMON_COUNTRIES.has(c.code))
  )

  if (eligible.length < choicesPerQuestion) return []

  // Build weighted pool
  const pool = eligible.map(country => {
    const record   = progressMap[country.code]
    const strength = record?.strength ?? 'new'
    return { item: country, weight: STRENGTH_WEIGHTS[strength] }
  })

  // Sample countries weighted by weakness
  const actualCount       = Math.min(count, eligible.length)
  const selectedCountries = weightedSample(pool, actualCount)

  // Build question objects
  return selectedCountries.map(country => {
    const others  = eligible.filter(c => c.code !== country.code)
    const wrongs  = shuffle(others).slice(0, choicesPerQuestion - 1)
    const choices = shuffle([
      { label: cap(country), isCorrect: true },
      ...wrongs.map(c => ({ label: cap(c), isCorrect: false })),
    ])
    return { country, correctCapital: cap(country), choices }
  })
}
