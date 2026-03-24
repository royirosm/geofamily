// src/utils/questionGenerator.js
// ─────────────────────────────────────────────────────────────────────────────
// Generates quiz questions for all module/direction combinations.
//
// KIDS DYNAMIC POOL SYSTEM (Phase 7):
//   Kids start with 40 base countries. For every 5 countries mastered globally
//   (across all modules), 5 new countries unlock. Pool grows deterministically
//   from KIDS_COUNTRY_ORDER. No new storage — derived from existing SRS data.
//   Call getKidsPoolSize(globalMasterCount) to get current pool ceiling.
//
// AGE MODES (Phase 7):
//   'kids'     — dynamic tiered pool (40 + unlocks), 3 choices, large UI
//   'familiar' — curated ~100 well-known sovereign states, 4 choices
//   'expert'   — all ~235 countries with a capital, 4 choices
//
// Exported generators:
//   generateQuestions              → capitals / find-capital
//   generateReverseQuestions       → capitals / find-country
//   generateFlagToCountryQuestions → flags / flag-to-country
//   generateCountryToFlagQuestions → flags / country-to-flag
//   generateSovereigntyBinaryQuestions → sovereignty / country-or-territory
//   generateFindSovereignQuestions → sovereignty / find-sovereign
//
// Exported helpers:
//   getKidsPoolSize(globalMasterCount) → current kids pool ceiling
//   getKidsUnlockInfo(before, after)   → { newUnlocks } for results celebration
// ─────────────────────────────────────────────────────────────────────────────

import { STRENGTH_WEIGHTS } from '../hooks/usePlayerProgress'
import { SOVEREIGN_POOL }   from '../i18n/countries/sovereigns'

// ── Kids unlock constants ─────────────────────────────────────────────────────
export const KIDS_BASE_SIZE    = 40   // starting pool
export const KIDS_UNLOCK_EVERY = 5    // master this many → unlock more
export const KIDS_UNLOCK_BATCH = 5    // how many unlock each time

/** Given global master count, return current kids pool ceiling */
export function getKidsPoolSize(globalMasterCount) {
  const unlocked = Math.floor(globalMasterCount / KIDS_UNLOCK_EVERY) * KIDS_UNLOCK_BATCH
  return KIDS_BASE_SIZE + unlocked
}

/** Returns how many new countries just unlocked between two master counts */
export function getKidsUnlockInfo(mastersBefore, mastersAfter) {
  const thresholdBefore = Math.floor(mastersBefore / KIDS_UNLOCK_EVERY)
  const thresholdAfter  = Math.floor(mastersAfter  / KIDS_UNLOCK_EVERY)
  const newUnlocks      = (thresholdAfter - thresholdBefore) * KIDS_UNLOCK_BATCH
  return { newUnlocks: Math.max(0, newUnlocks) }
}

// ── Kids country order ────────────────────────────────────────────────────────
// Ordered by recognisability to a 5–9 year old in a typical Western/Mediterranean
// household. Tier 1 = base 40, Tier 2 = next 40, Tier 3 = next 40, Tier 4 = rest.
// The question generator takes the first N codes from this list based on pool size.
//
// All 4 tiers listed here = ~160 codes. Anything not listed comes after them
// (the full countries array is appended as a final catch-all in buildKidsPool).

export const KIDS_COUNTRY_ORDER = [
  // ── Tier 1 — base 40 (most recognisable globally) ──────────────────────────
  'FR','DE','IT','ES','GB','US','CA','BR','AR','MX',
  'RU','CN','JP','IN','AU','ZA','EG','NG','KE','MA',
  'GR','CY','TR','IL','SA','AE','TH','KR','ID','NZ',
  'SE','NO','DK','FI','PL','NL','BE','CH','AT','PT',

  // ── Tier 2 — next 40 (European fills + larger world countries) ─────────────
  'IE','HU','RO','UA','CZ','SK','HR','RS','GE','AM',   // Europe + Caucasus
  'PK','BD','VN','PH','MM','ET','TZ','ZW','ZM','SN',   // Asia + Africa
  'CO','VE','EC','BO','PY','UY','CU','DO','CR','PA',   // Latin America
  'LB','JO','IQ','KW','QA','BH','OM','YE','LY','TN',   // Middle East + N Africa

  // ── Tier 3 — next 40 (smaller but notable countries) ───────────────────────
  'GT','HN','SV','NI','JM','HT','BS','TT','BB','LC',   // Central America + Caribbean
  'LT','LV','EE','SI','BA','ME','MK','AL','MD','BY',   // Eastern Europe
  'AZ','KZ','UZ','KG','TJ','TM','AF','NP','LK','KH',   // Central + S Asia
  'GH','CI','CM','AO','MZ','MG','RW','UG','MW','NA',   // Sub-Saharan Africa

  // ── Tier 4 — next 40 (less common but still notable) ───────────────────────
  'TG','BJ','BF','ML','NE','GN','SL','LR','GM','GW',   // W Africa
  'CF','TD','CG','CD','GA','GQ','NR','SS','ER','DJ',   // C + E Africa
  'SO','MR','CV','ST','SC','MU','KM','BI','SZ','LS',   // Islands + S Africa
  'FJ','PG','SB','VU','TO','WS','FM','PW','KI','TV',   // Pacific
]

