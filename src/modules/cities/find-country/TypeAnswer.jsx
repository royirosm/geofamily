// src/modules/cities/find-country/TypeAnswer.jsx — one correct answer
import TypeAnswerBase                          from '../../_shared/TypeAnswerBase'
import { generateCityFindCountryQuestions }    from '../../../utils/questionGeneratorLanguagesCities'

const CONFIG = {
  moduleId:    'cities',
  direction:   'find-country',
  accentColor: 'rose',
  generateFn:  generateCityFindCountryQuestions,
  getQuestion(question, lang) {
    return {
      correctAnswer:  question.correctAnswer,
      stimulusLabel:  question.cityName,
      stimulus: (
        <div className="flex flex-col items-center gap-3">
          <div className="text-6xl">🏙️</div>
          <h2 className="font-extrabold text-gray-800 text-2xl text-center">{question.cityName}</h2>
          <p className="text-gray-400 text-sm font-medium">🌍 Which country is this city in?</p>
        </div>
      ),
    }
  },
}

export default function TypeAnswer({ countries }) {
  return <TypeAnswerBase countries={countries} config={CONFIG} />
}
