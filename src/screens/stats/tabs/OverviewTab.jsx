// src/screens/stats/tabs/OverviewTab.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Stats Tab 1 — Overview
//
// Shows:
//   • 4 global stat cards (rounds, accuracy, countries seen, mastered)
//   • Per-module summary rows — tap to expand direction breakdown
//
// Region Strength and Most Missed have moved to CountriesTab —
// they are country-specific data, not global summaries.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react'
import { StatCard, EmptyState } from '../StatsHelpers.jsx'
import { MODULES }              from '../../../config/modules'
import { DIRECTION_LABELS }     from '../../../hooks/usePlayerProgress'

// ── Module row with expandable direction breakdown ────────────────────────────

function ModuleOverviewRow({ moduleId, stats, lang, t }) {
  const [expanded, setExpanded] = useState(false)

  const modConfig  = MODULES.find(m => m.id === moduleId)
  const rounds     = stats.roundsByModule[moduleId] ?? []
  const best       = stats.bestScoreByModule[moduleId] ?? 0
  const byDir      = stats.byDirection?.[moduleId] ?? {}
  const directions = Object.keys(byDir)
  const canExpand  = directions.length > 0

  const totalAcc = rounds.length > 0
    ? Math.round(rounds.reduce((s, r) => s + r.accuracy, 0) / rounds.length)
    : 0

  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">

      {/* Module header row */}
      <button
        className="w-full flex items-center gap-3 px-4 py-3 bg-white text-left hover:bg-gray-50 transition-colors"
        onClick={() => canExpand && setExpanded(e => !e)}
        disabled={!canExpand}
      >
        <span className="text-xl flex-shrink-0">{modConfig?.emoji ?? '📚'}</span>
        <div className="flex-1 min-w-0">
          <span className="font-bold text-gray-800 text-sm">
            {modConfig ? t(modConfig.labelKey) : moduleId}
          </span>
        </div>
        <span className="text-xs text-gray-400 flex-shrink-0">🎮 {rounds.length}</span>
        <span className="text-xs font-bold text-blue-600 flex-shrink-0 ml-2">🎯 {totalAcc}%</span>
        <span className="text-xs font-bold text-amber-500 flex-shrink-0 ml-2">🏆 {best}%</span>
        {canExpand && (
          <span className="text-gray-300 text-xs ml-2 flex-shrink-0">{expanded ? '▲' : '▼'}</span>
        )}
      </button>

      {/* Direction breakdown rows */}
      {expanded && directions.map(dirId => {
        const dir     = byDir[dirId]
        const dirInfo = DIRECTION_LABELS[dirId] ?? { en: dirId, el: dirId, emoji: '▸' }
        return (
          <div key={dirId} className="flex items-center gap-3 px-4 py-2.5 bg-gray-50 border-t border-gray-100">
            <span className="text-sm flex-shrink-0 ml-4">{dirInfo.emoji}</span>
            <span className="flex-1 text-xs font-semibold text-gray-600 min-w-0 truncate">
              {dirInfo[lang] ?? dirInfo.en}
            </span>
            <span className="text-xs text-gray-400 flex-shrink-0">🎮 {dir.rounds}</span>
            <span className="text-xs text-gray-500 flex-shrink-0 ml-2">🎯 {dir.accuracy}%</span>
            <span className="text-xs font-bold text-amber-500 flex-shrink-0 ml-2">🏆 {dir.bestAccuracy}%</span>
          </div>
        )
      })}
    </div>
  )
}

// ── Tab component ─────────────────────────────────────────────────────────────

export default function OverviewTab({ stats, allProgress, lang, t, isKids, navigate }) {
  const playedMods = Object.keys(allProgress)
  const hasData    = stats.countriesSeen > 0

  if (!hasData) {
    return (
      <EmptyState
        emoji="🌍"
        title={t('statsEmptyTitle')}
        subtitle={t('statsEmptySubtitle')}
        buttonLabel={t('statsPlayNow')}
        onButton={() => navigate('/')}
      />
    )
  }

  return (
    <div className="space-y-6">

      {/* Global stat cards */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard value={stats.totalRounds}    label={t('statsRounds')}   emoji="🎮" />
        <StatCard value={`${stats.accuracy}%`} label={t('statsAccuracy')} emoji="🎯" />
        <StatCard value={stats.countriesSeen}  label={t('statsSeen')}     emoji="🌍" />
        <StatCard value={stats.masterCount}    label={t('statsMastered')} emoji="⭐" />
      </div>

      {/* Per-module expandable rows */}
      {playedMods.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-bold text-gray-500 text-xs uppercase tracking-widest px-1">
            {t('statsModules')}
          </h3>
          {playedMods.map(mod => (
            <ModuleOverviewRow key={mod} moduleId={mod} stats={stats} lang={lang} t={t} />
          ))}
        </div>
      )}

    </div>
  )
}
