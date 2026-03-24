// src/hooks/useSync.js
// ─────────────────────────────────────────────────────────────────────────────
// Fixes applied in this version:
//   Fix 1  — generateJoinPin returns {ok,pin} or {ok:false,error} — never throws
//             so callers can surface errors in UI
//   Fix 2  — pushAllLocal() exported; called after createFamily() to upload
//             all existing local data immediately on family creation
//   Fix 7  — pushAllLocal() also called after joinViaPin() succeeds so Device B
//             uploads its own data right away
//   Fix 8  — normaliseHistory() handles both old (raw array) and new ({rounds:[]})
//             Firestore formats, preventing data loss when pulling legacy docs
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useRef } from 'react'
import {
  doc, getDoc, setDoc, collection,
  getDocs, deleteDoc,
} from 'firebase/firestore'
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth'
import { db, auth } from '../lib/firebase'
import { useSettings } from '../context/SettingsContext'

// ── Strength ordering ─────────────────────────────────────────────────────────
const STRENGTH_ORDER = ['new', 'beginner', 'learner', 'practising', 'advanced', 'master']
function strengthRank(s) {
  const i = STRENGTH_ORDER.indexOf(s)
  return i === -1 ? 0 : i
}

// ── Merge helpers ─────────────────────────────────────────────────────────────

function mergePlayers(local, remote) {
  const byId = {}
  for (const p of local)  byId[p.id] = p
  for (const p of remote) {
    const existing = byId[p.id]
    if (!existing) {
      byId[p.id] = p
    } else {
      const localTime  = existing.updatedAt ?? existing.createdAt ?? 0
      const remoteTime = p.updatedAt        ?? p.createdAt        ?? 0
      if (remoteTime > localTime) byId[p.id] = p
    }
  }
  const seen   = {}
  const result = []
  const sorted = Object.values(byId).sort(
    (a, b) => (a.createdAt ?? '') < (b.createdAt ?? '') ? -1 : 1
  )
  for (const p of sorted) {
    const key = p.name.toLowerCase().trim()
    if (!seen[key]) { seen[key] = true; result.push(p) }
  }
  return result
}

function mergeProgress(local, remote) {
  const merged = { ...local }
  for (const [code, remoteEntry] of Object.entries(remote ?? {})) {
    const localEntry = merged[code]
    if (!localEntry) {
      merged[code] = remoteEntry
    } else {
      const localRank  = strengthRank(localEntry.strength  ?? 'new')
      const remoteRank = strengthRank(remoteEntry.strength ?? 'new')
      if (remoteRank > localRank) {
        merged[code] = remoteEntry
      } else if (remoteRank === localRank) {
        if ((remoteEntry.correct ?? 0) > (localEntry.correct ?? 0)) {
          merged[code] = remoteEntry
        }
      }
    }
  }
  return merged
}

// Fix 8: accepts raw array (old localStorage format), {rounds:[]} (new format),
// or a raw Firestore doc data object — all normalised to a plain rounds array.
function normaliseHistory(raw) {
  if (!raw) return []
  if (Array.isArray(raw)) return raw
  if (Array.isArray(raw.rounds)) return raw.rounds
  return []
}

function mergeHistory(local, remote) {
  const byTs = {}
  for (const r of [...normaliseHistory(local), ...normaliseHistory(remote)]) {
    const key = r.timestamp ?? r.date ?? JSON.stringify(r)
    if (!byTs[key]) byTs[key] = r
  }
  return Object.values(byTs).sort((a, b) =>
    (a.timestamp ?? a.date ?? '') < (b.timestamp ?? b.date ?? '') ? -1 : 1
  )
}

// ── localStorage helpers ──────────────────────────────────────────────────────

function lsGet(key) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : null } catch { return null }
}
function lsSet(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)) } catch {}
}

// ── Collect all local progress + history for a set of players ─────────────────

