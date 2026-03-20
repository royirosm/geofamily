// MultipleChoice.jsx
// Capitals quiz screen.
// Reads lang + ageMode from route state (frozen at quiz start by HomeScreen).
// Includes an exit button with confirm dialog to return to home.

import { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate }    from 'react-router-dom'
import { useLanguage }                 from '../../context/LanguageContext'
import { useAgeMode }                  from '../../context/AgeModeContext'
import { generateQuestions }           from '../../utils/questionGenerator'

const QUESTIONS_PER_ROUND = 10

export default function MultipleChoice({ countries }) {
  const location = useLocation()
  const navigate = useNavigate()

  const { lang: liveLang, tLang }  = useLanguage()
  const { ageMode: liveAgeMode }   = useAgeMode()
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
      setQuestions(generateQuestions(countries, frozenLang, frozenAgeMode, QUESTIONS_PER_ROUND))
    }
  }, [countries, frozenLang, frozenAgeMode])

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

  const progress = (current / questions.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col">

      {/* Progress bar + counter + exit button */}
      <div className="w-full px-4 pt-4">
        <div className="flex justify-between items-center mb-2">

          {/* Exit button */}
          <button
            onClick={() => setShowExitConfirm(true)}
            className={`
              flex items-center gap-1 text-gray-400 hover:text-red-400
              transition-colors duration-200
              ${isKids ? 'text-base' : 'text-sm'}
            `}
          >
            ✕ {tLang('back', frozenLang)}
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
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Question counter below bar */}
        <div className={`text-center mt-1 text-gray-400 ${isKids ? 'text-sm' : 'text-xs'}`}>
          {tLang('quizQuestion_counter', frozenLang)} {current + 1} / {questions.length}
        </div>
      </div>

      {/* Question card */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-6 max-w-lg mx-auto w-full">

        {/* Flag */}
        <div className="mb-6 rounded-2xl overflow-hidden shadow-lg border border-gray-100 bg-white">
          <img
            src={question.country.flag}
            alt={`Flag of ${question.country.name[frozenLang]}`}
            className={`object-cover ${isKids ? 'w-48 h-32' : 'w-40 h-28'}`}
          />
        </div>

        {/* Question text */}
        <div className="text-center mb-8">
          <p className={`text-gray-500 mb-1 ${isKids ? 'text-lg' : 'text-sm'}`}>
            {tLang('quizQuestion', frozenLang)}
          </p>
          <h2 className={`font-extrabold text-gray-800 ${isKids ? 'text-3xl' : 'text-2xl'}`}>
            {question.country.name[frozenLang]}
          </h2>
        </div>

        {/* Answer choices */}
        <div className="w-full space-y-3">
          {question.choices.map((choice, i) => {
            const isSelected  = selected === choice.label
            const showCorrect = isAnswered && choice.isCorrect
            const showWrong   = isAnswered && isSelected && !choice.isCorrect

            let btnClass = 'bg-white border-2 border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50'
            if (showCorrect) btnClass = 'bg-green-500 border-2 border-green-500 text-white'
            if (showWrong)   btnClass = 'bg-red-400 border-2 border-red-400 text-white'

            return (
              <button
                key={i}
                onClick={() => handleAnswer(choice)}
                disabled={isAnswered}
                className={`
                  w-full rounded-xl px-5 font-semibold
                  transition-all duration-200
                  ${isKids ? 'py-4 text-xl' : 'py-3 text-base'}
                  ${btnClass}
                  ${isAnswered ? 'cursor-default' : 'cursor-pointer active:scale-95'}
                `}
              >
                {choice.label}
              </button>
            )
          })}
        </div>

        {/* Feedback + Next */}
        {isAnswered && (
          <div className="mt-6 w-full text-center animate-fade-in">
            <p className={`font-bold mb-4 ${isKids ? 'text-2xl' : 'text-lg'}`}>
              {answers[answers.length - 1]?.correct
                ? <span className="text-green-600">{tLang('quizCorrect', frozenLang)}</span>
                : (
                  <span className="text-red-500">
                    {tLang('quizWrong', frozenLang)} {tLang('quizCorrectAnswer', frozenLang)}: <strong>{question.correctCapital}</strong>
                  </span>
                )
              }
            </p>
            <button
              onClick={handleNext}
              className={`
                w-full rounded-xl font-bold text-white
                bg-blue-500 hover:bg-blue-600
                transition-all duration-200 active:scale-95
                ${isKids ? 'py-4 text-xl' : 'py-3 text-base'}
              `}
            >
              {isLastQ ? tLang('finish', frozenLang) : tLang('next', frozenLang)} →
            </button>
          </div>
        )}
      </div>

      {/* Exit confirm dialog */}
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
