// src/context/SettingsContext.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Phase 9: familyCode is now a "default family for new players" only.
//          Per-player familyCode/familyName live on the player profile itself.
//          Device-level settings: questionsPerRound, defaultFamilyCode,
//          defaultFamilyName (used when creating a new player automatically).
// ─────────────────────────────────────────────────────────────────────────────

import { createContext, useContext, useState } from 'react'

const SettingsContext = createContext(null)

const SETTINGS_KEY = 'geofamily_settings'

const DEFAULT_SETTINGS = {
  questionsPerRound: 10,
  familyCode:        '',   // device default — applied to new players on creation
  familyName:        '',   // display name for the device default family
  lang:              'en',
}

function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS
  } catch { return DEFAULT_SETTINGS }
}

function saveSettings(s) {
  try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(s)) } catch {}
}

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(loadSettings)

  function update(patch) {
    setSettings(prev => {
      const next = { ...prev, ...patch }
      saveSettings(next)
      return next
    })
  }

  function setQuestionsPerRound(n) { update({ questionsPerRound: n }) }

  // ── Device-level default family (applied to new players automatically) ─────
  // These functions still exist so SettingsModal can manage the device default.

  function createFamily(name, optionalCode) {
    update({
      familyCode: optionalCode ?? crypto.randomUUID(),
      familyName: name.trim().slice(0, 30),
    })
  }

  function joinFamily(code, name) {
    update({
      familyCode: code,
      familyName: name.trim().slice(0, 30),
    })
  }

  function leaveFamily() {
    update({ familyCode: '', familyName: '' })
  }

  // Legacy compat (SettingsModal still references these)
  function setFamilyCode(code) { update({ familyCode: code }) }
  function clearFamilyCode()   { update({ familyCode: '', familyName: '' }) }

  // syncEnabled at device level — true if a default family code is present.
  // Per-player sync is determined by player.familyCode length in useSync.
  const syncEnabled = settings.familyCode.length > 10

  return (
    <SettingsContext.Provider value={{
      ...settings,
      syncEnabled,
      setQuestionsPerRound,
      createFamily,
      joinFamily,
      leaveFamily,
      setFamilyCode,
      clearFamilyCode,
    }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used inside SettingsProvider')
  return ctx
}
