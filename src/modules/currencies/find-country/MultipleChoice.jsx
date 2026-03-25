// src/modules/currencies/find-country/MultipleChoice.jsx
// Stimulus: currency name  →  pick a country that uses it

import MultipleChoiceBase                        from '../../_shared/MultipleChoiceBase'
import { generateCurrencyFindCountryQuestions }  from '../../../utils/questionGeneratorPhase10'

const CONFIG = {
  moduleId:    'currencies',
  direction:   'find-country',
  accentColor: 'amber',
  generateFn:  generateCurrencyFindCountryQuestions,

  getStimulus(question, lang, isKids) {
    const { currencyName, currencyCode } = question
    return (
      <div className="flex flex-col items-center gap-3">
        <div className="text-6xl">💰</div>
        <h2 className={`font-extrabold text-gray-800 text-center leading-tight ${isKids ? 'text-3xl' : 'text-2xl'}`}>
          {currencyName}
        </h2>
        <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-bold tracking-wider">
          {currencyCode}
        </span>
        <p className="text-gray-400 text-sm font-medium">🌍 Name a country that uses this currency</p>
      </div>
    )
  },
}

export default function MultipleChoice({ countries }) {
  return <MultipleChoiceBase countries={countries} config={CONFIG} />
}
