// PlayerSelectScreen.jsx
// "Who's playing?" screen — shown on launch or when switching players.
//
// Profile cards show: avatar builder (emoji + bg colour), accent colour,
// level/title badge, and stats summary (rounds, accuracy, mastered).
// Supports add, edit, and delete with inline confirm.

import { useState }                                from 'react'
import { useLanguage }                             from '../context/LanguageContext'
import { useAgeMode }                              from '../context/AgeModeContext'
import { usePlayer }                               from '../context/PlayerContext'
import { getStatsForPlayer, getLevelForPlayer }    from '../hooks/usePlayerProgress'

// ── Avatar emoji options ──────────────────────────────────────────────────────
const AVATARS = [
  '🧒','👦','👧','🧑','👨','👩','🧔','👴','👵',
  '🦊','🐼','🐨','🦁','🐯','🐸','🦋','🐙','🦄',
  '🚀','⭐','🌈','🎮','🎵','⚽','🏆','🌍','🎯',
]

// ── Colour palettes ───────────────────────────────────────────────────────────
export const BG_COLORS = [
  { name: 'blue',   bg: 'bg-blue-400',   ring: 'ring-blue-500'   },
  { name: 'violet', bg: 'bg-violet-400', ring: 'ring-violet-500' },
  { name: 'rose',   bg: 'bg-rose-400',   ring: 'ring-rose-500'   },
  { name: 'amber',  bg: 'bg-amber-400',  ring: 'ring-amber-500'  },
  { name: 'green',  bg: 'bg-green-400',  ring: 'ring-green-500'  },
  { name: 'teal',   bg: 'bg-teal-400',   ring: 'ring-teal-500'   },
  { name: 'pink',   bg: 'bg-pink-400',   ring: 'ring-pink-500'   },
  { name: 'orange', bg: 'bg-orange-400', ring: 'ring-orange-500' },
]

export const ACCENT_COLORS = [
  { name: 'blue',   card: 'border-blue-300   bg-blue-50',   badge: 'bg-blue-500'   },
  { name: 'violet', card: 'border-violet-300 bg-violet-50', badge: 'bg-violet-500' },
  { name: 'rose',   card: 'border-rose-300   bg-rose-50',   badge: 'bg-rose-500'   },
  { name: 'amber',  card: 'border-amber-300  bg-amber-50',  badge: 'bg-amber-500'  },
  { name: 'green',  card: 'border-green-300  bg-green-50',  badge: 'bg-green-500'  },
  { name: 'teal',   card: 'border-teal-300   bg-teal-50',   badge: 'bg-teal-500'   },
  { name: 'pink',   card: 'border-pink-300   bg-pink-50',   badge: 'bg-pink-500'   },
  { name: 'orange', card: 'border-orange-300 bg-orange-50', badge: 'bg-orange-500' },
]

export function getAccent(name) {
  return ACCENT_COLORS.find(a => a.name === name) ?? ACCENT_COLORS[0]
}

export function getBg(name) {
  return BG_COLORS.find(b => b.name === name) ?? BG_COLORS[0]
}

// ── PlayerCard ────────────────────────────────────────────────────────────────
// Uses pure helper functions (not hooks) to read stats — safe inside .map()

