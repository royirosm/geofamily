// src/screens/stats/tabs/CountriesTab.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Stats Tab 2 — Countries
//
// Shows all country-specific data in one place:
//   • Region Strength bars  ← moved from OverviewTab (country data, not global)
//   • Most Missed list      ← moved from OverviewTab (country data, not global)
//   • Filterable country list (strength + region filters)
//     - Each row: flag, name, capital, strength dots per module
//     - Tap to expand: per-module strength progress bar
//
// All calculations are SRS-based (cumulative mastery, direction-agnostic).
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useMemo } from 'react'
import {
  REGIONS,
  STRENGTH_COLORS,
  RegionBar,
  EmptyState,
  buildCountryRows,
  buildRegionStats,
} from '../StatsHelpers.jsx'
import { MODULES }               from '../../../config/modules'
import { STRENGTH_DISPLAY_SCORE } from '../../../hooks/usePlayerProgress'

// ── Most Missed section ───────────────────────────────────────────────────────

function MostMissed({ countryRows, lang, t }) {
  const mostMissed = useMemo(() => {
    return [...countryRows]
      .filter(r => r.totalWrong > 0)
      .sort((a, b) => b.totalWrong - a.totalWrong)
      .slice(0, 5)
  }, [countryRows])

  if (mostMissed.length === 0) return null

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-50">
        <h3 className="font-bold text-gray-500 text-xs uppercase tracking-widest">
          {t('statsMostMissed')}
        </h3>
      </div>
      <div className="divide-y divide-gray-50">
        {mostMissed.map(({ code, country, totalWrong }) => (
          <div key={code} className="flex items-center gap-3 px-4 py-3">
            <img
              src={country.flag}
              alt={country.name[lang]}
              className="w-10 h-7 object-cover rounded shadow-sm flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-800 text-sm truncate">
                {country.name[lang] ?? country.name.en}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {country.capital?.[lang] ?? country.capital?.en}
              </p>
            </div>
            <span className="text-xs font-bold text-red-500 flex-shrink-0">✗ {totalWrong}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Region Strength section ───────────────────────────────────────────────────

function RegionStrength({ allProgress, countries, lang, t }) {
  const regionStats = useMemo(
    () => buildRegionStats(allProgress, countries),
    [allProgress, countries]
  )

  const hasAnyRegion = Object.values(regionStats).some(r => r.max > 0)
  if (!hasAnyRegion) return null

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
      <h3 className="font-bold text-gray-500 text-xs uppercase tracking-widest mb-4">
        {t('statsRegions')}
      </h3>
      <div className="space-y-3">
        {REGIONS.map(region => {
          const data = regionStats[region] ?? { score: 0, max: 0 }
          if (data.max === 0) return null
          return (
            <RegionBar
              key={region}
              region={t(`region${region}`) ?? region}
              score={data.score}
              maxScore={data.max}
            />
          )
        })}
      </div>
    </div>
  )
}

// ── Country list section ──────────────────────────────────────────────────────

function CountryList({ countryRows, allProgress, lang, t }) {
  const [strengthFilter, setStrengthFilter] = useState('all')
  const [regionFilter,   setRegionFilter]   = useState('all')
  const [expandedCode,   setExpandedCode]   = useState(null)

  const playedMods = Object.keys(allProgress)

  const filteredRows = useMemo(() => {
    return countryRows.filter(row => {
      const strengthOk = strengthFilter === 'all' || row.bestStrength === strengthFilter
      const regionOk   = regionFilter   === 'all' || row.country.region === regionFilter
      return strengthOk && regionOk
    })
  }, [countryRows, strengthFilter, regionFilter])

  return (
    <div className="space-y-3">

      {/* Section heading */}
      <h3 className="font-bold text-gray-500 text-xs uppercase tracking-widest px-1">
        {t('statsCountries')}
      </h3>

      {/* Strength filter */}
      <div className="flex bg-white border border-gray-100 rounded-full p-0.5 gap-0.5 shadow-sm overflow-x-auto">
        {['all', 'beginner', 'learner', 'practising', 'advanced', 'master'].map(s => (
          <button
            key={s}
            onClick={() => setStrengthFilter(s)}
            className={`px-2.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0 ${
              strengthFilter === s ? 'bg-gray-800 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {s === 'all' ? t('filterAll') : t(`strength${s.charAt(0).toUpperCase() + s.slice(1)}`)}
          </button>
        ))}
      </div>

      {/* Region filter */}
      <div className="flex bg-white border border-gray-100 rounded-full p-0.5 gap-0.5 shadow-sm overflow-x-auto">
        {['all', ...REGIONS].map(r => (
          <button
            key={r}
            onClick={() => setRegionFilter(r)}
            className={`px-2.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0 ${
              regionFilter === r ? 'bg-gray-800 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {r === 'all' ? t('filterAll') : t(`region${r}`) ?? r}
          </button>
        ))}
      </div>

      {/* Count */}
      <p className="text-xs text-gray-400 text-right px-1">
        {filteredRows.length} {t('statsCountriesCount')}
      </p>

      {/* List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {filteredRows.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-8">{t('statsNoData')}</p>
        ) : (
          <div className="divide-y divide-gray-50 max-h-[60vh] overflow-y-auto">
            {filteredRows.map(({ code, country, moduleStrengths, bestStrength }) => {
              const colors     = STRENGTH_COLORS[bestStrength] ?? STRENGTH_COLORS.new
              const isExpanded = expandedCode === code
              return (
                <div key={code}>
                  {/* Country row */}
                  <button
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50 transition-colors"
                    onClick={() => setExpandedCode(isExpanded ? null : code)}
                  >
                    <img
                      src={country.flag}
                      alt={country.name[lang]}
                      className="w-10 h-7 object-cover rounded shadow-sm flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 text-sm truncate">
                        {country.name[lang] ?? country.name.en}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {country.capital?.[lang] ?? country.capital?.en}
                      </p>
                    </div>
                    {/* Coloured strength dot per module */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {playedMods.map(mod => {
                        const s         = moduleStrengths[mod] ?? 'new'
                        const modConfig = MODULES.find(m => m.id === mod)
                        return (
                          <div
                            key={mod}
                            title={`${modConfig?.emoji ?? mod}: ${s}`}
                            className={`w-2.5 h-2.5 rounded-full ${STRENGTH_COLORS[s].dot}`}
                          />
                        )
                      })}
                    </div>
                    <span className={`text-xs font-bold flex-shrink-0 ml-1 ${colors.text}`}>
                      {t(`strength${bestStrength.charAt(0).toUpperCase() + bestStrength.slice(1)}`)}
                    </span>
                    <span className="text-gray-300 text-xs ml-1">{isExpanded ? '▲' : '▼'}</span>
                  </button>

                  {/* Expanded: per-module strength bar */}
                  {isExpanded && (
                    <div className="px-4 pb-3 pt-1 bg-gray-50 space-y-1.5">
                      {playedMods.map(mod => {
                        const s         = moduleStrengths[mod] ?? 'new'
                        const modConfig = MODULES.find(m => m.id === mod)
                        const modColors = STRENGTH_COLORS[s]
                        const score     = STRENGTH_DISPLAY_SCORE[s]
                        return (
                          <div key={mod} className="flex items-center gap-2">
                            <span className="text-sm flex-shrink-0">{modConfig?.emoji ?? '📚'}</span>
                            <span className="text-xs text-gray-500 w-20 flex-shrink-0 truncate">
                              {modConfig ? t(modConfig.labelKey) : mod}
                            </span>
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all duration-500 ${modColors.bar}`}
                                style={{ width: `${(score / 5) * 100}%` }}
                              />
                            </div>
                            <span className={`text-xs font-bold flex-shrink-0 ${modColors.text}`}>
                              {score}/5
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Tab component ─────────────────────────────────────────────────────────────

export default function CountriesTab({ stats, allProgress, countries, lang, t }) {
  const playedMods = Object.keys(allProgress)

  const countryMap = useMemo(() => {
    const m = {}
    for (const c of countries) m[c.code] = c
    return m
  }, [countries])

  const countryRows = useMemo(
    () => buildCountryRows(allProgress, countryMap),
    [allProgress, countryMap]
  )

  if (playedMods.length === 0) {
    return <EmptyState emoji="🌍" subtitle={t('statsEmptySubtitle')} />
  }

  return (
    <div className="space-y-6">
      <RegionStrength allProgress={allProgress} countries={countries} lang={lang} t={t} />
      <MostMissed countryRows={countryRows} lang={lang} t={t} />
      <CountryList countryRows={countryRows} allProgress={allProgress} lang={lang} t={t} />
    </div>
  )
}
