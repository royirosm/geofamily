// src/modules/codes/find-country/Flashcard.jsx
// Front: 2-letter code  →  Back: country flag + name

import FlashcardBase                         from '../../_shared/FlashcardBase'
import { generateCodeFindCountryQuestions }  from '../../../utils/questionGeneratorPhase10'
import FlagImage                             from '../../../components/FlagImage'

const CONFIG = {
  moduleId:    'codes',
  direction:   'find-country',
  accentColor: 'blue',
  generateFn:  generateCodeFindCountryQuestions,

  getFront(question, lang) {
    const { country } = question
    return (
      <div className="flex flex-col items-center gap-3">
        <div className="px-8 py-5 bg-blue-50 rounded-2xl border-2 border-blue-200">
          <span className="font-extrabold text-blue-700 text-5xl tracking-widest">
            {country.code}
          </span>
        </div>
        <p className="text-gray-400 text-sm font-medium">🌍 Which country has this code?</p>
      </div>
    )
  },

  getBack(question, lang) {
    const country = question.country
    return (
      <div className="flex flex-col items-center gap-4 w-full">
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
        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-bold tracking-wider">
          {country.code}
        </span>
      </div>
    )
  },
}

export default function Flashcard({ countries }) {
  return <FlashcardBase countries={countries} config={CONFIG} />
}
