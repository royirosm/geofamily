// src/modules/currencies/find-currency/Flashcard.jsx
// Front: country flag + name  →  Back: currency name + code

import FlashcardBase                              from '../../_shared/FlashcardBase'
import { generateCurrencyFindCurrencyQuestions }  from '../../../utils/questionGeneratorPhase10'
import FlagImage                                  from '../../../components/FlagImage'
import { CURRENCY_NAMES }                         from '../../../data/currencies'

const CONFIG = {
  moduleId:    'currencies',
  direction:   'find-currency',
  accentColor: 'amber',
  generateFn:  generateCurrencyFindCurrencyQuestions,

  getFront(question, lang) {
    const country = question.country
    return (
      <div className="flex flex-col items-center gap-3">
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
        <p className="text-gray-400 text-sm font-medium">💰 What is the currency?</p>
      </div>
    )
  },

  getBack(question, lang) {
    const code        = question.currencyCode
    const name        = question.correctAnswer
    const symbol      = code  // show code as badge since we don't store symbol

    return (
      <div className="flex flex-col items-center gap-3 w-full">
        <div className="text-5xl">💰</div>
        <h2 className="font-extrabold text-gray-800 text-3xl text-center leading-tight">
          {name}
        </h2>
        <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-bold tracking-wider">
          {code}
        </span>
      </div>
    )
  },
}

export default function Flashcard({ countries }) {
  return <FlashcardBase countries={countries} config={CONFIG} />
}
