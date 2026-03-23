// src/hooks/usePlayerProgress.js
// ─────────────────────────────────────────────────────────────────────────────
// Phase 5 changes:
//   - History entries now include `direction` field (e.g. 'find-capital')
//   - Old entries without direction default to 'find-capital' at read time
//   - getStatsForPlayer now returns byDirection breakdown:
//       byDirection[moduleId][directionId] = { rounds, accuracy, bestAccuracy, byMode }
//   - recordRound now accepts direction param (defaults to 'find-capital')
//   - MODE_LABELS updated with new direction-mode combinations
// ─────────────────────────────────────────────────────────────────────────────

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

// ── Mode labels — all mode IDs used across all modules ────────────────────────
// Used by StatsScreen for display labels + emoji.

export const MODE_LABELS = {
  'multiple-choice': { en: 'Multiple Choice', el: 'Πολλαπλή Επιλογή', emoji: '☑️' },
  'type-answer':     { en: 'Type Answer',     el: 'Πληκτρολόγηση',    emoji: '⌨️' },
  'flashcard':       { en: 'Flashcard',       el: 'Κάρτες',           emoji: '🃏' },
  // Legacy key kept for backwards compatibility with old history entries
  'typewrite':       { en: 'Type Answer',     el: 'Πληκτρολόγηση',    emoji: '⌨️' },
}

// ── Direction labels — all direction IDs across all modules ──────────────────

export const DIRECTION_LABELS = {
  'find-capital':    { en: 'Find the Capital',  el: 'Βρες την Πρωτεύουσα', emoji: '🗺️' },
  'find-country':    { en: 'Find the Country',  el: 'Βρες τη Χώρα',        emoji: '❓' },
  'flag-to-country': { en: 'Flag → Country',    el: 'Σημαία → Χώρα',       emoji: '🏳️' },
  'country-to-flag': { en: 'Country → Flag',    el: 'Χώρα → Σημαία',       emoji: '🌍' },
}

// ── Pure helpers ──────────────────────────────────────────────────────────────

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

function getPlayedModulesForPlayer(playerId) {
  const prefix = `geofamily_progress_${playerId}_`
  return Object.keys(localStorage)
    .filter(k => k.startsWith(prefix))
    .map(k => k.replace(prefix, ''))
}

// ── getStatsForPlayer ─────────────────────────────────────────────────────────
// Pure function — no hooks, safe to call anywhere.
//
// Returns:
//   totalRounds, accuracy, masterCount, countriesSeen   — global totals
//   roundsByModule   { moduleId: Round[] }
//   bestScoreByModule { moduleId: number }
//   byMode           { moduleId: { modeId: { rounds, accuracy, bestAccuracy } } }
//   byDirection      { moduleId: { directionId: { rounds, accuracy, bestAccuracy,
//                                                  byMode: { modeId: {...} } } } }

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

    // Master count
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

    // ── Per-module (all directions + modes combined) ──────────────────────────
    const roundsByModule = {}
    for (const r of history) {
      if (!roundsByModule[r.moduleId]) roundsByModule[r.moduleId] = []
      roundsByModule[r.moduleId].push(r)
    }

    const bestScoreByModule = {}
    for (const [mod, rounds] of Object.entries(roundsByModule)) {
      bestScoreByModule[mod] = Math.max(...rounds.map(r => r.accuracy))
    }

    // ── byMode — grouped by moduleId → modeId ────────────────────────────────
    const byMode = {}
    for (const r of history) {
      const mod  = r.moduleId
      const mode = r.mode ?? 'multiple-choice'
      if (!byMode[mod])       byMode[mod]       = {}
      if (!byMode[mod][mode]) byMode[mod][mode] = { rounds: 0, totalCorrect: 0, totalAnswers: 0, bestAccuracy: 0 }
      byMode[mod][mode].rounds++
      byMode[mod][mode].totalCorrect += r.score
      byMode[mod][mode].totalAnswers += r.total
      byMode[mod][mode].bestAccuracy  = Math.max(byMode[mod][mode].bestAccuracy, r.accuracy)
    }
    for (const mod of Object.keys(byMode)) {
      for (const mode of Object.keys(byMode[mod])) {
        const m = byMode[mod][mode]
        m.accuracy = m.totalAnswers > 0 ? Math.round((m.totalCorrect / m.totalAnswers) * 100) : 0
        delete m.totalCorrect
        delete m.totalAnswers
      }
    }

    // ── byDirection — grouped by moduleId → directionId → modeId ─────────────
    // direction defaults to 'find-capital' for legacy history entries
    const byDirection = {}
    for (const r of history) {
      const mod  = r.moduleId
      const dir  = r.direction ?? 'find-capital'
      const mode = r.mode      ?? 'multiple-choice'

      if (!byDirection[mod])          byDirection[mod]          = {}
      if (!byDirection[mod][dir])     byDirection[mod][dir]     = { rounds: 0, totalCorrect: 0, totalAnswers: 0, bestAccuracy: 0, byMode: {} }
      if (!byDirection[mod][dir].byMode[mode]) byDirection[mod][dir].byMode[mode] = { rounds: 0, totalCorrect: 0, totalAnswers: 0, bestAccuracy: 0 }

      // Direction totals
      byDirection[mod][dir].rounds++
      byDirection[mod][dir].totalCorrect += r.score
      byDirection[mod][dir].totalAnswers += r.total
      byDirection[mod][dir].bestAccuracy  = Math.max(byDirection[mod][dir].bestAccuracy, r.accuracy)

      // Mode within direction
      byDirection[mod][dir].byMode[mode].rounds++
      byDirection[mod][dir].byMode[mode].totalCorrect += r.score
      byDirection[mod][dir].byMode[mode].totalAnswers += r.total
      byDirection[mod][dir].byMode[mode].bestAccuracy  = Math.max(byDirection[mod][dir].byMode[mode].bestAccuracy, r.accuracy)
    }
    // Collapse totals → accuracy %
    for (const mod of Object.keys(byDirection)) {
      for (const dir of Object.keys(byDirection[mod])) {
        const d = byDirection[mod][dir]
        d.accuracy = d.totalAnswers > 0 ? Math.round((d.totalCorrect / d.totalAnswers) * 100) : 0
        delete d.totalCorrect
        delete d.totalAnswers
        for (const mode of Object.keys(d.byMode)) {
          const m = d.byMode[mode]
          m.accuracy = m.totalAnswers > 0 ? Math.round((m.totalCorrect / m.totalAnswers) * 100) : 0
          delete m.totalCorrect
          delete m.totalAnswers
        }
      }
    }

    return {
      totalRounds, totalCorrect, totalAnswers, accuracy,
      masterCount, maxPerCountry, playedMods,
      roundsByModule, bestScoreByModule,
      byMode,
      byDirection,
      countriesSeen: allCodes.size,
    }
  } catch {
    return {
      totalRounds: 0, totalCorrect: 0, totalAnswers: 0, accuracy: 0,
      masterCount: 0, maxPerCountry: 0, playedMods: [],
      roundsByModule: {}, bestScoreByModule: {}, byMode: {}, byDirection: {},
      countriesSeen: 0,
    }
  }
}

