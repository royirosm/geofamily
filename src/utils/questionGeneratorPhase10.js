// src/utils/questionGeneratorPhase10.js
// ─────────────────────────────────────────────────────────────────────────────
// Phase 10: Question generators for Wave 1 modules.
//
// BUGS FIXED vs original:
//   1. buildPool returns pool as [{ item, weight }] — NOT [{ country, weight }].
//      weightedSample(pool, n) returns raw country objects (via entry.item).
//      All pool.filter() calls now use p.item (not p.country).
//   2. requireCapital=false passed to buildPool for currencies and regions
//      (these modules don't need a capital city).
// ─────────────────────────────────────────────────────────────────────────────

import { buildPool, weightedSample, shuffle } from './questionGenerator'
import {
  CANONICAL_CURRENCY_COUNTRY,
  CURRENCY_COUNTRY_COUNT,
  CURRENCY_NAMES,
}                                             from '../data/currencies'
import {
  CANONICAL_REGION_COUNTRY,
  REGION_NAMES,
  getRegionKey,
}                                             from '../data/regions'

// ── Normalise helper ──────────────────────────────────────────────────────────
function norm(str) {
  if (!str) return ''
  return str.trim().toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
}

// ─────────────────────────────────────────────────────────────────────────────
// CURRENCIES
// ─────────────────────────────────────────────────────────────────────────────

export function generateCurrencyFindCurrencyQuestions(
  countries, lang, ageMode, count,
  progressMap = {}, globalMasterCount = 0, regionFilter = 'all',
) {
  const isKids             = ageMode === 'kids'
  const choicesPerQuestion = isKids ? 3 : 4

  // requireCapital=false — currencies don't need a capital
  const { eligible, pool } = buildPool(
    countries, lang, ageMode, progressMap, false, globalMasterCount, regionFilter,
  )

  const withCurrency = eligible.filter(c => c.primaryCurrency)
  if (withCurrency.length < choicesPerQuestion) return []

  // pool items are { item, weight } — filter using p.item
  const poolWithCurrency = pool.filter(p => p.item.primaryCurrency)
  const actualCount      = Math.min(count, poolWithCurrency.length)
  // weightedSample returns raw country objects (entry.item)
  const selected         = weightedSample(poolWithCurrency, actualCount)

  return selected.map(country => {
    const currency     = country.primaryCurrency
    const currencyName = (CURRENCY_NAMES[currency.code]?.[lang]) || currency.name

    const otherCurrencies = withCurrency.filter(
      c => c.primaryCurrency && c.primaryCurrency.code !== currency.code,
    )
    const wrongCountries = shuffle(otherCurrencies).slice(0, choicesPerQuestion - 1)

    // Format choices as "EGP · Egyptian Pound" — code prefix breaks country-name scanning
    // correctAnswer stays as plain name so TypeAnswer matching works normally
    const fmtLabel = (code, name) => `${code} · ${name}`
    const choices = shuffle([
      { label: fmtLabel(currency.code, currencyName), isCorrect: true },
      ...wrongCountries.map(c => {
        const wc    = c.primaryCurrency
        const wName = (CURRENCY_NAMES[wc.code]?.[lang]) || wc.name
        return { label: fmtLabel(wc.code, wName), isCorrect: false }
      }),
    ])

    return {
      country,
      correctAnswer: currencyName,   // plain name — used by TypeAnswer + feedback
      currencyCode:  currency.code,
      questionType:  'find-currency',
      choices,
    }
  })
}

