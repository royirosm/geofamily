// src/utils/questionGeneratorLanguagesCities.js
// ─────────────────────────────────────────────────────────────────────────────
// Phase 10 Wave 2: Question generators for Languages and Cities modules.
//
// Languages:
//   generateLanguageFindLanguageQuestions  — country → primary language
//   generateLanguageFindCountryQuestions   — language → any country (multi-valid)
//
// Cities:
//   generateCityFindCityQuestions          — country → any major city (multi-valid)
//   generateCityFindCountryQuestions       — city → country (always one answer)
//
// Helper used by both: getPrimaryLanguage(country) resolves the single best
// language for a country, applying the PRIMARY_LANGUAGE_OVERRIDE map first.
// ─────────────────────────────────────────────────────────────────────────────

import { buildPool, weightedSample, shuffle } from './questionGenerator'
import {
  PRIMARY_LANGUAGE_OVERRIDE,
  CANONICAL_LANGUAGE_COUNTRY,
  MINOR_LANGUAGES,
  getLanguageName,
}                                              from '../data/languages'
import {
  CITIES,
  getCityName,
  getCitiesForCountry,
  getNonCapitalCities,
}                                              from '../data/cities'

// ── Normalise (mirrors fuzzyMatch.js) ────────────────────────────────────────
function norm(str) {
  if (!str) return ''
  return str.trim().toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
}

// ── Primary language resolver ─────────────────────────────────────────────────
// Returns a single language string for a country, filtering minor ones.
export function getPrimaryLanguage(country) {
  // 1. Check static override first
  if (PRIMARY_LANGUAGE_OVERRIDE[country.code]) {
    return PRIMARY_LANGUAGE_OVERRIDE[country.code]
  }
  // 2. Use first non-minor language from API
  if (country.languages && country.languages.length > 0) {
    const major = country.languages.find(l => !MINOR_LANGUAGES.has(l))
    return major || country.languages[0]
  }
  return null
}

// ─────────────────────────────────────────────────────────────────────────────
// LANGUAGES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Languages › find-language
 * Stimulus: country flag + name  →  Answer: primary language
 * Always one correct answer per country.
 */
export function generateLanguageFindLanguageQuestions(
  countries, lang, ageMode, count,
  progressMap = {}, globalMasterCount = 0, regionFilter = 'all',
) {
  const isKids             = ageMode === 'kids'
  const choicesPerQuestion = isKids ? 3 : 4

  const { eligible, pool } = buildPool(
    countries, lang, ageMode, progressMap, false, globalMasterCount, regionFilter,
  )

  // Only countries with a resolvable primary language
  const withLanguage = eligible.filter(c => getPrimaryLanguage(c))
  if (withLanguage.length < choicesPerQuestion) return []

  const poolWithLang = pool.filter(p => getPrimaryLanguage(p.item))
  const actualCount  = Math.min(count, poolWithLang.length)
  const selected     = weightedSample(poolWithLang, actualCount)

  // All unique languages in pool (for distractors) — exclude minor ones
  const allLanguages = [...new Set(
    withLanguage.map(c => getPrimaryLanguage(c)).filter(Boolean)
  )]

  return selected.map(country => {
    const language = getPrimaryLanguage(country)

    const wrongLanguages = shuffle(
      allLanguages.filter(l => l !== language)
    ).slice(0, choicesPerQuestion - 1)

    const languageDisplay = getLanguageName(language, lang)

    const choices = shuffle([
      { label: languageDisplay, isCorrect: true },
      ...wrongLanguages.map(l => ({ label: getLanguageName(l, lang), isCorrect: false })),
    ])

    return {
      country,
      correctAnswer:    languageDisplay,   // display name in current lang
      correctAnswerEn:  language,          // English key for SRS/comparisons
      questionType:     'find-language',
      choices,
    }
  })
}

/**
 * Languages › find-country
 * Stimulus: language name  →  Answer: any country that speaks it as primary
 * Multi-valid: TypeAnswer accepts any valid country.
 */
