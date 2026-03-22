// LeaderboardScreen.jsx
// Two tabs (Family / Global).
// Ranking selector uses Option C — a bottom sheet opened by a single button,
// with rankings grouped by General / per-module. Scales cleanly to many modules.

import { useState, useMemo }   from 'react'
import { useNavigate }         from 'react-router-dom'
import { useLanguage }         from '../context/LanguageContext'
import { useAgeMode }          from '../context/AgeModeContext'
import { useSettings }         from '../context/SettingsContext'
import { useLeaderboard,
         RANKING_TYPES,
         RANKING_GROUPS,
         applyRanking }        from '../hooks/useLeaderboard'
import { getBg, getAccent }    from './PlayerSelectScreen'

const MEDALS = ['🥇', '🥈', '🥉']

const LEVEL_TITLES = {
  1: { en: 'New',        el: 'Νέος'         },
  2: { en: 'Beginner',   el: 'Αρχάριος'     },
  3: { en: 'Learner',    el: 'Μαθητής'      },
  4: { en: 'Practising', el: 'Εξασκούμενος' },
  5: { en: 'Advanced',   el: 'Προχωρημένος' },
  6: { en: 'Master',     el: 'Μαέστρος'     },
}

// ── Bottom sheet ranking picker ───────────────────────────────────────────────

