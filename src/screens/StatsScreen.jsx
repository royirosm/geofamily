// StatsScreen.jsx
// Full stats screen for the active player.
// Sections:
//   1. Header      — avatar, name, level/title, accent colour
//   2. Overview    — total rounds, accuracy, countries seen, mastered
//   3. By module   — rounds played + best accuracy per module (dynamic)
//   4. Region map  — average mastery score per world region (progress bars)
//   5. Country breakdown — filterable list by strength / region
//   6. Most missed — top 5 countries with most wrong answers
//
// Receives `countries` prop (full array from useCountries) to resolve
// code → name, flag, region for display.

import { useState, useMemo }         from 'react'
import { useNavigate }               from 'react-router-dom'
import { useLanguage }               from '../context/LanguageContext'
import { useAgeMode }                from '../context/AgeModeContext'
import { usePlayer }                 from '../context/PlayerContext'
import {
  getStatsForPlayer,
  getLevelForPlayer,
  STRENGTH_DISPLAY_SCORE,
}                                    from '../hooks/usePlayerProgress'
import { getAccent, getBg }          from './PlayerSelectScreen'

// ── Constants ─────────────────────────────────────────────────────────────────

const REGIONS = ['Europe', 'Asia', 'Africa', 'Americas', 'Oceania']

const STRENGTH_COLORS = {
  new:        { dot: 'bg-gray-300',   text: 'text-gray-400',  bar: 'bg-gray-200'   },
  beginner:   { dot: 'bg-red-400',    text: 'text-red-500',   bar: 'bg-red-400'    },
  learner:    { dot: 'bg-orange-400', text: 'text-orange-500',bar: 'bg-orange-400' },
  practising: { dot: 'bg-yellow-400', text: 'text-yellow-600',bar: 'bg-yellow-400' },
  advanced:   { dot: 'bg-blue-400',   text: 'text-blue-500',  bar: 'bg-blue-400'   },
  master:     { dot: 'bg-green-500',  text: 'text-green-600', bar: 'bg-green-500'  },
}

