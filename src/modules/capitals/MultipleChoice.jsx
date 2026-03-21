// MultipleChoice.jsx
// Capitals quiz screen.
// Reads lang + ageMode from route state (frozen at quiz start by HomeScreen).
// Reads questionsPerRound from SettingsContext.
// Designed to fit entirely on one mobile screen — no scrolling needed.
// Exit button is a clearly visible red pill. Confirm dialog prevents accidents.

import { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate }    from 'react-router-dom'
import { useLanguage }                 from '../../context/LanguageContext'
import { useAgeMode }                  from '../../context/AgeModeContext'
import { useSettings }                 from '../../context/SettingsContext'
import { generateQuestions }           from '../../utils/questionGenerator'

export default function MultipleChoice({ countries }) {
  const location = useLocation()
  const navigate = useNavigate()

  const { lang: liveLang, tLang }  = useLanguage()
  const { ageMode: liveAgeMode }   = useAgeMode()
  const { questionsPerRound }      = useSettings()

  const frozenLang    = location.state?.lang    ?? liveLang
  const frozenAgeMode = location.state?.ageMode ?? liveAgeMode
  const isKids        = frozenAgeMode === 'kids'

  const [questions, setQuestions]     = useState([])
  const [current, setCurrent]         = useState(0)
  const [selected, setSelected]       = useState(null)
  const [score, setScore]             = useState(0)
  const [streak, setStreak]           = useState(0)
  const [answers, setAnswers]         = useState([])
  const [showExitConfirm, setShowExitConfirm] = useState(false)

  const generated = useRef(false)

  useEffect(() => {
    if (countries.length > 0 && !generated.current) {
      generated.current = true
      setQuestions(generateQuestions(countries, frozenLang, frozenAgeMode, questionsPerRound))
    }
  }, [countries, frozenLang, frozenAgeMode, questionsPerRound])

  if (questions.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen text-xl text-gray-500">
        {tLang('loading', frozenLang)}
      </div>
    )
  }

  const question   = questions[current]
  const isAnswered = selected !== null
  const isLastQ    = current === questions.length - 1

  function handleAnswer(choice) {
    if (isAnswered) return
    setSelected(choice.label)
    const correct   = choice.isCorrect
    const newScore  = correct ? score + 1 : score
    const newStreak = correct ? streak + 1 : 0
    setScore(newScore)
    setStreak(newStreak)
    setAnswers(prev => [...prev, { question, chosen: choice.label, correct }])
  }

  function handleNext() {
    if (isLastQ) {
      navigate('/results', {
        state: { score, total: questions.length, answers, lang: frozenLang, ageMode: frozenAgeMode },
      })
    } else {
      setCurrent(c => c + 1)
      setSelected(null)
    }
  }

  function handleExitConfirmed() {
    navigate('/')
  }

  const progress = ((current + (isAnswered ? 1 : 0)) / questions.length) * 100

  return (
    // h-[100dvh] — uses dynamic viewport height on mobile (accounts for browser chrome)
    // overflow-hidden — prevents any scrolling; everything must fit
    <div className="h-[100dvh] overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col">

      {/* ── Top bar: progress + exit ── */}
      <div className="w-full px-4 pt-3 pb-2 flex-shrink-0">
        <div className="flex justify-between items-center mb-2">

          {/* Exit button — clearly visible red pill */}
          <button
            onClick={() => setShowExitConfirm(true)}
            className="
              flex items-center gap-1.5 px-3 py-1.5
              bg-red-100 hover:bg-red-200 text-red-600 hover:text-red-700
              rounded-full text-sm font-semibold
              transition-colors duration-200
            "
          >
            <span className="text-xs">✕</span>
            {tLang('exitButtonLabel', frozenLang)}
          </button>

          {/* Score + streak */}
          <span className={`font-bold text-blue-600 ${isKids ? 'text-base' : 'text-sm'}`}>
            {tLang('quizScore', frozenLang)}: {score}
            {streak >= 2 && (
              <span className="ml-2 text-orange-500">🔥 {streak}</span>
            )}
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div
            className="bg-blue-500 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Question counter */}
        <div className={`text-center mt-1 text-gray-400 ${isKids ? 'text-xs' : 'text-xs'}`}>
          {tLang('quizQuestion_counter', frozenLang)} {current + 1} / {questions.length}
        </div>
      </div>

      {/* ── Main content: flag + question + choices ── */}
      {/* flex-1 + overflow-hidden keeps it inside the viewport */}
      <div className="flex-1 overflow-hidden flex flex-col items-center justify-center px-4 pb-3 max-w-lg mx-auto w-full">

        {/* Flag — smaller on mobile to save vertical space */}
        <div className="mb-3 rounded-xl overflow-hidden shadow-md border border-gray-100 bg-white flex-shrink-0">
          <img
            src={question.country.flag}
            alt={`Flag of ${question.country.name[frozenLang]}`}
            className={`object-cover ${isKids ? 'w-44 h-28' : 'w-36 h-24'}`}
          />
        </div>

        {/* Question text */}
        <div className="text-center mb-3 flex-shrink-0">
          <p className={`text-gray-500 ${isKids ? 'text-base' : 'text-xs'}`}>
            {tLang('quizQuestion', frozenLang)}
          </p>
          <h2 className={`font-extrabold text-gray-800 leading-tight ${isKids ? 'text-2xl' : 'text-xl'}`}>
            {question.country.name[frozenLang]}
          </h2>
        </div>

        {/* Answer choices */}
        <div className="w-full space-y-2 flex-shrink-0">
          {question.choices.map((choice, i) => {
            const isSelected  = selected === choice.label
            const showCorrect = isAnswered && choice.isCorrect
            const showWrong   = isAnswered && isSelected && !choice.isCorrect

            // Inline feedback: the chosen wrong button turns red, correct turns green
            let btnClass = 'bg-white border-2 border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50'
            if (showCorrect) btnClass = 'bg-green-500 border-2 border-green-500 text-white'
            if (showWrong)   btnClass = 'bg-red-400 border-2 border-red-400 text-white'

            return (
              <button
                key={i}
                onClick={() => handleAnswer(choice)}
                disabled={isAnswered}
                className={`
                  w-full rounded-xl px-4 font-semibold
                  transition-all duration-200
                  ${isKids ? 'py-3 text-lg' : 'py-2.5 text-sm'}
                  ${btnClass}
                  ${isAnswered ? 'cursor-default' : 'cursor-pointer active:scale-95'}
                `}
              >
                {/* Show checkmark/cross inline on answered buttons */}
                {isAnswered && showCorrect && <span className="mr-2">✓</span>}
                {isAnswered && showWrong   && <span className="mr-2">✗</span>}
                {choice.label}
              </button>
            )
          })}
        </div>

        {/* Feedback + Next — appears after answering, inline below choices */}
        {isAnswered && (
          <div className="mt-3 w-full flex items-center gap-3 flex-shrink-0">
            {/* Feedback text — compact, left-aligned */}
            <p className={`flex-1 font-bold ${isKids ? 'text-base' : 'text-sm'}`}>
              {answers[answers.length - 1]?.correct
                ? <span className="text-green-600">{tLang('quizCorrect', frozenLang)}</span>
                : (
                  <span className="text-red-500">
                    {tLang('quizCorrectAnswer', frozenLang)}: <strong>{question.correctCapital}</strong>
                  </span>
                )
              }
            </p>

            {/* Next / Finish button — right side, compact */}
            <button
              onClick={handleNext}
              className={`
                rounded-xl font-bold text-white flex-shrink-0
                bg-blue-500 hover:bg-blue-600
                transition-all duration-200 active:scale-95
                ${isKids ? 'px-5 py-3 text-base' : 'px-4 py-2.5 text-sm'}
              `}
            >
              {isLastQ ? tLang('finish', frozenLang) : tLang('next', frozenLang)} →
            </button>
          </div>
        )}
      </div>

      {/* ── Exit confirm dialog ── */}
      {showExitConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full text-center">
            <div className="text-4xl mb-3">🚪</div>
            <h3 className={`font-extrabold text-gray-800 mb-2 ${isKids ? 'text-2xl' : 'text-xl'}`}>
              {tLang('exitTitle', frozenLang)}
            </h3>
            <p className={`text-gray-500 mb-6 ${isKids ? 'text-lg' : 'text-sm'}`}>
              {tLang('exitMessage', frozenLang)}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowExitConfirm(false)}
                className={`
                  flex-1 rounded-xl font-bold
                  bg-gray-100 text-gray-600 hover:bg-gray-200
                  transition-all duration-200
                  ${isKids ? 'py-4 text-lg' : 'py-3 text-base'}
                `}
              >
                {tLang('exitCancel', frozenLang)}
              </button>
              <button
                onClick={handleExitConfirmed}
                className={`
                  flex-1 rounded-xl font-bold text-white
                  bg-red-400 hover:bg-red-500
                  transition-all duration-200
                  ${isKids ? 'py-4 text-lg' : 'py-3 text-base'}
                `}
              >
                {tLang('exitConfirm', frozenLang)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
