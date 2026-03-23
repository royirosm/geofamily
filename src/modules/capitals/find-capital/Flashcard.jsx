// src/modules/capitals/find-capital/Flashcard.jsx
// Front: country flag + name  →  Back: capital city name

import FlashcardBase         from '../../_shared/FlashcardBase'
import { generateQuestions } from '../../../utils/questionGenerator'
import FlagImage             from '../../../components/FlagImage'

const CONFIG = {
  moduleId:    'capitals',
  direction:   'find-capital',
  accentColor: 'blue',
  generateFn:  generateQuestions,

  getFront(question, lang) {
    const country = question.country
    return (
      <div className="flex flex-col items-center gap-4 w-full">
        <div className="rounded-2xl overflow-hidden shadow-lg border-4 border-gray-100">
          <FlagImage
            src={country.flag}
            alt={`Flag of ${country.name[lang]}`}
            className="w-56 h-36 object-cover"
          />
        </div>
        <h2 className="font-extrabold text-gray-800 text-2xl text-center leading-tight">
          {country.name[lang] ?? country.name.en}
        </h2>
      </div>
    )
  },

  getBack(question, lang) {
    const capital = question.correctCapital ?? question.correctAnswer
    return (
      <div className="flex flex-col items-center gap-2">
        <span className="text-5xl">🏛️</span>
        <h2 className="font-extrabold text-gray-800 text-3xl text-center leading-tight">
          {capital}
        </h2>
      </div>
    )
  },
}

export default function Flashcard({ countries }) {
  return <FlashcardBase countries={countries} config={CONFIG} />
}
