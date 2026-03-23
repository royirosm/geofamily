// src/screens/stats/StatsHelpers.js
// ─────────────────────────────────────────────────────────────────────────────
// Shared constants, helpers, and primitive UI components used by all stats tabs.
// Import from here — never duplicate across tab files.
// ─────────────────────────────────────────────────────────────────────────────

import { STRENGTH_DISPLAY_SCORE } from '../../hooks/usePlayerProgress'

// ── Constants ─────────────────────────────────────────────────────────────────

export const REGIONS = ['Europe', 'Asia', 'Africa', 'Americas', 'Oceania']

export const STRENGTH_COLORS = {
  new:        { dot: 'bg-gray-300',   text: 'text-gray-400',   bar: 'bg-gray-200'   },
  beginner:   { dot: 'bg-red-400',    text: 'text-red-500',    bar: 'bg-red-400'    },
  learner:    { dot: 'bg-orange-400', text: 'text-orange-500', bar: 'bg-orange-400' },
  practising: { dot: 'bg-yellow-400', text: 'text-yellow-600', bar: 'bg-yellow-400' },
  advanced:   { dot: 'bg-blue-400',   text: 'text-blue-500',   bar: 'bg-blue-400'   },
  master:     { dot: 'bg-green-500',  text: 'text-green-600',  bar: 'bg-green-500'  },
}

// ── localStorage helper ───────────────────────────────────────────────────────
// Reads all module progress keys for a player and returns:
//   { moduleId: { countryCode: { correct, wrong, strength, lastSeen } } }

export function loadProgressForPlayer(playerId) {
  const prefix = `geofamily_progress_${playerId}_`
  const result = {}
  for (const key of Object.keys(localStorage)) {
    if (key.startsWith(prefix)) {
      const mod = key.replace(prefix, '')
      try { result[mod] = JSON.parse(localStorage.getItem(key)) } catch {}
    }
  }
  return result
}

// ── Derived data helpers ──────────────────────────────────────────────────────
// Pure functions — safe to call inside useMemo anywhere.

/**
 * Build countryRows — the canonical per-country summary across all modules.
 * Used by both CountriesTab (full list) and OverviewTab (most-missed, region stats).
 *
 * Returns array of:
 *   { code, country, moduleStrengths, totalScore, totalWrong, bestStrength }
 * sorted by totalScore descending.
 */
export function buildCountryRows(allProgress, countryMap) {
  const playedMods = Object.keys(allProgress)
  if (playedMods.length === 0) return []

  const allCodes = new Set(playedMods.flatMap(mod => Object.keys(allProgress[mod])))

  return [...allCodes].map(code => {
    const country = countryMap[code]
    if (!country) return null

    const moduleStrengths = {}
    let totalScore = 0
    let totalWrong = 0

    for (const mod of playedMods) {
      const rec = allProgress[mod]?.[code]
      moduleStrengths[mod] = rec?.strength ?? 'new'
      totalScore += STRENGTH_DISPLAY_SCORE[rec?.strength ?? 'new']
      totalWrong += rec?.wrong ?? 0
    }

    const bestScore    = Math.max(...Object.values(moduleStrengths).map(s => STRENGTH_DISPLAY_SCORE[s]))
    const bestStrength = Object.keys(STRENGTH_DISPLAY_SCORE).find(
      s => STRENGTH_DISPLAY_SCORE[s] === bestScore
    ) ?? 'new'

    return { code, country, moduleStrengths, totalScore, totalWrong, bestStrength }
  })
  .filter(Boolean)
  .sort((a, b) => b.totalScore - a.totalScore)
}

/**
 * Build regionStats from countryRows.
 * Returns { regionName: { score, max } }
 */
export function buildRegionStats(allProgress, countries) {
  const playedMods    = Object.keys(allProgress)
  const maxPerCountry = playedMods.length * 5
  if (maxPerCountry === 0) return {}

  const byRegion = {}
  for (const region of REGIONS) byRegion[region] = { score: 0, max: 0 }

  for (const country of countries) {
    const region = country.region
    if (!byRegion[region]) continue
    const seen = playedMods.some(mod => allProgress[mod]?.[country.code])
    if (!seen) continue

    let countryScore = 0
    for (const mod of playedMods) {
      const rec = allProgress[mod]?.[country.code]
      countryScore += STRENGTH_DISPLAY_SCORE[rec?.strength ?? 'new']
    }
    byRegion[region].score += countryScore
    byRegion[region].max   += maxPerCountry
  }
  return byRegion
}

// ── Shared UI primitives ──────────────────────────────────────────────────────

export function StatCard({ value, label, emoji }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-center">
      <div className="text-2xl mb-1">{emoji}</div>
      <div className="font-extrabold text-gray-800 text-2xl leading-none">{value}</div>
      <div className="text-xs text-gray-400 mt-1 font-medium">{label}</div>
    </div>
  )
}

export function RegionBar({ region, score, maxScore }) {
  const pct      = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0
  const barColor = pct >= 80 ? 'bg-green-500' : pct >= 50 ? 'bg-blue-400' : pct >= 20 ? 'bg-yellow-400' : 'bg-gray-300'
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-semibold text-gray-600 w-24 flex-shrink-0 truncate">{region}</span>
      <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
        <div className={`h-3 rounded-full transition-all duration-700 ${barColor}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-bold text-gray-500 w-14 text-right flex-shrink-0">{score}/{maxScore}</span>
    </div>
  )
}

export function EmptyState({ emoji, title, subtitle, buttonLabel, onButton }) {
  return (
    <div className="text-center py-16">
      <div className="text-5xl mb-4">{emoji}</div>
      {title && <h3 className="font-extrabold text-gray-800 text-xl mb-2">{title}</h3>}
      {subtitle && <p className="text-gray-400 text-sm mb-6">{subtitle}</p>}
      {buttonLabel && (
        <button
          onClick={onButton}
          className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-2xl transition-colors"
        >
          {buttonLabel}
        </button>
      )}
    </div>
  )
}
