// usePlayerProgress.js
// Manages per-country SRS data AND round history per player, per module.
//
// Storage keys:
//   geofamily_progress_{playerId}_{moduleId}  → country SRS map
//   geofamily_history_{playerId}              → round history (all modules)
//
// 5-step strength scale (net = correct - wrong):
//   'new'        → never seen          display score: 0
//   'beginner'   → net 1               display score: 1
//   'learner'    → net 2–3             display score: 2
//   'practising' → net 4–6             display score: 3
//   'advanced'   → net 7–9             display score: 4
//   'master'     → net >= 10           display score: 5

import { useCallback } from 'react'
import { usePlayer }   from '../context/PlayerContext'

// ── Strength config ───────────────────────────────────────────────────────────

export const STRENGTH_LEVELS = ['new', 'beginner', 'learner', 'practising', 'advanced', 'master']

export const STRENGTH_DISPLAY_SCORE = {
  new:        0,
  beginner:   1,
  learner:    2,
  practising: 3,
  advanced:   4,
  master:     5,
}

export const STRENGTH_WEIGHTS = {
  new:        10,
  beginner:   8,
  learner:    6,
  practising: 4,
  advanced:   2,
  master:     1,
}

// ── Pure helpers (no hooks — safe to call anywhere) ───────────────────────────

function computeStrength(correct, wrong) {
  const net = correct - wrong
  if (net >= 10) return 'master'
  if (net >= 7)  return 'advanced'
  if (net >= 4)  return 'practising'
  if (net >= 2)  return 'learner'
  if (net >= 1)  return 'beginner'
  return 'new'
}

function progressKey(playerId, moduleId) {
  return `geofamily_progress_${playerId}_${moduleId}`
}

function historyKey(playerId) {
  return `geofamily_history_${playerId}`
}

function loadProgress(playerId, moduleId) {
  try {
    const raw = localStorage.getItem(progressKey(playerId, moduleId))
    return raw ? JSON.parse(raw) : {}
  } catch { return {} }
}

function saveProgress(playerId, moduleId, data) {
  try { localStorage.setItem(progressKey(playerId, moduleId), JSON.stringify(data)) } catch {}
}

