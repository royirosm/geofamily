// Navbar.jsx
// Minimal top bar — logo (→ home) + fullscreen toggle + active player chip (→ stats).
// Fullscreen button is always visible here (except in PWA standalone mode or
// iOS Safari browser which don't support the API).
// Player chip hides during quiz — the quiz has its own top bar.

import { useState, useEffect, useCallback } from 'react'
import { useLocation, useNavigate }          from 'react-router-dom'
import { useLanguage }                       from '../context/LanguageContext'
import { usePlayer }                         from '../context/PlayerContext'
import { getBg }                             from '../screens/PlayerSelectScreen'

// True when running as installed PWA — fullscreen button not needed
function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches
    || window.navigator.standalone === true
}

// True when the Fullscreen API exists (iOS Safari browser returns false)
function fullscreenSupported() {
  return !!document.documentElement.requestFullscreen
}

export default function Navbar() {
  const { t }            = useLanguage()
  const { activePlayer } = usePlayer()
  const navigate         = useNavigate()
  const loc              = useLocation()

  const inQuiz = loc.pathname.startsWith('/quiz')
  const bg     = activePlayer ? getBg(activePlayer.avatarBg) : null

  const showFullscreenBtn              = !isStandalone() && fullscreenSupported()
  const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement)

  useEffect(() => {
    function onFsChange() { setIsFullscreen(!!document.fullscreenElement) }
    document.addEventListener('fullscreenchange', onFsChange)
    return () => document.removeEventListener('fullscreenchange', onFsChange)
  }, [])

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {})
    } else {
      document.exitFullscreen()
    }
  }, [])

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

      {/* Right side: fullscreen + player chip */}
      <div className="flex items-center gap-2">

        {/* Fullscreen toggle — available on all screens including quiz */}
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

        {/* Player chip → stats (hidden during quiz) */}
        {activePlayer && !inQuiz && (
          <button
            onClick={() => navigate('/stats')}
            className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 rounded-full pl-1 pr-3 py-1 transition-colors"
            aria-label={t('statsTitle')}
          >
            <div className={`w-6 h-6 rounded-full ${bg.bg} flex items-center justify-center flex-shrink-0`}>
              <span className="text-sm leading-none">{activePlayer.avatar}</span>
            </div>
            <span className="text-xs font-bold text-gray-700 max-w-[80px] truncate">
              {activePlayer.name}
            </span>
          </button>
        )}
      </div>
    </nav>
  )
}
