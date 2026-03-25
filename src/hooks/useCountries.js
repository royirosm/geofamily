// src/hooks/useCountries.js
// ─────────────────────────────────────────────────────────────────────────────
// Phase 10: Added `currencies` and `languages` fields to the normalized shape.
//   - currencies: [{ code, name }]  — array so multi-currency countries work
//   - languages:  string[]          — array of language name strings (English)
//   - primaryCurrency: { code, name } — first/only currency (convenience field)
//   - primaryLanguage: string          — most prominent language (convenience field)
//
// CACHE_VERSION bumped to 4 to force re-fetch with new fields.
//
// Each country object shape (full):
// {
//   code:             string,           // "GR"
//   name:             { en, el },
//   capital:          { en, el },
//   flag:             string,
//   region:           string,           // "Europe"
//   subregion:        string,           // "Southern Europe"
//   population:       number,
//   independent:      boolean,
//   sovereign:        object|null,
//   currencies:       [{ code, name }], // e.g. [{ code: "EUR", name: "Euro" }]
//   primaryCurrency:  { code, name },   // first entry of currencies[]
//   languages:        string[],         // e.g. ["Greek"]
//   primaryLanguage:  string,           // first entry of languages[]
// }
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect }   from 'react'
import greekCountryNames         from '../i18n/countries/names'
import greekCapitalNames         from '../i18n/countries/capitals'
import { getSovereign }          from '../i18n/countries/sovereigns'

const API_BASE          = 'https://restcountries.com/v3.1'
// Added currencies and languages to the fields string
const FIELDS            = 'name,capital,flags,region,subregion,population,cca2,independent,currencies,languages'
const CACHE_KEY         = 'geofamily_countries'
const CACHE_VERSION     = 4   // bumped: added currencies + languages fields
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000  // 24 hours

export function useCountries() {
  const [countries, setCountries] = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)

  useEffect(() => {
    async function loadCountries() {
      try {
        // 1. Check localStorage cache
        const cached = localStorage.getItem(CACHE_KEY)
        if (cached) {
          const { data, timestamp, version } = JSON.parse(cached)
          const isFresh   = Date.now() - timestamp < CACHE_DURATION_MS
          const isCurrent = version === CACHE_VERSION
          if (isFresh && isCurrent) {
            setCountries(data)
            setLoading(false)
            return
          }
        }

        // 2. Cache miss / expired / stale version — fetch fresh
        const response = await fetch(`${API_BASE}/all?fields=${FIELDS}`)
        if (!response.ok) throw new Error(`API error: ${response.status}`)
        const raw = await response.json()

        // 3. Normalize
        const normalized = raw
          .filter(c => c.capital && c.capital.length > 0)
          .map(c => {
            const isIndependent = c.independent === true

            // ── Currencies ──────────────────────────────────────────────────
            // RestCountries shape: { EUR: { name: "Euro", symbol: "€" }, ... }
            // We flatten to an array of { code, name } for easy iteration.
            const currencyEntries = c.currencies
              ? Object.entries(c.currencies).map(([code, val]) => ({
                  code,
                  name: val?.name || code,
                }))
              : []
            const primaryCurrency = currencyEntries[0] || null

            // ── Languages ───────────────────────────────────────────────────
            // RestCountries shape: { fra: "French", ara: "Arabic", ... }
            // We extract just the values (language names in English).
            const languageValues = c.languages
              ? Object.values(c.languages)
              : []
            const primaryLanguage = languageValues[0] || null

            return {
              code:            c.cca2,
              name: {
                en: c.name.common,
                el: greekCountryNames[c.cca2]
                    || c.name.nativeName?.ell?.common
                    || c.name.common,
              },
              capital: {
                en: c.capital[0],
                el: greekCapitalNames[c.cca2] || c.capital[0],
              },
              flag:            c.flags?.svg || c.flags?.png || '',
              region:          c.region     || '',
              subregion:       c.subregion  || '',
              population:      c.population || 0,
              independent:     isIndependent,
              sovereign:       isIndependent ? null : getSovereign(c.cca2),
              currencies:      currencyEntries,
              primaryCurrency,
              languages:       languageValues,
              primaryLanguage,
            }
          })
          .sort((a, b) => a.name.en.localeCompare(b.name.en))

        // 4. Persist to cache
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          data:      normalized,
          timestamp: Date.now(),
          version:   CACHE_VERSION,
        }))

        setCountries(normalized)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadCountries()
  }, [])

  return { countries, loading, error }
}
