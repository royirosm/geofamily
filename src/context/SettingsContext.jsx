// SettingsContext.jsx
// Global settings state.
// Manages: questionsPerRound (default 10) + familyCode (default '').
// Persists all settings to localStorage.
// Add more settings here as needed in future phases.

import { createContext, useContext, useState } from 'react'

const SettingsContext = createContext(null)

const STORAGE_KEY = 'geofamily_settings'
const DEFAULTS = {
  questionsPerRound: 10,
  familyCode:        '',   // empty = leaderboard sync disabled
}

function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS
  } catch {
    return DEFAULTS
  }
}

function saveSettings(settings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch {
    // localStorage unavailable — silently ignore
  }
}

// Generates a random human-readable family code like "LION-42"
const WORDS = [
  'LION', 'BEAR', 'WOLF', 'HAWK', 'FROG', 'DUCK', 'CRAB', 'DEER',
  'FISH', 'BIRD', 'STAR', 'MOON', 'SHIP', 'TREE', 'ROSE', 'FIRE',
]
export function generateFamilyCode() {
  const word = WORDS[Math.floor(Math.random() * WORDS.length)]
  const num  = Math.floor(Math.random() * 90) + 10 // 10–99
  return `${word}-${num}`
}

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(loadSettings)

  function setQuestionsPerRound(n) {
    const updated = { ...settings, questionsPerRound: n }
    setSettings(updated)
    saveSettings(updated)
  }

  function setFamilyCode(code) {
    // Sanitise: uppercase, trim, max 10 chars
    const clean = code.toUpperCase().trim().slice(0, 10)
    const updated = { ...settings, familyCode: clean }
    setSettings(updated)
    saveSettings(updated)
  }

  function clearFamilyCode() {
    const updated = { ...settings, familyCode: '' }
    setSettings(updated)
    saveSettings(updated)
  }

  return (
    <SettingsContext.Provider value={{
      ...settings,
      setQuestionsPerRound,
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