export function generateCurrencyFindCountryQuestions(
  countries, lang, ageMode, count,
  progressMap = {}, globalMasterCount = 0, regionFilter = 'all',
) {
  const isKids             = ageMode === 'kids'
  const choicesPerQuestion = isKids ? 3 : 4

  const { eligible } = buildPool(
    countries, lang, ageMode, progressMap, false, globalMasterCount, regionFilter,
  )

  const withCurrency = eligible.filter(c => c.primaryCurrency)
  if (withCurrency.length < choicesPerQuestion) return []

  const currencyMap = {}
  withCurrency.forEach(c => {
    const code = c.primaryCurrency.code
    if (!currencyMap[code]) currencyMap[code] = []
    currencyMap[code].push(c)
  })

  const currencyCodes = Object.keys(currencyMap)
  if (currencyCodes.length < choicesPerQuestion) return []

  const shuffledCodes = shuffle(currencyCodes)
  const selectedCodes = shuffledCodes.slice(0, Math.min(count, shuffledCodes.length))

  return selectedCodes.map(code => {
    const validCountries = currencyMap[code]
    const currency       = validCountries[0].primaryCurrency
    const currencyName   = (CURRENCY_NAMES[code]?.[lang]) || currency.name

    const canonicalCode    = CANONICAL_CURRENCY_COUNTRY[code]
    const canonicalCountry = validCountries.find(c => c.code === canonicalCode)
                          || validCountries[0]
    const correctAnswer    = canonicalCountry.name[lang] || canonicalCountry.name.en

    const acceptedAnswers = new Set(
      validCountries.map(c => norm(c.name[lang] || c.name.en)),
    )

    const wrongCountries = shuffle(
      withCurrency.filter(c => c.primaryCurrency.code !== code),
    ).slice(0, choicesPerQuestion - 1)

    const choices = shuffle([
      { label: correctAnswer, flag: canonicalCountry.flag, isCorrect: true },
      ...wrongCountries.map(c => ({
        label:     c.name[lang] || c.name.en,
        flag:      c.flag,
        isCorrect: false,
      })),
    ])

    const sharedCount     = CURRENCY_COUNTRY_COUNT[code] || validCountries.length
    const otherValidCount = Math.max(0, sharedCount - 1)

    return {
      country:         canonicalCountry,
      currencyCode:    code,
      currencyName,
      correctAnswer,
      acceptedAnswers,
      otherValidCount,
      questionType:    'find-country-by-currency',
      choices,
    }
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// COUNTRY CODES
// ─────────────────────────────────────────────────────────────────────────────

export function generateCodeFindCodeQuestions(
  countries, lang, ageMode, count,
  progressMap = {}, globalMasterCount = 0, regionFilter = 'all',
) {
  const isKids             = ageMode === 'kids'
  const choicesPerQuestion = isKids ? 3 : 4

  const { eligible, pool } = buildPool(
    countries, lang, ageMode, progressMap, true, globalMasterCount, regionFilter,
  )

  if (eligible.length < choicesPerQuestion) return []

  const actualCount = Math.min(count, pool.length)
  const selected    = weightedSample(pool, actualCount)

  return selected.map(country => {
    const correctAnswer = country.code
    const others  = shuffle(eligible.filter(c => c.code !== country.code))
    const wrongs  = others.slice(0, choicesPerQuestion - 1)
    const choices = shuffle([
      { label: correctAnswer, isCorrect: true },
      ...wrongs.map(c => ({ label: c.code, isCorrect: false })),
    ])
    return { country, correctAnswer, questionType: 'find-code', choices }
  })
}

export function generateCodeFindCountryQuestions(
  countries, lang, ageMode, count,
  progressMap = {}, globalMasterCount = 0, regionFilter = 'all',
) {
  const isKids             = ageMode === 'kids'
  const choicesPerQuestion = isKids ? 3 : 4

  const { eligible, pool } = buildPool(
    countries, lang, ageMode, progressMap, true, globalMasterCount, regionFilter,
  )

  if (eligible.length < choicesPerQuestion) return []

  const actualCount = Math.min(count, pool.length)
  const selected    = weightedSample(pool, actualCount)

  return selected.map(country => {
    const correctAnswer = country.name[lang] || country.name.en
    const others  = shuffle(eligible.filter(c => c.code !== country.code))
    const wrongs  = others.slice(0, choicesPerQuestion - 1)
    const choices = shuffle([
      { label: correctAnswer, flag: country.flag, code: country.code, isCorrect: true },
      ...wrongs.map(c => ({
        label: c.name[lang] || c.name.en, flag: c.flag, code: c.code, isCorrect: false,
      })),
    ])
    return { country, correctAnswer, questionType: 'find-country-by-code', choices }
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// REGIONS
// ─────────────────────────────────────────────────────────────────────────────

export function generateRegionFindRegionQuestions(
  countries, lang, ageMode, count,
  progressMap = {}, globalMasterCount = 0, regionFilter = 'all',
) {
  const isKids             = ageMode === 'kids'
  const choicesPerQuestion = isKids ? 3 : 4

  // requireCapital=false — region exists on all countries
  const { eligible, pool } = buildPool(
    countries, lang, ageMode, progressMap, false, globalMasterCount, regionFilter,
  )

  const validEligible = eligible.filter(c => getRegionKey(c, ageMode))
  if (validEligible.length < choicesPerQuestion) return []

  // pool items are { item, weight } — use p.item to access country
  const validPool   = pool.filter(p => getRegionKey(p.item, ageMode))
  const actualCount = Math.min(count, validPool.length)
  // weightedSample returns raw country objects
  const selected    = weightedSample(validPool, actualCount)

  const allRegionKeys = [...new Set(validEligible.map(c => getRegionKey(c, ageMode)))]

  return selected.map(country => {
    const regionKey     = getRegionKey(country, ageMode)
    const regionDisplay = (REGION_NAMES[regionKey]?.[lang]) || regionKey

    const wrongRegionKeys = shuffle(
      allRegionKeys.filter(r => r !== regionKey),
    ).slice(0, choicesPerQuestion - 1)

    const choices = shuffle([
      { label: regionDisplay, isCorrect: true },
      ...wrongRegionKeys.map(r => ({
        label: (REGION_NAMES[r]?.[lang]) || r, isCorrect: false,
      })),
    ])

    return { country, regionKey, correctAnswer: regionDisplay, questionType: 'find-region', choices }
  })
}

export function generateRegionFindCountryQuestions(
  countries, lang, ageMode, count,
  progressMap = {}, globalMasterCount = 0, regionFilter = 'all',
) {
  const isKids             = ageMode === 'kids'
  const choicesPerQuestion = isKids ? 3 : 4

  const { eligible } = buildPool(
    countries, lang, ageMode, progressMap, false, globalMasterCount, regionFilter,
  )

  const withRegion = eligible.filter(c => getRegionKey(c, ageMode))
  if (withRegion.length < choicesPerQuestion) return []

  const regionMap = {}
  withRegion.forEach(c => {
    const key = getRegionKey(c, ageMode)
    if (!regionMap[key]) regionMap[key] = []
    regionMap[key].push(c)
  })

  const regionKeys   = Object.keys(regionMap)
  const shuffledKeys = shuffle(regionKeys)
  const selectedKeys = shuffledKeys.slice(0, Math.min(count, shuffledKeys.length))

  return selectedKeys.map(regionKey => {
    const validCountries = regionMap[regionKey]
    const regionDisplay  = (REGION_NAMES[regionKey]?.[lang]) || regionKey

    const canonicalCode    = CANONICAL_REGION_COUNTRY[regionKey]
    const canonicalCountry = validCountries.find(c => c.code === canonicalCode)
                          || validCountries.slice().sort((a, b) => b.population - a.population)[0]
    const correctAnswer    = canonicalCountry.name[lang] || canonicalCountry.name.en

    const acceptedAnswers = new Set(
      validCountries.map(c => norm(c.name[lang] || c.name.en)),
    )

    const wrongPool      = withRegion.filter(c => getRegionKey(c, ageMode) !== regionKey)
    const wrongCountries = shuffle(wrongPool).slice(0, choicesPerQuestion - 1)

    const choices = shuffle([
      { label: correctAnswer, flag: canonicalCountry.flag, isCorrect: true },
      ...wrongCountries.map(c => ({
        label: c.name[lang] || c.name.en, flag: c.flag, isCorrect: false,
      })),
    ])

    const otherValidCount = Math.max(0, validCountries.length - 1)

    return {
      country:         canonicalCountry,
      regionKey,
      regionDisplay,
      correctAnswer,
      acceptedAnswers,
      otherValidCount,
      questionType:    'find-country-by-region',
      choices,
    }
  })
}
