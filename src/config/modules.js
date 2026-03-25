// src/config/modules.js
// Phase 7:  sovereignty module added
// Phase 10: currencies, codes, regions modules added (Wave 1)

export const MODULES = [

  // ── CAPITALS ───────────────────────────────────────────────────────────────
  {
    id:        'capitals',
    labelKey:  'modulesCapitals',
    emoji:     '🏛️',
    gradient:  'from-blue-500 to-indigo-600',
    available: true,
    directions: [
      {
        id:       'find-capital',
        labelKey: 'dirFindCapital',
        emoji:    '🗺️',
        descKey:  'dirFindCapitalDesc',
        modes: [
          { id: 'multiple-choice', labelKey: 'modeMultipleChoice', emoji: '☑️', locked: false },
          { id: 'type-answer',     labelKey: 'modeTypeAnswer',     emoji: '⌨️', locked: false },
          { id: 'flashcard',       labelKey: 'modeFlashcard',      emoji: '🃏', locked: false },
        ],
      },
      {
        id:       'find-country',
        labelKey: 'dirFindCountry',
        emoji:    '❓',
        descKey:  'dirFindCountryDesc',
        modes: [
          { id: 'multiple-choice', labelKey: 'modeMultipleChoice', emoji: '☑️', locked: false },
          { id: 'type-answer',     labelKey: 'modeTypeAnswer',     emoji: '⌨️', locked: false },
          { id: 'flashcard',       labelKey: 'modeFlashcard',      emoji: '🃏', locked: false },
        ],
      },
    ],
  },

  // ── FLAGS ──────────────────────────────────────────────────────────────────
  {
    id:        'flags',
    labelKey:  'modulesFlags',
    emoji:     '🚩',
    gradient:  'from-rose-400 to-pink-600',
    available: true,
    directions: [
      {
        id:       'flag-to-country',
        labelKey: 'dirFlagToCountry',
        emoji:    '🏳️',
        descKey:  'dirFlagToCountryDesc',
        modes: [
          { id: 'multiple-choice', labelKey: 'modeMultipleChoice', emoji: '☑️', locked: false },
          { id: 'type-answer',     labelKey: 'modeTypeAnswer',     emoji: '⌨️', locked: false },
          { id: 'flashcard',       labelKey: 'modeFlashcard',      emoji: '🃏', locked: false },
        ],
      },
      {
        id:       'country-to-flag',
        labelKey: 'dirCountryToFlag',
        emoji:    '🌍',
        descKey:  'dirCountryToFlagDesc',
        modes: [
          { id: 'multiple-choice', labelKey: 'modeMultipleChoice', emoji: '☑️', locked: false },
          { id: 'flashcard',       labelKey: 'modeFlashcard',      emoji: '🃏', locked: false },
        ],
      },
    ],
  },

  // ── SOVEREIGNTY ────────────────────────────────────────────────────────────
  {
    id:        'sovereignty',
    labelKey:  'modulesSovereignty',
    emoji:     '🌐',
    gradient:  'from-amber-400 to-orange-500',
    available: true,
    directions: [
      {
        id:       'country-or-territory',
        labelKey: 'dirCountryOrTerritory',
        emoji:    '🗺️',
        descKey:  'dirCountryOrTerritoryDesc',
        modes: [
          { id: 'multiple-choice', labelKey: 'modeMultipleChoice', emoji: '☑️', locked: false },
        ],
      },
      {
        id:       'find-sovereign',
        labelKey: 'dirFindSovereign',
        emoji:    '🏛️',
        descKey:  'dirFindSovereignDesc',
        modes: [
          { id: 'multiple-choice', labelKey: 'modeMultipleChoice', emoji: '☑️', locked: false },
        ],
      },
    ],
  },

  // ── CURRENCIES ─────────────────────────────────────────────────────────────
  {
    id:        'currencies',
    labelKey:  'modulesCurrencies',
    emoji:     '💰',
    gradient:  'from-amber-400 to-yellow-500',
    available: true,
    directions: [
      {
        id:       'find-currency',
        labelKey: 'dirFindCurrency',
        emoji:    '💵',
        descKey:  'dirFindCurrencyDesc',
        modes: [
          { id: 'multiple-choice', labelKey: 'modeMultipleChoice', emoji: '☑️', locked: false },
          { id: 'type-answer',     labelKey: 'modeTypeAnswer',     emoji: '⌨️', locked: false },
          { id: 'flashcard',       labelKey: 'modeFlashcard',      emoji: '🃏', locked: false },
        ],
      },
      {
        id:       'find-country',
        labelKey: 'dirFindCountry',
        emoji:    '❓',
        descKey:  'dirFindCountryByCurrencyDesc',
        modes: [
          { id: 'multiple-choice', labelKey: 'modeMultipleChoice', emoji: '☑️', locked: false },
          { id: 'type-answer',     labelKey: 'modeTypeAnswer',     emoji: '⌨️', locked: false },
          { id: 'flashcard',       labelKey: 'modeFlashcard',      emoji: '🃏', locked: false },
        ],
      },
    ],
  },

  // ── COUNTRY CODES ──────────────────────────────────────────────────────────
  {
    id:        'codes',
    labelKey:  'modulesCodes',
    emoji:     '🔤',
    gradient:  'from-blue-400 to-cyan-500',
    available: true,
    directions: [
      {
        id:       'find-code',
        labelKey: 'dirFindCode',
        emoji:    '🔡',
        descKey:  'dirFindCodeDesc',
        modes: [
          { id: 'multiple-choice', labelKey: 'modeMultipleChoice', emoji: '☑️', locked: false },
          { id: 'type-answer',     labelKey: 'modeTypeAnswer',     emoji: '⌨️', locked: false },
          { id: 'flashcard',       labelKey: 'modeFlashcard',      emoji: '🃏', locked: false },
        ],
      },
      {
        id:       'find-country',
        labelKey: 'dirFindCountry',
        emoji:    '❓',
        descKey:  'dirFindCountryByCodeDesc',
        modes: [
          { id: 'multiple-choice', labelKey: 'modeMultipleChoice', emoji: '☑️', locked: false },
          { id: 'type-answer',     labelKey: 'modeTypeAnswer',     emoji: '⌨️', locked: false },
          { id: 'flashcard',       labelKey: 'modeFlashcard',      emoji: '🃏', locked: false },
        ],
      },
    ],
  },

  // ── REGIONS ────────────────────────────────────────────────────────────────
  {
    id:        'regions',
    labelKey:  'modulesRegions',
    emoji:     '🌍',
    gradient:  'from-green-400 to-emerald-600',
    available: true,
    directions: [
      {
        id:       'find-region',
        labelKey: 'dirFindRegion',
        emoji:    '📍',
        descKey:  'dirFindRegionDesc',
        modes: [
          { id: 'multiple-choice', labelKey: 'modeMultipleChoice', emoji: '☑️', locked: false },
          { id: 'type-answer',     labelKey: 'modeTypeAnswer',     emoji: '⌨️', locked: false },
          { id: 'flashcard',       labelKey: 'modeFlashcard',      emoji: '🃏', locked: false },
        ],
      },
      {
        id:       'find-country',
        labelKey: 'dirFindCountry',
        emoji:    '❓',
        descKey:  'dirFindCountryByRegionDesc',
        modes: [
          { id: 'multiple-choice', labelKey: 'modeMultipleChoice', emoji: '☑️', locked: false },
          { id: 'type-answer',     labelKey: 'modeTypeAnswer',     emoji: '⌨️', locked: false },
          { id: 'flashcard',       labelKey: 'modeFlashcard',      emoji: '🃏', locked: false },
        ],
      },
    ],
  },

  // ── COMING SOON ────────────────────────────────────────────────────────────
  // ── LANGUAGES ─────────────────────────────────────────────────────────────
  {
    id:        'languages',
    labelKey:  'modulesLanguages',
    emoji:     '🗣️',
    gradient:  'from-indigo-400 to-violet-500',
    available: true,
    directions: [
      {
        id:       'find-language',
        labelKey: 'dirFindLanguage',
        emoji:    '💬',
        descKey:  'dirFindLanguageDesc',
        modes: [
          { id: 'multiple-choice', labelKey: 'modeMultipleChoice', emoji: '☑️', locked: false },
          { id: 'type-answer',     labelKey: 'modeTypeAnswer',     emoji: '⌨️', locked: false },
          { id: 'flashcard',       labelKey: 'modeFlashcard',      emoji: '🃏', locked: false },
        ],
      },
      {
        id:       'find-country',
        labelKey: 'dirFindCountry',
        emoji:    '❓',
        descKey:  'dirFindCountryByLanguageDesc',
        modes: [
          { id: 'multiple-choice', labelKey: 'modeMultipleChoice', emoji: '☑️', locked: false },
          { id: 'type-answer',     labelKey: 'modeTypeAnswer',     emoji: '⌨️', locked: false },
          { id: 'flashcard',       labelKey: 'modeFlashcard',      emoji: '🃏', locked: false },
        ],
      },
    ],
  },

  // ── CITIES ─────────────────────────────────────────────────────────────────
  {
    id:        'cities',
    labelKey:  'modulesCities',
    emoji:     '🏙️',
    gradient:  'from-rose-400 to-pink-600',
    available: true,
    directions: [
      {
        id:       'find-city',
        labelKey: 'dirFindCity',
        emoji:    '🏙️',
        descKey:  'dirFindCityDesc',
        modes: [
          { id: 'multiple-choice', labelKey: 'modeMultipleChoice', emoji: '☑️', locked: false },
          { id: 'type-answer',     labelKey: 'modeTypeAnswer',     emoji: '⌨️', locked: false },
          { id: 'flashcard',       labelKey: 'modeFlashcard',      emoji: '🃏', locked: false },
        ],
      },
      {
        id:       'find-country',
        labelKey: 'dirFindCountry',
        emoji:    '❓',
        descKey:  'dirFindCountryByCityDesc',
        modes: [
          { id: 'multiple-choice', labelKey: 'modeMultipleChoice', emoji: '☑️', locked: false },
          { id: 'type-answer',     labelKey: 'modeTypeAnswer',     emoji: '⌨️', locked: false },
          { id: 'flashcard',       labelKey: 'modeFlashcard',      emoji: '🃏', locked: false },
        ],
      },
    ],
  },
  {
    id:        'map-quiz',
    labelKey:  'modulesMapQuiz',
    emoji:     '🗺️',
    gradient:  'from-emerald-400 to-teal-600',
    available: false,
    directions: [],
  },
]

export function getModule(moduleId) {
  return MODULES.find(m => m.id === moduleId) ?? null
}

export function getDirection(moduleId, directionId) {
  return getModule(moduleId)?.directions.find(d => d.id === directionId) ?? null
}

export function getMode(moduleId, directionId, modeId) {
  return getDirection(moduleId, directionId)?.modes.find(m => m.id === modeId) ?? null
}

export function defaultMode(moduleId, directionId) {
  return getDirection(moduleId, directionId)?.modes.find(m => !m.locked) ?? null
}

export function quizPath(moduleId, directionId, modeId) {
  return `/quiz/${moduleId}/${directionId}/${modeId}`
}
