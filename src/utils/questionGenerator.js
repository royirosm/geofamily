// src/utils/questionGenerator.js
// ─────────────────────────────────────────────────────────────────────────────
// Generates quiz questions for all module/direction combinations.
//
// Exported functions:
//   generateQuestions(countries, lang, ageMode, count, progressMap)
//     → capitals / find-capital (original behaviour — given country, find capital)
//
//   generateReverseQuestions(countries, lang, ageMode, count, progressMap)
//     → capitals / find-country (given capital, find country)
//
//   generateFlagToCountryQuestions(countries, lang, ageMode, count, progressMap)
//     → flags / flag-to-country (given flag image, find country name)
//
//   generateCountryToFlagQuestions(countries, lang, ageMode, count, progressMap)
//     → flags / country-to-flag (given country name, find flag image)
//
// All functions share the same signature and return a uniform question array.
// Answer choices are always { label, isCorrect } so quiz components are identical.
// For country-to-flag, label is the flag SVG URL (rendered as <img>).
//
// SRS weighting is always applied via progressMap (mode-agnostic per module).
// capital field is always { en, el } — resolve with lang before use.
// ─────────────────────────────────────────────────────────────────────────────

import { STRENGTH_WEIGHTS } from '../hooks/usePlayerProgress'

// Countries considered "common" for Kids mode
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

/** Resolve capital to a display string — capital is always { en, el } */
function cap(country, lang) {
  if (!country.capital) return ''
  if (typeof country.capital === 'object') return country.capital[lang] ?? country.capital.en ?? ''
  return country.capital
}

/** Resolve country name to a display string */
function name(country, lang) {
  if (typeof country.name === 'object') return country.name[lang] ?? country.name.en ?? ''
  return country.name
}

/** Shared eligibility filter and weighted pool builder */
function buildPool(countries, lang, ageMode, progressMap, requireCapital = true) {
  const isKids = ageMode === 'kids'
  const eligible = countries.filter(c =>
    c.flag &&
    (!requireCapital || (c.capital && cap(c, lang))) &&
    (!isKids || COMMON_COUNTRIES.has(c.code))
  )
  const pool = eligible.map(country => {
    const strength = progressMap[country.code]?.strength ?? 'new'
    return { item: country, weight: STRENGTH_WEIGHTS[strength] }
  })
  return { eligible, pool }
}

// ── capitals / find-capital ───────────────────────────────────────────────────
// Given: country name + flag  →  pick the correct capital
// (original behaviour — unchanged)

export function generateQuestions(countries, lang, ageMode, count, progressMap = {}) {
  const isKids             = ageMode === 'kids'
  const choicesPerQuestion = isKids ? 3 : 4
  const { eligible, pool } = buildPool(countries, lang, ageMode, progressMap, true)

  if (eligible.length < choicesPerQuestion) return []

  const actualCount       = Math.min(count, eligible.length)
  const selectedCountries = weightedSample(pool, actualCount)

  return selectedCountries.map(country => {
    const correctCapital = cap(country, lang)
    const others  = eligible.filter(c => c.code !== country.code)
    const wrongs  = shuffle(others).slice(0, choicesPerQuestion - 1)
    const choices = shuffle([
      { label: correctCapital, isCorrect: true },
      ...wrongs.map(c => ({ label: cap(c, lang), isCorrect: false })),
    ])
    return {
      country,
      correctCapital,
      correctAnswer: correctCapital,   // unified field for ResultsScreen
      questionType:  'find-capital',
      choices,
    }
  })
}

// ── capitals / find-country ───────────────────────────────────────────────────
// Given: capital city name  →  pick the correct country
// Distractors are other country names.

export function generateReverseQuestions(countries, lang, ageMode, count, progressMap = {}) {
  const isKids             = ageMode === 'kids'
  const choicesPerQuestion = isKids ? 3 : 4
  const { eligible, pool } = buildPool(countries, lang, ageMode, progressMap, true)

  if (eligible.length < choicesPerQuestion) return []

  const actualCount       = Math.min(count, eligible.length)
  const selectedCountries = weightedSample(pool, actualCount)

  return selectedCountries.map(country => {
    const correctName    = name(country, lang)
    const correctCapital = cap(country, lang)
    const others  = eligible.filter(c => c.code !== country.code)
    const wrongs  = shuffle(others).slice(0, choicesPerQuestion - 1)
    const choices = shuffle([
      { label: correctName, flag: country.flag, isCorrect: true },
      ...wrongs.map(c => ({ label: name(c, lang), flag: c.flag, isCorrect: false })),
    ])
    return {
      country,
      correctCapital,
      correctAnswer: correctName,      // unified field for ResultsScreen
      questionType:  'find-country',
      choices,
    }
  })
}

// ── flags / flag-to-country ───────────────────────────────────────────────────
// Given: flag image  →  pick the correct country name
// Structurally identical to find-country, triggered from flags module.

export function generateFlagToCountryQuestions(countries, lang, ageMode, count, progressMap = {}) {
  const isKids             = ageMode === 'kids'
  const choicesPerQuestion = isKids ? 3 : 4
  const { eligible, pool } = buildPool(countries, lang, ageMode, progressMap, false)

  if (eligible.length < choicesPerQuestion) return []

  const actualCount       = Math.min(count, eligible.length)
  const selectedCountries = weightedSample(pool, actualCount)

  return selectedCountries.map(country => {
    const correctName = name(country, lang)
    const others  = eligible.filter(c => c.code !== country.code)
    const wrongs  = shuffle(others).slice(0, choicesPerQuestion - 1)
    const choices = shuffle([
      { label: correctName, isCorrect: true },
      ...wrongs.map(c => ({ label: name(c, lang), isCorrect: false })),
    ])
    return {
      country,
      correctAnswer: correctName,
      questionType:  'flag-to-country',
      choices,
    }
  })
}

// ── flags / country-to-flag ───────────────────────────────────────────────────
// Given: country name  →  pick the correct flag image
// choices.label = flag SVG URL (rendered as <img> in the quiz component)
// choices.countryName = country name (for display in results review)

export function generateCountryToFlagQuestions(countries, lang, ageMode, count, progressMap = {}) {
  const isKids             = ageMode === 'kids'
  const choicesPerQuestion = isKids ? 3 : 4
  const { eligible, pool } = buildPool(countries, lang, ageMode, progressMap, false)

  if (eligible.length < choicesPerQuestion) return []

  const actualCount       = Math.min(count, eligible.length)
  const selectedCountries = weightedSample(pool, actualCount)

  return selectedCountries.map(country => {
    const others  = eligible.filter(c => c.code !== country.code)
    const wrongs  = shuffle(others).slice(0, choicesPerQuestion - 1)
    const choices = shuffle([
      { label: country.flag, countryName: name(country, lang), isCorrect: true  },
      ...wrongs.map(c => ({ label: c.flag, countryName: name(c, lang), isCorrect: false })),
    ])
    return {
      country,
      correctAnswer: name(country, lang),
      questionType:  'country-to-flag',
      choices,
    }
  })
}
