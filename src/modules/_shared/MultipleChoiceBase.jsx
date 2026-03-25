// src/modules/_shared/MultipleChoiceBase.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Phase 10: Generic Multiple Choice base — config-driven, mirrors the exact
// visual pattern of the existing per-module MC components (capitals, flags).
//
// CONFIG shape:
// {
//   moduleId:    string,
//   direction:   string,
//   accentColor: string,
//   generateFn:  function,
//   getStimulus: function(question, lang, isKids) → ReactNode,
// }
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef }  from 'react'
import { useLocation, useNavigate }     from 'react-router-dom'
import { useLanguage }                  from '../../context/LanguageContext'
import { useAgeMode }                   from '../../context/AgeModeContext'
import { useSettings }                  from '../../context/SettingsContext'
import { usePlayer }                    from '../../context/PlayerContext'
import { usePlayerProgress }            from '../../hooks/usePlayerProgress'
import { getAccent }                    from '../../screens/PlayerSelectScreen'

// Per-accent progress bar colour (matches existing modules)
const PROGRESS_COLOR = {
  amber:  'bg-amber-500',
  blue:   'bg-blue-500',
  green:  'bg-green-500',
  indigo: 'bg-indigo-500',
  rose:   'bg-rose-500',
}

export default function MultipleChoiceBase({ countries, config }) {
  const {
    moduleId, direction, accentColor,
    generateFn, getStimulus,
  } = config

  const location = useLocation()
  const navigate = useNavigate()

  const { lang: liveLang, tLang }              = useLanguage()
  const { ageMode: liveAgeMode }               = useAgeMode()
  const { questionsPerRound }                  = useSettings()
  const { activePlayer }                       = usePlayer()
  const { getProgress, recordRound }           = usePlayerProgress(moduleId)

  const frozenLang         = location.state?.lang         ?? liveLang
  const frozenAgeMode      = location.state?.ageMode      ?? liveAgeMode
  const frozenRegionFilter = location.state?.regionFilter ?? 'all'
  const isKidsFrozen       = frozenAgeMode === 'kids'

  const accentPlayer   = getAccent(activePlayer?.accentColor)
  const progressColor  = PROGRESS_COLOR[accentColor] || 'bg-blue-500'

  const [questions, setQuestions]             = useState([])
  const [current, setCurrent]                 = useState(0)
  const [selected, setSelected]               = useState(null)   // chosen label string
  const [result, setResult]                   = useState(null)   // null | 'correct' | 'wrong'
  const [score, setScore]                     = useState(0)
  const [streak, setStreak]                   = useState(0)
  const [answers, setAnswers]                 = useState([])
  const [showExitConfirm, setShowExitConfirm] = useState(false)
  const generated = useRef(false)

  useEffect(() => {
    if (countries.length > 0 && !generated.current) {
      generated.current = true
      const progress = getProgress()
      setQuestions(generateFn(
        countries, frozenLang, frozenAgeMode,
        questionsPerRound, progress, 0, frozenRegionFilter,
      ))
    }
  }, [countries]) // eslint-disable-line react-hooks/exhaustive-deps

  if (questions.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen text-xl text-gray-400">
        {tLang('loading', frozenLang) || 'Loading…'}
      </div>
    )
  }

  const question    = questions[current]
  const isAnswered  = result !== null
  const isLastQ     = current === questions.length - 1
  const progressPct = ((current + (isAnswered ? 1 : 0)) / questions.length) * 100

  function handleAnswer(choice) {
    if (isAnswered) return
    const isCorrect = choice.isCorrect
    setSelected(choice.label)
    setResult(isCorrect ? 'correct' : 'wrong')
    if (isCorrect) {
      setScore(s  => s + 1)
      setStreak(s => s + 1)
    } else {
      setStreak(0)
    }
    setAnswers(prev => [...prev, {
      question: {
        country:       question.country,
        correctAnswer: question.correctAnswer,
      },
      correct: isCorrect,
      match:   isCorrect ? 'correct' : 'wrong',
      chosen:  choice.label,
    }])
  }

  function handleNext() {
    if (isLastQ) {
      const mistakes = answers
        .filter(a => !a.correct)
        .map(a => a.question.country.code)
      recordRound(answers, score, answers.length, 'multiple-choice', direction, mistakes)
      navigate('/results', {
        state: {
          score,
          total:     questions.length,
          answers,
          moduleId,
          direction,
          mode:      'multiple-choice',
          lang:      frozenLang,
          ageMode:   frozenAgeMode,
          mistakes,
        },
      })
    } else {
      setCurrent(c => c + 1)
      setResult(null)
      setSelected(null)
    }
  }

  return (
    <div className="h-[100dvh] flex flex-col bg-gradient-to-br from-slate-50 to-slate-100">

      {/* ── Top bar ── */}
      <div className="flex-shrink-0 px-4 pt-4 pb-2 max-w-lg mx-auto w-full">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => setShowExitConfirm(true)}
            className={`text-gray-400 hover:text-gray-600 font-semibold transition-colors ${isKidsFrozen ? 'text-base' : 'text-sm'}`}
          >
            ✕ {tLang('exitButtonLabel', frozenLang) || 'Exit'}
          </button>
          <span className={`text-gray-500 font-semibold ${isKidsFrozen ? 'text-base' : 'text-sm'}`}>
            {tLang('quizScore', frozenLang) || 'Score'}: {score}
            {streak >= 2 && <span className="ml-2 text-orange-500">🔥 {streak}</span>}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div
            className={`${progressColor} h-1.5 rounded-full transition-all duration-500`}
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <div className="text-center mt-1 text-gray-400 text-xs">
          {tLang('quizQuestion_counter', frozenLang) || 'Q'} {current + 1} / {questions.length}
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="flex-1 overflow-hidden flex flex-col items-center justify-center px-4 pb-3 max-w-lg mx-auto w-full">

        {/* Stimulus */}
        <div className="w-full flex justify-center mb-3 flex-shrink-0">
          {getStimulus(question, frozenLang, isKidsFrozen)}
        </div>

        {/* Choice buttons */}
        <div className="w-full space-y-2 flex-shrink-0">
          {question.choices.map((choice, i) => {
            const isSelected  = selected === choice.label
            const showCorrect = isAnswered && choice.isCorrect
            const showWrong   = isAnswered && isSelected && !choice.isCorrect

            // Match the exact button styling of existing MC modules
            let btnClass = 'bg-white border-2 border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50'
            if (showCorrect) btnClass = 'bg-green-500 border-2 border-green-500 text-white'
            if (showWrong)   btnClass = 'bg-red-400   border-2 border-red-400   text-white'

            return (
              <button
                key={i}
                onClick={() => handleAnswer(choice)}
                disabled={isAnswered}
                className={`
                  w-full rounded-xl px-4 font-semibold transition-all duration-200
                  flex items-center gap-3
                  ${isKidsFrozen ? 'py-3 text-lg' : 'py-2.5 text-sm'}
                  ${btnClass}
                  ${isAnswered ? 'cursor-default' : 'cursor-pointer active:scale-95'}
                `}
              >
                {showCorrect && <span className="flex-shrink-0">✓</span>}
                {showWrong   && <span className="flex-shrink-0">✗</span>}
                {choice.flag && (
                  <img
                    src={choice.flag}
                    alt=""
                    className={`w-8 h-6 object-cover rounded flex-shrink-0 ${showCorrect || showWrong ? 'opacity-80' : ''}`}
                  />
                )}
                <span className="flex-1 text-left">{choice.label}</span>
                {choice.code && (
                  <span className={`
                    text-xs font-bold tracking-wider px-1.5 py-0.5 rounded flex-shrink-0
                    ${showCorrect ? 'bg-green-400 text-white' : showWrong ? 'bg-red-300 text-white' : 'bg-gray-100 text-gray-500'}
                  `}>
                    {choice.code}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Feedback + Next — inline row, matching capitals/flags MC pattern */}
        {isAnswered && (
          <div className="mt-3 w-full flex items-center gap-3 flex-shrink-0">
            <p className={`flex-1 font-bold ${isKidsFrozen ? 'text-base' : 'text-sm'}`}>
              {result === 'correct'
                ? <span className="text-green-600">{tLang('quizCorrect', frozenLang) || 'Correct! 🎉'}</span>
                : <span className="text-red-500">
                    {tLang('quizCorrectAnswer', frozenLang) || 'Answer'}:{' '}
                    <strong>{question.correctAnswer}</strong>
                  </span>
              }
            </p>
            <button
              onClick={handleNext}
              className={`
                rounded-xl font-bold text-white flex-shrink-0 transition-all active:scale-95
                bg-blue-500 hover:bg-blue-600
                ${isKidsFrozen ? 'px-5 py-3 text-base' : 'px-4 py-2.5 text-sm'}
              `}
            >
              {isLastQ
                ? (tLang('finish', frozenLang) || 'Finish')
                : (tLang('next', frozenLang)   || 'Next')} →
            </button>
          </div>
        )}
      </div>

      {/* ── Exit confirm modal ── */}
      {showExitConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-6">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <p className={`font-extrabold text-gray-800 mb-2 ${isKidsFrozen ? 'text-xl' : 'text-lg'}`}>
              {tLang('exitTitle', frozenLang) || 'Leave quiz?'}
            </p>
            <p className={`text-gray-500 mb-6 ${isKidsFrozen ? 'text-base' : 'text-sm'}`}>
              {tLang('exitMessage', frozenLang) || 'Your progress will be lost.'}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowExitConfirm(false)}
                className={`flex-1 rounded-2xl border-2 border-gray-200 font-bold text-gray-600 hover:border-gray-300 transition-all ${isKidsFrozen ? 'py-4 text-base' : 'py-3 text-sm'}`}
              >
                {tLang('exitCancel', frozenLang) || 'Keep playing'}
              </button>
              <button
                onClick={() => navigate('/module/' + moduleId)}
                className={`flex-1 rounded-2xl bg-red-500 font-bold text-white hover:bg-red-600 transition-all ${isKidsFrozen ? 'py-4 text-base' : 'py-3 text-sm'}`}
              >
                {tLang('exitConfirm', frozenLang) || 'Leave'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
