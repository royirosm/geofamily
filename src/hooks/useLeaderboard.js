// useLeaderboard.js
// Manages all Firebase leaderboard reads and writes.
//
// Bug fixed: modules are now written as a proper nested object
//   { modules: { capitals: {...} } }  ← correct
// instead of the broken flat key:
//   { "modules.capitals": {...} }     ← was silently failing
//
// Firestore document shape:
// {
//   name, avatar, avatarBg, accentColor,
//   totalRounds, accuracy, masterCount, level, bestScore,
//   modules: {
//     capitals: {
//       rounds, accuracy, bestAccuracy,
//       byMode: {
//         'multiple-choice': { rounds, accuracy, bestAccuracy },
//         'typewrite':        { rounds, accuracy, bestAccuracy },
//       }
//     }
//   },
//   familyCode,   ← globalLeaderboard only
//   updatedAt,
// }

import { useState, useEffect, useCallback } from 'react'
import {
  doc, setDoc, collection,
  query, orderBy, limit, onSnapshot,
} from 'firebase/firestore'
import { db }          from '../lib/firebase'
import { usePlayer }   from '../context/PlayerContext'
import { useSettings } from '../context/SettingsContext'

// ── Ranking config ────────────────────────────────────────────────────────────

export const RANKING_TYPES = [
  {
    id:        'mostPlayed',
    labelKey:  'rankMostPlayed',
    emoji:     '🎮',
    group:     'general',
    sortFn:    (a, b) => b.totalRounds - a.totalRounds,
    valueFn:   e => e.totalRounds,
    suffixKey: 'leaderboardRounds',
    qualify:   () => true,
  },
  {
    id:        'mostAccurate',
    labelKey:  'rankMostAccurate',
    emoji:     '🎯',
    group:     'general',
    sortFn:    (a, b) => b.accuracy - a.accuracy,
    valueFn:   e => `${e.accuracy}%`,
    suffixKey: null,
    qualify:   e => (e.totalRounds ?? 0) >= 3,
  },
  {
    id:        'mostMastered',
    labelKey:  'rankMostMastered',
    emoji:     '⭐',
    group:     'general',
    sortFn:    (a, b) => b.masterCount - a.masterCount,
    valueFn:   e => e.masterCount,
    suffixKey: 'rankMasteredSuffix',
    qualify:   e => (e.masterCount ?? 0) > 0,
  },
  {
    id:        'bestScore',
    labelKey:  'rankBestScore',
    emoji:     '🔥',
    group:     'general',
    sortFn:    (a, b) => b.bestScore - a.bestScore,
    valueFn:   e => Math.round(e.bestScore ?? 0),
    suffixKey: 'rankScoreSuffix',
    qualify:   () => true,
  },
  {
    id:        'capitals-played',
    labelKey:  'rankCapitalsPlayed',
    emoji:     '🏛️',
    group:     'capitals',
    sortFn:    (a, b) => (b.modules?.capitals?.rounds ?? 0) - (a.modules?.capitals?.rounds ?? 0),
    valueFn:   e => e.modules?.capitals?.rounds ?? 0,
    suffixKey: 'leaderboardRounds',
    qualify:   e => (e.modules?.capitals?.rounds ?? 0) > 0,
  },
  {
    id:        'capitals-accuracy',
    labelKey:  'rankCapitalsAccuracy',
    emoji:     '🏛️🎯',
    group:     'capitals',
    sortFn:    (a, b) => (b.modules?.capitals?.accuracy ?? 0) - (a.modules?.capitals?.accuracy ?? 0),
    valueFn:   e => `${e.modules?.capitals?.accuracy ?? 0}%`,
    suffixKey: null,
    qualify:   e => (e.modules?.capitals?.rounds ?? 0) >= 3,
  },
]

export const RANKING_GROUPS = [
  { id: 'general',  labelKey: 'rankGroupGeneral',  emoji: '🌍' },
  { id: 'capitals', labelKey: 'rankGroupCapitals', emoji: '🏛️' },
]

