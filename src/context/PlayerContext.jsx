// PlayerContext.jsx
// Manages all player profiles and tracks which player is currently active.
// Profiles and the active player ID are persisted to localStorage.
// Each profile: { id, name, avatar (emoji), createdAt }
// The active player is read by the SRS engine, Results screen, and Navbar.

import { createContext, useContext, useState } from 'react'

const PlayerContext = createContext(null)

const PROFILES_KEY    = 'geofamily_players'
const ACTIVE_KEY      = 'geofamily_active_player'

// ── Persistence helpers ──────────────────────────────────────────────────────

function loadProfiles() {
  try {
    const raw = localStorage.getItem(PROFILES_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveProfiles(profiles) {
  try {
    localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles))
  } catch { /* silently ignore */ }
}

function loadActiveId() {
  try {
    return localStorage.getItem(ACTIVE_KEY) ?? null
  } catch {
    return null
  }
}

function saveActiveId(id) {
  try {
    if (id) localStorage.setItem(ACTIVE_KEY, id)
    else localStorage.removeItem(ACTIVE_KEY)
  } catch { /* silently ignore */ }
}

// ── Provider ─────────────────────────────────────────────────────────────────

export function PlayerProvider({ children }) {
  const [profiles, setProfiles]   = useState(loadProfiles)
  const [activeId, setActiveId]   = useState(loadActiveId)

  // Derived: the full active player object (or null)
  const activePlayer = profiles.find(p => p.id === activeId) ?? null

  function addPlayer(name, avatar) {
    const newPlayer = {
      id:        crypto.randomUUID(),
      name:      name.trim(),
      avatar,
      createdAt: new Date().toISOString(),
    }
    const updated = [...profiles, newPlayer]
    setProfiles(updated)
    saveProfiles(updated)
    return newPlayer
  }

  function removePlayer(id) {
    const updated = profiles.filter(p => p.id !== id)
    setProfiles(updated)
    saveProfiles(updated)
    // If the deleted player was active, clear active
    if (activeId === id) {
      setActiveId(null)
      saveActiveId(null)
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
      profiles,
      activePlayer,
      activeId,
      addPlayer,
      removePlayer,
      switchPlayer,
      clearActivePlayer,
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
