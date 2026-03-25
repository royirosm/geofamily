// src/modules/languages/find-language/TypeAnswer.jsx
import TypeAnswerBase                              from '../../_shared/TypeAnswerBase'
import { generateLanguageFindLanguageQuestions }   from '../../../utils/questionGeneratorLanguagesCities'
import FlagImage                                   from '../../../components/FlagImage'

const CONFIG = {
  moduleId:    'languages',
  direction:   'find-language',
  accentColor: 'indigo',
  generateFn:  generateLanguageFindLanguageQuestions,
  getQuestion(question, lang) {
    const country = question.country
    return {
      correctAnswer:  question.correctAnswer,
      stimulusLabel:  country.name[lang] || country.name.en,
      stimulus: (
        <div className="flex flex-col items-center gap-3">
          <div className="rounded-2xl overflow-hidden shadow-xl border-4 border-white">
            <FlagImage src={country.flag} alt={`Flag of ${country.name[lang]}`} className="w-56 h-36 object-cover" />
          </div>
          <h2 className="font-extrabold text-gray-800 text-2xl text-center">
            {country.name[lang] || country.name.en}
          </h2>
          <p className="text-gray-400 text-sm font-medium">🗣️ What is the official language?</p>
        </div>
      ),
    }
  },
}

export default function TypeAnswer({ countries }) {
  return <TypeAnswerBase countries={countries} config={CONFIG} />
}
