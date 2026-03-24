// src/utils/questionGenerator.js
// ─────────────────────────────────────────────────────────────────────────────
// Phase 8C additions:
//   - buildPool() accepts optional `regionFilter` string (e.g. 'Europe')
//   - When regionFilter is set (and not 'all'), eligible countries are filtered
//     to that region AFTER age-mode filtering, before SRS weighting
//   - All 4 main generators pass regionFilter through to buildPool
//   - Sovereignty generators are unaffected (no region concept there)
//   - Generator signature:
//       generateQuestions(countries, lang, ageMode, count, progressMap, globalMasterCount, regionFilter)
// ─────────────────────────────────────────────────────────────────────────────

// ── Kids unlock helpers ───────────────────────────────────────────────────────

const KIDS_BASE_SIZE = 40
const KIDS_STEP_SIZE = 5   // unlock 5 more per 5 mastered

export function getKidsPoolSize(globalMasterCount) {
  return KIDS_BASE_SIZE + Math.floor(globalMasterCount / KIDS_STEP_SIZE) * KIDS_STEP_SIZE
}

export function getKidsUnlockInfo(mastersBefore, mastersAfter) {
  const before = getKidsPoolSize(mastersBefore)
  const after  = getKidsPoolSize(mastersAfter)
  return { newUnlocks: Math.max(0, after - before) }
}

// ── Familiar pool (~100 well-known sovereign states) ─────────────────────────
export const FAMILIAR_COUNTRIES = new Set([
  'AF','AL','DZ','AD','AO','AG','AR','AM','AU','AT','AZ','BS','BH','BD','BB',
  'BY','BE','BZ','BJ','BT','BO','BA','BW','BR','BN','BG','BF','BI','CV','KH',
  'CM','CA','CF','TD','CL','CN','CO','KM','CG','CR','HR','CU','CY','CZ','DK',
  'DJ','DM','DO','EC','EG','SV','GQ','ER','EE','SZ','ET','FJ','FI','FR','GA',
  'GM','GE','DE','GH','GR','GD','GT','GN','GW','GY','HT','HN','HU','IS','IN',
  'ID','IR','IQ','IE','IL','IT','JM','JP','JO','KZ','KE','KI','KP','KR','KW',
  'KG','LA','LV','LB','LS','LR','LY','LI','LT','LU','MG','MW','MY','MV','ML',
  'MT','MH','MR','MU','MX','FM','MD','MC','MN','ME','MA','MZ','MM','NA','NR',
  'NP','NL','NZ','NI','NE','NG','NO','OM','PK','PW','PA','PG','PY','PE','PH',
  'PL','PT','QA','RO','RU','RW','KN','LC','VC','WS','SM','ST','SA','SN','RS',
  'SC','SL','SG','SK','SI','SB','SO','ZA','SS','ES','LK','SD','SR','SE','CH',
  'SY','TW','TJ','TZ','TH','TL','TG','TO','TT','TN','TR','TM','TV','UG','UA',
  'AE','GB','US','UY','UZ','VU','VE','VN','YE','ZM','ZW',
])

// ── Common territories (kids sovereignty) ────────────────────────────────────
export const COMMON_TERRITORIES = new Set([
  'PR','GU','VI','AS','MP',          // US territories
  'GI','HK','MO','FK','BM','KY',     // GB / other
  'GP','MQ','GF','RE','NC','PF','MF',// FR territories
  'AW','CW','SX','BQ',               // NL territories
  'GL','FO',                         // DK territories
  'GG','JE','IM',                    // Crown dependencies
])

// ── Kids country order (4 tiers of 40) ───────────────────────────────────────
export const KIDS_COUNTRY_ORDER = [
  // Tier 1
  'FR','DE','IT','ES','GB','US','CA','BR','AR','MX',
  'RU','CN','JP','IN','AU','ZA','EG','NG','KE','MA',
  'GR','CY','TR','IL','SA','AE','TH','KR','ID','NZ',
  'SE','NO','DK','FI','PL','NL','BE','CH','AT','PT',
  // Tier 2
  'IE','HU','RO','UA','CZ','SK','HR','RS','GE','AM',
  'PK','BD','VN','PH','MM','ET','TZ','ZW','ZM','SN',
  'CO','VE','EC','BO','PY','UY','CU','DO','CR','PA',
  'LB','JO','IQ','KW','QA','BH','OM','YE','LY','TN',
  // Tier 3
  'GT','HN','SV','NI','JM','HT','BS','TT','BB','LC',
  'LT','LV','EE','SI','BA','ME','MK','AL','MD','BY',
  'AZ','KZ','UZ','KG','TJ','TM','AF','NP','LK','KH',
  'GH','CI','CM','AO','MZ','MG','RW','UG','MW','NA',
  // Tier 4
  'TG','BJ','BF','ML','NE','GN','SL','LR','GM','GW',
  'CF','TD','CG','CD','GA','GQ','NR','SS','ER','DJ',
  'SO','MR','CV','ST','SC','MU','KM','BI','SZ','LS',
  'FJ','PG','SB','VU','TO','WS','FM','PW','KI','TV',
]

