// src/modules/languages/find-language/Flashcard.jsx
// Front: country flag + name  →  Back: language name
import FlashcardBase                               from '../../_shared/FlashcardBase'
import { generateLanguageFindLanguageQuestions }   from '../../../utils/questionGeneratorLanguagesCities'
import FlagImage                                   from '../../../components/FlagImage'

const CONFIG = {
  moduleId:    'languages',
  direction:   'find-language',
  accentColor: 'indigo',
  generateFn:  generateLanguageFindLanguageQuestions,
  getFront(question, lang) {
    const country = question.country
    return (
      <div className="flex flex-col items-center gap-3">
        <div className="rounded-2xl overflow-hidden shadow-lg border-4 border-gray-100">
          <FlagImage src={country.flag} alt={`Flag of ${country.name[lang]}`} className="w-48 h-32 object-cover" />
        </div>
        <h2 className="font-extrabold text-gray-800 text-2xl text-center">{country.name[lang] || country.name.en}</h2>
        <p className="text-gray-400 text-sm font-medium">🗣️ What is the official language?</p>
      </div>
    )
  },
  getBack(question) {
    return (
      <div className="flex flex-col items-center gap-3">
        <div className="text-5xl">🗣️</div>
        <h2 className="font-extrabold text-gray-800 text-3xl text-center">{question.correctAnswer}</h2>
      </div>
    )
  },
}

export default function Flashcard({ countries }) {
  return <FlashcardBase countries={countries} config={CONFIG} />
}
