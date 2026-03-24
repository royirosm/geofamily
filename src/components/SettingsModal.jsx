// src/components/SettingsModal.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Fixes applied:
//   Fix 1 — PIN generation failure is now shown in the UI (not silent)
//   Fix 2 — pushAllLocal() called immediately after createFamily()
//   Fix 3 — Leave family now shows a confirmation dialog with a clear warning
//   Fix 7 — pushAllLocal() called immediately after joinViaPin() succeeds
// ─────────────────────────────────────────────────────────────────────────────

import { useState }               from 'react'
import { useLanguage }            from '../context/LanguageContext'
import { useSettings }            from '../context/SettingsContext'
import { usePlayer }              from '../context/PlayerContext'
import { useSync }                from '../hooks/useSync'
import { getBg }                  from '../screens/PlayerSelectScreen'
import PlayerSelectScreen         from '../screens/PlayerSelectScreen'

export default function SettingsModal({ onClose }) {
  const { t }                           = useLanguage()
  const {
    questionsPerRound, setQuestionsPerRound,
    familyName, familyCode, syncEnabled,
    createFamily, joinFamily, leaveFamily,
  }                                     = useSettings()
  const { activePlayer, profiles }      = usePlayer()
  const { generateJoinPin, joinViaPin, pushAllLocal } = useSync()

  const [showPlayerSwap,   setShowPlayerSwap]   = useState(false)

  // Create family
  const [createName,       setCreateName]       = useState('')
  const [createMode,       setCreateMode]       = useState(false)
  const [createLoading,    setCreateLoading]    = useState(false)

  // PIN display
  const [activePin,        setActivePin]        = useState(null)
  const [pinLoading,       setPinLoading]       = useState(false)
  const [pinError,         setPinError]         = useState('')   // Fix 1

  // Join via PIN
  const [joinMode,         setJoinMode]         = useState(false)
  const [pinInput,         setPinInput]         = useState('')
  const [joinError,        setJoinError]        = useState('')
  const [joinLoading,      setJoinLoading]      = useState(false)

  // Fix 3: leave confirmation
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false)

  const options = [5, 10, 15, 20]
  const bg      = activePlayer ? getBg(activePlayer.avatarBg) : null

  // ── Handlers ──────────────────────────────────────────────────────────────

  // Fix 2: create family then immediately push all local data
  async function handleCreate() {
    if (!createName.trim()) return
    setCreateLoading(true)
    // createFamily() is synchronous — updates SettingsContext + localStorage
    const newCode = crypto.randomUUID()
    createFamily(createName, newCode)  // pass code so we can use it immediately
    // pushAllLocal needs the new code before context re-render propagates
    await pushAllLocal(profiles, newCode)
    setCreateLoading(false)
    setCreateMode(false)
    setCreateName('')
  }

  // Fix 1: surface PIN generation errors in UI
  async function handleGeneratePin() {
    setPinLoading(true)
    setPinError('')
    const result = await generateJoinPin(familyName)
    setPinLoading(false)
    if (result.ok) {
      setActivePin(result.pin)
    } else {
      const msgs = {
        no_family: t('syncPinNoFamily')  ?? 'No family set up yet.',
        network:   t('syncPinNetwork')   ?? 'Network error. Try again.',
      }
      setPinError(msgs[result.error] ?? 'Something went wrong.')
    }
  }

  // Fix 7: after join, push local data up to the new family
  async function handleJoin() {
    setJoinError('')
    setJoinLoading(true)
    const result = await joinViaPin(pinInput)
    if (result.ok) {
      joinFamily(result.familyCode, result.familyName)
      // Push all local data to the family we just joined
      await pushAllLocal(profiles, result.familyCode)
      setJoinLoading(false)
      setJoinMode(false)
      setPinInput('')
    } else {
      setJoinLoading(false)
      const msgs = {
        not_found:      t('syncPinNotFound')    ?? 'PIN not found.',
        expired:        t('syncPinExpired')     ?? 'PIN has expired.',
        invalid_format: t('syncPinInvalid')     ?? 'Enter a 6-digit PIN.',
        network:        t('syncPinNetwork')     ?? 'Network error. Try again.',
      }
      setJoinError(msgs[result.error] ?? 'Something went wrong.')
    }
  }

  // Fix 3: confirmed leave
  function handleLeaveConfirmed() {
    leaveFamily()
    setActivePin(null)
    setShowLeaveConfirm(false)
  }

  // ── Player swap sub-screen ─────────────────────────────────────────────────
  if (showPlayerSwap) {
    return (
      <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
        <PlayerSelectScreen onDone={() => setShowPlayerSwap(false)} />
      </div>
    )
  }

  // ── Fix 3: Leave confirmation overlay ─────────────────────────────────────
  if (showLeaveConfirm) {
    return (
      <div
        className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4"
        onClick={() => setShowLeaveConfirm(false)}
      >
        <div
          className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm space-y-4"
          onClick={e => e.stopPropagation()}
        >
          <div className="text-center">
            <p className="text-3xl mb-2">⚠️</p>
            <h3 className="font-extrabold text-gray-800 text-lg">
              {t('syncLeaveTitle') ?? 'Leave family?'}
            </h3>
          </div>
          <p className="text-sm text-gray-500 text-center leading-relaxed">
            {t('syncLeaveWarning') ??
              'Your players and progress will stay on this device, but sync will stop. ' +
              'To rejoin, you\'ll need a new PIN from another device in the family.'}
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setShowLeaveConfirm(false)}
              className="flex-1 py-3 rounded-xl border-2 border-gray-200 font-bold text-gray-600 text-sm"
            >
              {t('exitCancel') ?? 'Cancel'}
            </button>
            <button
              onClick={handleLeaveConfirmed}
              className="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold text-sm"
            >
              {t('syncLeaveConfirm') ?? 'Leave'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm space-y-5 max-h-[90dvh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >

        {/* ── Header ───────────────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <h2 className="font-extrabold text-gray-800 text-xl">⚙️ {t('settings')}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>

        {/* ── Active player ─────────────────────────────────────────── */}
        {activePlayer && (
          <>
            <div>
              <p className="font-semibold text-gray-600 text-sm mb-3">👤 {t('settingsPlayer')}</p>
              <button
                onClick={() => setShowPlayerSwap(true)}
                className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors text-left"
              >
                <span className={`w-9 h-9 rounded-full flex items-center justify-center text-lg flex-shrink-0 ${bg}`}>
                  {activePlayer.avatar}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-800 text-sm truncate">{activePlayer.name}</p>
                  <p className="text-xs text-gray-400">{t('settingsPlayerSwitch')}</p>
                </div>
                <span className="text-gray-300 text-sm flex-shrink-0">›</span>
              </button>
            </div>
            <div className="border-t border-gray-100" />
          </>
        )}

        {/* ── Questions per round ───────────────────────────────────── */}
        <div>
          <p className="font-semibold text-gray-600 text-sm mb-3">{t('settingsQuestionsPerRound')}</p>
          <div className="grid grid-cols-4 gap-2">
            {options.map(n => (
              <button
                key={n}
                onClick={() => setQuestionsPerRound(n)}
                className={`
                  py-3 rounded-xl font-bold text-base transition-all duration-200
                  ${questionsPerRound === n
                    ? 'bg-blue-500 text-white shadow-md scale-105'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
                `}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-100" />

        {/* ── Family Sync ───────────────────────────────────────────── */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <p className="font-semibold text-gray-600 text-sm">🔗 {t('syncTitle') ?? 'Family Sync'}</p>
            {syncEnabled && (
              <span className="text-xs bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full">
                {t('syncActive') ?? 'Active'}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400 mb-4">
            {t('syncHint') ?? 'Link devices so your whole family shares players and progress.'}
          </p>

          {/* ── STATE A: No family ── */}
          {!syncEnabled && !createMode && !joinMode && (
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setCreateMode(true)}
                className="w-full py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm transition-all"
              >
                ✨ {t('syncCreate') ?? 'Create a family'}
              </button>
              <button
                onClick={() => setJoinMode(true)}
                className="w-full py-3 rounded-xl border-2 border-gray-200 hover:border-gray-300 text-gray-600 font-bold text-sm transition-all"
              >
                🔑 {t('syncJoin') ?? 'Join with a PIN'}
              </button>
            </div>
          )}

          {/* ── Create family form ── */}
          {!syncEnabled && createMode && (
            <div className="space-y-3">
              <p className="text-xs text-gray-500">
                {t('syncCreateHint') ?? 'Give your family a name for the leaderboard.'}
              </p>
              <input
                type="text"
                value={createName}
                onChange={e => setCreateName(e.target.value.slice(0, 30))}
                placeholder={t('syncFamilyNamePlaceholder') ?? 'e.g. The Smiths'}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold focus:border-blue-400 focus:outline-none"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={() => { setCreateMode(false); setCreateName('') }}
                  className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-gray-500 font-bold text-sm"
                >
                  {t('back') ?? 'Back'}
                </button>
                <button
                  onClick={handleCreate}
                  disabled={!createName.trim() || createLoading}
                  className="flex-1 py-2.5 rounded-xl bg-blue-500 text-white font-bold text-sm disabled:opacity-40"
                >
                  {createLoading ? '…' : (t('syncCreateConfirm') ?? 'Create')}
                </button>
              </div>
            </div>
          )}

          {/* ── Join via PIN form ── */}
          {!syncEnabled && joinMode && (
            <div className="space-y-3">
              <p className="text-xs text-gray-500">
                {t('syncJoinHint') ?? 'Enter the 6-digit PIN shown on the other device.'}
              </p>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={pinInput}
                onChange={e => { setPinInput(e.target.value.replace(/\D/g, '')); setJoinError('') }}
                placeholder="000000"
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-2xl font-bold text-center tracking-widest focus:border-blue-400 focus:outline-none"
                autoFocus
              />
              {joinError && <p className="text-xs text-red-500 text-center">{joinError}</p>}
              <div className="flex gap-2">
                <button
                  onClick={() => { setJoinMode(false); setPinInput(''); setJoinError('') }}
                  className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-gray-500 font-bold text-sm"
                >
                  {t('back') ?? 'Back'}
                </button>
                <button
                  onClick={handleJoin}
                  disabled={pinInput.length !== 6 || joinLoading}
                  className="flex-1 py-2.5 rounded-xl bg-blue-500 text-white font-bold text-sm disabled:opacity-40"
                >
                  {joinLoading ? '…' : (t('syncJoinConfirm') ?? 'Join')}
                </button>
              </div>
            </div>
          )}

          {/* ── STATE B: Has family ── */}
          {syncEnabled && (
            <div className="space-y-3">
              {/* Family name */}
              <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
                <span className="text-2xl">🏠</span>
                <div>
                  <p className="font-extrabold text-gray-800 text-sm">
                    {familyName || (t('syncUnnamedFamily') ?? 'My Family')}
                  </p>
                  <p className="text-xs text-gray-400">
                    {t('syncFamilyActive') ?? 'Syncing across devices'}
                  </p>
                </div>
              </div>

              {/* Fix 1: PIN error message */}
              {pinError && (
                <p className="text-xs text-red-500 text-center">{pinError}</p>
              )}

              {/* PIN display */}
              {activePin && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-center">
                  <p className="text-xs text-amber-700 mb-1">
                    {t('syncPinLabel') ?? 'Enter this PIN on the other device:'}
                  </p>
                  <p className="text-4xl font-extrabold tracking-widest text-amber-800 font-mono">
                    {activePin}
                  </p>
                  <p className="text-xs text-amber-600 mt-1">
                    {t('syncPinExpiry') ?? 'Valid for 10 minutes'}
                  </p>
                  <button
                    onClick={() => { setActivePin(null); setPinError('') }}
                    className="mt-2 text-xs text-amber-500 underline"
                  >
                    {t('syncPinDismiss') ?? 'Dismiss'}
                  </button>
                </div>
              )}

              {/* Link another device */}
              {!activePin && (
                <button
                  onClick={handleGeneratePin}
                  disabled={pinLoading}
                  className="w-full py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm transition-all disabled:opacity-50"
                >
                  {pinLoading ? '…' : `📱 ${t('syncLinkDevice') ?? 'Link another device'}`}
                </button>
              )}

              {/* Fix 3: Leave opens confirmation instead of acting immediately */}
              <button
                onClick={() => setShowLeaveConfirm(true)}
                className="w-full py-2.5 rounded-xl border-2 border-red-100 text-red-400 hover:border-red-200 font-bold text-sm transition-all"
              >
                {t('syncLeave') ?? 'Leave family'}
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
