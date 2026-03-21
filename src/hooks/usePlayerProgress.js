// usePlayerProgress.js
// Manages per-country SRS (Spaced Repetition System) data for the active player.
// Each country gets a record tracking correct/wrong counts, last seen date,
// and a computed strength level: 'new' | 'weak' | 'medium' | 'strong'
//
// Storage key format: geofamily_progress_{playerId}
// Shape stored in localStorage:
// {
//   "GR": { correct: 8, wrong: 1, lastSeen: "2026-03-21", strength: "strong" },
//   "CY": { correct: 2, wrong: 4, lastSeen: "2026-03-20", strength: "weak" },
//   ...
// }
//
// Usage:
//   const { getProgress, recordAnswer, getStrength } = usePlayerProgress()

import { useCallback } from 'react'
import { usePlayer }   from '../context/PlayerContext'

// ── Strength thresholds ───────────────────────────────────────────────────────
// net = correct - wrong
// 'new'    → never seen
// 'weak'   → net <= 1
// 'medium' → net 2–4
// 'strong' → net >= 5

function computeStrength(correct, wrong) {
  const net = correct - wrong
  if (net >= 5) return 'strong'
  if (net >= 2) return 'medium'
  return 'weak'
}

// ── Persistence helpers ───────────────────────────────────────────────────────

function storageKey(playerId) {
  return `geofamily_progress_${playerId}`
}

function loadProgress(playerId) {
  try {
    const raw = localStorage.getItem(storageKey(playerId))
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveProgress(playerId, data) {
  try {
    localStorage.setItem(storageKey(playerId), JSON.stringify(data))
  } catch { /* silently ignore */ }
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function usePlayerProgress() {
  const { activePlayer } = usePlayer()

  // Get the full progress map for the active player
  const getProgress = useCallback(() => {
    if (!activePlayer) return {}
    return loadProgress(activePlayer.id)
  }, [activePlayer])

  // Get a single country's record (or a 'new' default)
  const getCountryRecord = useCallback((countryCode) => {
    if (!activePlayer) return null
    const progress = loadProgress(activePlayer.id)
    return progress[countryCode] ?? { correct: 0, wrong: 0, lastSeen: null, strength: 'new' }
  }, [activePlayer])

  // Get just the strength level for a country
  const getStrength = useCallback((countryCode) => {
    return getCountryRecord(countryCode)?.strength ?? 'new'
  }, [getCountryRecord])

  // Record the result of a single answer and update the stored record
  const recordAnswer = useCallback((countryCode, isCorrect) => {
    if (!activePlayer) return
    const progress = loadProgress(activePlayer.id)
    const current  = progress[countryCode] ?? { correct: 0, wrong: 0 }

    const correct = current.correct + (isCorrect ? 1 : 0)
    const wrong   = current.wrong   + (isCorrect ? 0 : 1)

    progress[countryCode] = {
      correct,
      wrong,
      lastSeen: new Date().toISOString().split('T')[0], // YYYY-MM-DD
      strength: computeStrength(correct, wrong),
    }

    saveProgress(activePlayer.id, progress)
  }, [activePlayer])

  // Record a full round of answers at once (called from ResultsScreen)
  const recordRound = useCallback((answers) => {
    if (!activePlayer) return
    const progress = loadProgress(activePlayer.id)
    const today    = new Date().toISOString().split('T')[0]

    for (const answer of answers) {
      const code    = answer.question.country.code
      const current = progress[code] ?? { correct: 0, wrong: 0 }
      const correct = current.correct + (answer.correct ? 1 : 0)
      const wrong   = current.wrong   + (answer.correct ? 0 : 1)

      progress[code] = {
        correct,
        wrong,
        lastSeen: today,
        strength: computeStrength(correct, wrong),
      }
    }

    saveProgress(activePlayer.id, progress)
  }, [activePlayer])

  return {
    getProgress,
    getCountryRecord,
    getStrength,
    recordAnswer,
    recordRound,
  }
}
