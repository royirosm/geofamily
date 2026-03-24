// src/hooks/useCountries.js
// ─────────────────────────────────────────────────────────────────────────────
// Fetches country data from RestCountries API, merges with bilingual translation
// maps, and caches the result in localStorage for 24 hours.
// Returns: { countries, loading, error }
//
// Translation maps live in src/i18n/countries/ — edit there to fix/add names.
// To add a new language (e.g. French):
//   1. Create src/i18n/countries/names_fr.js  and  capitals_fr.js
//   2. Import them here
//   3. Add `fr: frenchNames[c.cca2] || c.name.common` in the normalize step below
//
// Each country object shape:
// {
//   code:        string,           // "GR"
//   name:        { en, el },       // { en: "Greece", el: "Ελλάδα" }
//   capital:     { en, el },       // { en: "Athens", el: "Αθήνα" }
//   flag:        string,           // SVG URL
//   region:      string,           // "Europe"
//   subregion:   string,           // "Southern Europe"
//   population:  number,           // 10723736
//   independent: boolean,          // true = sovereign state, false = territory
//   sovereign:   object|null,      // { flag, code, name:{en,el} } for territories, null for sovereign states
// }
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect }   from 'react'
import greekCountryNames         from '../i18n/countries/names'
import greekCapitalNames         from '../i18n/countries/capitals'
import { getSovereign }          from '../i18n/countries/sovereigns'

const API_BASE          = 'https://restcountries.com/v3.1'
const FIELDS            = 'name,capital,flags,region,subregion,population,cca2,independent'
const CACHE_KEY         = 'geofamily_countries'
const CACHE_VERSION     = 3   // bumped: added independent + sovereign fields
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
            return {
              code:        c.cca2,
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
              flag:        c.flags?.svg || c.flags?.png || '',
              region:      c.region     || '',
              subregion:   c.subregion  || '',
              population:  c.population || 0,
              independent: isIndependent,
              sovereign:   isIndependent ? null : getSovereign(c.cca2),
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
