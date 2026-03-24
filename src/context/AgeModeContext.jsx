// src/context/AgeModeContext.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Provides the active age mode to any component.
//
// THREE modes (upgraded from 2):
//   'kids'     — 3 choices, large UI, celebratory feedback, tiered country pool
//                (starts at 40, unlocks 5 more per 5 countries mastered globally)
//   'familiar' — 4 choices, normal UI, curated ~100-country pool (well-known states)
//   'expert'   — 4 choices, normal UI, all ~235 countries
//
// Backwards compatibility: old localStorage value 'explorer' maps to 'expert'
// so existing users are not reset.
//
// Usage:
//   const { ageMode, setAgeMode, isKids, isFamiliar, isExpert } = useAgeMode()
// ─────────────────────────────────────────────────────────────────────────────

import { createContext, useContext, useState } from 'react'

const AgeModeContext = createContext(null)

function loadAgeMode() {
  const stored = localStorage.getItem('geofamily_agemode') || 'kids'
  // Migrate legacy 'explorer' value to 'expert'
  return stored === 'explorer' ? 'expert' : stored
}

export function AgeModeProvider({ children }) {
  const [ageMode, setAgeModeState] = useState(loadAgeMode)

  function setAgeMode(newMode) {
    setAgeModeState(newMode)
    localStorage.setItem('geofamily_agemode', newMode)
  }

  return (
    <AgeModeContext.Provider value={{
      ageMode,
      setAgeMode,
      isKids:     ageMode === 'kids',
      isFamiliar: ageMode === 'familiar',
      isExpert:   ageMode === 'expert',
    }}>
      {children}
    </AgeModeContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAgeMode() {
  const ctx = useContext(AgeModeContext)
  if (!ctx) throw new Error('useAgeMode must be used inside <AgeModeProvider>')
  return ctx
}
