// Navbar.jsx
// Minimal top bar — logo (→ home) + active player chip (→ stats).
// Age mode, language, settings and player-switch have moved to HomeScreen.
// All controls are disabled during quiz (pointer-events-none + opacity).

import { useLocation, useNavigate } from 'react-router-dom'
import { useLanguage }    from '../context/LanguageContext'
import { usePlayer }      from '../context/PlayerContext'
import { getBg }          from '../screens/PlayerSelectScreen'

export default function Navbar() {
  const { t }            = useLanguage()
  const { activePlayer } = usePlayer()
  const navigate         = useNavigate()
  const loc              = useLocation()

  const inQuiz = loc.pathname.startsWith('/quiz')
  const bg     = activePlayer ? getBg(activePlayer.avatarBg) : null

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
    </nav>
  )
}
