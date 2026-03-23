// src/modules/capitals/find-country/Flashcard.jsx
// Front: capital city name  →  Back: country name + flag

import FlashcardBase                from '../../_shared/FlashcardBase'
import { generateReverseQuestions } from '../../../utils/questionGenerator'
import FlagImage                    from '../../../components/FlagImage'

const CONFIG = {
  moduleId:    'capitals',
  direction:   'find-country',
  accentColor: 'indigo',
  generateFn:  generateReverseQuestions,

  getFront(question, lang) {
    const capital = question.correctCapital
    return (
      <div className="flex flex-col items-center gap-3">
        <span className="text-5xl">🏙️</span>
        <h2 className="font-extrabold text-gray-800 text-3xl text-center leading-tight">
          {capital}
        </h2>
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
          {country.name[lang] ?? country.name.en}
        </h2>
      </div>
    )
  },
}

export default function Flashcard({ countries }) {
  return <FlashcardBase countries={countries} config={CONFIG} />
}