export function applyRanking(entries, rankingId) {
  const cfg = RANKING_TYPES.find(r => r.id === rankingId) ?? RANKING_TYPES[0]
  return [...entries].filter(cfg.qualify).sort(cfg.sortFn)
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useLeaderboard() {
  const { activePlayer } = usePlayer()
  const { familyCode }   = useSettings()

  const [familyEntries, setFamilyEntries] = useState([])
  const [globalEntries, setGlobalEntries] = useState([])
  const [loading,       setLoading]       = useState(true)
  const [error,         setError]         = useState(null)
  const [isOffline,     setIsOffline]     = useState(!navigator.onLine)

  useEffect(() => {
    const goOnline  = () => setIsOffline(false)
    const goOffline = () => setIsOffline(true)
    window.addEventListener('online',  goOnline)
    window.addEventListener('offline', goOffline)
    return () => {
      window.removeEventListener('online',  goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [])

  useEffect(() => {
    setLoading(true)
    setError(null)
    const unsubs = []

    const globalQ = query(
      collection(db, 'globalLeaderboard'),
      orderBy('totalRounds', 'desc'),
      limit(50)
    )
    const unsubGlobal = onSnapshot(
      globalQ,
      snap => {
        setGlobalEntries(snap.docs.map(d => ({ id: d.id, ...d.data() })))
        setLoading(false)
        setError(null)
      },
      err => {
        console.warn('Global leaderboard error:', err)
        setError('global')
        setLoading(false)
      }
    )
    unsubs.push(unsubGlobal)

    if (familyCode) {
      const unsubFamily = onSnapshot(
        collection(db, 'families', familyCode, 'players'),
        snap => {
          setFamilyEntries(snap.docs.map(d => ({ id: d.id, ...d.data() })))
          setError(null)
        },
        err => {
          console.warn('Family leaderboard error:', err)
          setError('family')
        }
      )
      unsubs.push(unsubFamily)
    } else {
      setFamilyEntries([])
    }

    return () => unsubs.forEach(u => u())
  }, [familyCode])

  // ── pushScore ──────────────────────────────────────────────────────────────
  // stats    = getStatsForPlayer(id)    — includes byMode breakdown
  // level    = getLevelForPlayer(id)
  // moduleId = e.g. 'capitals'
  // mode     = e.g. 'multiple-choice'

  const pushScore = useCallback(async (player, stats, level, moduleId, mode) => {
    if (!player || stats.totalRounds === 0) return

    // Build the modules nested object properly (not dot notation)
    const modulesPayload = {}
    if (moduleId) {
      const modRounds = stats.roundsByModule?.[moduleId] ?? []
      const byModeForModule = stats.byMode?.[moduleId] ?? {}

      modulesPayload[moduleId] = {
        rounds:      modRounds.length,
        accuracy:    modRounds.length > 0
          ? Math.round(modRounds.reduce((s, r) => s + r.accuracy, 0) / modRounds.length)
          : 0,
        bestAccuracy: stats.bestScoreByModule?.[moduleId] ?? 0,
        byMode:       byModeForModule,
      }
    }

    const payload = {
      name:        player.name,
      avatar:      player.avatar,
      avatarBg:    player.avatarBg,
      accentColor: player.accentColor,
      totalRounds: stats.totalRounds,
      accuracy:    stats.accuracy,
      masterCount: stats.masterCount,
      level:       level.level,
      bestScore:   Math.round(stats.totalRounds * stats.accuracy / 100),
      updatedAt:   Date.now(),
      // Proper nested object — not dot notation
      ...(Object.keys(modulesPayload).length > 0 ? { modules: modulesPayload } : {}),
    }

    try {
      await setDoc(
        doc(db, 'globalLeaderboard', player.id),
        { ...payload, familyCode: familyCode || '' },
        { merge: true }
      )
    } catch (err) {
      console.warn('pushScore global failed:', err)
    }

    if (familyCode) {
      try {
        await setDoc(
          doc(db, 'families', familyCode, 'players', player.id),
          payload,
          { merge: true }
        )
      } catch (err) {
        console.warn('pushScore family failed:', err)
      }
    }
  }, [familyCode])

  return {
    pushScore,
    familyEntries,
    globalEntries,
    loading,
    error,
    isOffline,
    activePlayerId: activePlayer?.id ?? null,
  }
}
