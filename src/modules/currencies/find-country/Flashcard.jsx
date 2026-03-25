// src/modules/currencies/find-country/Flashcard.jsx
// Front: currency name + code
// Back:  canonical country flag + name  +  "also used by N other countries" note

import FlashcardMultiBase                        from '../../_shared/FlashcardMultiBase'
import { generateCurrencyFindCountryQuestions }  from '../../../utils/questionGeneratorPhase10'
import FlagImage                                 from '../../../components/FlagImage'

const CONFIG = {
  moduleId:    'currencies',
  direction:   'find-country',
  accentColor: 'amber',
  generateFn:  generateCurrencyFindCountryQuestions,

  getFront(question, lang) {
    const { currencyName, currencyCode } = question
    return (
      <div className="flex flex-col items-center gap-3">
        <div className="text-5xl">💰</div>
        <h2 className="font-extrabold text-gray-800 text-3xl text-center leading-tight">
          {currencyName}
        </h2>
        <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-bold tracking-wider">
          {currencyCode}
        </span>
        <p className="text-gray-400 text-sm font-medium">🌍 Name a country that uses this</p>
      </div>
    )
  },

  getBack(question, lang) {
    const country         = question.country   // canonical country
    const { otherValidCount } = question

    return (
      <div className="flex flex-col items-center gap-3 w-full">
        <div className="rounded-2xl overflow-hidden shadow-lg border-4 border-gray-100">
          <FlagImage
            src={country.flag}
            alt={`Flag of ${country.name[lang]}`}
            className="w-48 h-32 object-cover"
          />
        </div>
        <h2 className="font-extrabold text-gray-800 text-2xl text-center leading-tight">
          {country.name[lang] || country.name.en}
        </h2>
        {otherValidCount > 0 && (
          <p className="text-amber-600 text-sm font-semibold text-center">
            🌍 Also used by {otherValidCount} other {otherValidCount === 1 ? 'country' : 'countries'}
          </p>
        )}
      </div>
    )
  },
}

export default function Flashcard({ countries }) {
  return <FlashcardMultiBase countries={countries} config={CONFIG} />
}
