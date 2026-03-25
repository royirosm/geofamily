// src/modules/codes/find-code/Flashcard.jsx
// Front: country flag + name  →  Back: 2-letter code in large display

import FlashcardBase                     from '../../_shared/FlashcardBase'
import { generateCodeFindCodeQuestions } from '../../../utils/questionGeneratorPhase10'
import FlagImage                         from '../../../components/FlagImage'

const CONFIG = {
  moduleId:    'codes',
  direction:   'find-code',
  accentColor: 'blue',
  generateFn:  generateCodeFindCodeQuestions,

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
        <p className="text-gray-400 text-sm font-medium">🔤 What is the country code?</p>
      </div>
    )
  },

  getBack(question, lang) {
    const country = question.country
    return (
      <div className="flex flex-col items-center gap-4 w-full">
        {/* Large code display */}
        <div className="px-8 py-4 bg-blue-50 rounded-2xl border-2 border-blue-200">
          <span className="font-extrabold text-blue-700 text-5xl tracking-widest">
            {question.correctAnswer}
          </span>
        </div>
        <h2 className="font-semibold text-gray-600 text-lg text-center">
          {country.name[lang] || country.name.en}
        </h2>
      </div>
    )
  },
}

export default function Flashcard({ countries }) {
  return <FlashcardBase countries={countries} config={CONFIG} />
}
