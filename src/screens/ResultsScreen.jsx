// ResultsScreen.jsx
// Shown after finishing a quiz round.
// Displays: circular score, message, full question breakdown, play again / home buttons.

import { useLocation, useNavigate } from 'react-router-dom'
import { useLanguage }              from '../context/LanguageContext'
import { useAgeMode }               from '../context/AgeModeContext'

export default function ResultsScreen() {
  const location = useLocation()
  const navigate = useNavigate()

  const { lang: liveLang, tLang } = useLanguage()
  const { ageMode: liveAgeMode }  = useAgeMode()

  const score         = location.state?.score   ?? 0
  const total         = location.state?.total   ?? 10
  const answers       = location.state?.answers ?? []
  const frozenLang    = location.state?.lang    ?? liveLang
  const frozenAgeMode = location.state?.ageMode ?? liveAgeMode
  const isKids        = frozenAgeMode === 'kids'

  const percentage = Math.round((score / total) * 100)

  function getMessage() {
    if (percentage === 100) return tLang('resultsPerfect', frozenLang)
    if (percentage >= 70)   return tLang('resultsGreat', frozenLang)
    if (percentage >= 40)   return tLang('resultsGood', frozenLang)
    return tLang('resultsKeepTrying', frozenLang)
  }

  function handlePlayAgain() {
    navigate('/quiz/capitals', {
      state: { lang: frozenLang, ageMode: frozenAgeMode },
    })
  }

  function handleHome() {
    navigate('/')
  }

  // Circular score ring
  const radius        = 54
  const circumference = 2 * Math.PI * radius
  const offset        = circumference - (percentage / 100) * circumference
  const ringColor     = percentage === 100 ? '#22c55e' : percentage >= 70 ? '#3b82f6' : '#f59e0b'

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 px-4 py-8">
      <div className="max-w-lg mx-auto space-y-6">

        {/* Score card */}
        <div className="bg-white rounded-3xl shadow-xl p-8 text-center">

          {/* Circular score */}
          <div className="flex justify-center mb-6">
            <div className="relative w-36 h-36">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle
                  cx="60" cy="60" r={radius}
                  fill="none" stroke="#e5e7eb" strokeWidth="10"
                />
                <circle
                  cx="60" cy="60" r={radius}
                  fill="none"
                  stroke={ringColor}
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`font-extrabold text-gray-800 ${isKids ? 'text-4xl' : 'text-3xl'}`}>
                  {score}
                </span>
                <span className="text-gray-400 text-sm">/ {total}</span>
              </div>
            </div>
          </div>

          <h2 className={`font-extrabold text-gray-800 mb-2 ${isKids ? 'text-3xl' : 'text-2xl'}`}>
            {tLang('resultsTitle', frozenLang)}
          </h2>
          <p className={`text-gray-500 mb-8 ${isKids ? 'text-xl' : 'text-base'}`}>
            {getMessage()}
          </p>

          {/* Buttons */}
          <div className="space-y-3">
            <button
              onClick={handlePlayAgain}
              className={`
                w-full rounded-xl font-bold text-white
                bg-blue-500 hover:bg-blue-600
                transition-all duration-200 active:scale-95
                ${isKids ? 'py-4 text-xl' : 'py-3 text-base'}
              `}
            >
              🔄 {tLang('tryAgain', frozenLang)}
            </button>
            <button
              onClick={handleHome}
              className={`
                w-full rounded-xl font-bold
                bg-gray-100 text-gray-600 hover:bg-gray-200
                transition-all duration-200 active:scale-95
                ${isKids ? 'py-4 text-xl' : 'py-3 text-base'}
              `}
            >
              🏠 {tLang('home', frozenLang)}
            </button>
          </div>
        </div>

        {/* Question breakdown */}
        {answers.length > 0 && (
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">

            {/* Section header */}
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className={`font-bold text-gray-700 ${isKids ? 'text-xl' : 'text-base'}`}>
                {tLang('resultsReview', frozenLang)}
              </h3>
            </div>

            {/* Answer rows */}
            <div className="divide-y divide-gray-50">
              {answers.map((answer, i) => {
                const country = answer.question.country
                const correct = answer.correct

                return (
                  <div
                    key={i}
                    className={`
                      flex items-center gap-4 px-6 py-4
                      ${correct ? 'bg-white' : 'bg-red-50'}
                    `}
                  >
                    {/* Flag */}
                    <img
                      src={country.flag}
                      alt={country.name[frozenLang]}
                      className="w-12 h-8 object-cover rounded-md shadow-sm flex-shrink-0"
                    />

                    {/* Country + answer info */}
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold text-gray-800 truncate ${isKids ? 'text-lg' : 'text-sm'}`}>
                        {country.name[frozenLang]}
                      </p>
                      {correct ? (
                        <p className={`text-green-600 ${isKids ? 'text-base' : 'text-xs'}`}>
                          {answer.question.correctCapital}
                        </p>
                      ) : (
                        <p className={`text-red-400 ${isKids ? 'text-base' : 'text-xs'}`}>
                          <span className="line-through mr-2">{answer.chosen}</span>
                          <span className="text-gray-600 font-medium">→ {answer.question.correctCapital}</span>
                        </p>
                      )}
                    </div>

                    {/* Result icon */}
                    <div className={`text-2xl flex-shrink-0 ${isKids ? 'text-3xl' : 'text-xl'}`}>
                      {correct ? '✅' : '❌'}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
