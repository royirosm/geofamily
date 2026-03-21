// PlayerSelectScreen.jsx
// "Who's playing?" screen shown on app launch when no active player is set,
// or when the user taps the player chip in the Navbar to switch.
//
// Features:
//  - Displays existing player cards (tap to select)
//  - "Add player" form with name input + emoji avatar picker
//  - Delete player (with a small confirm step inline)
//  - Fully bilingual (EN/EL)

import { useState } from 'react'
import { useLanguage } from '../context/LanguageContext'
import { useAgeMode }  from '../context/AgeModeContext'
import { usePlayer }   from '../context/PlayerContext'

// Avatar options — a curated set of friendly emojis
const AVATARS = [
  '🧒','👦','👧','🧑','👨','👩','🧔','👴','👵',
  '🦊','🐼','🐨','🦁','🐯','🐸','🦋','🐙','🦄',
  '🚀','⭐','🌈','🎮','🎵','⚽','🏆','🌍','🎯',
]

export default function PlayerSelectScreen({ onDone }) {
  const { t }           = useLanguage()
  const { isKids }      = useAgeMode()
  const { profiles, addPlayer, removePlayer, switchPlayer } = usePlayer()

  const [showAddForm, setShowAddForm]   = useState(false)
  const [newName, setNewName]           = useState('')
  const [newAvatar, setNewAvatar]       = useState(AVATARS[0])
  const [deleteConfirm, setDeleteConfirm] = useState(null) // id of player pending delete
  const [nameError, setNameError]       = useState('')

  function handleSelect(id) {
    switchPlayer(id)
    onDone()
  }

  function handleAdd() {
    const trimmed = newName.trim()
    if (!trimmed) {
      setNameError(t('playerNameRequired'))
      return
    }
    if (profiles.some(p => p.name.toLowerCase() === trimmed.toLowerCase())) {
      setNameError(t('playerNameTaken'))
      return
    }
    const player = addPlayer(trimmed, newAvatar)
    switchPlayer(player.id)
    onDone()
  }

  function handleDeleteConfirmed(id) {
    removePlayer(id)
    setDeleteConfirm(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col items-center justify-center px-4 py-10">

      {/* Title */}
      <div className="text-center mb-8">
        <div className={`mb-3 ${isKids ? 'text-6xl' : 'text-5xl'}`}>👋</div>
        <h1 className={`font-extrabold text-gray-800 ${isKids ? 'text-3xl' : 'text-2xl'}`}>
          {t('playerWhoIsPlaying')}
        </h1>
        <p className={`text-gray-400 mt-1 ${isKids ? 'text-lg' : 'text-sm'}`}>
          {t('playerPickOrAdd')}
        </p>
      </div>

      {/* Existing players */}
      {profiles.length > 0 && (
        <div className="w-full max-w-sm space-y-3 mb-6">
          {profiles.map(player => (
            <div key={player.id} className="relative">
              {deleteConfirm === player.id ? (
                // Inline delete confirm
                <div className="flex items-center gap-2 bg-red-50 border-2 border-red-200 rounded-2xl px-4 py-3">
                  <span className="text-2xl">{player.avatar}</span>
                  <span className={`flex-1 font-semibold text-red-600 ${isKids ? 'text-base' : 'text-sm'}`}>
                    {t('playerDeleteConfirm')} {player.name}?
                  </span>
                  <button
                    onClick={() => handleDeleteConfirmed(player.id)}
                    className="px-3 py-1.5 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-600 transition-colors"
                  >
                    {t('playerDeleteYes')}
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="px-3 py-1.5 bg-gray-200 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-300 transition-colors"
                  >
                    {t('playerDeleteNo')}
                  </button>
                </div>
              ) : (
                // Normal player card
                <button
                  onClick={() => handleSelect(player.id)}
                  className={`
                    w-full flex items-center gap-4 px-4
                    bg-white hover:bg-blue-50
                    border-2 border-gray-100 hover:border-blue-300
                    rounded-2xl transition-all duration-200 active:scale-95 shadow-sm
                    ${isKids ? 'py-4' : 'py-3'}
                  `}
                >
                  <span className={`flex-shrink-0 ${isKids ? 'text-4xl' : 'text-3xl'}`}>
                    {player.avatar}
                  </span>
                  <span className={`flex-1 text-left font-bold text-gray-800 ${isKids ? 'text-xl' : 'text-base'}`}>
                    {player.name}
                  </span>
                  <span className="text-blue-400 text-lg">▶</span>
                </button>
              )}

              {/* Delete button (shown when not in confirm mode) */}
              {deleteConfirm !== player.id && (
                <button
                  onClick={e => { e.stopPropagation(); setDeleteConfirm(player.id) }}
                  className="absolute right-12 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center text-gray-300 hover:text-red-400 transition-colors text-lg"
                  aria-label={`Delete ${player.name}`}
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add player section */}
      {!showAddForm ? (
        <button
          onClick={() => setShowAddForm(true)}
          className={`
            flex items-center gap-2 px-6
            border-2 border-dashed border-gray-300 hover:border-blue-400
            text-gray-400 hover:text-blue-500
            rounded-2xl transition-all duration-200 font-semibold w-full max-w-sm justify-center
            ${isKids ? 'py-4 text-lg' : 'py-3 text-sm'}
          `}
        >
          <span className="text-xl">＋</span>
          {t('playerAdd')}
        </button>
      ) : (
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg border border-gray-100 p-5 space-y-4">

          {/* Name input */}
          <div>
            <label className={`block font-semibold text-gray-600 mb-1.5 ${isKids ? 'text-base' : 'text-sm'}`}>
              {t('playerName')}
            </label>
            <input
              type="text"
              value={newName}
              onChange={e => { setNewName(e.target.value); setNameError('') }}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
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
            {nameError && (
              <p className="text-red-500 text-xs mt-1">{nameError}</p>
            )}
          </div>

          {/* Avatar picker */}
          <div>
            <label className={`block font-semibold text-gray-600 mb-2 ${isKids ? 'text-base' : 'text-sm'}`}>
              {t('playerAvatar')}
            </label>
            <div className="grid grid-cols-9 gap-1">
              {AVATARS.map(emoji => (
                <button
                  key={emoji}
                  onClick={() => setNewAvatar(emoji)}
                  className={`
                    text-xl rounded-lg transition-all duration-150
                    ${isKids ? 'text-2xl py-1' : 'text-lg py-0.5'}
                    ${newAvatar === emoji
                      ? 'bg-blue-100 ring-2 ring-blue-400 scale-110'
                      : 'hover:bg-gray-100'}
                  `}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
            <span className="text-3xl">{newAvatar}</span>
            <span className={`font-bold text-gray-700 ${isKids ? 'text-xl' : 'text-base'}`}>
              {newName || t('playerNamePlaceholder')}
            </span>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => { setShowAddForm(false); setNewName(''); setNameError('') }}
              className={`flex-1 rounded-xl font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors ${isKids ? 'py-3 text-base' : 'py-2.5 text-sm'}`}
            >
              {t('playerAddCancel')}
            </button>
            <button
              onClick={handleAdd}
              className={`flex-1 rounded-xl font-bold text-white bg-blue-500 hover:bg-blue-600 transition-colors ${isKids ? 'py-3 text-base' : 'py-2.5 text-sm'}`}
            >
              {t('playerAddConfirm')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
