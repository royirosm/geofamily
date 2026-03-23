// src/modules/flags/flag-to-country/Flashcard.jsx
// Front: large flag image  →  Back: country name

import FlashcardBase                     from '../../_shared/FlashcardBase'
import { generateFlagToCountryQuestions } from '../../../utils/questionGenerator'
import FlagImage                          from '../../../components/FlagImage'

const CONFIG = {
  moduleId:    'flags',
  direction:   'flag-to-country',
  accentColor: 'rose',
  generateFn:  generateFlagToCountryQuestions,

  getFront(question, lang) {
    const country = question.country
    return (
      <div className="flex flex-col items-center gap-2 w-full">
        <div className="rounded-2xl overflow-hidden shadow-xl border-4 border-gray-100">
          <FlagImage
            src={country.flag}
            alt="Which country is this?"
            className="w-64 h-40 object-cover"
          />
        </div>
      </div>
    )
  },

  getBack(question, lang) {
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
}

export default function Flashcard({ countries }) {
  return <FlashcardBase countries={countries} config={CONFIG} />
}
