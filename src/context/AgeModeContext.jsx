// AgeModeContext.jsx
// Provides the active age mode ('kids' | 'explorer') to any component.
//
// Kids mode:    3 answer choices, no timer, common countries, large UI, celebratory feedback
// Explorer mode: 4 answer choices, timer on, all 195 countries, normal UI, concise feedback
//
// Usage:
//   const { ageMode, setAgeMode, isKids } = useAgeMode()

import { createContext, useContext, useState } from 'react'

const AgeModeContext = createContext(null)

export function AgeModeProvider({ children }) {
  const [ageMode, setAgeMode] = useState(
    () => localStorage.getItem('geofamily_agemode') || 'kids'
  )

  function switchAgeMode(newMode) {
    setAgeMode(newMode)
    localStorage.setItem('geofamily_agemode', newMode)
  }

  return (
    <AgeModeContext.Provider value={{
      ageMode,
      setAgeMode: switchAgeMode,
      isKids: ageMode === 'kids',
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
