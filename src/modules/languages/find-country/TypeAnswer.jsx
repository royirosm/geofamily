// src/modules/languages/find-country/TypeAnswer.jsx — multi-valid
import TypeAnswerMultiBase                         from '../../_shared/TypeAnswerMultiBase'
import { generateLanguageFindCountryQuestions }    from '../../../utils/questionGeneratorLanguagesCities'

const CONFIG = {
  moduleId:    'languages',
  direction:   'find-country',
  accentColor: 'indigo',
  generateFn:  generateLanguageFindCountryQuestions,
  getQuestion(question, lang) {
    return {
      correctAnswer:   question.correctAnswer,
      acceptedAnswers: question.acceptedAnswers,
      otherValidCount: question.otherValidCount,
      stimulusLabel:   question.language,
      stimulus: (
        <div className="flex flex-col items-center gap-3">
          <div className="text-6xl">🗣️</div>
          <h2 className="font-extrabold text-gray-800 text-2xl text-center">{question.language}</h2>
          <p className="text-gray-400 text-sm font-medium">🌍 Name any country where this is the official language</p>
        </div>
      ),
    }
  },
}

export default function TypeAnswer({ countries }) {
  return <TypeAnswerMultiBase countries={countries} config={CONFIG} />
}
