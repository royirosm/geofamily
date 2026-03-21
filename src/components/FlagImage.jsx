// FlagImage.jsx
// Reusable flag display component with a graceful offline/error fallback.
// Use this everywhere a country flag is shown instead of a raw <img>.
//
// Props:
//   src       — flag SVG URL from country.flag
//   alt       — accessible alt text (country name)
//   className — size/shape classes (e.g. "w-36 h-24")
//   isKids    — switches to a playful message in Kids mode
//
// Behaviour:
//   - While loading: shows a pulsing skeleton placeholder (same dimensions)
//   - On success:    shows the flag normally
//   - On error:      shows a styled "flag unavailable" card (Option B)
//     Kids mode  → "✈️ Flag on its way!"
//     Explorer   → "📡 Flag unavailable"

import { useState } from 'react'

export default function FlagImage({ src, alt, className = '', isKids = false }) {
  const [status, setStatus] = useState('loading') // 'loading' | 'loaded' | 'error'

  // Shared outer dimensions so every state takes up the same space
  // and the layout never shifts mid-quiz.
  const sizeClass = className || 'w-36 h-24'

  if (status === 'error') {
    return (
      <div
        className={`${sizeClass} flex flex-col items-center justify-center rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 border-2 border-dashed border-slate-300`}
        aria-label={alt}
        role="img"
      >
        <span className="text-2xl mb-1 select-none">
          {isKids ? '✈️' : '📡'}
        </span>
        <span className="text-xs font-semibold text-slate-400 text-center leading-tight px-2">
          {isKids ? 'Flag on its way!' : 'Flag unavailable'}
        </span>
      </div>
    )
  }

  return (
    <div className={`${sizeClass} relative`}>
      {/* Skeleton shown while the image is still loading */}
      {status === 'loading' && (
        <div className={`absolute inset-0 rounded-xl bg-slate-200 animate-pulse`} />
      )}

      <img
        src={src}
        alt={alt}
        // Hide the img visually while loading so we only see the skeleton.
        // Use opacity instead of display:none so the browser still fetches
        // and caches the image.
        className={`${sizeClass} object-cover rounded-xl transition-opacity duration-300 ${
          status === 'loaded' ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={()  => setStatus('loaded')}
        onError={() => setStatus('error')}
      />
    </div>
  )
}
