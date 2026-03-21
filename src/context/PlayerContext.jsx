// PlayerContext.jsx
// Manages all player profiles and tracks which player is currently active.
// Profiles and the active player ID are persisted to localStorage.
//
// Each profile shape:
// {
//   id:          string (UUID)
//   name:        string
//   avatar:      string (emoji)
//   avatarBg:    string (tailwind bg class, e.g. 'bg-blue-400')
//   accentColor: string (tailwind color name, e.g. 'blue')
//   createdAt:   ISO string
// }

import { createContext, useContext, useState } from 'react'

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
    else localStorage.removeItem(ACTIVE_KEY)
  } catch {}
}

export function PlayerProvider({ children }) {
  const [profiles, setProfiles] = useState(loadProfiles)
  const [activeId, setActiveId] = useState(loadActiveId)

  const activePlayer = profiles.find(p => p.id === activeId) ?? null

  function addPlayer(name, avatar, avatarBg, accentColor) {
    const newPlayer = {
      id:          crypto.randomUUID(),
      name:        name.trim(),
      avatar,
      avatarBg:    avatarBg    ?? 'bg-blue-400',
      accentColor: accentColor ?? 'blue',
      createdAt:   new Date().toISOString(),
    }
    const updated = [...profiles, newPlayer]
    setProfiles(updated)
    saveProfiles(updated)
    return newPlayer
  }

  function updatePlayer(id, { name, avatar, avatarBg, accentColor }) {
    const updated = profiles.map(p =>
      p.id === id
        ? { ...p, name: name?.trim() ?? p.name, avatar: avatar ?? p.avatar,
            avatarBg: avatarBg ?? p.avatarBg, accentColor: accentColor ?? p.accentColor }
        : p
    )
    setProfiles(updated)
    saveProfiles(updated)
  }

  function removePlayer(id) {
    const updated = profiles.filter(p => p.id !== id)
    setProfiles(updated)
    saveProfiles(updated)
    if (activeId === id) { setActiveId(null); saveActiveId(null) }
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