function PlayerCard({ player, isKids, onSelect, onEdit, onDelete, deleteConfirm, onDeleteConfirm, onDeleteCancel, t, lang }) {
  // Pure reads — no hooks called here
  const stats  = getStatsForPlayer(player.id)
  const level  = getLevelForPlayer(player.id)
  const accent = getAccent(player.accentColor)
  const bg     = getBg(player.avatarBg)

  if (deleteConfirm) {
    return (
      <div className="flex items-center gap-2 bg-red-50 border-2 border-red-200 rounded-2xl px-4 py-3">
        <div className={`flex-shrink-0 w-10 h-10 rounded-full ${bg.bg} flex items-center justify-center`}>
          <span className="text-xl">{player.avatar}</span>
        </div>
        <span className={`flex-1 font-semibold text-red-600 ${isKids ? 'text-base' : 'text-sm'}`}>
          {t('playerDeleteConfirm')} {player.name}?
        </span>
        <button onClick={onDeleteConfirm} className="px-3 py-1.5 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-600 transition-colors">
          {t('playerDeleteYes')}
        </button>
        <button onClick={onDeleteCancel} className="px-3 py-1.5 bg-gray-200 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-300 transition-colors">
          {t('playerDeleteNo')}
        </button>
      </div>
    )
  }

  return (
    <div className="relative group">
      <button
        onClick={onSelect}
        className={`
          w-full flex items-center gap-4 px-4
          bg-white border-2 border-gray-100
          hover:border-blue-200 hover:bg-blue-50
          rounded-2xl transition-all duration-200 active:scale-95 shadow-sm
          ${isKids ? 'py-4' : 'py-3'}
        `}
      >
        {/* Avatar bubble */}
        <div className={`flex-shrink-0 w-12 h-12 rounded-full ${bg.bg} flex items-center justify-center shadow-sm`}>
          <span className="text-2xl">{player.avatar}</span>
        </div>

        {/* Info */}
        <div className="flex-1 text-left min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`font-bold text-gray-800 truncate ${isKids ? 'text-xl' : 'text-base'}`}>
              {player.name}
            </span>
            <span className={`text-xs font-bold text-white px-2 py-0.5 rounded-full flex-shrink-0 ${accent.badge}`}>
              {level.title[lang] ?? level.title.en}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="text-xs text-gray-400">
              🎮 {stats.totalRounds} {t('playerStatRounds')}
            </span>
            {stats.totalRounds > 0 && (
              <span className="text-xs text-gray-400">🎯 {stats.accuracy}%</span>
            )}
            {stats.masterCount > 0 && (
              <span className="text-xs text-gray-400">⭐ {stats.masterCount}</span>
            )}
          </div>
        </div>

        <span className="text-blue-400 text-lg flex-shrink-0">▶</span>
      </button>

      {/* Edit button */}
      <button
        onClick={e => { e.stopPropagation(); onEdit() }}
        className="absolute right-10 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center text-gray-300 hover:text-blue-400 transition-colors text-base"
        aria-label={`Edit ${player.name}`}
      >
        ✏️
      </button>

      {/* Delete button */}
      <button
        onClick={e => { e.stopPropagation(); onDelete() }}
        className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center text-gray-300 hover:text-red-400 transition-colors text-xl leading-none"
        aria-label={`Delete ${player.name}`}
      >
        ×
      </button>
    </div>
  )
}

// ── PlayerForm (shared for Add + Edit) ───────────────────────────────────────

