// translations.js
// All UI strings for the app in English and Greek.
// Usage: const { t } = useLanguage(); then t('key')
// Add new keys here as new screens are built — never hardcode strings in components.

const translations = {

  // --- General ---
  appName: {
    en: 'GeoFamily',
    el: 'GeoFamily',
  },
  loading: {
    en: 'Loading...',
    el: 'Φόρτωση...',
  },
  error: {
    en: 'Something went wrong. Please try again.',
    el: 'Κάτι πήγε στραβά. Παρακαλώ δοκίμασε ξανά.',
  },
  back: {
    en: 'Back',
    el: 'Πίσω',
  },
  play: {
    en: 'Play',
    el: 'Παίξε',
  },
  start: {
    en: 'Start',
    el: 'Ξεκίνα',
  },
  next: {
    en: 'Next',
    el: 'Επόμενο',
  },
  finish: {
    en: 'Finish',
    el: 'Τέλος',
  },
  tryAgain: {
    en: 'Try Again',
    el: 'Ξαναπροσπάθησε',
  },
  home: {
    en: 'Home',
    el: 'Αρχική',
  },

  // --- Age Mode toggle ---
  kidsMode: {
    en: 'Kids',
    el: 'Παιδιά',
  },
  explorerMode: {
    en: 'Explorer',
    el: 'Εξερευνητής',
  },

  // --- Home screen ---
  homeTitle: {
    en: 'Learn Geography',
    el: 'Μάθε Γεωγραφία',
  },
  homeSubtitle: {
    en: 'Fun for the whole family',
    el: 'Διασκέδαση για όλη την οικογένεια',
  },
  chooseModule: {
    en: 'Choose a topic',
    el: 'Διάλεξε θέμα',
  },

  // --- Modules ---
  modulesCapitals: {
    en: 'Capitals',
    el: 'Πρωτεύουσες',
  },
  modulesFlags: {
    en: 'Flags',
    el: 'Σημαίες',
  },
  modulesCities: {
    en: 'Cities',
    el: 'Πόλεις',
  },
  modulesMapQuiz: {
    en: 'Map Quiz',
    el: 'Κουίζ Χάρτη',
  },

  // --- Quiz ---
  quizQuestion: {
    en: 'What is the capital of',
    el: 'Ποια είναι η πρωτεύουσα της',
  },
  quizQuestionOf: {
    // Used for languages where word order differs
    en: 'of',
    el: 'της',
  },
  quizCorrect: {
    en: 'Correct! 🎉',
    el: 'Σωστό! 🎉',
  },
  quizWrong: {
    en: 'Not quite!',
    el: 'Όχι ακριβώς!',
  },
  quizCorrectAnswer: {
    en: 'The answer was',
    el: 'Η απάντηση ήταν',
  },
  quizStreak: {
    en: 'Streak',
    el: 'Σερί',
  },
  quizScore: {
    en: 'Score',
    el: 'Σκορ',
  },
  quizQuestion_counter: {
    en: 'Question',
    el: 'Ερώτηση',
  },

  // --- Results screen ---
  resultsTitle: {
    en: 'Round complete!',
    el: 'Ο γύρος τελείωσε!',
  },
  resultsScore: {
    en: 'You got',
    el: 'Πήρες',
  },
  resultsOutOf: {
    en: 'out of',
    el: 'από',
  },
  resultsPerfect: {
    en: 'Perfect score! Amazing! 🏆',
    el: 'Τέλειο σκορ! Απίθανο! 🏆',
  },
  resultsGreat: {
    en: 'Great job! Keep it up! 🌟',
    el: 'Μπράβο! Συνέχισε έτσι! 🌟',
  },
  resultsGood: {
    en: 'Good effort! Practice makes perfect! 💪',
    el: 'Καλή προσπάθεια! Η εξάσκηση φέρνει τελειότητα! 💪',
  },
  resultsKeepTrying: {
    en: 'Keep trying, you\'ll get there! 😊',
    el: 'Συνέχισε να προσπαθείς, θα τα καταφέρεις! 😊',
  },

  // --- Regions (for filtering) ---
  regionAll: {
    en: 'All regions',
    el: 'Όλες οι περιοχές',
  },
  regionEurope: {
    en: 'Europe',
    el: 'Ευρώπη',
  },
  regionAsia: {
    en: 'Asia',
    el: 'Ασία',
  },
  regionAfrica: {
    en: 'Africa',
    el: 'Αφρική',
  },
  regionAmericas: {
    en: 'Americas',
    el: 'Αμερική',
  },
  regionOceania: {
    en: 'Oceania',
    el: 'Ωκεανία',
  },

  resultsReview: {
    en: 'Review',
    el: 'Ανασκόπηση',
  },

  // --- Exit dialog ---
  exitTitle: {
    en: 'Quit the game?',
    el: 'Έξοδος από το παιχνίδι;',
  },
  exitMessage: {
    en: 'Your progress will be lost.',
    el: 'Η πρόοδός σου θα χαθεί.',
  },
  exitCancel: {
    en: 'Keep playing',
    el: 'Συνέχεια',
  },
  exitConfirm: {
    en: 'Quit',
    el: 'Έξοδος',
  },

}

export default translations
