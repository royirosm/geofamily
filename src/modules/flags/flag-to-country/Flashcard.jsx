// src/modules/flags/country-to-flag/Flashcard.jsx
// Front: country name  →  Back: flag image

import FlashcardBase                      from '../../_shared/FlashcardBase'
import { generateCountryToFlagQuestions } from '../../../utils/questionGenerator'
import FlagImage                          from '../../../components/FlagImage'

const CONFIG = {
  moduleId:    'flags',
  direction:   'country-to-flag',
  accentColor: 'pink',
  generateFn:  generateCountryToFlagQuestions,

  getFront(question, lang) {
    const country = question.country
    return (
      <div className="flex flex-col items-center gap-3">
        <span className="text-5xl">🌍</span>
        <h2 className="font-extrabold text-gray-800 text-3xl text-center leading-tight">
          {country.name[lang] ?? country.name.en}
        </h2>
      </div>
    )
  },

  getBack(question, lang) {
    const country = question.country
    return (
      <div className="flex flex-col items-center gap-2 w-full">
        <div className="rounded-2xl overflow-hidden shadow-xl border-4 border-gray-100">
          <FlagImage
            src={country.flag}
            alt={`Flag of ${country.name[lang]}`}
            className="w-64 h-40 object-cover"
          />
        </div>
      </div>
    )
  },
}

export default function Flashcard({ countries }) {
  return <FlashcardBase countries={countries} config={CONFIG} />
}