export function generateLanguageFindCountryQuestions(
  countries, lang, ageMode, count,
  progressMap = {}, globalMasterCount = 0, regionFilter = 'all',
) {
  const isKids             = ageMode === 'kids'
  const choicesPerQuestion = isKids ? 3 : 4

  const { eligible } = buildPool(
    countries, lang, ageMode, progressMap, false, globalMasterCount, regionFilter,
  )

  const withLanguage = eligible.filter(c => getPrimaryLanguage(c))
  if (withLanguage.length < choicesPerQuestion) return []

  // Build map: language → [countries]
  const langMap = {}
  withLanguage.forEach(c => {
    const l = getPrimaryLanguage(c)
    if (!langMap[l]) langMap[l] = []
    langMap[l].push(c)
  })

  const langKeys     = Object.keys(langMap)
  const shuffledKeys = shuffle(langKeys)
  const selectedKeys = shuffledKeys.slice(0, Math.min(count, shuffledKeys.length))

  return selectedKeys.map(language => {
    const validCountries = langMap[language]

    const canonicalCode    = CANONICAL_LANGUAGE_COUNTRY[language]
    const canonicalCountry = validCountries.find(c => c.code === canonicalCode)
                          || validCountries.slice().sort((a, b) => b.population - a.population)[0]
    const correctAnswer    = canonicalCountry.name[lang] || canonicalCountry.name.en

    const acceptedAnswers = new Set(
      validCountries.map(c => norm(c.name[lang] || c.name.en))
    )

    const wrongPool      = withLanguage.filter(c => getPrimaryLanguage(c) !== language)
    const wrongCountries = shuffle(wrongPool).slice(0, choicesPerQuestion - 1)

    const choices = shuffle([
      { label: correctAnswer, flag: canonicalCountry.flag, isCorrect: true },
      ...wrongCountries.map(c => ({
        label:     c.name[lang] || c.name.en,
        flag:      c.flag,
        isCorrect: false,
      })),
    ])

    const otherValidCount = Math.max(0, validCountries.length - 1)

    const languageDisplay = getLanguageName(language, lang)

    return {
      country:         canonicalCountry,
      language:        languageDisplay,    // translated for stimulus display
      languageEn:      language,           // English key
      correctAnswer,
      acceptedAnswers,
      otherValidCount,
      questionType:    'find-country-by-language',
      choices,
    }
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// CITIES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Cities › find-city
 * Stimulus: country flag + name  →  Answer: any major city in that country
 * Multi-valid: TypeAnswer accepts any city in the country's city list.
 */
export function generateCityFindCityQuestions(
  countries, lang, ageMode, count,
  progressMap = {}, globalMasterCount = 0, regionFilter = 'all',
) {
  const isKids             = ageMode === 'kids'
  const choicesPerQuestion = isKids ? 3 : 4

  const { eligible, pool } = buildPool(
    countries, lang, ageMode, progressMap, false, globalMasterCount, regionFilter,
  )

  // Only countries with non-capital cities in our dataset
  const withCities = eligible.filter(c => getCitiesForCountry(c.code).length > 0)
  if (withCities.length < choicesPerQuestion) return []

  const poolWithCities = pool.filter(p => getCitiesForCountry(p.item.code).length > 0)
  const actualCount    = Math.min(count, poolWithCities.length)
  const selected       = weightedSample(poolWithCities, actualCount)

  // Build flat distractor pool from NON-CAPITAL cities across all eligible countries
  const allCities = withCities.flatMap(c => {
    const capitalEn = c.capital?.en || ''
    return getNonCapitalCities(c.code, capitalEn).map(city => ({ city, countryCode: c.code }))
  })

  return selected.map(country => {
    const capitalEn      = country.capital?.en || ''
    // For the quiz: use non-capital cities so we don't repeat Capitals module
    const quizCities     = getNonCapitalCities(country.code, capitalEn)
    // For the flashcard "other cities" note: show ALL cities including capital
    const allCountryCities = getCitiesForCountry(country.code)
    const canonicalCity    = quizCities[0]
    const canonicalCityLang = getCityName(canonicalCity, lang)

    // TypeAnswer accepts ANY city (including capital — generous matching)
    const acceptedAnswers = new Set(
      allCountryCities.flatMap(city => [
        norm(city),
        norm(getCityName(city, lang)),
      ])
    )

    const otherValidCount = Math.max(0, quizCities.length - 1)

    // MC distractors: non-capital cities from OTHER countries
    const wrongCities = shuffle(
      allCities.filter(e => e.countryCode !== country.code)
    ).slice(0, choicesPerQuestion - 1)

    const choices = shuffle([
      { label: canonicalCityLang, isCorrect: true },
      ...wrongCities.map(e => ({
        label:     getCityName(e.city, lang),
        isCorrect: false,
      })),
    ])

    return {
      country,
      cityList:       quizCities,
      allCityList:    allCountryCities,
      canonicalCity,
      correctAnswer:  canonicalCityLang,
      acceptedAnswers,
      otherValidCount,
      questionType:   'find-city',
      choices,
    }
  })
}

/**
 * Cities › find-country
 * Stimulus: city name  →  Answer: the country it belongs to
 * Always one correct answer — cities don't span countries.
 */
export function generateCityFindCountryQuestions(
  countries, lang, ageMode, count,
  progressMap = {}, globalMasterCount = 0, regionFilter = 'all',
) {
  const isKids             = ageMode === 'kids'
  const choicesPerQuestion = isKids ? 3 : 4

  const { eligible, pool } = buildPool(
    countries, lang, ageMode, progressMap, false, globalMasterCount, regionFilter,
  )

  const withCities = eligible.filter(c => getCitiesForCountry(c.code).length > 0)
  if (withCities.length < choicesPerQuestion) return []

  const poolWithCities = pool.filter(p => getCitiesForCountry(p.item.code).length > 0)
  const actualCount    = Math.min(count, poolWithCities.length)
  const selected       = weightedSample(poolWithCities, actualCount)

  return selected.map(country => {
    const cityList   = getCitiesForCountry(country.code)
    // Pick a random NON-CAPITAL city to keep variety and avoid overlap with Capitals module
    const capitalEn   = country.capital?.en || ''
    const quizPool    = getNonCapitalCities(country.code, capitalEn)
    const chosenCity  = shuffle(quizPool.length > 0 ? quizPool : cityList)[0]
    const cityLang   = getCityName(chosenCity, lang)
    const correctAnswer = country.name[lang] || country.name.en

    const others  = shuffle(withCities.filter(c => c.code !== country.code))
    const wrongs  = others.slice(0, choicesPerQuestion - 1)

    const choices = shuffle([
      { label: correctAnswer, flag: country.flag, isCorrect: true },
      ...wrongs.map(c => ({
        label:     c.name[lang] || c.name.en,
        flag:      c.flag,
        isCorrect: false,
      })),
    ])

    return {
      country,
      cityName:      cityLang,
      cityNameEn:    chosenCity,
      correctAnswer,
      questionType:  'find-country-by-city',
      choices,
    }
  })
}
