// src/modules/languages/find-country/Flashcard.jsx
// Front: language name  →  Back: canonical country + "also spoken in N" note
import FlashcardMultiBase                          from '../../_shared/FlashcardMultiBase'
import { generateLanguageFindCountryQuestions }    from '../../../utils/questionGeneratorLanguagesCities'
import FlagImage                                   from '../../../components/FlagImage'

const CONFIG = {
  moduleId:    'languages',
  direction:   'find-country',
  accentColor: 'indigo',
  generateFn:  generateLanguageFindCountryQuestions,
  getFront(question) {
    return (
      <div className="flex flex-col items-center gap-3">
        <div className="text-5xl">🗣️</div>
        <h2 className="font-extrabold text-gray-800 text-3xl text-center">{question.language}</h2>
        <p className="text-gray-400 text-sm font-medium">🌍 Name a country where this is spoken</p>
      </div>
    )
  },
  getBack(question, lang) {
    const country = question.country
    return (
      <div className="flex flex-col items-center gap-3 w-full">
        <div className="rounded-2xl overflow-hidden shadow-lg border-4 border-gray-100">
          <FlagImage src={country.flag} alt={`Flag of ${country.name[lang]}`} className="w-48 h-32 object-cover" />
        </div>
        <h2 className="font-extrabold text-gray-800 text-2xl text-center">{country.name[lang] || country.name.en}</h2>
        {question.otherValidCount > 0 && (
          <p className="text-indigo-600 text-sm font-semibold text-center">
            🌍 Also official in {question.otherValidCount} other {question.otherValidCount === 1 ? 'country' : 'countries'}
          </p>
        )}
      </div>
    )
  },
}

export default function Flashcard({ countries }) {
  return <FlashcardMultiBase countries={countries} config={CONFIG} />
}
