// src/modules/cities/find-city/Flashcard.jsx
// Front: country flag + name  →  Back: canonical city + "+ N other cities" note
import FlashcardMultiBase                      from '../../_shared/FlashcardMultiBase'
import { generateCityFindCityQuestions }       from '../../../utils/questionGeneratorLanguagesCities'
import FlagImage                               from '../../../components/FlagImage'

const CONFIG = {
  moduleId:    'cities',
  direction:   'find-city',
  accentColor: 'rose',
  generateFn:  generateCityFindCityQuestions,
  getFront(question, lang) {
    const country = question.country
    return (
      <div className="flex flex-col items-center gap-3">
        <div className="rounded-2xl overflow-hidden shadow-lg border-4 border-gray-100">
          <FlagImage src={country.flag} alt={`Flag of ${country.name[lang]}`} className="w-48 h-32 object-cover" />
        </div>
        <h2 className="font-extrabold text-gray-800 text-2xl text-center">{country.name[lang] || country.name.en}</h2>
        <p className="text-gray-400 text-sm font-medium">🏙️ Name a major city</p>
      </div>
    )
  },
  getBack(question, lang) {
    const { correctAnswer, otherValidCount, cityList } = question
    return (
      <div className="flex flex-col items-center gap-3 w-full">
        <div className="text-5xl">🏙️</div>
        <h2 className="font-extrabold text-gray-800 text-3xl text-center">{correctAnswer}</h2>
        {otherValidCount > 0 && (
          <p className="text-rose-600 text-sm font-semibold text-center">
            + {otherValidCount} other major {otherValidCount === 1 ? 'city' : 'cities'} in this country
          </p>
        )}
        {/* Show the full city list as a subtle hint */}
        {cityList && cityList.length > 1 && (
          <p className="text-gray-400 text-xs text-center px-4">
            {cityList.slice(1).join(' · ')}
          </p>
        )}
      </div>
    )
  },
}

export default function Flashcard({ countries }) {
  return <FlashcardMultiBase countries={countries} config={CONFIG} />
}
