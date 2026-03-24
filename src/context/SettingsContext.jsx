// src/context/SettingsContext.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Phase 8A changes:
//   - familyCode  → private UUID used as the Firestore sync path key (never shown)
//   - familyName  → public display name shown on the leaderboard
//   - Old short WORD-NN style codes are migrated away: if the stored familyCode
//     matches the legacy pattern (e.g. "LION-42") it is cleared on load so the
//     user is prompted to create a proper family via the new PIN flow.
//   - syncEnabled → true when familyCode is a non-empty UUID-format string
//   - generateFamilyCode() kept for legacy compat but no longer used internally
// ─────────────────────────────────────────────────────────────────────────────

import { createContext, useContext, useState } from 'react'

const SettingsContext = createContext(null)

const STORAGE_KEY = 'geofamily_settings'

const DEFAULTS = {
  questionsPerRound: 10,
  familyCode:        '',   // private UUID — Firestore path key
  familyName:        '',   // public display name
}

// Legacy short-code pattern: WORD-NN  e.g. "LION-42"
const LEGACY_CODE_RE = /^[A-Z]{3,5}-\d{2}$/

function isLegacyCode(code) {
  return typeof code === 'string' && LEGACY_CODE_RE.test(code.trim())
}

function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULTS
    const parsed = { ...DEFAULTS, ...JSON.parse(raw) }
    // Deprecate old short codes — clear them silently
    if (isLegacyCode(parsed.familyCode)) {
      parsed.familyCode = ''
    }
    return parsed
  } catch {
    return DEFAULTS
  }
}

function saveSettings(settings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch {}
}

// Kept for any legacy callers, but new code uses crypto.randomUUID() directly
export function generateFamilyCode() {
  const WORDS = ['LION','BEAR','WOLF','HAWK','FROG','DUCK','CRAB','DEER',
                 'FISH','BIRD','STAR','MOON','SHIP','TREE','ROSE','FIRE']
  const word = WORDS[Math.floor(Math.random() * WORDS.length)]
  const num  = Math.floor(Math.random() * 90) + 10
  return `${word}-${num}`
}

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(loadSettings)

  function update(patch) {
    const updated = { ...settings, ...patch }
    setSettings(updated)
    saveSettings(updated)
  }

  function setQuestionsPerRound(n) { update({ questionsPerRound: n }) }

  // Called when creating a NEW family.
  // optionalCode lets the caller pre-generate the UUID so it can be used
  // immediately in pushAllLocal before the context re-render propagates.
  function createFamily(name, optionalCode) {
    update({
      familyCode: optionalCode ?? crypto.randomUUID(),
      familyName: name.trim().slice(0, 30),
    })
  }

  // Called when joining via PIN — receives the private familyCode from Firestore
  function joinFamily(code, name) {
    update({
      familyCode: code,
      familyName: name.trim().slice(0, 30),
    })
  }

  function leaveFamily() {
    update({ familyCode: '', familyName: '' })
  }

  // Legacy compat (SettingsModal still references these directly)
  function setFamilyCode(code) { update({ familyCode: code }) }
  function clearFamilyCode()   { update({ familyCode: '', familyName: '' }) }

  const syncEnabled = settings.familyCode.length > 10  // UUID is 36 chars

  return (
    <SettingsContext.Provider value={{
      ...settings,
      syncEnabled,
      setQuestionsPerRound,
      createFamily,
      joinFamily,
      leaveFamily,
      // Legacy compat
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
