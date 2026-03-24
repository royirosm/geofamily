// src/components/TerritoryBadge.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Displays a coloured pill identifying a territory and its governing country.
// Shown in question stimuli whenever country.independent === false.
//
// Props:
//   sovereign  — { flag: '🇫🇷', name: { en, el } }  from country.sovereign
//   lang       — 'en' | 'el'
//   isKids     — boolean, slightly larger text in kids mode
// ─────────────────────────────────────────────────────────────────────────────

export default function TerritoryBadge({ sovereign, lang, isKids = false }) {
  if (!sovereign) return null

  const label = sovereign.name[lang] ?? sovereign.name.en

  return (
    <span
      className={`
        inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-semibold
        bg-amber-100 text-amber-800 border border-amber-300
        ${isKids ? 'text-sm' : 'text-xs'}
      `}
    >
      <span>{sovereign.flag}</span>
      <span>{label}</span>
      <span className="opacity-60">· Territory</span>
    </span>
  )
}
