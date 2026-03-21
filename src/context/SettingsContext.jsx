// SettingsContext.jsx
// Global settings state.
// Currently manages: questionsPerRound (default 10).
// Persists all settings to localStorage.
// Add more settings here as needed in future phases.

import { createContext, useContext, useState } from 'react'

const SettingsContext = createContext(null)

const STORAGE_KEY = 'geofamily_settings'
const DEFAULTS = {
  questionsPerRound: 10,
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

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(loadSettings)

  function setQuestionsPerRound(n) {
    const updated = { ...settings, questionsPerRound: n }
    setSettings(updated)
    saveSettings(updated)
  }

  return (
    <SettingsContext.Provider value={{ ...settings, setQuestionsPerRound }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used inside SettingsProvider')
  return ctx
}
