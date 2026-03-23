// src/screens/ModuleSelectScreen.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Phase 5: Direction + mode selector screen.
// Route: /module/:moduleId
//
// UX flow:
//   1. Two large direction cards (e.g. "Find the Capital" / "Find the Country")
//   2. Mode pills below (Multiple Choice pre-selected, locked modes greyed)
//   3. Big "Play!" CTA navigates to the quiz component
//
// State from HomeScreen: { lang, ageMode }
// Navigates to: /quiz/:moduleId/:directionId/:modeId with same state forwarded
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect }   from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useLanguage }           from '../context/LanguageContext'
import { useAgeMode }            from '../context/AgeModeContext'
import { getModule, defaultMode, quizPath } from '../config/modules'

export default function ModuleSelectScreen() {
  const { moduleId }  = useParams()
  const navigate      = useNavigate()
  const location      = useLocation()

  const { lang: liveLang, t, tLang } = useLanguage()
  const { ageMode: liveAgeMode, isKids } = useAgeMode()

  // Freeze lang/ageMode from navigation state (same pattern as quiz screens)
  const frozenLang    = location.state?.lang    ?? liveLang
  const frozenAgeMode = location.state?.ageMode ?? liveAgeMode

  const mod = getModule(moduleId)

  // ── Selection state ────────────────────────────────────────────────────────
  // Default to first direction; default mode = first unlocked mode of that direction
  const [selectedDirId,  setSelectedDirId]  = useState(mod?.directions[0]?.id ?? null)
  const [selectedModeId, setSelectedModeId] = useState(null)

  // When direction changes → reset mode to first unlocked of that direction
  useEffect(() => {
    if (!mod || !selectedDirId) return
    const firstUnlocked = defaultMode(moduleId, selectedDirId)
    setSelectedModeId(firstUnlocked?.id ?? null)
  }, [selectedDirId, moduleId, mod])

  // ── Guard ──────────────────────────────────────────────────────────────────
  if (!mod) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-400 text-lg">
        Module not found.
      </div>
    )
  }

  const currentDir = mod.directions.find(d => d.id === selectedDirId)

  function handlePlay() {
    if (!selectedDirId || !selectedModeId) return
    navigate(quizPath(moduleId, selectedDirId, selectedModeId), {
      state: { lang: frozenLang, ageMode: frozenAgeMode },
    })
  }

  // Tailwind gradient per module (mirrored from modules.js)
  const headerGradient = mod.gradient ?? 'from-blue-500 to-indigo-600'

  return (
    <div className="h-[100dvh] overflow-y-auto bg-gradient-to-br from-slate-50 to-blue-50">

      {/* ── Module header ─────────────────────────────────────────── */}
      <div className={`bg-gradient-to-r ${headerGradient} text-white px-4 pt-4 pb-6`}>
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-white/80 hover:text-white text-sm font-semibold mb-4 transition-colors"
        >
          ← {tLang('home', frozenLang)}
        </button>
        <div className="text-center">
          <div className={`mb-2 ${isKids ? 'text-6xl' : 'text-5xl'}`}>{mod.emoji}</div>
          <h1 className={`font-extrabold leading-tight ${isKids ? 'text-3xl' : 'text-2xl'}`}>
            {tLang(mod.labelKey, frozenLang)}
          </h1>
          <p className={`text-white/75 mt-1 ${isKids ? 'text-base' : 'text-sm'}`}>
            {tLang('moduleSelectSubtitle', frozenLang)}
          </p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-6 pb-10 space-y-6">

        {/* ── Step 1: Direction cards ──────────────────────────────── */}
        <section>
          <p className={`text-center font-semibold text-gray-400 uppercase tracking-widest mb-4 ${isKids ? 'text-sm' : 'text-xs'}`}>
            {tLang('moduleSelectStep1', frozenLang)}
          </p>

          <div className="grid grid-cols-2 gap-3">
            {mod.directions.map(dir => {
              const isSelected = selectedDirId === dir.id
              return (
                <button
                  key={dir.id}
                  onClick={() => setSelectedDirId(dir.id)}
                  className={`
                    relative rounded-2xl p-5 text-left transition-all duration-200
                    border-2 active:scale-95
                    ${isSelected
                      ? `bg-gradient-to-br ${headerGradient} text-white border-transparent shadow-lg scale-[1.02]`
                      : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:shadow-md'
                    }
                  `}
                >
                  {/* Selected checkmark */}
                  {isSelected && (
                    <div className="absolute top-2.5 right-2.5 w-5 h-5 bg-white/30 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">✓</span>
                    </div>
                  )}
                  <div className={`mb-2 ${isKids ? 'text-4xl' : 'text-3xl'}`}>{dir.emoji}</div>
                  <p className={`font-extrabold leading-tight ${isKids ? 'text-base' : 'text-sm'}`}>
                    {tLang(dir.labelKey, frozenLang)}
                  </p>
                  <p className={`mt-1 leading-snug ${isSelected ? 'text-white/75' : 'text-gray-400'} ${isKids ? 'text-sm' : 'text-xs'}`}>
                    {tLang(dir.descKey, frozenLang)}
                  </p>
                </button>
              )
            })}
          </div>
        </section>

        {/* ── Step 2: Mode pills ───────────────────────────────────── */}
        {currentDir && (
          <section>
            <p className={`text-center font-semibold text-gray-400 uppercase tracking-widest mb-4 ${isKids ? 'text-sm' : 'text-xs'}`}>
              {tLang('moduleSelectStep2', frozenLang)}
            </p>

            <div className="flex gap-2 justify-center flex-wrap">
              {currentDir.modes.map(mode => {
                const isSelected = selectedModeId === mode.id
                const isLocked   = mode.locked

                return (
                  <button
                    key={mode.id}
                    onClick={() => !isLocked && setSelectedModeId(mode.id)}
                    disabled={isLocked}
                    className={`
                      relative flex items-center gap-2 px-4 rounded-full border-2 font-bold transition-all duration-200
                      ${isKids ? 'py-3 text-base' : 'py-2 text-sm'}
                      ${isLocked
                        ? 'bg-gray-50 border-gray-200 text-gray-300 cursor-not-allowed'
                        : isSelected
                          ? `bg-gradient-to-r ${headerGradient} text-white border-transparent shadow-md`
                          : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:shadow-sm'
                      }
                    `}
                  >
                    <span>{mode.emoji}</span>
                    <span>{tLang(mode.labelKey, frozenLang)}</span>
                    {isLocked && (
                      <span className="text-xs ml-0.5">🔒</span>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Coming soon note */}
            {currentDir.modes.some(m => m.locked) && (
              <p className={`text-center text-gray-400 mt-3 ${isKids ? 'text-sm' : 'text-xs'}`}>
                🔒 {tLang('moduleSelectComingSoon', frozenLang)}
              </p>
            )}
          </section>
        )}

        {/* ── Play CTA ─────────────────────────────────────────────── */}
        <button
          onClick={handlePlay}
          disabled={!selectedDirId || !selectedModeId}
          className={`
            w-full rounded-2xl font-extrabold text-white transition-all duration-200
            ${isKids ? 'py-5 text-xl' : 'py-4 text-base'}
            ${selectedDirId && selectedModeId
              ? `bg-gradient-to-r ${headerGradient} shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95`
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }
          `}
        >
          ▶ {tLang('play', frozenLang)}!
        </button>

      </div>
    </div>
  )
}
