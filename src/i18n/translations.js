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

  // --- Settings ---
  settings: {
    en: 'Settings',
    el: 'Ρυθμίσεις',
  },
  settingsQuestionsPerRound: {
    en: 'Questions per round',
    el: 'Ερωτήσεις ανά γύρο',
  },
  settingsDone: {
    en: 'Done',
    el: 'Εντάξει',
  },

  // --- Player profiles ---
  playerWhoIsPlaying: {
    en: "Who's playing?",
    el: 'Ποιος παίζει;',
  },
  playerPickOrAdd: {
    en: 'Pick a player or add a new one',
    el: 'Διάλεξε παίκτη ή πρόσθεσε νέο',
  },
  playerAdd: {
    en: 'Add player',
    el: 'Νέος παίκτης',
  },
  playerName: {
    en: 'Name',
    el: 'Όνομα',
  },
  playerNamePlaceholder: {
    en: 'Enter a name…',
    el: 'Γράψε ένα όνομα…',
  },
  playerNameRequired: {
    en: 'Please enter a name',
    el: 'Παρακαλώ γράψε ένα όνομα',
  },
  playerNameTaken: {
    en: 'That name is already taken',
    el: 'Αυτό το όνομα χρησιμοποιείται ήδη',
  },
  playerAvatar: {
    en: 'Choose an avatar',
    el: 'Διάλεξε avatar',
  },
  playerAddConfirm: {
    en: "Let's go!",
    el: 'Πάμε!',
  },
  playerAddCancel: {
    en: 'Cancel',
    el: 'Ακύρωση',
  },
  playerDeleteConfirm: {
    en: 'Delete',
    el: 'Διαγραφή',
  },
  playerDeleteYes: {
    en: 'Yes, delete',
    el: 'Ναι, διαγραφή',
  },
  playerDeleteNo: {
    en: 'Keep',
    el: 'Όχι',
  },
  playerSwitch: {
    en: 'Switch player',
    el: 'Αλλαγή παίκτη',
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
    en: 'Answer:',
    el: 'Απάντηση:',
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
    en: 'Q',
    el: 'Ε',
  },

  // --- Exit button label (in quiz top bar) ---
  exitButtonLabel: {
    en: 'Quit',
    el: 'Έξοδος',
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
    en: "Keep trying, you'll get there! 😊",
    el: 'Συνέχισε να προσπαθείς, θα τα καταφέρεις! 😊',
  },
  resultsReview: {
    en: 'Review',
    el: 'Ανασκόπηση',
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

}

export default translations