function PlayerForm({ initial, onSave, onCancel, isKids, t, existingNames }) {
  const [name,        setName]        = useState(initial?.name        ?? '')
  const [avatar,      setAvatar]      = useState(initial?.avatar      ?? AVATARS[0])
  const [avatarBg,    setAvatarBg]    = useState(initial?.avatarBg    ?? 'blue')
  const [accentColor, setAccentColor] = useState(initial?.accentColor ?? 'blue')
  const [nameError,   setNameError]   = useState('')

  const bg     = getBg(avatarBg)
  const accent = getAccent(accentColor)

  function handleSave() {
    const trimmed = name.trim()
    if (!trimmed) { setNameError(t('playerNameRequired')); return }
    if (existingNames.includes(trimmed.toLowerCase())) { setNameError(t('playerNameTaken')); return }
    onSave({ name: trimmed, avatar, avatarBg, accentColor })
  }

  return (
    <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg border border-gray-100 p-5 space-y-4">

      {/* Name */}
      <div>
        <label className={`block font-semibold text-gray-600 mb-1.5 ${isKids ? 'text-base' : 'text-sm'}`}>
          {t('playerName')}
        </label>
        <input
          type="text"
          value={name}
          onChange={e => { setName(e.target.value); setNameError('') }}
          onKeyDown={e => e.key === 'Enter' && handleSave()}
          placeholder={t('playerNamePlaceholder')}
          maxLength={20}
          autoFocus
          className={`
            w-full border-2 rounded-xl px-4 font-semibold text-gray-800
            focus:outline-none focus:border-blue-400 transition-colors
            ${nameError ? 'border-red-300' : 'border-gray-200'}
            ${isKids ? 'py-3 text-xl' : 'py-2.5 text-base'}
          `}
        />
        {nameError && <p className="text-red-500 text-xs mt-1">{nameError}</p>}
      </div>

      {/* Avatar emoji picker */}
      <div>
        <label className={`block font-semibold text-gray-600 mb-2 ${isKids ? 'text-base' : 'text-sm'}`}>
          {t('playerAvatar')}
        </label>
        <div className="grid grid-cols-9 gap-1">
          {AVATARS.map(emoji => (
            <button
              key={emoji}
              onClick={() => setAvatar(emoji)}
              className={`
                rounded-lg transition-all duration-150 flex items-center justify-center
                ${isKids ? 'text-2xl h-9' : 'text-lg h-8'}
                ${avatar === emoji ? 'ring-2 ring-blue-400 scale-110 bg-blue-50' : 'hover:bg-gray-100'}
              `}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Avatar background colour */}
      <div>
        <label className={`block font-semibold text-gray-600 mb-2 ${isKids ? 'text-base' : 'text-sm'}`}>
          {t('playerAvatarBg')}
        </label>
        <div className="flex gap-2 flex-wrap">
          {BG_COLORS.map(c => (
            <button
              key={c.name}
              onClick={() => setAvatarBg(c.name)}
              className={`w-8 h-8 rounded-full ${c.bg} transition-all duration-150 ${avatarBg === c.name ? `ring-2 ring-offset-2 ${c.ring} scale-110` : 'hover:scale-105'}`}
              aria-label={c.name}
            />
          ))}
        </div>
      </div>

      {/* Accent colour */}
      <div>
        <label className={`block font-semibold text-gray-600 mb-2 ${isKids ? 'text-base' : 'text-sm'}`}>
          {t('playerAccentColor')}
        </label>
        <div className="flex gap-2 flex-wrap">
          {ACCENT_COLORS.map(c => (
            <button
              key={c.name}
              onClick={() => setAccentColor(c.name)}
              className={`w-8 h-8 rounded-full ${c.badge} transition-all duration-150 ${accentColor === c.name ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : 'hover:scale-105'}`}
              aria-label={c.name}
            />
          ))}
        </div>
      </div>

      {/* Live preview */}
      <div className={`flex items-center gap-3 rounded-xl px-4 py-3 border-2 ${accent.card}`}>
        <div className={`w-10 h-10 rounded-full ${bg.bg} flex items-center justify-center`}>
          <span className="text-2xl">{avatar}</span>
        </div>
        <div>
          <span className={`font-bold text-gray-700 ${isKids ? 'text-xl' : 'text-base'}`}>
            {name || t('playerNamePlaceholder')}
          </span>
          <span className={`ml-2 text-xs font-bold text-white px-2 py-0.5 rounded-full ${accent.badge}`}>
            {t('levelNew')}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <button
          onClick={onCancel}
          className={`flex-1 rounded-xl font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors ${isKids ? 'py-3 text-base' : 'py-2.5 text-sm'}`}
        >
          {t('playerAddCancel')}
        </button>
        <button
          onClick={handleSave}
          className={`flex-1 rounded-xl font-bold text-white bg-blue-500 hover:bg-blue-600 transition-colors ${isKids ? 'py-3 text-base' : 'py-2.5 text-sm'}`}
        >
          {initial ? t('playerSaveEdit') : t('playerAddConfirm')}
        </button>
      </div>
    </div>
  )
}

// ── Main screen ───────────────────────────────────────────────────────────────

export default function PlayerSelectScreen({ onDone }) {
  const { lang, t }     = useLanguage()
  const { isKids }      = useAgeMode()
  const { profiles, addPlayer, updatePlayer, removePlayer, switchPlayer } = usePlayer()

  const [mode,          setMode]          = useState('list') // 'list' | 'add' | 'edit'
  const [editingId,     setEditingId]     = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  function handleSelect(id)  { switchPlayer(id); onDone() }

  function handleAdd({ name, avatar, avatarBg, accentColor }) {
    const player = addPlayer(name, avatar, avatarBg, accentColor)
    switchPlayer(player.id)
    onDone()
  }

  function handleEdit({ name, avatar, avatarBg, accentColor }) {
    updatePlayer(editingId, { name, avatar, avatarBg, accentColor })
    setMode('list'); setEditingId(null)
  }

  const editingPlayer = profiles.find(p => p.id === editingId)
  const takenNames    = profiles
    .filter(p => p.id !== editingId)
    .map(p => p.name.toLowerCase())

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col items-center justify-center px-4 py-10">

      {/* Title — only in list mode */}
      {mode === 'list' && (
        <div className="text-center mb-8">
          <div className={`mb-3 ${isKids ? 'text-6xl' : 'text-5xl'}`}>👋</div>
          <h1 className={`font-extrabold text-gray-800 ${isKids ? 'text-3xl' : 'text-2xl'}`}>
            {t('playerWhoIsPlaying')}
          </h1>
          <p className={`text-gray-400 mt-1 ${isKids ? 'text-lg' : 'text-sm'}`}>
            {t('playerPickOrAdd')}
          </p>
        </div>
      )}

      {/* Player list */}
      {mode === 'list' && (
        <>
          {profiles.length > 0 && (
            <div className="w-full max-w-sm space-y-3 mb-6">
              {profiles.map(player => (
                <PlayerCard
                  key={player.id}
                  player={player}
                  isKids={isKids}
                  t={t}
                  lang={lang}
                  onSelect={() => handleSelect(player.id)}
                  onEdit={() => { setEditingId(player.id); setMode('edit') }}
                  onDelete={() => setDeleteConfirm(player.id)}
                  deleteConfirm={deleteConfirm === player.id}
                  onDeleteConfirm={() => { removePlayer(player.id); setDeleteConfirm(null) }}
                  onDeleteCancel={() => setDeleteConfirm(null)}
                />
              ))}
            </div>
          )}

          <button
            onClick={() => setMode('add')}
            className={`flex items-center gap-2 px-6 border-2 border-dashed border-gray-300 hover:border-blue-400 text-gray-400 hover:text-blue-500 rounded-2xl transition-all font-semibold w-full max-w-sm justify-center ${isKids ? 'py-4 text-lg' : 'py-3 text-sm'}`}
          >
            <span className="text-xl">＋</span>
            {t('playerAdd')}
          </button>
        </>
      )}

      {/* Add form */}
      {mode === 'add' && (
        <>
          <h2 className={`font-extrabold text-gray-800 mb-6 ${isKids ? 'text-2xl' : 'text-xl'}`}>
            {t('playerAdd')}
          </h2>
          <PlayerForm
            initial={null}
            onSave={handleAdd}
            onCancel={() => setMode('list')}
            isKids={isKids}
            t={t}
            existingNames={takenNames}
          />
        </>
      )}

      {/* Edit form */}
      {mode === 'edit' && editingPlayer && (
        <>
          <h2 className={`font-extrabold text-gray-800 mb-6 ${isKids ? 'text-2xl' : 'text-xl'}`}>
            {t('playerEditTitle')}
          </h2>
          <PlayerForm
            initial={editingPlayer}
            onSave={handleEdit}
            onCancel={() => { setMode('list'); setEditingId(null) }}
            isKids={isKids}
            t={t}
            existingNames={takenNames}
          />
        </>
      )}
    </div>
  )
}
