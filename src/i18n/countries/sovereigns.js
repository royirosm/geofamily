// src/i18n/countries/sovereigns.js
// ─────────────────────────────────────────────────────────────────────────────
// Maps non-independent territory codes → their governing sovereign state.
// Used by:
//   - useCountries.js  → attaches `sovereign` field to territory country objects
//   - TerritoryBadge   → renders the governing country flag + name pill
//   - questionGenerator → sovereignty / find-sovereign direction (MC distractors)
//
// Only territories that appear in the RestCountries API with a capital are listed.
// Sovereign states (independent: true) are NOT in this map.
//
// Shape: { [cca2]: { flag: string (emoji), code: string (cca2 of sovereign),
//                    name: { en, el } } }
// ─────────────────────────────────────────────────────────────────────────────

const SOVEREIGNS = {
  // ── United Kingdom ────────────────────────────────────────────────────────
  AI: { flag: '🇬🇧', code: 'GB', name: { en: 'United Kingdom', el: 'Ηνωμένο Βασίλειο' } },
  BM: { flag: '🇬🇧', code: 'GB', name: { en: 'United Kingdom', el: 'Ηνωμένο Βασίλειο' } },
  FK: { flag: '🇬🇧', code: 'GB', name: { en: 'United Kingdom', el: 'Ηνωμένο Βασίλειο' } },
  GI: { flag: '🇬🇧', code: 'GB', name: { en: 'United Kingdom', el: 'Ηνωμένο Βασίλειο' } },
  GG: { flag: '🇬🇧', code: 'GB', name: { en: 'United Kingdom', el: 'Ηνωμένο Βασίλειο' } },
  IM: { flag: '🇬🇧', code: 'GB', name: { en: 'United Kingdom', el: 'Ηνωμένο Βασίλειο' } },
  JE: { flag: '🇬🇧', code: 'GB', name: { en: 'United Kingdom', el: 'Ηνωμένο Βασίλειο' } },
  KY: { flag: '🇬🇧', code: 'GB', name: { en: 'United Kingdom', el: 'Ηνωμένο Βασίλειο' } },
  MS: { flag: '🇬🇧', code: 'GB', name: { en: 'United Kingdom', el: 'Ηνωμένο Βασίλειο' } },
  PN: { flag: '🇬🇧', code: 'GB', name: { en: 'United Kingdom', el: 'Ηνωμένο Βασίλειο' } },
  SH: { flag: '🇬🇧', code: 'GB', name: { en: 'United Kingdom', el: 'Ηνωμένο Βασίλειο' } },
  TC: { flag: '🇬🇧', code: 'GB', name: { en: 'United Kingdom', el: 'Ηνωμένο Βασίλειο' } },
  VG: { flag: '🇬🇧', code: 'GB', name: { en: 'United Kingdom', el: 'Ηνωμένο Βασίλειο' } },

  // ── United States ─────────────────────────────────────────────────────────
  AS: { flag: '🇺🇸', code: 'US', name: { en: 'United States', el: 'Ηνωμένες Πολιτείες' } },
  GU: { flag: '🇺🇸', code: 'US', name: { en: 'United States', el: 'Ηνωμένες Πολιτείες' } },
  MP: { flag: '🇺🇸', code: 'US', name: { en: 'United States', el: 'Ηνωμένες Πολιτείες' } },
  PR: { flag: '🇺🇸', code: 'US', name: { en: 'United States', el: 'Ηνωμένες Πολιτείες' } },
  VI: { flag: '🇺🇸', code: 'US', name: { en: 'United States', el: 'Ηνωμένες Πολιτείες' } },

  // ── France ────────────────────────────────────────────────────────────────
  BL: { flag: '🇫🇷', code: 'FR', name: { en: 'France', el: 'Γαλλία' } },
  GF: { flag: '🇫🇷', code: 'FR', name: { en: 'France', el: 'Γαλλία' } },
  GP: { flag: '🇫🇷', code: 'FR', name: { en: 'France', el: 'Γαλλία' } },
  MF: { flag: '🇫🇷', code: 'FR', name: { en: 'France', el: 'Γαλλία' } },
  MQ: { flag: '🇫🇷', code: 'FR', name: { en: 'France', el: 'Γαλλία' } },
  NC: { flag: '🇫🇷', code: 'FR', name: { en: 'France', el: 'Γαλλία' } },
  PF: { flag: '🇫🇷', code: 'FR', name: { en: 'France', el: 'Γαλλία' } },
  PM: { flag: '🇫🇷', code: 'FR', name: { en: 'France', el: 'Γαλλία' } },
  RE: { flag: '🇫🇷', code: 'FR', name: { en: 'France', el: 'Γαλλία' } },
  TF: { flag: '🇫🇷', code: 'FR', name: { en: 'France', el: 'Γαλλία' } },
  WF: { flag: '🇫🇷', code: 'FR', name: { en: 'France', el: 'Γαλλία' } },
  YT: { flag: '🇫🇷', code: 'FR', name: { en: 'France', el: 'Γαλλία' } },

  // ── Netherlands ───────────────────────────────────────────────────────────
  AW: { flag: '🇳🇱', code: 'NL', name: { en: 'Netherlands', el: 'Ολλανδία' } },
  BQ: { flag: '🇳🇱', code: 'NL', name: { en: 'Netherlands', el: 'Ολλανδία' } },
  CW: { flag: '🇳🇱', code: 'NL', name: { en: 'Netherlands', el: 'Ολλανδία' } },
  SX: { flag: '🇳🇱', code: 'NL', name: { en: 'Netherlands', el: 'Ολλανδία' } },

  // ── Denmark ───────────────────────────────────────────────────────────────
  FO: { flag: '🇩🇰', code: 'DK', name: { en: 'Denmark', el: 'Δανία' } },
  GL: { flag: '🇩🇰', code: 'DK', name: { en: 'Denmark', el: 'Δανία' } },

  // ── Norway ────────────────────────────────────────────────────────────────
  SJ: { flag: '🇳🇴', code: 'NO', name: { en: 'Norway', el: 'Νορβηγία' } },

  // ── Australia ─────────────────────────────────────────────────────────────
  CC: { flag: '🇦🇺', code: 'AU', name: { en: 'Australia', el: 'Αυστραλία' } },
  CX: { flag: '🇦🇺', code: 'AU', name: { en: 'Australia', el: 'Αυστραλία' } },
  NF: { flag: '🇦🇺', code: 'AU', name: { en: 'Australia', el: 'Αυστραλία' } },

  // ── New Zealand ───────────────────────────────────────────────────────────
  CK: { flag: '🇳🇿', code: 'NZ', name: { en: 'New Zealand', el: 'Νέα Ζηλανδία' } },
  NU: { flag: '🇳🇿', code: 'NZ', name: { en: 'New Zealand', el: 'Νέα Ζηλανδία' } },
  TK: { flag: '🇳🇿', code: 'NZ', name: { en: 'New Zealand', el: 'Νέα Ζηλανδία' } },

  // ── China ─────────────────────────────────────────────────────────────────
  HK: { flag: '🇨🇳', code: 'CN', name: { en: 'China', el: 'Κίνα' } },
  MO: { flag: '🇨🇳', code: 'CN', name: { en: 'China', el: 'Κίνα' } },

  // ── Finland ───────────────────────────────────────────────────────────────
  AX: { flag: '🇫🇮', code: 'FI', name: { en: 'Finland', el: 'Φινλανδία' } },

  // ── Special / disputed ────────────────────────────────────────────────────
  // Kosovo — recognised by ~100 countries, disputed by others. Shown as self-governing.
  // Taiwan  — complex status. Shown as self-governing for educational purposes.
  // Palestine — shown as self-governing (observer state).
  // These are intentionally NOT in the SOVEREIGNS map so they appear as "Country"
  // in the binary game — avoiding geopolitical controversy in a kids' app.
}

// ── Derived helpers ───────────────────────────────────────────────────────────

/** All territory codes that have a known sovereign */
export const TERRITORY_CODES = new Set(Object.keys(SOVEREIGNS))

/** Get sovereign info for a territory code, or null if sovereign/unknown */
export function getSovereign(code) {
  return SOVEREIGNS[code] ?? null
}

/** All unique sovereign codes that govern at least one territory */
export const SOVEREIGN_POOL = [
  ...new Set(Object.values(SOVEREIGNS).map(s => s.code))
].map(code => ({
  code,
  flag: Object.values(SOVEREIGNS).find(s => s.code === code).flag,
  name: Object.values(SOVEREIGNS).find(s => s.code === code).name,
}))

export default SOVEREIGNS