// ── Familiar pool (~100 well-known sovereign states) ─────────────────────────
// Curated list for 'familiar' mode — adults who want a manageable pool.
// All UN member states that are regularly in news/curricula, pop > ~500k,
// plus a few smaller but very well-known ones (IS, MT, LU, CY, etc.).
// Excludes: microstates under 100k, most territories, very remote islands.

export const FAMILIAR_COUNTRIES = new Set([
  // Europe (34)
  'FR','DE','IT','ES','GB','PT','NL','BE','CH','AT',
  'SE','NO','DK','FI','PL','CZ','SK','HU','RO','UA',
  'GR','TR','HR','RS','BA','SI','BG','MK','AL','ME',
  'IE','IS','LU','MT','CY','GE','AM','AZ','MD','BY',
  // Americas (18)
  'US','CA','MX','BR','AR','CO','VE','PE','CL','EC',
  'BO','PY','UY','CU','DO','GT','HN','CR',
  // Africa (20)
  'EG','MA','TN','LY','DZ','NG','ZA','KE','ET','GH',
  'TZ','CM','CI','SN','AO','MZ','ZM','ZW','SD','SS',
  // Asia (22)
  'CN','JP','KR','IN','PK','BD','VN','TH','ID','PH',
  'MY','MM','KH','NP','LK','IR','IQ','SA','AE','IL',
  'JO','KW',
  // Oceania (2)
  'AU','NZ',
  // Russia + Central Asia (4)
  'RU','KZ','UZ','AF',
])

// ── Territories considered "common" for Kids sovereignty module ───────────────
export const COMMON_TERRITORIES = new Set([
  'GU','PR','VI','AS','MP',   // US
  'GI','FK','BM','VG','KY',   // UK
  'NC','PF','GP','MQ','RE',   // France
  'AW','CW',                  // Netherlands
  'GL','FO',                  // Denmark
  'HK','MO',                  // China
])

// ── Utilities ─────────────────────────────────────────────────────────────────

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

function cap(country, lang) {
  if (!country.capital) return ''
  if (typeof country.capital === 'object') return country.capital[lang] ?? country.capital.en ?? ''
  return country.capital
}

function name(country, lang) {
  if (typeof country.name === 'object') return country.name[lang] ?? country.name.en ?? ''
  return country.name
}

// ── Pool builders ─────────────────────────────────────────────────────────────

/**
 * Builds the eligible country set + SRS-weighted pool for a given mode.
 *
 * ageMode 'kids'     → dynamic tiered set, size = getKidsPoolSize(globalMasterCount)
 * ageMode 'familiar' → FAMILIAR_COUNTRIES set
 * ageMode 'expert'   → all countries (legacy 'explorer' also maps here)
 *
 * globalMasterCount only needed for kids mode; pass 0 for other modes.
 */
function buildPool(countries, lang, ageMode, progressMap, requireCapital = true, globalMasterCount = 0) {
  let eligible

  if (ageMode === 'kids') {
    const poolSize     = getKidsPoolSize(globalMasterCount)
    const orderedCodes = buildKidsEligibleCodes(countries, poolSize)
    eligible = countries.filter(c =>
      c.flag &&
      (!requireCapital || (c.capital && cap(c, lang))) &&
      orderedCodes.has(c.code)
    )
  } else if (ageMode === 'familiar') {
    eligible = countries.filter(c =>
      c.flag &&
      (!requireCapital || (c.capital && cap(c, lang))) &&
      FAMILIAR_COUNTRIES.has(c.code)
    )
  } else {
    // 'expert' or legacy 'explorer' — all countries
    eligible = countries.filter(c =>
      c.flag &&
      (!requireCapital || (c.capital && cap(c, lang)))
    )
  }

  const pool = eligible.map(country => ({
    item:   country,
    weight: STRENGTH_WEIGHTS[progressMap[country.code]?.strength ?? 'new'],
  }))

  return { eligible, pool }
}

/**
 * Builds the set of country codes eligible for kids mode.
 * Takes first `poolSize` codes from KIDS_COUNTRY_ORDER,
 * then appends any remaining countries not already listed
 * (so the pool never has gaps if a code is missing from the order list).
 */
function buildKidsEligibleCodes(countries, poolSize) {
  const allCodes  = new Set(countries.map(c => c.code))
  const ordered   = KIDS_COUNTRY_ORDER.filter(code => allCodes.has(code))
  // Append any country codes not in our order list at the end
  const unlisted  = [...allCodes].filter(code => !KIDS_COUNTRY_ORDER.includes(code)).sort()
  const full      = [...ordered, ...unlisted]
  return new Set(full.slice(0, poolSize))
}

