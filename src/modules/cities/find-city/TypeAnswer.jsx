// src/modules/cities/find-city/TypeAnswer.jsx — multi-valid
import TypeAnswerMultiBase                     from '../../_shared/TypeAnswerMultiBase'
import { generateCityFindCityQuestions }       from '../../../utils/questionGeneratorLanguagesCities'
import FlagImage                               from '../../../components/FlagImage'

const CONFIG = {
  moduleId:    'cities',
  direction:   'find-city',
  accentColor: 'rose',
  generateFn:  generateCityFindCityQuestions,
  getQuestion(question, lang) {
    const country = question.country
    return {
      correctAnswer:   question.correctAnswer,
      acceptedAnswers: question.acceptedAnswers,
      otherValidCount: question.otherValidCount,
      stimulusLabel:   country.name[lang] || country.name.en,
      stimulus: (
        <div className="flex flex-col items-center gap-3">
          <div className="rounded-2xl overflow-hidden shadow-xl border-4 border-white">
            <FlagImage src={country.flag} alt={`Flag of ${country.name[lang]}`} className="w-56 h-36 object-cover" />
          </div>
          <h2 className="font-extrabold text-gray-800 text-2xl text-center">
            {country.name[lang] || country.name.en}
          </h2>
          <p className="text-gray-400 text-sm font-medium">🏙️ Name any major city in this country</p>
        </div>
      ),
    }
  },
}

export default function TypeAnswer({ countries }) {
  return <TypeAnswerMultiBase countries={countries} config={CONFIG} />
}
