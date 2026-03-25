// src/context/PlayerContext.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Phase 9.5: Identity foundations.
//
// Changes from Phase 9:
//   • addPlayer() stamps the current Firebase UID onto the new player profile
//     via getFirebaseUid() from useSync. This creates a permanent link between
//     the player's app UUID and their Firebase anonymous auth identity.
//   • Player profile shape gains two new optional fields:
//       firebaseUid: string  — Firebase anonymous UID, set once at creation
//       handle:      string  — globally unique display handle (empty by default)
//   • updatePlayer() accepts handle updates (for the handle-claim flow).
//   • Migration: existing players get firebaseUid = '' and handle = '' silently
//     on first Phase 9.5 load (filled in by migrateProfiles).
//   • Everything else (CRUD, sync, family) is unchanged from Phase 9.
// ─────────────────────────────────────────────────────────────────────────────

import { createContext, useContext, useState, useCallback } from 'react'
import { useSync }     from '../hooks/useSync'
import { useSettings } from './SettingsContext'

const PlayerContext = createContext(null)

const PROFILES_KEY = 'geofamily_players'
const ACTIVE_KEY   = 'geofamily_active_player'

function loadProfiles() {
  try {
    const raw = localStorage.getItem(PROFILES_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function saveProfiles(profiles) {
  try { localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles)) } catch {}
}

function loadActiveId() {
  try { return localStorage.getItem(ACTIVE_KEY) ?? null } catch { return null }
}

function saveActiveId(id) {
  try {
    if (id) localStorage.setItem(ACTIVE_KEY, id)
    else    localStorage.removeItem(ACTIVE_KEY)
  } catch {}
}

// ── Migration ─────────────────────────────────────────────────────────────────
// Phase 9:   adds familyCode + familyName to profiles that lack them
// Phase 9.5: adds firebaseUid + handle to profiles that lack them
// Both run only for profiles where the field is literally undefined (not '').
// One-time, silent, runs at initial useState load only.

function migrateProfiles(profiles, deviceFamilyCode, deviceFamilyName) {
  let changed = false
  const migrated = profiles.map(p => {
    const patch = {}

    // Phase 9 migration — assign device family to pre-Phase-9 players
    if (p.familyCode === undefined) {
      patch.familyCode = deviceFamilyCode ?? ''
      patch.familyName = deviceFamilyName ?? ''
      changed = true
    }

    // Phase 9.5 migration — add empty identity fields
    if (p.firebaseUid === undefined) { patch.firebaseUid = ''; changed = true }
    if (p.handle      === undefined) { patch.handle      = ''; changed = true }

    return Object.keys(patch).length > 0 ? { ...p, ...patch } : p
  })
  return { migrated, changed }
}

export function PlayerProvider({ children }) {
  const { familyCode: deviceFamilyCode, familyName: deviceFamilyName } = useSettings()

  const [profiles, setProfiles] = useState(() => {
    const raw = loadProfiles()
    const { migrated, changed } = migrateProfiles(raw, deviceFamilyCode, deviceFamilyName)
    if (changed) saveProfiles(migrated)
    return migrated
  })

  const [activeId, setActiveId] = useState(loadActiveId)

  const { pullAndMerge, pushProfile, pushAllLocal, getFirebaseUid } = useSync()

  const activePlayer = profiles.find(p => p.id === activeId) ?? null

  // ── Pull on open ──────────────────────────────────────────────────────────
  const syncOnOpen = useCallback(async () => {
    await pullAndMerge(profiles)
    const refreshed = loadProfiles()
    setProfiles(refreshed)
    if (activeId && !refreshed.find(p => p.id === activeId)) {
      setActiveId(null)
      saveActiveId(null)
    }
  }, [pullAndMerge, profiles, activeId])

  // ── CRUD ──────────────────────────────────────────────────────────────────

  function addPlayer(name, avatar, avatarBg, accentColor, familyCode, familyName) {
    const newPlayer = {
      id:          crypto.randomUUID(),
      name:        name.trim(),
      avatar,
      avatarBg:    avatarBg    ?? 'blue',
      accentColor: accentColor ?? 'blue',
      familyCode:  familyCode  ?? deviceFamilyCode ?? '',
      familyName:  familyName  ?? deviceFamilyName ?? '',
      // Phase 9.5: identity fields
      firebaseUid: getFirebaseUid() ?? '',
      handle:      '',
      createdAt:   new Date().toISOString(),
      updatedAt:   new Date().toISOString(),
    }
    const updated = [...profiles, newPlayer]
    setProfiles(updated)
    saveProfiles(updated)
    pushProfile(newPlayer)   // fire-and-forget
    return newPlayer
  }

  function updatePlayer(id, {
    name, avatar, avatarBg, accentColor,
    familyCode, familyName,
    handle,      // Phase 9.5: handle update (after claimHandle succeeds)
  }) {
    let updated
    setProfiles(prev => {
      updated = prev.map(p =>
        p.id === id
          ? {
              ...p,
              name:        name?.trim()    ?? p.name,
              avatar:      avatar          ?? p.avatar,
              avatarBg:    avatarBg        ?? p.avatarBg,
              accentColor: accentColor     ?? p.accentColor,
              familyCode:  familyCode !== undefined ? familyCode : p.familyCode,
              familyName:  familyName !== undefined ? familyName : p.familyName,
              handle:      handle     !== undefined ? handle     : p.handle,
              updatedAt:   new Date().toISOString(),
            }
          : p
      )
      saveProfiles(updated)
      return updated
    })
    setTimeout(() => {
      const player = (updated ?? profiles).find(p => p.id === id)
      if (player) pushProfile(player)
    }, 0)
  }

  function removePlayer(id) {
    const updated = profiles.filter(p => p.id !== id)
    setProfiles(updated)
    saveProfiles(updated)
    if (activeId === id) {
      const next = updated[0]?.id ?? null
      setActiveId(next)
      saveActiveId(next)
    }
  }

  function switchPlayer(id) {
    setActiveId(id)
    saveActiveId(id)
  }

  function clearActivePlayer() {
    setActiveId(null)
    saveActiveId(null)
  }

  return (
    <PlayerContext.Provider value={{
      profiles, activePlayer, activeId,
      addPlayer, updatePlayer, removePlayer, switchPlayer, clearActivePlayer,
      syncOnOpen,
      pushAllLocal,
    }}>
      {children}
    </PlayerContext.Provider>
  )
}

export function usePlayer() {
  const ctx = useContext(PlayerContext)
  if (!ctx) throw new Error('usePlayer must be used inside PlayerProvider')
  return ctx
}