function collectLocalData(profiles) {
  const progressDocs = []
  const historyDocs  = []
  for (const player of profiles) {
    const prefix = `geofamily_progress_${player.id}_`
    for (const key of Object.keys(localStorage)) {
      if (!key.startsWith(prefix)) continue
      const moduleId = key.slice(prefix.length)
      const map      = lsGet(key) ?? {}
      if (Object.keys(map).length > 0) progressDocs.push({ playerId: player.id, moduleId, map })
    }
    const rounds = normaliseHistory(lsGet(`geofamily_history_${player.id}`))
    if (rounds.length > 0) historyDocs.push({ playerId: player.id, rounds })
  }
  return { progressDocs, historyDocs }
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useSync() {
  const { familyCode, syncEnabled } = useSettings()
  const authedRef = useRef(false)

  // ── Anonymous Auth ────────────────────────────────────────────────────────
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, user => {
      if (user) { authedRef.current = true; return }
      signInAnonymously(auth).catch(err =>
        console.warn('[useSync] anon auth failed:', err)
      )
    })
    return unsub
  }, [])

  // ── Pull on open ──────────────────────────────────────────────────────────
  const pullAndMerge = useCallback(async () => {
    if (!syncEnabled || !familyCode) return
    try {
      const playersSnap = await getDoc(doc(db, 'families', familyCode, 'sync', 'playersList'))
      if (playersSnap.exists()) {
        const remotePlayers = playersSnap.data().players ?? []
        const localPlayers  = lsGet('geofamily_players') ?? []
        const merged        = mergePlayers(localPlayers, remotePlayers)
        lsSet('geofamily_players', merged)

        // Fetch all progress docs in one call
        const progressSnaps = await getDocs(
          collection(db, 'families', familyCode, 'progress')
        )

        for (const player of merged) {
          // Progress
          for (const snap of progressSnaps.docs) {
            if (!snap.id.startsWith(player.id + '_')) continue
            const moduleId  = snap.id.slice(player.id.length + 1)
            const remoteMap = snap.data().map ?? {}
            const localKey  = `geofamily_progress_${player.id}_${moduleId}`
            lsSet(localKey, mergeProgress(lsGet(localKey) ?? {}, remoteMap))
          }

          // History — Fix 8: normalise before merging
          const histSnap = await getDoc(
            doc(db, 'families', familyCode, 'history', player.id)
          )
          if (histSnap.exists()) {
            const remoteRounds = normaliseHistory(histSnap.data())
            const localKey     = `geofamily_history_${player.id}`
            const localRounds  = normaliseHistory(lsGet(localKey))
            lsSet(localKey, { rounds: mergeHistory(localRounds, remoteRounds) })
          }
        }
      }

      await setDoc(
        doc(db, 'families', familyCode, 'sync', 'meta'),
        { lastSyncAt: Date.now() },
        { merge: true }
      )
    } catch (err) {
      console.warn('[useSync] pullAndMerge failed:', err)
    }
  }, [syncEnabled, familyCode])

  // ── Push players ──────────────────────────────────────────────────────────
  const pushPlayers = useCallback(async (profiles) => {
    if (!syncEnabled || !familyCode) return
    try {
      await setDoc(
        doc(db, 'families', familyCode, 'sync', 'playersList'),
        { players: profiles, updatedAt: Date.now() },
        { merge: false }
      )
    } catch (err) {
      console.warn('[useSync] pushPlayers failed:', err)
    }
  }, [syncEnabled, familyCode])

  // ── Push progress ─────────────────────────────────────────────────────────
  const pushProgress = useCallback(async (playerId, moduleId, progressMap) => {
    if (!syncEnabled || !familyCode) return
    try {
      await setDoc(
        doc(db, 'families', familyCode, 'progress', `${playerId}_${moduleId}`),
        { map: progressMap, updatedAt: Date.now() },
        { merge: false }
      )
    } catch (err) {
      console.warn('[useSync] pushProgress failed:', err)
    }
  }, [syncEnabled, familyCode])

  // ── Push history ──────────────────────────────────────────────────────────
  const pushHistory = useCallback(async (playerId, rounds) => {
    if (!syncEnabled || !familyCode) return
    try {
      await setDoc(
        doc(db, 'families', familyCode, 'history', playerId),
        { rounds, updatedAt: Date.now() },
        { merge: false }
      )
    } catch (err) {
      console.warn('[useSync] pushHistory failed:', err)
    }
  }, [syncEnabled, familyCode])

  // ── Fix 2 + 7: Push ALL local data ───────────────────────────────────────
  // Called after createFamily() and after joinViaPin() to immediately upload
  // all existing local players, progress, and history to Firestore.
  // Uses the familyCode/syncEnabled values captured at call time via closure —
  // caller must ensure these are set before calling (SettingsContext updates
  // are synchronous so this is safe when called right after createFamily/joinFamily).
  const pushAllLocal = useCallback(async (profiles, overrideFamilyCode) => {
    // overrideFamilyCode is passed when calling right after createFamily/joinFamily,
    // before the context re-render has propagated the new familyCode.
    const fc = overrideFamilyCode ?? familyCode
    if (!fc) return
    try {
      await setDoc(
        doc(db, 'families', fc, 'sync', 'playersList'),
        { players: profiles, updatedAt: Date.now() },
        { merge: false }
      )
      await setDoc(
        doc(db, 'families', fc, 'sync', 'meta'),
        { createdAt: Date.now(), lastSyncAt: Date.now() },
        { merge: true }
      )

      const { progressDocs, historyDocs } = collectLocalData(profiles)

      await Promise.all([
        ...progressDocs.map(({ playerId, moduleId, map }) =>
          setDoc(
            doc(db, 'families', fc, 'progress', `${playerId}_${moduleId}`),
            { map, updatedAt: Date.now() },
            { merge: false }
          )
        ),
        ...historyDocs.map(({ playerId, rounds }) =>
          setDoc(
            doc(db, 'families', fc, 'history', playerId),
            { rounds, updatedAt: Date.now() },
            { merge: false }
          )
        ),
      ])
    } catch (err) {
      console.warn('[useSync] pushAllLocal failed:', err)
    }
  }, [familyCode])

  // ── Fix 1: Generate join PIN ──────────────────────────────────────────────
  // Returns {ok: true, pin} on success, {ok: false, error} on failure.
  // Never throws — caller can safely show error in UI.
  const generateJoinPin = useCallback(async (familyNameArg) => {
    if (!syncEnabled || !familyCode) {
      return { ok: false, error: 'no_family' }
    }
    try {
      const pin       = String(Math.floor(100000 + Math.random() * 900000))
      const expiresAt = Date.now() + 10 * 60 * 1000
      await setDoc(
        doc(db, 'joinPins', pin),
        { familyCode, familyName: familyNameArg, expiresAt },
      )
      return { ok: true, pin }
    } catch (err) {
      console.warn('[useSync] generateJoinPin failed:', err)
      return { ok: false, error: 'network' }
    }
  }, [syncEnabled, familyCode])

  // ── Join via PIN ──────────────────────────────────────────────────────────
  const joinViaPin = useCallback(async (pin) => {
    const trimmed = pin.trim().replace(/\s/g, '')
    if (trimmed.length !== 6 || !/^\d+$/.test(trimmed)) {
      return { ok: false, error: 'invalid_format' }
    }
    try {
      const snap = await getDoc(doc(db, 'joinPins', trimmed))
      if (!snap.exists())         return { ok: false, error: 'not_found' }
      const { familyCode: fc, familyName: fn, expiresAt } = snap.data()
      if (Date.now() > expiresAt) return { ok: false, error: 'expired' }
      deleteDoc(doc(db, 'joinPins', trimmed)).catch(() => {})
      return { ok: true, familyCode: fc, familyName: fn }
    } catch (err) {
      console.warn('[useSync] joinViaPin failed:', err)
      return { ok: false, error: 'network' }
    }
  }, [])

  return {
    pullAndMerge,
    pushPlayers,
    pushProgress,
    pushHistory,
    pushAllLocal,
    generateJoinPin,
    joinViaPin,
  }
}