function loadHistory(playerId) {
  try {
    const raw = localStorage.getItem(historyKey(playerId))
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function saveHistory(playerId, history) {
  try { localStorage.setItem(historyKey(playerId), JSON.stringify(history)) } catch {}
}

// Returns all moduleIds this player has a progress record for
function getPlayedModulesForPlayer(playerId) {
  const prefix = `geofamily_progress_${playerId}_`
  return Object.keys(localStorage)
    .filter(k => k.startsWith(prefix))
    .map(k => k.replace(prefix, ''))
}

// Aggregate stats for any player ID — used by profile cards (no hook needed)
export function getStatsForPlayer(playerId) {
  try {
    const history      = loadHistory(playerId)
    const totalRounds  = history.length
    const totalCorrect = history.reduce((s, r) => s + r.score, 0)
    const totalAnswers = history.reduce((s, r) => s + r.total, 0)
    const accuracy     = totalAnswers > 0 ? Math.round((totalCorrect / totalAnswers) * 100) : 0

    const playedMods = getPlayedModulesForPlayer(playerId)
    const allCodes   = new Set()
    const modMaps    = {}
    for (const mod of playedMods) {
      const map = loadProgress(playerId, mod)
      modMaps[mod] = map
      Object.keys(map).forEach(c => allCodes.add(c))
    }

    const maxPerCountry = playedMods.length * 5
    let masterCount = 0
    if (maxPerCountry > 0) {
      for (const code of allCodes) {
        const score = playedMods.reduce(
          (s, mod) => s + (STRENGTH_DISPLAY_SCORE[modMaps[mod]?.[code]?.strength ?? 'new']),
          0
        )
        if (score >= maxPerCountry) masterCount++
      }
    }

    const roundsByModule = {}
    for (const r of history) {
      if (!roundsByModule[r.moduleId]) roundsByModule[r.moduleId] = []
      roundsByModule[r.moduleId].push(r)
    }

    const bestScoreByModule = {}
    for (const [mod, rounds] of Object.entries(roundsByModule)) {
      bestScoreByModule[mod] = Math.max(...rounds.map(r => r.accuracy))
    }

    return {
      totalRounds, totalCorrect, totalAnswers, accuracy,
      masterCount, maxPerCountry, playedMods,
      roundsByModule, bestScoreByModule,
      countriesSeen: allCodes.size,
    }
  } catch {
    return {
      totalRounds: 0, totalCorrect: 0, totalAnswers: 0, accuracy: 0,
      masterCount: 0, maxPerCountry: 0, playedMods: [],
      roundsByModule: {}, bestScoreByModule: {}, countriesSeen: 0,
    }
  }
}

// Level/title for any player ID — used by profile cards (no hook needed)
export function getLevelForPlayer(playerId) {
  try {
    const rounds = loadHistory(playerId).length
    if (rounds >= 100) return { level: 6, title: { en: 'Master',      el: 'Μαέστρος' } }
    if (rounds >= 50)  return { level: 5, title: { en: 'Advanced',    el: 'Προχωρημένος' } }
    if (rounds >= 20)  return { level: 4, title: { en: 'Practising',  el: 'Εξασκούμενος' } }
    if (rounds >= 10)  return { level: 3, title: { en: 'Learner',     el: 'Μαθητής' } }
    if (rounds >= 3)   return { level: 2, title: { en: 'Beginner',    el: 'Αρχάριος' } }
    return               { level: 1, title: { en: 'New',          el: 'Νέος' } }
  } catch {
    return { level: 1, title: { en: 'New', el: 'Νέος' } }
  }
}

// ── Hook (only used in quiz screens + ResultsScreen) ─────────────────────────

export function usePlayerProgress(moduleId) {
  const { activePlayer } = usePlayer()

  // Full SRS map for this player + module
  const getProgress = useCallback(() => {
    if (!activePlayer || !moduleId) return {}
    return loadProgress(activePlayer.id, moduleId)
  }, [activePlayer, moduleId])

  // Single country record
  const getCountryRecord = useCallback((countryCode) => {
    if (!activePlayer || !moduleId) return null
    const progress = loadProgress(activePlayer.id, moduleId)
    return progress[countryCode] ?? { correct: 0, wrong: 0, lastSeen: null, strength: 'new' }
  }, [activePlayer, moduleId])

  // Record a full round of answers + save to history
  const recordRound = useCallback((answers, roundScore, roundTotal) => {
    if (!activePlayer || !moduleId) return
    const today    = new Date().toISOString().split('T')[0]
    const progress = loadProgress(activePlayer.id, moduleId)

    for (const answer of answers) {
      const code    = answer.question.country.code
      const current = progress[code] ?? { correct: 0, wrong: 0 }
      const correct = current.correct + (answer.correct ? 1 : 0)
      const wrong   = current.wrong   + (answer.correct ? 0 : 1)
      progress[code] = { correct, wrong, lastSeen: today, strength: computeStrength(correct, wrong) }
    }

    saveProgress(activePlayer.id, moduleId, progress)

    const history = loadHistory(activePlayer.id)
    history.push({
      moduleId,
      date:     today,
      score:    roundScore,
      total:    roundTotal,
      accuracy: Math.round((roundScore / roundTotal) * 100),
    })
    saveHistory(activePlayer.id, history)
  }, [activePlayer, moduleId])

  // Reactive wrappers around the pure helpers (for stats screen use)
  const getStats = useCallback(() => {
    if (!activePlayer) return null
    return getStatsForPlayer(activePlayer.id)
  }, [activePlayer])

  const getLevel = useCallback(() => {
    if (!activePlayer) return { level: 1, title: { en: 'New', el: 'Νέος' } }
    return getLevelForPlayer(activePlayer.id)
  }, [activePlayer])

  return { getProgress, getCountryRecord, recordRound, getStats, getLevel }
}