// ── getLevelForPlayer ─────────────────────────────────────────────────────────

export function getLevelForPlayer(playerId) {
  try {
    const rounds = loadHistory(playerId).length
    if (rounds >= 100) return { level: 6, title: { en: 'Master',     el: 'Μαέστρος'     } }
    if (rounds >= 50)  return { level: 5, title: { en: 'Advanced',   el: 'Προχωρημένος' } }
    if (rounds >= 20)  return { level: 4, title: { en: 'Practising', el: 'Εξασκούμενος' } }
    if (rounds >= 10)  return { level: 3, title: { en: 'Learner',    el: 'Μαθητής'      } }
    if (rounds >= 3)   return { level: 2, title: { en: 'Beginner',   el: 'Αρχάριος'     } }
    return               { level: 1, title: { en: 'New',         el: 'Νέος'         } }
  } catch {
    return { level: 1, title: { en: 'New', el: 'Νέος' } }
  }
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function usePlayerProgress(moduleId) {
  const { activePlayer } = usePlayer()

  const getProgress = useCallback(() => {
    if (!activePlayer || !moduleId) return {}
    return loadProgress(activePlayer.id, moduleId)
  }, [activePlayer, moduleId])

  const getCountryRecord = useCallback((countryCode) => {
    if (!activePlayer || !moduleId) return null
    const progress = loadProgress(activePlayer.id, moduleId)
    return progress[countryCode] ?? { correct: 0, wrong: 0, lastSeen: null, strength: 'new' }
  }, [activePlayer, moduleId])

  // Phase 5: added `direction` param
  // Phase 6: added `mistakes` param — array of country codes answered wrong this round.
  //          Used by GameModeTab (Phase 6+) for per-direction most-missed breakdown.
  //          Old entries without mistakes default to [] at read time.
  const recordRound = useCallback((answers, roundScore, roundTotal, mode = 'multiple-choice', direction = 'find-capital', mistakes = []) => {
    if (!activePlayer || !moduleId) return
    const today    = new Date().toISOString().split('T')[0]
    const progress = loadProgress(activePlayer.id, moduleId)

    // SRS update — mode-agnostic and direction-agnostic
    for (const answer of answers) {
      const code    = answer.question.country.code
      const current = progress[code] ?? { correct: 0, wrong: 0 }
      const correct = current.correct + (answer.correct ? 1 : 0)
      const wrong   = current.wrong   + (answer.correct ? 0 : 1)
      progress[code] = { correct, wrong, lastSeen: today, strength: computeStrength(correct, wrong) }
    }
    saveProgress(activePlayer.id, moduleId, progress)

    // History entry — includes direction + mistakes (Phase 6)
    const history = loadHistory(activePlayer.id)
    history.push({
      moduleId,
      direction,
      mode,
      date:     today,
      score:    roundScore,
      total:    roundTotal,
      accuracy: Math.round((roundScore / roundTotal) * 100),
      ...(mistakes.length > 0 ? { mistakes } : {}),  // omit key if empty to save space
    })
    saveHistory(activePlayer.id, history)
  }, [activePlayer, moduleId])

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
