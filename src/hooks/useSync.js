// src/hooks/useSync.js
// ─────────────────────────────────────────────────────────────────────────────
// Phase 9.5: Identity foundations.
//
// Changes from Phase 9:
//   • Firebase UID is now tracked in a ref AND exposed as getFirebaseUid()
//     so PlayerContext can stamp it onto new player profiles.
//   • pushProfile() writes firebaseUid into the Firestore profile doc.
//     Firestore rules can then verify ownership: request.auth.uid == resource.data.firebaseUid
//   • getFirebaseUid() — synchronous getter for the current Firebase UID,
//     returns null if auth hasn't resolved yet.
//   • No other behaviour changes — all Phase 9 sync logic is unchanged.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useCallback } from 'react'
import {
  getDoc, setDoc, doc, getDocs, collection,
} from 'firebase/firestore'
import {
  onAuthStateChanged, signInAnonymously,
} from 'firebase/auth'
import { db, auth } from '../lib/firebase'
import { useSettings } from '../context/SettingsContext'

// ── Helpers ───────────────────────────────────────────────────────────────────

function strengthRank(s) {
  return ['new', 'beginner', 'learner', 'practising', 'advanced', 'master'].indexOf(s ?? 'new')
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

// ── Collect all local progress + history for a single player ─────────────────

function collectLocalDataForPlayer(player) {
  const progressDocs = []
  const prefix = `geofamily_progress_${player.id}_`
  for (const key of Object.keys(localStorage)) {
    if (!key.startsWith(prefix)) continue
    const moduleId = key.slice(prefix.length)
    const map      = lsGet(key) ?? {}
    if (Object.keys(map).length > 0) progressDocs.push({ moduleId, map })
  }
  const rounds = normaliseHistory(lsGet(`geofamily_history_${player.id}`))
  return { progressDocs, rounds }
}

// ── Firestore path builders ───────────────────────────────────────────────────

function playerProfilePath(playerId)            { return doc(db, 'players', playerId, 'data', 'profile') }
function playerProgressPath(playerId, moduleId) { return doc(db, 'players', playerId, 'progress', moduleId) }
function playerHistoryPath(playerId)            { return doc(db, 'players', playerId, 'data', 'history') }
function familyMemberPath(familyCode, playerId) { return doc(db, 'families', familyCode, 'members', playerId) }

// Phase 8A legacy paths (read-only during migration)
function legacyProgressPath(familyCode, playerId, moduleId) {
  return doc(db, 'families', familyCode, 'progress', `${playerId}_${moduleId}`)
}
function legacyHistoryPath(familyCode, playerId) {
  return doc(db, 'families', familyCode, 'history', playerId)
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useSync() {
  const { familyCode: deviceFamilyCode, familyName: deviceFamilyName } = useSettings()

  // Phase 9.5: track Firebase UID so we can stamp it onto player profiles
  const firebaseUidRef = useRef(null)

  // ── Anonymous Auth ────────────────────────────────────────────────────────
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, user => {
      if (user) {
        firebaseUidRef.current = user.uid
        return
      }
      signInAnonymously(auth).catch(err =>
        console.warn('[useSync] anon auth failed:', err)
      )
    })
    return unsub
  }, [])

  // ── Expose Firebase UID ───────────────────────────────────────────────────
  // Called by PlayerContext when creating a new player so the UID is stored
  // on the profile. Returns null if auth hasn't resolved yet (rare race).
  const getFirebaseUid = useCallback(() => {
    return firebaseUidRef.current ?? auth.currentUser?.uid ?? null
  }, [])

  // ── Push profile ──────────────────────────────────────────────────────────
  // Phase 9.5: now writes firebaseUid into the Firestore profile doc.
  // Firestore rules should verify: request.auth.uid == resource.data.firebaseUid
  const pushProfile = useCallback(async (player) => {
    if (!player?.id) return
    try {
      await setDoc(playerProfilePath(player.id), {
        name:        player.name,
        avatar:      player.avatar,
        avatarBg:    player.avatarBg,
        accentColor: player.accentColor,
        handle:      player.handle      ?? '',   // Phase 9.5: globally unique handle
        familyCode:  player.familyCode  ?? '',
        familyName:  player.familyName  ?? '',
        firebaseUid: player.firebaseUid ?? firebaseUidRef.current ?? '',  // Phase 9.5
        updatedAt:   Date.now(),
      }, { merge: true })

      // Keep family member index for leaderboard queries
      if (player.familyCode?.length > 10) {
        await setDoc(familyMemberPath(player.familyCode, player.id), {
          name:       player.name,
          avatar:     player.avatar,
          familyCode: player.familyCode,
          joinedAt:   player.createdAt ?? new Date().toISOString(),
        }, { merge: true })
      }
    } catch (err) {
      console.warn('[useSync] pushProfile failed:', err)
    }
  }, [])

  // ── Push progress ─────────────────────────────────────────────────────────
  const pushProgress = useCallback(async (player, moduleId, progressMap) => {
    if (!player?.familyCode || player.familyCode.length <= 10) return
    try {
      await setDoc(playerProgressPath(player.id, moduleId), {
        map:       progressMap,
        updatedAt: Date.now(),
      }, { merge: false })
    } catch (err) {
      console.warn('[useSync] pushProgress failed:', err)
    }
  }, [])

  // ── Push history ──────────────────────────────────────────────────────────
  const pushHistory = useCallback(async (player, rounds) => {
    if (!player?.familyCode || player.familyCode.length <= 10) return
    try {
      await setDoc(playerHistoryPath(player.id), {
        rounds,
        updatedAt: Date.now(),
      }, { merge: false })
    } catch (err) {
      console.warn('[useSync] pushHistory failed:', err)
    }
  }, [])

  // ── Push all local data for a single player ───────────────────────────────
  const pushAllLocal = useCallback(async (player) => {
    if (!player?.id || !player?.familyCode || player.familyCode.length <= 10) return
    try {
      await pushProfile(player)
      const { progressDocs, rounds } = collectLocalDataForPlayer(player)
      for (const { moduleId, map } of progressDocs) {
        await setDoc(playerProgressPath(player.id, moduleId), {
          map, updatedAt: Date.now(),
        }, { merge: false })
      }
      if (rounds.length > 0) {
        await setDoc(playerHistoryPath(player.id), {
          rounds, updatedAt: Date.now(),
        }, { merge: false })
      }
    } catch (err) {
      console.warn('[useSync] pushAllLocal failed:', err)
    }
  }, [pushProfile])

  // ── Pull and merge ────────────────────────────────────────────────────────
  const pullAndMerge = useCallback(async (profiles = []) => {
    for (const player of profiles) {
      if (!player?.familyCode || player.familyCode.length <= 10) continue
      try {
        const progressSnaps = await getDocs(
          collection(db, 'players', player.id, 'progress')
        )

        if (!progressSnaps.empty) {
          progressSnaps.forEach(snap => {
            const moduleId  = snap.id
            const remoteMap = snap.data().map ?? {}
            const localKey  = `geofamily_progress_${player.id}_${moduleId}`
            lsSet(localKey, mergeProgress(lsGet(localKey) ?? {}, remoteMap))
          })
        } else {
          await migrateLegacyProgress(player)
        }

        const histSnap = await getDoc(playerHistoryPath(player.id))
        if (histSnap.exists()) {
          const remoteRounds = normaliseHistory(histSnap.data())
          const localKey     = `geofamily_history_${player.id}`
          const localRounds  = normaliseHistory(lsGet(localKey))
          lsSet(localKey, { rounds: mergeHistory(localRounds, remoteRounds) })
        } else {
          await migrateLegacyHistory(player)
        }
      } catch (err) {
        console.warn(`[useSync] pullAndMerge failed for player ${player.id}:`, err)
      }
    }
  }, [])

  // ── Legacy migration helpers ──────────────────────────────────────────────

  async function migrateLegacyProgress(player) {
    if (!player.familyCode || player.familyCode.length <= 10) return
    try {
      const prefix    = `geofamily_progress_${player.id}_`
      const moduleIds = Object.keys(localStorage)
        .filter(k => k.startsWith(prefix))
        .map(k => k.slice(prefix.length))
      for (const moduleId of moduleIds) {
        const legacySnap = await getDoc(legacyProgressPath(player.familyCode, player.id, moduleId))
        if (legacySnap.exists()) {
          const remoteMap = legacySnap.data().map ?? {}
          const localKey  = `geofamily_progress_${player.id}_${moduleId}`
          const merged    = mergeProgress(lsGet(localKey) ?? {}, remoteMap)
          lsSet(localKey, merged)
          await setDoc(playerProgressPath(player.id, moduleId), {
            map: merged, updatedAt: Date.now(),
          }, { merge: false })
        }
      }
    } catch (err) {
      console.warn('[useSync] legacy progress migration failed:', err)
    }
  }

  async function migrateLegacyHistory(player) {
    if (!player.familyCode || player.familyCode.length <= 10) return
    try {
      const legacySnap = await getDoc(legacyHistoryPath(player.familyCode, player.id))
      if (legacySnap.exists()) {
        const remoteRounds = normaliseHistory(legacySnap.data())
        const localKey     = `geofamily_history_${player.id}`
        const localRounds  = normaliseHistory(lsGet(localKey))
        const merged       = { rounds: mergeHistory(localRounds, remoteRounds) }
        lsSet(localKey, merged)
        await setDoc(playerHistoryPath(player.id), {
          rounds: merged.rounds, updatedAt: Date.now(),
        }, { merge: false })
      }
    } catch (err) {
      console.warn('[useSync] legacy history migration failed:', err)
    }
  }

  // ── PIN mechanics ─────────────────────────────────────────────────────────

  const generateJoinPin = useCallback(async () => {
    if (!deviceFamilyCode || deviceFamilyCode.length <= 10) {
      return { error: 'no_family' }
    }
    try {
      const pin = String(Math.floor(100000 + Math.random() * 900000))
      await setDoc(doc(db, 'joinPins', pin), {
        familyCode: deviceFamilyCode,
        familyName: deviceFamilyName,
        expiresAt:  Date.now() + 10 * 60 * 1000,
      })
      return { pin }
    } catch (err) {
      console.warn('[useSync] generateJoinPin failed:', err)
      return { error: 'network' }
    }
  }, [deviceFamilyCode, deviceFamilyName])

  const joinViaPin = useCallback(async (pin) => {
    const trimmed = pin.trim()
    if (!/^\d{6}$/.test(trimmed)) return { error: 'invalid_format' }
    try {
      const snap = await getDoc(doc(db, 'joinPins', trimmed))
      if (!snap.exists())          return { error: 'not_found' }
      const data = snap.data()
      if (data.expiresAt < Date.now()) return { error: 'expired' }
      return { familyCode: data.familyCode, familyName: data.familyName }
    } catch (err) {
      console.warn('[useSync] joinViaPin failed:', err)
      return { error: 'network' }
    }
  }, [])

  // ── Handle claim ──────────────────────────────────────────────────────────
  // Phase 9.5: atomically claim a unique handle in Firestore.
  // The handles/{handle} document acts as a reservation — write succeeds only
  // if the document doesn't exist yet (enforced by Firestore rules: allow create only).
  // Returns { ok: true } or { ok: false, error: 'taken' | 'network' }
  const claimHandle = useCallback(async (handle, playerId) => {
    if (!handle || handle.length < 2) return { ok: false, error: 'too_short' }
    const normalized = handle.toLowerCase().replace(/[^a-z0-9_]/g, '')
    if (normalized !== handle.toLowerCase()) return { ok: false, error: 'invalid_chars' }
    try {
      // Check if already taken
      const existing = await getDoc(doc(db, 'handles', normalized))
      if (existing.exists()) {
        // If it's claimed by this player already, that's fine
        if (existing.data().playerId === playerId) return { ok: true, handle: normalized }
        return { ok: false, error: 'taken' }
      }
      // Claim it
      await setDoc(doc(db, 'handles', normalized), {
        playerId,
        claimedAt: Date.now(),
      })
      return { ok: true, handle: normalized }
    } catch (err) {
      console.warn('[useSync] claimHandle failed:', err)
      return { ok: false, error: 'network' }
    }
  }, [])

  return {
    getFirebaseUid,
    pushProfile,
    pushProgress,
    pushHistory,
    pushAllLocal,
    pullAndMerge,
    generateJoinPin,
    joinViaPin,
    claimHandle,
  }
}