function RankingSheet({ active, onSelect, onClose, t }) {
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-40"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-2xl max-w-lg mx-auto">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        <div className="px-5 pb-8 pt-2 space-y-5">
          {RANKING_GROUPS.map(group => {
            const groupRankings = RANKING_TYPES.filter(r => r.group === group.id)
            return (
              <div key={group.id}>
                {/* Group header */}
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                  {group.emoji} {t(group.labelKey)}
                </p>
                {/* Options */}
                <div className="space-y-1">
                  {groupRankings.map(cfg => (
                    <button
                      key={cfg.id}
                      onClick={() => { onSelect(cfg.id); onClose() }}
                      className={`
                        w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left
                        transition-all duration-150
                        ${active === cfg.id
                          ? 'bg-blue-50 border-2 border-blue-400'
                          : 'bg-gray-50 border-2 border-transparent hover:border-gray-200'}
                      `}
                    >
                      <span className="text-xl">{cfg.emoji}</span>
                      <span className={`font-semibold text-sm ${active === cfg.id ? 'text-blue-700' : 'text-gray-700'}`}>
                        {t(cfg.labelKey)}
                      </span>
                      {active === cfg.id && (
                        <span className="ml-auto text-blue-500 font-bold">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}

// ── Player row ────────────────────────────────────────────────────────────────

function PlayerRow({ entry, rank, isYou, lang, t, isKids, rankingCfg }) {
  const bg     = getBg(entry.avatarBg)
  const accent = getAccent(entry.accentColor)
  const medal  = rank <= 3 ? MEDALS[rank - 1] : null
  const title  = LEVEL_TITLES[entry.level] ?? LEVEL_TITLES[1]
  const value  = rankingCfg.valueFn(entry)
  const suffix = rankingCfg.suffixKey ? ` ${t(rankingCfg.suffixKey)}` : ''

  return (
    <div className={`
      flex items-center gap-3 px-4 py-3 rounded-2xl transition-all
      ${isYou
        ? `border-2 ${accent.card} shadow-sm`
        : 'bg-white border border-gray-100'}
    `}>
      <div className="w-8 text-center flex-shrink-0">
        {medal
          ? <span className="text-xl">{medal}</span>
          : <span className="text-sm font-bold text-gray-400">#{rank}</span>}
      </div>

      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${bg.bg}`}>
        <span className="text-xl leading-none">{entry.avatar}</span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className={`font-bold text-gray-800 truncate ${isKids ? 'text-base' : 'text-sm'}`}>
            {entry.name}
          </span>
          {isYou && (
            <span className={`text-xs font-bold text-white px-1.5 py-0.5 rounded-full flex-shrink-0 ${accent.badge}`}>
              {t('leaderboardYou')}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-gray-400">{title[lang] ?? title.en}</span>
          {entry.masterCount > 0 && (
            <span className="text-xs text-gray-400">⭐ {entry.masterCount}</span>
          )}
        </div>
      </div>

      <div className="text-right flex-shrink-0">
        <div className={`font-extrabold text-gray-800 ${isKids ? 'text-base' : 'text-sm'}`}>
          {value}<span className="text-xs font-normal text-gray-400">{suffix}</span>
        </div>
        <div className="text-xs text-gray-400">
          🎮 {entry.totalRounds} · 🎯 {entry.accuracy}%
        </div>
      </div>
    </div>
  )
}

function EmptyState({ emoji, message, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="text-5xl mb-4">{emoji}</div>
      <p className="text-gray-500 text-sm leading-relaxed max-w-xs">{message}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-5 px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl text-sm transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}

// ── Main screen ───────────────────────────────────────────────────────────────

export default function LeaderboardScreen() {
  const navigate       = useNavigate()
  const { lang, t }    = useLanguage()
  const { isKids }     = useAgeMode()
  const { familyCode } = useSettings()

  const { familyEntries, globalEntries, loading, error, isOffline, activePlayerId } = useLeaderboard()

  const [activeTab,      setActiveTab]      = useState('family')
  const [activeRanking,  setActiveRanking]  = useState('mostPlayed')
  const [sheetOpen,      setSheetOpen]      = useState(false)

  const rankingCfg = RANKING_TYPES.find(r => r.id === activeRanking) ?? RANKING_TYPES[0]

  const rankedFamily = useMemo(() => applyRanking(familyEntries, activeRanking), [familyEntries, activeRanking])
  const rankedGlobal = useMemo(() => applyRanking(globalEntries, activeRanking), [globalEntries, activeRanking])
  const entries      = activeTab === 'family' ? rankedFamily : rankedGlobal

  function renderList() {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="text-4xl mb-3 animate-spin">🌍</div>
            <p className="text-gray-400 text-sm">{t('leaderboardLoading')}</p>
          </div>
        </div>
      )
    }

    if (error) return <EmptyState emoji="📡" message={t('leaderboardError')} />

    if (activeTab === 'family' && !familyCode) {
      return (
        <EmptyState
          emoji="🏠"
          message={t('leaderboardNoFamily')}
          action={{ label: t('leaderboardGoSettings'), onClick: () => navigate('/') }}
        />
      )
    }

    if (entries.length === 0) return <EmptyState emoji="🏁" message={t('leaderboardEmpty')} />

    return (
      <div className="space-y-2">
        {entries.map((entry, i) => (
          <PlayerRow
            key={entry.id}
            entry={entry}
            rank={i + 1}
            isYou={entry.id === activePlayerId}
            lang={lang}
            t={t}
            isKids={isKids}
            rankingCfg={rankingCfg}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">

      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100">

        {/* Title + Sort button row */}
        <div className="px-4 pt-4 pb-2 flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-gray-600 font-bold flex-shrink-0"
          >
            ←
          </button>
          <h1 className={`font-extrabold text-gray-800 flex-1 ${isKids ? 'text-2xl' : 'text-xl'}`}>
            🏆 {t('leaderboardTitle')}
          </h1>
          {/* Option C — single sort button */}
          <button
            onClick={() => setSheetOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-sm font-semibold text-gray-600 transition-colors flex-shrink-0"
          >
            <span>{rankingCfg.emoji}</span>
            <span>{t(rankingCfg.labelKey)}</span>
            <span className="text-gray-400">▾</span>
          </button>
        </div>

        {/* Offline banner */}
        {isOffline && (
          <div className="mx-4 mb-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-xs text-amber-700 font-medium">
            📴 {t('leaderboardOffline')}
          </div>
        )}

        {/* Family / Global tabs */}
        <div className="flex px-4 gap-1">
          {[
            { id: 'family', label: `🏠 ${t('leaderboardTabFamily')}${familyCode ? ` · ${familyCode}` : ''}` },
            { id: 'global', label: `🌍 ${t('leaderboardTabGlobal')}` },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex-1 py-2.5 text-sm font-bold rounded-t-xl transition-all border-b-2
                ${activeTab === tab.id
                  ? 'text-blue-600 border-blue-500 bg-blue-50'
                  : 'text-gray-400 border-transparent hover:text-gray-600'}
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 py-4">
        {renderList()}
      </div>

      {/* Ranking bottom sheet */}
      {sheetOpen && (
        <RankingSheet
          active={activeRanking}
          onSelect={setActiveRanking}
          onClose={() => setSheetOpen(false)}
          t={t}
        />
      )}
    </div>
  )
}
