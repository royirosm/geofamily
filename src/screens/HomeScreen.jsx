// src/screens/HomeScreen.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Phase 7 changes:
//   - Age mode toggle: 3 icons only (no labels), all same size
//   - Module card emojis: unified size (text-3xl always, no kids/explorer split)
//   - Globe: animate-bounce restored for kids mode
//   - Player chip removed from home — player switching moved into Settings modal
//   - Kids unlock badge retained
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react'
import { useNavigate }          from 'react-router-dom'
import { useLanguage }          from '../context/LanguageContext'
import { useAgeMode }           from '../context/AgeModeContext'
import { usePlayer }            from '../context/PlayerContext'
import { MODULES }              from '../config/modules'
import { getKidsPoolSize }      from '../utils/questionGenerator'
import { getGlobalMasterCount } from '../hooks/usePlayerProgress'
import SettingsModal            from '../components/SettingsModal'

function seenPoolKey(playerId) { return `geofamily_kids_seen_pool_${playerId}` }

export default function HomeScreen() {
  const navigate                        = useNavigate()
  const { lang, setLang, t }            = useLanguage()
  const { ageMode, setAgeMode, isKids } = useAgeMode()
  const { activePlayer }                = usePlayer()
  const [showSettings, setShowSettings] = useState(false)
  const [unlockBadge,  setUnlockBadge]  = useState(null)

  // ── Kids unlock badge ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!activePlayer || ageMode !== 'kids') { setUnlockBadge(null); return }
    const masterCount  = getGlobalMasterCount(activePlayer.id)
    const currentSize  = getKidsPoolSize(masterCount)
    const seenKey      = seenPoolKey(activePlayer.id)
    const lastSeenSize = parseInt(localStorage.getItem(seenKey) ?? '0', 10)
    if (currentSize > lastSeenSize && lastSeenSize > 0) {
      setUnlockBadge(currentSize - lastSeenSize)
    } else {
      setUnlockBadge(null)
      if (lastSeenSize === 0) localStorage.setItem(seenKey, String(currentSize))
    }
  }, [activePlayer, ageMode])

  function handleModuleClick(mod) {
    if (!mod.available) return
    // Clear unlock badge when quiz starts
    if (isKids && activePlayer && unlockBadge) {
      const masterCount = getGlobalMasterCount(activePlayer.id)
      localStorage.setItem(seenPoolKey(activePlayer.id), String(getKidsPoolSize(masterCount)))
      setUnlockBadge(null)
    }
    navigate(`/module/${mod.id}`, { state: { lang, ageMode } })
  }

  return (
    <div className="h-[100dvh] overflow-y-auto bg-gradient-to-br from-slate-50 to-blue-50">

      {/* ── Control strip ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-2 px-4 pt-3 pb-2 max-w-2xl mx-auto">

        {/* 3-way age mode toggle — icons only */}
        <div className="flex items-center bg-white border border-gray-200 rounded-full p-0.5 gap-0.5 shadow-sm">
          <ModeButton
            active={ageMode === 'kids'}
            onClick={() => setAgeMode('kids')}
            activeClass="bg-yellow-400"
            label={t('kidsMode')}
          >
            🧒
          </ModeButton>
          <ModeButton
            active={ageMode === 'familiar'}
            onClick={() => setAgeMode('familiar')}
            activeClass="bg-emerald-500"
            label={t('familiarMode')}
          >
            🌍
          </ModeButton>
          <ModeButton
            active={ageMode === 'expert'}
            onClick={() => setAgeMode('expert')}
            activeClass="bg-blue-500"
            label={t('expertMode')}
          >
            🧭
          </ModeButton>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLang(lang === 'en' ? 'el' : 'en')}
            className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs font-bold text-gray-600 hover:bg-gray-50 shadow-sm transition-colors"
          >
            {lang === 'en' ? 'ΕΛ' : 'EN'}
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 bg-white border border-gray-200 rounded-full text-gray-500 hover:bg-gray-50 shadow-sm transition-colors text-base leading-none"
          >
            ⚙️
          </button>
        </div>
      </div>

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <div className="text-center px-4 pt-4 pb-5 max-w-2xl mx-auto">
        {/* Globe — always bounces */}
        <div className="mb-2 text-5xl animate-bounce">🌍</div>
        <h1 className={`font-extrabold text-gray-800 ${isKids ? 'text-3xl' : 'text-2xl'}`}>
          {t('homeTitle')}
        </h1>
        <p className={`text-gray-400 mt-1 ${isKids ? 'text-lg' : 'text-sm'}`}>
          {t('homeSubtitle')}
        </p>

        {/* Kids unlock badge */}
        {isKids && unlockBadge && (
          <div className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-yellow-100 border border-yellow-300 text-yellow-800 font-bold text-sm animate-pulse">
            🆕 {unlockBadge} {t('kidsNewCountries')}
          </div>
        )}

        {/* Mode description pill */}
        {ageMode === 'familiar' && (
          <p className="mt-2 text-xs text-emerald-600 font-semibold">{t('familiarModeDesc')}</p>
        )}
        {ageMode === 'expert' && (
          <p className="mt-2 text-xs text-blue-500 font-semibold">{t('expertModeDesc')}</p>
        )}
      </div>

      {/* ── Module grid ───────────────────────────────────────────── */}
      <div className="px-4 pb-4 max-w-2xl mx-auto">
        <p className="text-center font-semibold text-gray-400 uppercase tracking-widest text-xs mb-4">
          {t('chooseModule')}
        </p>
        <div className="grid grid-cols-2 gap-3 auto-rows-fr">
          {MODULES.map(mod => (
            <button
              key={mod.id}
              onClick={() => handleModuleClick(mod)}
              disabled={!mod.available}
              className={`
                relative rounded-3xl p-5 text-left transition-all duration-200 h-full
                ${mod.available
                  ? `bg-gradient-to-br ${mod.gradient} text-white shadow-lg hover:shadow-xl active:scale-95 hover:scale-[1.02]`
                  : 'bg-white border-2 border-dashed border-gray-200 text-gray-300 cursor-not-allowed'
                }
              `}
            >
              <div className="mb-2 text-3xl">{mod.emoji}</div>
              <p className={`font-extrabold leading-tight ${isKids ? 'text-base' : 'text-sm'}`}>
                {t(mod.labelKey)}
              </p>
              {!mod.available && (
                <p className="text-xs mt-1 text-gray-400">🔒 {t('comingSoon')}</p>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Leaderboard ───────────────────────────────────────────── */}
      <div className="px-4 pb-8 max-w-2xl mx-auto">
        <button
          onClick={() => navigate('/leaderboard')}
          className={`w-full rounded-2xl font-bold bg-white border-2 border-gray-200 text-gray-600 hover:bg-gray-50 transition-all ${isKids ? 'py-4 text-lg' : 'py-3 text-sm'}`}
        >
          🏆 {t('leaderboard')}
        </button>
      </div>

      {/* ── Settings modal (now includes player switcher) ────────── */}
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </div>
  )
}

// ── Mode toggle button — icon only, no label text ────────────────────────────
function ModeButton({ active, onClick, activeClass, label, children }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`
        w-9 h-8 flex items-center justify-center rounded-full text-base
        transition-all duration-200
        ${active ? `${activeClass} shadow-sm` : 'text-gray-400 hover:text-gray-600'}
      `}
    >
      {children}
    </button>
  )
}
