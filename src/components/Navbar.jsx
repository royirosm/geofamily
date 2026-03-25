// src/components/Navbar.jsx
// Phase 9: top-right player chip opens an account panel with:
//   • Player info (avatar, name, level, family status)
//   • Switch player
//   • View stats
//   • Edit profile (opens PlayerSelectScreen in edit mode)
// Settings (⚙️) now only controls questions per round.

import { useState, useEffect, useCallback, useRef } from 'react'
import { useLocation, useNavigate }                  from 'react-router-dom'
import { useLanguage }                               from '../context/LanguageContext'
import { usePlayer }                                 from '../context/PlayerContext'
import { getBg, getAccent }                          from '../screens/PlayerSelectScreen'
import { getLevelForPlayer }                         from '../hooks/usePlayerProgress'
import PlayerSelectScreen                            from '../screens/PlayerSelectScreen'

// True when running as installed PWA
function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches
    || window.navigator.standalone === true
}

function fullscreenSupported() {
  return !!document.documentElement.requestFullscreen
}

// ── AccountPanel ──────────────────────────────────────────────────────────────

function AccountPanel({ onClose, onSwitchPlayer, onEditPlayer }) {
  const { lang, t }      = useLanguage()
  const { activePlayer } = usePlayer()
  const navigate         = useNavigate()
  const panelRef         = useRef(null)

  // Close on outside click
  useEffect(() => {
    function handleClick(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) onClose()
    }
    // Use a small delay so the opening click doesn't immediately close it
    const timer = setTimeout(() => document.addEventListener('mousedown', handleClick), 10)
    return () => { clearTimeout(timer); document.removeEventListener('mousedown', handleClick) }
  }, [onClose])

  if (!activePlayer) return null

  const bg     = getBg(activePlayer.avatarBg)
  const accent = getAccent(activePlayer.accentColor)
  const level  = getLevelForPlayer(activePlayer.id)

  return (
    <div
      ref={panelRef}
      className="absolute top-full right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50"
    >
      {/* Player card */}
      <div className={`px-4 py-4 border-b border-gray-100`}>
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-full ${bg.bg} flex items-center justify-center flex-shrink-0 shadow-sm`}>
            <span className="text-2xl">{activePlayer.avatar}</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-extrabold text-gray-800 truncate">{activePlayer.name}</p>
            <span className={`text-xs font-bold text-white px-2 py-0.5 rounded-full ${accent.badge}`}>
              {level.title[lang] ?? level.title.en}
            </span>
            {activePlayer.familyCode?.length > 10 && (
              <p className="text-xs text-gray-400 mt-0.5">🏠 {activePlayer.familyName || 'Family'}</p>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="py-1">
        <button
          onClick={() => { navigate('/stats'); onClose() }}
          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
        >
          <span className="text-lg">📊</span>
          <span className="font-semibold text-gray-700 text-sm">{t('statsTitle')}</span>
        </button>

        <button
          onClick={() => { onEditPlayer(); onClose() }}
          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
        >
          <span className="text-lg">✏️</span>
          <span className="font-semibold text-gray-700 text-sm">{t('playerEditTitle')}</span>
        </button>

        <div className="mx-4 my-1 border-t border-gray-100" />

        <button
          onClick={() => { onSwitchPlayer(); onClose() }}
          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
        >
          <span className="text-lg">👥</span>
          <span className="font-semibold text-gray-700 text-sm">{t('playerSwitch')}</span>
        </button>
      </div>
    </div>
  )
}

// ── Navbar ────────────────────────────────────────────────────────────────────

export default function Navbar() {
  const { t }                    = useLanguage()
  const { activePlayer }         = usePlayer()
  const navigate                 = useNavigate()
  const loc                      = useLocation()

  const inQuiz = loc.pathname.startsWith('/quiz')
  const bg     = activePlayer ? getBg(activePlayer.avatarBg) : null

  const showFullscreenBtn               = !isStandalone() && fullscreenSupported()
  const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement)
  const [showPanel,    setShowPanel]    = useState(false)

  // 'none' | 'switch' | 'edit'
  const [overlayMode, setOverlayMode]   = useState('none')

  useEffect(() => {
    function onFsChange() { setIsFullscreen(!!document.fullscreenElement) }
    document.addEventListener('fullscreenchange', onFsChange)
    return () => document.removeEventListener('fullscreenchange', onFsChange)
  }, [])

  // Close panel on route change
  useEffect(() => { setShowPanel(false); setOverlayMode('none') }, [loc.pathname])

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {})
    } else {
      document.exitFullscreen()
    }
  }, [])

  // ── Full-screen overlays (player switch / edit) ───────────────────────────

  if (overlayMode === 'switch') {
    return (
      <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
        <PlayerSelectScreen onDone={() => setOverlayMode('none')} />
      </div>
    )
  }

  if (overlayMode === 'edit') {
    // Show PlayerSelectScreen but jump straight to edit for the active player.
    // We pass an initialEdit prop so it opens in edit mode immediately.
    return (
      <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
        <PlayerSelectScreen
          onDone={() => setOverlayMode('none')}
          initialEditId={activePlayer?.id}
        />
      </div>
    )
  }

  return (
    <nav className="w-full px-4 py-2 flex items-center justify-between bg-white border-b border-gray-100 sticky top-0 z-50">

      {/* Logo → home */}
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-1.5 flex-shrink-0 hover:opacity-80 transition-opacity"
      >
        <span className="text-xl">🌍</span>
        <span className="font-bold text-base text-gray-800 tracking-tight leading-none">
          {t('appName')}
        </span>
      </button>

      {/* Right side */}
      <div className="flex items-center gap-2">

        {/* Fullscreen toggle */}
        {showFullscreenBtn && (
          <button
            onClick={toggleFullscreen}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-sm"
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? '⊡' : '⛶'}
          </button>
        )}

        {/* Account chip — hidden during quiz */}
        {activePlayer && !inQuiz && (
          <div className="relative">
            <button
              onClick={() => setShowPanel(p => !p)}
              className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 rounded-full pl-1 pr-3 py-1 transition-colors"
              aria-label="Account"
            >
              <div className={`w-6 h-6 rounded-full ${bg.bg} flex items-center justify-center flex-shrink-0`}>
                <span className="text-sm leading-none">{activePlayer.avatar}</span>
              </div>
              <span className="text-xs font-bold text-gray-700 max-w-[80px] truncate">
                {activePlayer.name}
              </span>
            </button>

            {showPanel && (
              <AccountPanel
                onClose={() => setShowPanel(false)}
                onSwitchPlayer={() => setOverlayMode('switch')}
                onEditPlayer={() => setOverlayMode('edit')}
              />
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
