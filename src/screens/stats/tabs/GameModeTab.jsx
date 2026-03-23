// src/screens/stats/tabs/GameModeTab.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Stats Tab 3 — By Game Mode
//
// Phase 6 update: per-direction "Most missed" mini-list.
// Data source:
//   • Rounds/accuracy → byDirection from getStatsForPlayer
//   • Most missed     → mistakesByDirection (country codes from history.mistakes)
//
// Most missed only appears where Phase 6+ history entries exist.
// Old entries without mistakes are silently skipped — no backwards-compat issue.
//
// Requires `countries` prop to resolve country codes → flag + name.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useMemo } from 'react'
import { EmptyState }        from '../StatsHelpers.jsx'
import { MODULES }           from '../../../config/modules'
import {
  MODE_LABELS,
  DIRECTION_LABELS,
}                            from '../../../hooks/usePlayerProgress'

// ── Per-direction most missed mini-list ───────────────────────────────────────

function DirectionMostMissed({ mistakeCounts, countryMap, lang, t }) {
  const top = useMemo(() => {
    return Object.entries(mistakeCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([code, count]) => ({ code, count, country: countryMap[code] }))
      .filter(r => r.country)
  }, [mistakeCounts, countryMap])

  if (top.length === 0) return null

  return (
    <div className="px-4 py-2.5 border-t border-gray-50 bg-white">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 ml-6">
        {t('statsMostMissed')}
      </p>
      <div className="space-y-1.5 ml-6">
        {top.map(({ code, count, country }) => (
          <div key={code} className="flex items-center gap-2">
            <img
              src={country.flag}
              alt={country.name[lang]}
              className="w-8 h-5 object-cover rounded shadow-sm flex-shrink-0"
            />
            <span className="text-xs font-semibold text-gray-600 flex-1 truncate">
              {country.name[lang] ?? country.name.en}
            </span>
            <span className="text-xs font-bold text-red-400 flex-shrink-0">✗ {count}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Tab component ─────────────────────────────────────────────────────────────

export default function GameModeTab({ stats, countries, lang, t }) {
  const [expandedModule, setExpandedModule] = useState(null)

  const byDir               = stats.byDirection        ?? {}
  const mistakesByDirection = stats.mistakesByDirection ?? {}
  const playedModuleIds     = Object.keys(byDir)

  const countryMap = useMemo(() => {
    const m = {}
    for (const c of countries) m[c.code] = c
    return m
  }, [countries])

  if (playedModuleIds.length === 0) {
    return <EmptyState emoji="🎮" subtitle={t('statsEmptySubtitle')} />
  }

  return (
    <div className="space-y-3">
      {MODULES.filter(m => byDir[m.id]).map(modConfig => {
        const modId       = modConfig.id
        const dirMap      = byDir[modId] ?? {}
        const dirIds      = Object.keys(dirMap)
        const isExpanded  = expandedModule === modId
        const totalRounds = (stats.roundsByModule[modId] ?? []).length
        const totalAcc    = totalRounds > 0
          ? Math.round(
              (stats.roundsByModule[modId] ?? []).reduce((s, r) => s + r.accuracy, 0) / totalRounds
            )
          : 0

        return (
          <div key={modId} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

            {/* Module header */}
            <button
              className="w-full flex items-center gap-3 px-4 py-4 text-left hover:bg-gray-50 transition-colors"
              onClick={() => setExpandedModule(isExpanded ? null : modId)}
            >
              <span className="text-2xl flex-shrink-0">{modConfig.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="font-extrabold text-gray-800 text-sm">{t(modConfig.labelKey)}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {totalRounds} {t('statsRounds').toLowerCase()} · {totalAcc}% {t('statsAccuracy').toLowerCase()}
                </p>
              </div>
              <span className="text-gray-300 text-sm">{isExpanded ? '▲' : '▼'}</span>
            </button>

            {/* Direction + Mode rows */}
            {isExpanded && dirIds.map(dirId => {
              const dir           = dirMap[dirId]
              const dirInfo       = DIRECTION_LABELS[dirId] ?? { en: dirId, el: dirId, emoji: '▸' }
              const modeIds       = Object.keys(dir.byMode ?? {})
              const mistakeCounts = mistakesByDirection[modId]?.[dirId] ?? {}
              const hasMistakes   = Object.keys(mistakeCounts).length > 0

              return (
                <div key={dirId} className="border-t border-gray-100">

                  {/* Direction header */}
                  <div className="flex items-center gap-2 px-4 py-3 bg-gray-50">
                    <span className="text-base flex-shrink-0">{dirInfo.emoji}</span>
                    <span className="font-bold text-gray-700 text-sm flex-1">
                      {dirInfo[lang] ?? dirInfo.en}
                    </span>
                    <span className="text-xs text-gray-400">
                      {dir.rounds} {t('statsRounds').toLowerCase()}
                    </span>
                    <span className="text-xs font-bold text-blue-600 ml-2">{dir.accuracy}%</span>
                    <span className="text-xs font-bold text-amber-500 ml-2">🏆 {dir.bestAccuracy}%</span>
                  </div>

                  {/* Mode rows */}
                  {modeIds.map(modeId => {
                    const m        = dir.byMode[modeId]
                    const modeInfo = MODE_LABELS[modeId] ?? { en: modeId, el: modeId, emoji: '🎮' }
                    return (
                      <div key={modeId} className="flex items-center gap-2 px-4 py-2.5 border-t border-gray-50">
                        <span className="text-sm ml-6 flex-shrink-0">{modeInfo.emoji}</span>
                        <span className="text-xs font-semibold text-gray-600 flex-1">
                          {modeInfo[lang] ?? modeInfo.en}
                        </span>
                        <span className="text-xs text-gray-400">
                          {m.rounds} {t('statsRounds').toLowerCase()}
                        </span>
                        <span className="text-xs text-gray-500 ml-2">🎯 {m.accuracy}%</span>
                        <span className="text-xs font-bold text-amber-500 ml-2">🏆 {m.bestAccuracy}%</span>
                      </div>
                    )
                  })}

                  {/* Most missed in this direction (Phase 6+ data only) */}
                  {hasMistakes && (
                    <DirectionMostMissed
                      mistakeCounts={mistakeCounts}
                      countryMap={countryMap}
                      lang={lang}
                      t={t}
                    />
                  )}

                </div>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}