// ── Sovereign pool for find-sovereign distractors ────────────────────────────
export const SOVEREIGN_POOL = [
  { code: 'GB', flag: 'https://flagcdn.com/gb.svg', name: { en: 'United Kingdom', el: 'Ηνωμένο Βασίλειο' } },
  { code: 'US', flag: 'https://flagcdn.com/us.svg', name: { en: 'United States',  el: 'Ηνωμένες Πολιτείες' } },
  { code: 'FR', flag: 'https://flagcdn.com/fr.svg', name: { en: 'France',          el: 'Γαλλία' } },
  { code: 'NL', flag: 'https://flagcdn.com/nl.svg', name: { en: 'Netherlands',     el: 'Ολλανδία' } },
  { code: 'DK', flag: 'https://flagcdn.com/dk.svg', name: { en: 'Denmark',         el: 'Δανία' } },
  { code: 'NO', flag: 'https://flagcdn.com/no.svg', name: { en: 'Norway',          el: 'Νορβηγία' } },
  { code: 'AU', flag: 'https://flagcdn.com/au.svg', name: { en: 'Australia',       el: 'Αυστραλία' } },
  { code: 'NZ', flag: 'https://flagcdn.com/nz.svg', name: { en: 'New Zealand',     el: 'Νέα Ζηλανδία' } },
  { code: 'CN', flag: 'https://flagcdn.com/cn.svg', name: { en: 'China',           el: 'Κίνα' } },
  { code: 'FI', flag: 'https://flagcdn.com/fi.svg', name: { en: 'Finland',         el: 'Φινλανδία' } },
]

// ── SRS weights ───────────────────────────────────────────────────────────────
export const STRENGTH_WEIGHTS = {
  new:        10,
  beginner:   8,
  learner:    6,
  practising: 4,
  advanced:   2,
  master:     1,
}

// ── Utility ───────────────────────────────────────────────────────────────────

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function weightedSample(pool, count) {
  const result = []
  const used   = new Set()
  const total  = () => pool.reduce((s, e) => s + (used.has(e.item.code) ? 0 : e.weight), 0)
  for (let i = 0; i < count && used.size < pool.length; i++) {
    let r = Math.random() * total()
    for (const entry of pool) {
      if (used.has(entry.item.code)) continue
      r -= entry.weight
      if (r <= 0) { result.push(entry.item); used.add(entry.item.code); break }
    }
  }
  return result
}

function cap(country, lang) {
  return country.capital?.[lang] ?? country.capital?.en ?? ''
}

function name(country, lang) {
  return country.name?.[lang] ?? country.name?.en ?? ''
}

// ── Kids pool builder ─────────────────────────────────────────────────────────

function buildKidsEligibleCodes(countries, poolSize) {
  const allCodes = new Set(countries.map(c => c.code))
  const ordered  = KIDS_COUNTRY_ORDER.filter(code => allCodes.has(code))
  const unlisted = [...allCodes].filter(code => !KIDS_COUNTRY_ORDER.includes(code)).sort()
  const full     = [...ordered, ...unlisted]
  return new Set(full.slice(0, poolSize))
}

// ── Pool builder ──────────────────────────────────────────────────────────────
//
// Phase 8C: accepts optional `regionFilter` param.
// When set and not 'all', eligible countries are filtered to that region
// AFTER age-mode filtering, so region narrows within the age pool.

function buildPool(
  countries,
  lang,
  ageMode,
  progressMap,
  requireCapital   = true,
  globalMasterCount = 0,
  regionFilter     = 'all',
) {
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
    eligible = countries.filter(c =>
      c.flag &&
      (!requireCapital || (c.capital && cap(c, lang)))
    )
  }

  // 8C: apply region filter (skip for 'all' or undefined)
  if (regionFilter && regionFilter !== 'all') {
    eligible = eligible.filter(c => c.region === regionFilter)
  }

  const pool = eligible.map(country => ({
    item:   country,
    weight: STRENGTH_WEIGHTS[progressMap[country.code]?.strength ?? 'new'],
  }))

  return { eligible, pool }
}

// ── capitals / find-capital ───────────────────────────────────────────────────

export function generateQuestions(
  countries, lang, ageMode, count,
  progressMap = {}, globalMasterCount = 0, regionFilter = 'all',
) {
  const isKids             = ageMode === 'kids'
  const choicesPerQuestion = isKids ? 3 : 4
  const { eligible, pool } = buildPool(countries, lang, ageMode, progressMap, true, globalMasterCount, regionFilter)

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

export function generateReverseQuestions(
  countries, lang, ageMode, count,
  progressMap = {}, globalMasterCount = 0, regionFilter = 'all',
) {
  const isKids             = ageMode === 'kids'
  const choicesPerQuestion = isKids ? 3 : 4
  const { eligible, pool } = buildPool(countries, lang, ageMode, progressMap, true, globalMasterCount, regionFilter)

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

export function generateFlagToCountryQuestions(
  countries, lang, ageMode, count,
  progressMap = {}, globalMasterCount = 0, regionFilter = 'all',
) {
  const isKids             = ageMode === 'kids'
  const choicesPerQuestion = isKids ? 3 : 4
  const { eligible, pool } = buildPool(countries, lang, ageMode, progressMap, false, globalMasterCount, regionFilter)

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

export function generateCountryToFlagQuestions(
  countries, lang, ageMode, count,
  progressMap = {}, globalMasterCount = 0, regionFilter = 'all',
) {
  const isKids             = ageMode === 'kids'
  const choicesPerQuestion = isKids ? 3 : 4
  const { eligible, pool } = buildPool(countries, lang, ageMode, progressMap, false, globalMasterCount, regionFilter)

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
// (no regionFilter — sovereignty is global by nature)

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