// ── capitals / find-capital ───────────────────────────────────────────────────

export function generateQuestions(countries, lang, ageMode, count, progressMap = {}, globalMasterCount = 0) {
  const isKids             = ageMode === 'kids'
  const choicesPerQuestion = isKids ? 3 : 4
  const { eligible, pool } = buildPool(countries, lang, ageMode, progressMap, true, globalMasterCount)

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
      correctAnswer: correctCapital,
      questionType:  'find-capital',
      choices,
    }
  })
}

// ── capitals / find-country ───────────────────────────────────────────────────

export function generateReverseQuestions(countries, lang, ageMode, count, progressMap = {}, globalMasterCount = 0) {
  const isKids             = ageMode === 'kids'
  const choicesPerQuestion = isKids ? 3 : 4
  const { eligible, pool } = buildPool(countries, lang, ageMode, progressMap, true, globalMasterCount)

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
      correctAnswer: correctName,
      questionType:  'find-country',
      choices,
    }
  })
}

// ── flags / flag-to-country ───────────────────────────────────────────────────

export function generateFlagToCountryQuestions(countries, lang, ageMode, count, progressMap = {}, globalMasterCount = 0) {
  const isKids             = ageMode === 'kids'
  const choicesPerQuestion = isKids ? 3 : 4
  const { eligible, pool } = buildPool(countries, lang, ageMode, progressMap, false, globalMasterCount)

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

export function generateCountryToFlagQuestions(countries, lang, ageMode, count, progressMap = {}, globalMasterCount = 0) {
  const isKids             = ageMode === 'kids'
  const choicesPerQuestion = isKids ? 3 : 4
  const { eligible, pool } = buildPool(countries, lang, ageMode, progressMap, false, globalMasterCount)

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
      correctAnswer: country.flag,
      questionType:  'country-to-flag',
      choices,
    }
  })
}

// ── sovereignty / country-or-territory ───────────────────────────────────────

export function generateSovereigntyBinaryQuestions(countries, lang, ageMode, count, progressMap = {}) {
  const isKids = ageMode === 'kids'

  const sovereigns  = countries.filter(c =>
    c.flag && c.independent === true &&
    (!isKids || new Set(KIDS_COUNTRY_ORDER.slice(0, KIDS_BASE_SIZE)).has(c.code))
  )
  const territories = countries.filter(c =>
    c.flag && c.independent === false && c.sovereign &&
    (!isKids || COMMON_TERRITORIES.has(c.code))
  )

  if (sovereigns.length === 0 || territories.length === 0) return []

  const halfA = Math.ceil(count / 2)
  const halfB = Math.floor(count / 2)

  function buildWeightedPool(pool) {
    return pool.map(country => ({
      item:   country,
      weight: STRENGTH_WEIGHTS[progressMap[country.code]?.strength ?? 'new'],
    }))
  }

  const selectedSovereigns  = weightedSample(buildWeightedPool(sovereigns),  Math.min(halfA, sovereigns.length))
  const selectedTerritories = weightedSample(buildWeightedPool(territories), Math.min(halfB, territories.length))

  return shuffle([...selectedSovereigns, ...selectedTerritories]).map(country => ({
    country,
    questionType: 'country-or-territory',
  }))
}

// ── sovereignty / find-sovereign ─────────────────────────────────────────────

export function generateFindSovereignQuestions(countries, lang, ageMode, count, progressMap = {}) {
  const isKids             = ageMode === 'kids'
  const choicesPerQuestion = isKids ? 3 : 4

  const territories = countries.filter(c =>
    c.flag && c.independent === false && c.sovereign &&
    (!isKids || COMMON_TERRITORIES.has(c.code))
  )

  if (territories.length < 1) return []

  const pool = territories.map(c => ({
    item:   c,
    weight: STRENGTH_WEIGHTS[progressMap[c.code]?.strength ?? 'new'],
  }))

  const actualCount = Math.min(count, territories.length)
  const selected    = weightedSample(pool, actualCount)

  return selected.map(country => {
    const correctSovereign = country.sovereign
    const correctLabel     = correctSovereign.name[lang] ?? correctSovereign.name.en
    const otherSovereigns  = SOVEREIGN_POOL.filter(s => s.code !== correctSovereign.code)
    const wrongSovereigns  = shuffle(otherSovereigns).slice(0, choicesPerQuestion - 1)

    const choices = shuffle([
      { label: correctLabel, flag: correctSovereign.flag, isCorrect: true  },
      ...wrongSovereigns.map(s => ({
        label:     s.name[lang] ?? s.name.en,
        flag:      s.flag,
        isCorrect: false,
      })),
    ])

    return {
      country,
      correctAnswer: correctLabel,
      questionType:  'find-sovereign',
      choices,
    }
  })
}
