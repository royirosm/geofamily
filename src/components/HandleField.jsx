// src/components/HandleField.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Phase 9.5: Optional globally-unique handle field.
// Rendered inside PlayerForm (edit mode only) below the family section.
//
// UX:
//   • Shows current handle if set, or a placeholder prompting the user to
//     choose one.
//   • On "Set handle" the app calls claimHandle() in useSync — which writes
//     to handles/{handle} in Firestore. If the write succeeds the handle is
//     unique; if not, the user sees "already taken".
//   • Handle rules: 2–20 chars, lowercase a-z, 0-9, underscore only.
//     The field auto-lowercases and strips invalid chars on input.
//   • Once set, a handle can be changed (the old reservation stays but is
//     superseded — handle squatting cleanup is a future concern).
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react'
import { useSync }  from '../hooks/useSync'

export default function HandleField({ playerId, currentHandle, onHandleClaimed, isKids, t }) {
  const { claimHandle } = useSync()

  const [editing,  setEditing]  = useState(false)
  const [input,    setInput]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [success,  setSuccess]  = useState(false)

  const hasHandle = currentHandle?.length > 0

  function sanitize(val) {
    return val.toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 20)
  }

  async function handleClaim() {
    if (input.length < 2) { setError(t('handleTooShort') || 'At least 2 characters'); return }
    setLoading(true); setError('')
    const result = await claimHandle(input, playerId)
    setLoading(false)
    if (result.ok) {
      onHandleClaimed(result.handle)
      setEditing(false)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 2000)
    } else {
      const msgs = {
        taken:         t('handleTaken')        || 'Already taken — try another.',
        too_short:     t('handleTooShort')     || 'At least 2 characters.',
        invalid_chars: t('handleInvalidChars') || 'Letters, numbers and _ only.',
        network:       t('syncPinNetwork')     || 'Network error. Try again.',
      }
      setError(msgs[result.error] ?? 'Something went wrong.')
    }
  }

  return (
    <div className="border-2 border-gray-100 rounded-2xl p-4 space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <p className={`font-bold text-gray-700 ${isKids ? 'text-base' : 'text-sm'}`}>
            🏷️ {t('handleTitle') || 'Public handle'}
          </p>
          <p className={`text-gray-400 ${isKids ? 'text-sm' : 'text-xs'} mt-0.5`}>
            {hasHandle
              ? `@${currentHandle}`
              : (t('handleHint') || 'Optional — used on leaderboards & for friends')}
          </p>
        </div>
        {success && <span className="text-xs text-green-500 font-semibold">✓ Saved</span>}
      </div>

      {!editing ? (
        <button
          onClick={() => { setEditing(true); setInput(currentHandle ?? ''); setError('') }}
          className="w-full py-2 text-xs font-semibold rounded-xl bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors text-left px-3"
        >
          {hasHandle
            ? `✏️  ${t('handleChange') || 'Change handle'}`
            : `✨  ${t('handleSet') || 'Set a handle'}`}
        </button>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center gap-1">
            <span className="text-gray-400 text-sm font-bold pl-1">@</span>
            <input
              value={input}
              onChange={e => { setInput(sanitize(e.target.value)); setError('') }}
              placeholder="your_handle"
              maxLength={20}
              className="flex-1 border-2 border-gray-200 rounded-xl px-3 py-2 text-sm font-mono focus:outline-none focus:border-blue-400"
            />
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <div className="flex gap-2">
            <button
              onClick={() => { setEditing(false); setError('') }}
              className="flex-1 py-2 text-sm font-semibold rounded-xl border-2 border-gray-200 text-gray-600"
            >
              {t('exitCancel') || 'Cancel'}
            </button>
            <button
              onClick={handleClaim}
              disabled={loading || input.length < 2}
              className="flex-1 py-2 text-sm font-semibold rounded-xl bg-blue-500 text-white disabled:opacity-50"
            >
              {loading ? '…' : (t('handleClaim') || 'Claim')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
