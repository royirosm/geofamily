// src/data/regions.js
// ─────────────────────────────────────────────────────────────────────────────
// Static region/subregion data for the Regions module.
//
// REGIONS_BY_AGE_MODE:
//   kids      → 5 continents (RestCountries `region` field)
//   familiar/expert → subregions (RestCountries `subregion` field)
//
// CANONICAL_REGION_COUNTRY maps region/subregion → single canonical country
// for Flashcard "find-country" back face.
//
// REGION_NAMES provides bilingual display names for regions/subregions.
//
// REGION_HINT_LIST provides the fixed list of options shown as a hint in
// TypeAnswer mode (since answers come from a closed set).
// ─────────────────────────────────────────────────────────────────────────────

// The 5 RestCountries `region` values (used in kids mode)
export const CONTINENTS = ['Africa', 'Americas', 'Asia', 'Europe', 'Oceania']

// All RestCountries `subregion` values that have ≥ 2 countries in the dataset
export const SUBREGIONS = [
  'Australia and New Zealand',
  'Caribbean',
  'Central America',
  'Central Asia',
  'Eastern Africa',
  'Eastern Asia',
  'Eastern Europe',
  'Melanesia',
  'Micronesia',
  'Middle Africa',
  'Northern Africa',
  'Northern America',
  'Northern Europe',
  'Polynesia',
  'South America',
  'South-Eastern Asia',
  'Southern Africa',
  'Southern Asia',
  'Southern Europe',
  'Sub-Saharan Africa',
  'Western Africa',
  'Western Asia',
  'Western Europe',
]

// region/subregion → canonical country code (most populous / most recognisable)
export const CANONICAL_REGION_COUNTRY = {
  // Continents (kids)
  Africa:                    'NG',   // Nigeria
  Americas:                  'US',   // United States
  Asia:                      'CN',   // China
  Europe:                    'DE',   // Germany
  Oceania:                   'AU',   // Australia
  // Subregions (familiar/expert)
  'Australia and New Zealand': 'AU',
  'Caribbean':               'CU',
  'Central America':         'MX',
  'Central Asia':            'KZ',
  'Eastern Africa':          'ET',
  'Eastern Asia':            'CN',
  'Eastern Europe':          'RU',
  'Melanesia':               'PG',
  'Micronesia':              'FM',
  'Middle Africa':           'CD',
  'Northern Africa':         'EG',
  'Northern America':        'US',
  'Northern Europe':         'SE',
  'Polynesia':               'WS',
  'South America':           'BR',
  'South-Eastern Asia':      'ID',
  'Southern Africa':         'ZA',
  'Southern Asia':           'IN',
  'Southern Europe':         'IT',
  'Sub-Saharan Africa':      'NG',
  'Western Africa':          'NG',
  'Western Asia':            'TR',
  'Western Europe':          'FR',
}

// Bilingual region/subregion display names
export const REGION_NAMES = {
  // Continents
  Africa:    { en: 'Africa',   el: 'Αφρική' },
  Americas:  { en: 'Americas', el: 'Αμερική' },
  Asia:      { en: 'Asia',     el: 'Ασία' },
  Europe:    { en: 'Europe',   el: 'Ευρώπη' },
  Oceania:   { en: 'Oceania',  el: 'Ωκεανία' },

  // Subregions
  'Australia and New Zealand': { en: 'Australia & New Zealand', el: 'Αυστραλία & Νέα Ζηλανδία' },
  'Caribbean':                 { en: 'Caribbean',               el: 'Καραϊβική' },
  'Central America':           { en: 'Central America',         el: 'Κεντρική Αμερική' },
  'Central Asia':              { en: 'Central Asia',            el: 'Κεντρική Ασία' },
  'Eastern Africa':            { en: 'Eastern Africa',          el: 'Ανατολική Αφρική' },
  'Eastern Asia':              { en: 'Eastern Asia',            el: 'Ανατολική Ασία' },
  'Eastern Europe':            { en: 'Eastern Europe',          el: 'Ανατολική Ευρώπη' },
  'Melanesia':                 { en: 'Melanesia',               el: 'Μελανησία' },
  'Micronesia':                { en: 'Micronesia',              el: 'Μικρονησία' },
  'Middle Africa':             { en: 'Middle Africa',           el: 'Κεντρική Αφρική' },
  'Northern Africa':           { en: 'Northern Africa',         el: 'Βόρεια Αφρική' },
  'Northern America':          { en: 'Northern America',        el: 'Βόρεια Αμερική' },
  'Northern Europe':           { en: 'Northern Europe',         el: 'Βόρεια Ευρώπη' },
  'Polynesia':                 { en: 'Polynesia',               el: 'Πολυνησία' },
  'South America':             { en: 'South America',           el: 'Νότια Αμερική' },
  'South-Eastern Asia':        { en: 'South-Eastern Asia',      el: 'Νοτιοανατολική Ασία' },
  'Southern Africa':           { en: 'Southern Africa',         el: 'Νότια Αφρική' },
  'Southern Asia':             { en: 'Southern Asia',           el: 'Νότια Ασία' },
  'Southern Europe':           { en: 'Southern Europe',         el: 'Νότια Ευρώπη' },
  'Sub-Saharan Africa':        { en: 'Sub-Saharan Africa',      el: 'Υποσαχάρια Αφρική' },
  'Western Africa':            { en: 'Western Africa',          el: 'Δυτική Αφρική' },
  'Western Asia':              { en: 'Western Asia',            el: 'Δυτική Ασία' },
  'Western Europe':            { en: 'Western Europe',          el: 'Δυτική Ευρώπη' },
}

// Helper: get the region key used for a given country and ageMode
// Kids → country.region  |  familiar/expert → country.subregion
export function getRegionKey(country, ageMode) {
  return ageMode === 'kids' ? country.region : (country.subregion || country.region)
}

// Helper: get all valid region keys for a given ageMode
export function getRegionList(ageMode) {
  return ageMode === 'kids' ? CONTINENTS : SUBREGIONS
}
