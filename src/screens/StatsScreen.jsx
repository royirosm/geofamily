// src/screens/StatsScreen.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Stats screen shell — Phase 5 modular refactor.
//
// Responsibilities:
//   • Sticky header with player info + level badge
//   • Tab strip (Overview / Countries / By Game Mode)
//   • Load shared data (stats, allProgress) once and pass to active tab
//   • Route to the correct tab component
//
// Tab components live in src/screens/stats/tabs/
// Shared helpers live in src/screens/stats/StatsHelpers.jsx
//
// To add a new tab in the future:
//   1. Create src/screens/stats/tabs/NewTab.jsx
//   2. Add one entry to TABS array below
//   3. Add one conditional render in the content section
//   Nothing else changes.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useMemo }   from 'react'
import { useNavigate }         from 'react-router-dom'
import { useLanguage }         from '../context/LanguageContext'
import { useAgeMode }          from '../context/AgeModeContext'
import { usePlayer }           from '../context/PlayerContext'
import {
  getStatsForPlayer,
  getLevelForPlayer,
}                              from '../hooks/usePlayerProgress'
import { getAccent, getBg }    from './PlayerSelectScreen'
import { loadProgressForPlayer } from './stats/StatsHelpers.jsx'

// ── Tab components ────────────────────────────────────────────────────────────
import OverviewTab   from './stats/tabs/OverviewTab'
import CountriesTab  from './stats/tabs/CountriesTab'
import GameModeTab   from './stats/tabs/GameModeTab'

// ── Tab registry ─────────────────────────────────────────────────────────────

const TABS = [
  { id: 'overview',  labelKey: 'statsTabOverview',  emoji: '📊' },
  { id: 'countries', labelKey: 'statsTabCountries', emoji: '🌍' },
  { id: 'gamemode',  labelKey: 'statsTabGameMode',  emoji: '🎮' },
]

// ── Screen ────────────────────────────────────────────────────────────────────

export default function StatsScreen({ countries }) {
  const navigate         = useNavigate()
  const { lang, t }      = useLanguage()
  const { isKids }       = useAgeMode()
  const { activePlayer } = usePlayer()

  const [activeTab, setActiveTab] = useState('overview')

  if (!activePlayer) { navigate('/'); return null }

  const stats  = getStatsForPlayer(activePlayer.id)
  const level  = getLevelForPlayer(activePlayer.id)
  const accent = getAccent(activePlayer.accentColor)
  const bg     = getBg(activePlayer.avatarBg)

  // Load once — passed to all tabs as a prop so no tab re-reads localStorage
  const allProgress = useMemo(
    () => loadProgressForPlayer(activePlayer.id),
    [activePlayer.id]
  )

  return (
    <div className="h-[100dvh] flex flex-col bg-gradient-to-br from-slate-50 to-blue-50">

      {/* ── Sticky header ─────────────────────────────────────────── */}
      <div className="flex-shrink-0 bg-white border-b border-gray-100 shadow-sm">

        {/* Player row */}
        <div className="px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="text-gray-400 hover:text-gray-600 transition-colors text-xl w-8 flex-shrink-0"
          >←</button>
          <div className={`w-9 h-9 rounded-full ${bg.bg} flex items-center justify-center flex-shrink-0`}>
            <span className="text-xl">{activePlayer.avatar}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-gray-800 truncate">{activePlayer.name}</span>
              <span className={`text-xs font-bold text-white px-2 py-0.5 rounded-full flex-shrink-0 ${accent.badge}`}>
                {level.title[lang] ?? level.title.en}
              </span>
            </div>
            <span className="text-xs text-gray-400">{t('statsTitle')}</span>
          </div>
        </div>

        {/* Tab strip */}
        <div className="flex border-t border-gray-100">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold transition-all
                border-b-2
                ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
                }
              `}
            >
              <span>{tab.emoji}</span>
              <span>{t(tab.labelKey)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Scrollable tab content ────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-lg mx-auto px-4 py-6 pb-12">

          {activeTab === 'overview' && (
            <OverviewTab
              stats={stats}
              allProgress={allProgress}
              lang={lang}
              t={t}
              isKids={isKids}
              navigate={navigate}
            />
          )}

          {activeTab === 'countries' && (
            <CountriesTab
              stats={stats}
              allProgress={allProgress}
              countries={countries}
              lang={lang}
              t={t}
            />
          )}

          {activeTab === 'gamemode' && (
            <GameModeTab
              stats={stats}
              lang={lang}
              t={t}
            />
          )}

        </div>
      </div>
    </div>
  )
}