const MODULE_LABELS = {
  capitals: { en: 'Capitals', el: 'Πρωτεύουσες', emoji: '🏛️' },
  flags:    { en: 'Flags',    el: 'Σημαίες',      emoji: '🚩' },
  cities:   { en: 'Cities',   el: 'Πόλεις',       emoji: '🏙️' },
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function loadProgressForPlayer(playerId) {
  // Returns { moduleId: { countryCode: { correct, wrong, strength } } }
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

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCard({ value, label, emoji }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-center">
      <div className="text-2xl mb-1">{emoji}</div>
      <div className="font-extrabold text-gray-800 text-2xl leading-none">{value}</div>
      <div className="text-xs text-gray-400 mt-1 font-medium">{label}</div>
    </div>
  )
}

function RegionBar({ region, score, maxScore, lang }) {
  const pct     = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0
  const barColor = pct >= 80 ? 'bg-green-500' : pct >= 50 ? 'bg-blue-400' : pct >= 20 ? 'bg-yellow-400' : 'bg-gray-300'

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-semibold text-gray-600 w-24 flex-shrink-0 truncate">
        {region}
      </span>
      <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
        <div
          className={`h-3 rounded-full transition-all duration-700 ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-bold text-gray-500 w-14 text-right flex-shrink-0">
        {score}/{maxScore}
      </span>
    </div>
  )
}

// ── Main screen ───────────────────────────────────────────────────────────────

export default function StatsScreen({ countries }) {
  const navigate              = useNavigate()
  const { lang, t }           = useLanguage()
  const { isKids }            = useAgeMode()
  const { activePlayer }      = usePlayer()

  const [strengthFilter, setStrengthFilter] = useState('all')
  const [regionFilter,   setRegionFilter]   = useState('all')

  if (!activePlayer) {
    navigate('/')
    return null
  }

  const stats  = getStatsForPlayer(activePlayer.id)
  const level  = getLevelForPlayer(activePlayer.id)
  const accent = getAccent(activePlayer.accentColor)
  const bg     = getBg(activePlayer.avatarBg)

  // All module progress maps
  const allProgress = useMemo(
    () => loadProgressForPlayer(activePlayer.id),
    [activePlayer.id]
  )

  // Build a lookup: countryCode → country object
  const countryMap = useMemo(() => {
    const m = {}
    for (const c of countries) m[c.code] = c
    return m
  }, [countries])

  // ── Region strength map ───────────────────────────────────────────────────
  // For each region: sum display scores across all modules for all countries in that region
  const regionStats = useMemo(() => {
    const playedMods = Object.keys(allProgress)
    const maxPerCountry = playedMods.length * 5
    if (maxPerCountry === 0) return {}

    const byRegion = {}
    for (const region of REGIONS) {
      byRegion[region] = { score: 0, max: 0, count: 0 }
    }

    for (const country of countries) {
      const region = country.region
      if (!byRegion[region]) continue

      // Has this country been seen in any module?
      const seen = playedMods.some(mod => allProgress[mod]?.[country.code])
      if (!seen) continue

      let countryScore = 0
      for (const mod of playedMods) {
        const rec = allProgress[mod]?.[country.code]
        countryScore += STRENGTH_DISPLAY_SCORE[rec?.strength ?? 'new']
      }

      byRegion[region].score += countryScore
      byRegion[region].max   += maxPerCountry
      byRegion[region].count += 1
    }

    return byRegion
  }, [allProgress, countries])

  // ── Country list ──────────────────────────────────────────────────────────
  // Aggregate per country: best strength across modules (for display)
  const countryRows = useMemo(() => {
    const playedMods = Object.keys(allProgress)
    if (playedMods.length === 0) return []

    // Collect all seen country codes
    const seen = new Set()
    for (const mod of playedMods) {
      Object.keys(allProgress[mod] ?? {}).forEach(c => seen.add(c))
    }

    return Array.from(seen)
      .map(code => {
        const country = countryMap[code]
        if (!country) return null

        // Per-module strength
        const moduleStrengths = {}
        let totalScore = 0
        let totalWrong = 0

        for (const mod of playedMods) {
          const rec = allProgress[mod]?.[code]
          moduleStrengths[mod] = rec?.strength ?? 'new'
          totalScore += STRENGTH_DISPLAY_SCORE[rec?.strength ?? 'new']
          totalWrong += rec?.wrong ?? 0
        }

        // Best strength for colour coding
        const bestScore  = Math.max(...Object.values(moduleStrengths).map(s => STRENGTH_DISPLAY_SCORE[s]))
        const bestStrength = Object.keys(STRENGTH_DISPLAY_SCORE).find(
          s => STRENGTH_DISPLAY_SCORE[s] === bestScore
        ) ?? 'new'

        return { code, country, moduleStrengths, totalScore, totalWrong, bestStrength }
      })
      .filter(Boolean)
      .sort((a, b) => b.totalScore - a.totalScore)
  }, [allProgress, countryMap])

  // Apply filters
  const filteredRows = useMemo(() => {
    return countryRows.filter(row => {
      const strengthOk = strengthFilter === 'all' || row.bestStrength === strengthFilter
      const regionOk   = regionFilter === 'all'   || row.country.region === regionFilter
      return strengthOk && regionOk
    })
  }, [countryRows, strengthFilter, regionFilter])

  // Most missed (top 5 by wrong answers)
  const mostMissed = useMemo(() => {
    return [...countryRows]
      .filter(r => r.totalWrong > 0)
      .sort((a, b) => b.totalWrong - a.totalWrong)
      .slice(0, 5)
  }, [countryRows])

  const playedMods = Object.keys(allProgress)
  const hasData    = countryRows.length > 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 pb-12">

      {/* ── Header ── */}
      <div className={`sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3`}>
        <button
          onClick={() => navigate('/')}
          className="text-gray-400 hover:text-gray-600 transition-colors text-xl w-8"
        >
          ←
        </button>
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

      <div className="max-w-lg mx-auto px-4 pt-6 space-y-6">

        {/* ── Overview cards ── */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard value={stats.totalRounds}    label={t('statsRounds')}   emoji="🎮" />
          <StatCard value={`${stats.accuracy}%`} label={t('statsAccuracy')} emoji="🎯" />
          <StatCard value={stats.countriesSeen}  label={t('statsSeen')}     emoji="🌍" />
          <StatCard value={stats.masterCount}    label={t('statsMastered')} emoji="⭐" />
        </div>

        {/* ── Per-module breakdown ── */}
        {playedMods.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <h3 className="font-bold text-gray-700 mb-3 text-sm uppercase tracking-wide">
              {t('statsModules')}
            </h3>
            <div className="space-y-3">
              {playedMods.map(mod => {
                const rounds = stats.roundsByModule[mod] ?? []
                const best   = stats.bestScoreByModule[mod] ?? 0
                const info   = MODULE_LABELS[mod] ?? { en: mod, el: mod, emoji: '📚' }
                return (
                  <div key={mod} className="flex items-center gap-3">
                    <span className="text-xl">{info.emoji}</span>
                    <div className="flex-1">
                      <span className="font-semibold text-gray-700 text-sm">
                        {info[lang] ?? info.en}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">
                      🎮 {rounds.length}
                    </span>
                    <span className="text-xs font-bold text-blue-600">
                      🏆 {best}%
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── Region strength map ── */}
        {hasData && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <h3 className="font-bold text-gray-700 mb-4 text-sm uppercase tracking-wide">
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
                    lang={lang}
                  />
                )
              })}
            </div>
          </div>
        )}

        {/* ── Most missed ── */}
        {mostMissed.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-50">
              <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wide">
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
                    <p className="text-xs text-gray-400">
                      {country.capital[lang] ?? country.capital.en}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-red-500 flex-shrink-0">
                    ✗ {totalWrong}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Country breakdown ── */}
        {hasData && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-50 space-y-2">
              <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wide">
                {t('statsCountries')}
              </h3>

              {/* Filters */}
              <div className="flex gap-2 flex-wrap">
                {/* Strength filter */}
                <div className="flex bg-gray-100 rounded-full p-0.5 gap-0.5 text-xs">
                  {['all', 'beginner', 'learner', 'practising', 'advanced', 'master'].map(s => (
                    <button
                      key={s}
                      onClick={() => setStrengthFilter(s)}
                      className={`px-2 py-1 rounded-full font-semibold transition-all ${
                        strengthFilter === s ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500'
                      }`}
                    >
                      {s === 'all' ? t('filterAll') : t(`strength${s.charAt(0).toUpperCase() + s.slice(1)}`)}
                    </button>
                  ))}
                </div>

                {/* Region filter */}
                <div className="flex bg-gray-100 rounded-full p-0.5 gap-0.5 text-xs">
                  {['all', ...REGIONS].map(r => (
                    <button
                      key={r}
                      onClick={() => setRegionFilter(r)}
                      className={`px-2 py-1 rounded-full font-semibold transition-all ${
                        regionFilter === r ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500'
                      }`}
                    >
                      {r === 'all' ? t('filterAll') : t(`region${r}`)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Country rows */}
            <div className="divide-y divide-gray-50 max-h-96 overflow-y-auto">
              {filteredRows.length === 0 ? (
                <p className="text-center text-gray-400 text-sm py-8">{t('statsNoData')}</p>
              ) : (
                filteredRows.map(({ code, country, bestStrength, totalScore, moduleStrengths }) => {
                  const colors   = STRENGTH_COLORS[bestStrength] ?? STRENGTH_COLORS.new
                  const playedMods = Object.keys(allProgress)
                  const maxScore = playedMods.length * 5

                  return (
                    <div key={code} className="flex items-center gap-3 px-4 py-2.5">
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
                          {country.capital[lang] ?? country.capital.en}
                        </p>
                      </div>

                      {/* Per-module strength dots */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {playedMods.map(mod => {
                          const s = moduleStrengths[mod] ?? 'new'
                          const c = STRENGTH_COLORS[s]
                          return (
                            <div
                              key={mod}
                              title={`${MODULE_LABELS[mod]?.en ?? mod}: ${s}`}
                              className={`w-2.5 h-2.5 rounded-full ${c.dot}`}
                            />
                          )
                        })}
                      </div>

                      {/* Total score */}
                      <span className={`text-xs font-bold w-10 text-right flex-shrink-0 ${colors.text}`}>
                        {totalScore}/{maxScore}
                      </span>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!hasData && (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🌍</div>
            <p className="font-bold text-gray-600 text-lg">{t('statsEmptyTitle')}</p>
            <p className="text-gray-400 text-sm mt-1">{t('statsEmptySubtitle')}</p>
            <button
              onClick={() => navigate('/')}
              className="mt-6 px-6 py-3 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600 transition-colors"
            >
              {t('statsPlayNow')}
            </button>
          </div>
        )}

      </div>
    </div>
  )
}
