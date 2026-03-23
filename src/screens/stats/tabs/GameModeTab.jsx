// src/screens/stats/tabs/GameModeTab.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Stats Tab 3 — By Game Mode
//
// Shows performance broken down by module → direction → mode.
// Data source: round history (accuracy per session), NOT SRS progress.
//
// Each module card is expandable to reveal:
//   Direction rows  (e.g. "Find the Capital", "Find the Country")
//   └ Mode rows     (e.g. "Multiple Choice")
//       rounds · accuracy · best accuracy
//
// Only modules/directions/modes with actual play history are shown.
//
// Phase 6 note: when `mistakes` array is added to history entries,
// this tab can be extended to show per-direction most-missed countries
// and per-direction regional accuracy — add those sections here.
// ─────────────────────────────────────────────────────────────────────────────

import { useState }          from 'react'
import { EmptyState }        from '../StatsHelpers.jsx'
import { MODULES }           from '../../../config/modules'
import {
  MODE_LABELS,
  DIRECTION_LABELS,
}                            from '../../../hooks/usePlayerProgress'

// ── Tab component ─────────────────────────────────────────────────────────────

export default function GameModeTab({ stats, lang, t }) {
  const [expandedModule, setExpandedModule] = useState(null)

  const byDir           = stats.byDirection ?? {}
  const playedModuleIds = Object.keys(byDir)

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

            {/* ── Module header ── */}
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

            {/* ── Direction + Mode rows (expanded) ── */}
            {isExpanded && dirIds.map(dirId => {
              const dir     = dirMap[dirId]
              const dirInfo = DIRECTION_LABELS[dirId] ?? { en: dirId, el: dirId, emoji: '▸' }
              const modeIds = Object.keys(dir.byMode ?? {})

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
                </div>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}
