// src/hooks/usePlayerProgress.js
// ─────────────────────────────────────────────────────────────────────────────
// Phase 8A: recordRound now fire-and-forget pushes progress + history to
//           Firestore after writing to localStorage, via useSync.
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback } from 'react'
import { usePlayer }   from '../context/PlayerContext'
import { useSync }     from './useSync'

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

// ── Mode labels ───────────────────────────────────────────────────────────────

export const MODE_LABELS = {
  'multiple-choice': { en: 'Multiple Choice', el: 'Πολλαπλή Επιλογή', emoji: '☑️' },
  'type-answer':     { en: 'Type Answer',     el: 'Πληκτρολόγηση',    emoji: '⌨️' },
  'flashcard':       { en: 'Flashcard',       el: 'Κάρτες',           emoji: '🃏' },
  'typewrite':       { en: 'Type Answer',     el: 'Πληκτρολόγηση',    emoji: '⌨️' },
}

// ── Direction labels ──────────────────────────────────────────────────────────

export const DIRECTION_LABELS = {
  'find-capital':         { en: 'Find the Capital',         el: 'Βρες την Πρωτεύουσα',  emoji: '🗺️' },
  'find-country':         { en: 'Find the Country',         el: 'Βρες τη Χώρα',          emoji: '❓' },
  'flag-to-country':      { en: 'Flag → Country',           el: 'Σημαία → Χώρα',         emoji: '🏳️' },
  'country-to-flag':      { en: 'Country → Flag',           el: 'Χώρα → Σημαία',         emoji: '🌍' },
  'country-or-territory': { en: 'Country or Territory?',    el: 'Χώρα ή Έδαφος;',        emoji: '🌐' },
  'find-sovereign':       { en: 'Find the Governing Country', el: 'Βρες τη Μητρόπολη',   emoji: '🏛️' },
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
    if (!raw) return []
    const parsed = JSON.parse(raw)
    // Support both old format (array) and new format ({ rounds: [] })
    return Array.isArray(parsed) ? parsed : (parsed.rounds ?? [])
  } catch { return [] }
}

function saveHistory(playerId, rounds) {
  try {
    localStorage.setItem(historyKey(playerId), JSON.stringify({ rounds }))
  } catch {}
}

function getPlayedModulesForPlayer(playerId) {
  const prefix = `geofamily_progress_${playerId}_`
  return Object.keys(localStorage)
    .filter(k => k.startsWith(prefix))
    .map(k => k.replace(prefix, ''))
}

// ── getStatsForPlayer ─────────────────────────────────────────────────────────

export function getStatsForPlayer(playerId) {
  try {
    const history      = loadHistory(playerId)
    const totalRounds  = history.length
    const totalCorrect = history.reduce((s, r) => s + r.score, 0)
    const totalAnswers = history.reduce((s, r) => s + r.total, 0)
    const accuracy     = totalAnswers > 0
      ? Math.round((totalCorrect / totalAnswers) * 100) : 0

    // masterCount — distinct country codes at 'master' across all modules
    const modules        = getPlayedModulesForPlayer(playerId)
    const masteredCodes  = new Set()
    const roundsByModule = {}
    const bestScoreByModule = {}
    const byMode    = {}
    const byDirection = {}

    for (const modId of modules) {
      const prog = loadProgress(playerId, modId)
      for (const [code, rec] of Object.entries(prog)) {
        if (rec?.strength === 'master') masteredCodes.add(code)
      }
    }

    for (const round of history) {
      const mod = round.moduleId ?? 'capitals'
      const dir = round.direction ?? 'find-capital'
      const mod_ = round.mode ?? 'multiple-choice'

      // roundsByModule
      if (!roundsByModule[mod]) roundsByModule[mod] = []
      roundsByModule[mod].push(round)

      // bestScoreByModule
      const acc = round.accuracy ?? 0
      if (!bestScoreByModule[mod] || acc > bestScoreByModule[mod]) {
        bestScoreByModule[mod] = acc
      }

      // byDirection[mod][dir]
      if (!byDirection[mod])      byDirection[mod] = {}
      if (!byDirection[mod][dir]) byDirection[mod][dir] = { rounds: 0, accuracy: 0, bestAccuracy: 0, byMode: {} }
      const dRef = byDirection[mod][dir]
      dRef.rounds++
      dRef.accuracy     = Math.round(((dRef.accuracy * (dRef.rounds - 1)) + acc) / dRef.rounds)
      dRef.bestAccuracy = Math.max(dRef.bestAccuracy, acc)

      // byDirection[mod][dir].byMode
      if (!dRef.byMode[mod_]) dRef.byMode[mod_] = { rounds: 0, accuracy: 0, bestAccuracy: 0 }
      const mRef = dRef.byMode[mod_]
      mRef.rounds++
      mRef.accuracy     = Math.round(((mRef.accuracy * (mRef.rounds - 1)) + acc) / mRef.rounds)
      mRef.bestAccuracy = Math.max(mRef.bestAccuracy, acc)

      // byMode (legacy flat structure)
      if (!byMode[mod])       byMode[mod] = {}
      if (!byMode[mod][mod_]) byMode[mod][mod_] = { rounds: 0, accuracy: 0, bestAccuracy: 0 }
      const bmRef = byMode[mod][mod_]
      bmRef.rounds++
      bmRef.accuracy     = Math.round(((bmRef.accuracy * (bmRef.rounds - 1)) + acc) / bmRef.rounds)
      bmRef.bestAccuracy = Math.max(bmRef.bestAccuracy, acc)
    }

    // mistakesByDirection
    const mistakesByDirection = {}
    for (const round of history) {
      if (!round.mistakes?.length) continue
      const mod = round.moduleId ?? 'capitals'
      const dir = round.direction ?? 'find-capital'
      if (!mistakesByDirection[mod])      mistakesByDirection[mod] = {}
      if (!mistakesByDirection[mod][dir]) mistakesByDirection[mod][dir] = {}
      for (const code of round.mistakes) {
        mistakesByDirection[mod][dir][code] = (mistakesByDirection[mod][dir][code] ?? 0) + 1
      }
    }

    return {
      totalRounds, accuracy,
      masterCount:  masteredCodes.size,
      countriesSeen: new Set(history.flatMap(r =>
        (r.answers ?? []).map(a => a?.question?.country?.code).filter(Boolean)
      )).size,
      roundsByModule,
      bestScoreByModule,
      byMode,
      byDirection,
      mistakesByDirection,
    }
  } catch (err) {
    console.warn('getStatsForPlayer error:', err)
    return {
      totalRounds: 0, accuracy: 0, masterCount: 0, countriesSeen: 0,
      roundsByModule: {}, bestScoreByModule: {}, byMode: {}, byDirection: {}, mistakesByDirection: {},
    }
  }
}

