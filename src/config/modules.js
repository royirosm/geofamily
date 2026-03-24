// src/config/modules.js
// Phase 7: sovereignty module added (country-or-territory + find-sovereign)

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
          // type-answer not applicable — answer is a visual flag
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
          // Uses SovereigntyBinary component — registered as 'multiple-choice' route
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

  // ── COMING SOON ────────────────────────────────────────────────────────────
  {
    id:        'cities',
    labelKey:  'modulesCities',
    emoji:     '🏙️',
    gradient:  'from-violet-400 to-purple-600',
    available: false,
    directions: [],
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
