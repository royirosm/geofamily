// src/config/modules.js
// ─────────────────────────────────────────────────────────────────────────────
// SINGLE SOURCE OF TRUTH for every module, direction, and mode in GeoFamily.
//
// Structure:  module → directions[] → modes[]
//
// To add a new module:        add an entry to MODULES
// To add a new direction:     add to module.directions[]
// To unlock a Phase 6 mode:   set locked: false on the mode entry
// To wire a new component:    add one Route in App.jsx only
//
// Route convention:
//   /module/:moduleId                    → ModuleSelectScreen
//   /quiz/:moduleId/:directionId/:modeId → quiz component
//
// ─────────────────────────────────────────────────────────────────────────────

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
        id:      'find-capital',
        labelKey: 'dirFindCapital',
        emoji:   '🗺️',
        descKey: 'dirFindCapitalDesc',
        modes: [
          { id: 'multiple-choice', labelKey: 'modeMultipleChoice', emoji: '☑️', locked: false },
          { id: 'type-answer',     labelKey: 'modeTypeAnswer',     emoji: '⌨️', locked: true  },
          { id: 'flashcard',       labelKey: 'modeFlashcard',      emoji: '🃏', locked: true  },
        ],
      },
      {
        id:      'find-country',
        labelKey: 'dirFindCountry',
        emoji:   '❓',
        descKey: 'dirFindCountryDesc',
        modes: [
          { id: 'multiple-choice', labelKey: 'modeMultipleChoice', emoji: '☑️', locked: false },
          { id: 'type-answer',     labelKey: 'modeTypeAnswer',     emoji: '⌨️', locked: true  },
          { id: 'flashcard',       labelKey: 'modeFlashcard',      emoji: '🃏', locked: true  },
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
        id:      'flag-to-country',
        labelKey: 'dirFlagToCountry',
        emoji:   '🏳️',
        descKey: 'dirFlagToCountryDesc',
        modes: [
          { id: 'multiple-choice', labelKey: 'modeMultipleChoice', emoji: '☑️', locked: false },
          { id: 'type-answer',     labelKey: 'modeTypeAnswer',     emoji: '⌨️', locked: true  },
          { id: 'flashcard',       labelKey: 'modeFlashcard',      emoji: '🃏', locked: true  },
        ],
      },
      {
        id:      'country-to-flag',
        labelKey: 'dirCountryToFlag',
        emoji:   '🌍',
        descKey: 'dirCountryToFlagDesc',
        modes: [
          { id: 'multiple-choice', labelKey: 'modeMultipleChoice', emoji: '☑️', locked: false },
          { id: 'flashcard',       labelKey: 'modeFlashcard',      emoji: '🃏', locked: true  },
          // Note: type-answer not applicable — answer is a visual flag
        ],
      },
    ],
  },

  // ── COMING SOON ────────────────────────────────────────────────────────────
  {
    id:        'cities',
    labelKey:  'modulesCities',
    emoji:     '🏙️',
    gradient:  'from-amber-400 to-orange-500',
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

// ── Helpers ───────────────────────────────────────────────────────────────────

export function getModule(moduleId) {
  return MODULES.find(m => m.id === moduleId) ?? null
}

export function getDirection(moduleId, directionId) {
  return getModule(moduleId)?.directions.find(d => d.id === directionId) ?? null
}

export function getMode(moduleId, directionId, modeId) {
  return getDirection(moduleId, directionId)?.modes.find(m => m.id === modeId) ?? null
}

/** First unlocked mode for a direction */
export function defaultMode(moduleId, directionId) {
  return getDirection(moduleId, directionId)?.modes.find(m => !m.locked) ?? null
}

/** Build quiz route path */
export function quizPath(moduleId, directionId, modeId) {
  return `/quiz/${moduleId}/${directionId}/${modeId}`
}