// ── getLevelForPlayer ─────────────────────────────────────────────────────────

const LEVELS = [
  { level: 1,  minRounds: 0,   title: { en: 'Explorer',      el: 'Εξερευνητής'  } },
  { level: 2,  minRounds: 5,   title: { en: 'Traveller',     el: 'Ταξιδιώτης'   } },
  { level: 3,  minRounds: 15,  title: { en: 'Adventurer',    el: 'Περιηγητής'   } },
  { level: 4,  minRounds: 30,  title: { en: 'Navigator',     el: 'Πλοηγός'      } },
  { level: 5,  minRounds: 50,  title: { en: 'Cartographer',  el: 'Χαρτογράφος'  } },
  { level: 6,  minRounds: 75,  title: { en: 'Geographer',    el: 'Γεωγράφος'    } },
  { level: 7,  minRounds: 100, title: { en: 'World Scholar', el: 'Παγκόσμιος'   } },
  { level: 8,  minRounds: 150, title: { en: 'Globe Master',  el: 'Κύριος Γης'   } },
]

export function getLevelForPlayer(playerId) {
  const stats = getStatsForPlayer(playerId)
  let best = LEVELS[0]
  for (const lvl of LEVELS) {
    if (stats.totalRounds >= lvl.minRounds) best = lvl
  }
  return best
}

// ── getGlobalMasterCount ──────────────────────────────────────────────────────

export function getGlobalMasterCount(playerId) {
  try {
    const prefix   = `geofamily_progress_${playerId}_`
    const mastered = new Set()
    for (const key of Object.keys(localStorage)) {
      if (!key.startsWith(prefix)) continue
      const map = JSON.parse(localStorage.getItem(key) ?? '{}')
      for (const [code, rec] of Object.entries(map)) {
        if (rec?.strength === 'master') mastered.add(code)
      }
    }
    return mastered.size
  } catch { return 0 }
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function usePlayerProgress(moduleId) {
  const { activePlayer } = usePlayer()
  const { pushProgress, pushHistory } = useSync()

  const getProgress = useCallback(() => {
    if (!activePlayer || !moduleId) return {}
    return loadProgress(activePlayer.id, moduleId)
  }, [activePlayer, moduleId])

  const getCountryRecord = useCallback((countryCode) => {
    if (!activePlayer || !moduleId) return null
    const progress = loadProgress(activePlayer.id, moduleId)
    return progress[countryCode] ?? { correct: 0, wrong: 0, lastSeen: null, strength: 'new' }
  }, [activePlayer, moduleId])

  const recordRound = useCallback((
    answers,
    roundScore,
    roundTotal,
    mode      = 'multiple-choice',
    direction = 'find-capital',
    mistakes  = [],
  ) => {
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
    const newRound = {
      moduleId,
      direction,
      mode,
      date:      today,
      timestamp: new Date().toISOString(),
      score:     roundScore,
      total:     roundTotal,
      accuracy:  Math.round((roundScore / roundTotal) * 100),
      ...(mistakes.length > 0 ? { mistakes } : {}),
    }
    history.push(newRound)
    saveHistory(activePlayer.id, history)

    // 8A: push to Firestore fire-and-forget
    pushProgress(activePlayer.id, moduleId, progress)
    pushHistory(activePlayer.id, history)
  }, [activePlayer, moduleId, pushProgress, pushHistory])

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
