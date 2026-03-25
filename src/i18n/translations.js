const translations = {

  // --- General ---
  appName:   { en: 'GeoFamily', el: 'GeoFamily' },
  loading:   { en: 'Loading...', el: 'Φόρτωση...' },
  error:     { en: 'Something went wrong. Please try again.', el: 'Κάτι πήγε στραβά. Παρακαλώ δοκίμασε ξανά.' },
  back:      { en: 'Back', el: 'Πίσω' },
  play:      { en: 'Play', el: 'Παίξε' },
  start:     { en: 'Start', el: 'Ξεκίνα' },
  next:      { en: 'Next', el: 'Επόμενο' },
  finish:    { en: 'Finish', el: 'Τέλος' },
  tryAgain:  { en: 'Try Again', el: 'Ξαναπροσπάθησε' },
  home:      { en: 'Home', el: 'Αρχική' },

  // --- Age Mode ---
  kidsMode:     { en: 'Kids',     el: 'Παιδιά' },
  familiarMode:     { en: 'Familiar',   el: 'Γνώριμες'      },
  expertMode:       { en: 'Expert',     el: 'Ειδικός'        },
  familiarModeDesc: { en: '~100 well-known countries',  el: '~100 γνωστές χώρες'     },
  expertModeDesc:   { en: 'All ~235 countries & territories', el: 'Όλες οι ~235 χώρες' },

  // ── Kids unlock system ─────────────────────────────────────────────────────
  kidsNewCountries:  { en: 'new countries unlocked!',   el: 'νέες χώρες ξεκλειδώθηκαν!' },
  kidsUnlockedTitle: { en: '🎉 New countries unlocked!', el: '🎉 Νέες χώρες ξεκλειδώθηκαν!' },
  kidsUnlockedDesc:  { en: 'new countries added to your pool. Keep exploring!',
                       el: 'νέες χώρες προστέθηκαν. Συνέχισε την εξερεύνηση!'              },

  // ── General UI (if not already present) ───────────────────────────────────
  comingSoon: { en: 'Coming soon', el: 'Έρχεται σύντομα' },
  leaderboard: { en: 'Leaderboard', el: 'Κατάταξη' },

  // --- Settings ---
  settings:                  { en: 'Settings',           el: 'Ρυθμίσεις' },
  settingsQuestionsPerRound: { en: 'Questions per round', el: 'Ερωτήσεις ανά γύρο' },
  settingsDone:              { en: 'Done',               el: 'Εντάξει' },
  settingsPlayer:       { en: 'Player',           el: 'Παίκτης'             },
  settingsPlayerSwitch: { en: 'Tap to switch player', el: 'Πάτα για αλλαγή παίκτη' },

  // --- Home screen ---
  homeTitle:    { en: 'Learn Geography',          el: 'Μάθε Γεωγραφία' },
  homeSubtitle: { en: 'Fun for the whole family', el: 'Διασκέδαση για όλη την οικογένεια' },
  chooseModule: { en: 'Choose a topic',           el: 'Διάλεξε θέμα' },

  // --- Modules ---
  modulesCapitals: { en: 'Capitals', el: 'Πρωτεύουσες' },
  modulesFlags:    { en: 'Flags',    el: 'Σημαίες' },
  modulesCities:   { en: 'Cities',   el: 'Πόλεις' },
  modulesMapQuiz:  { en: 'Map Quiz', el: 'Κουίζ Χάρτη' },

  // --- Quiz ---
  quizQuestion:         { en: 'What is the capital of', el: 'Ποια είναι η πρωτεύουσα της' },
  quizQuestionOf:       { en: 'of',      el: 'της' },
  quizCorrect:          { en: 'Correct! 🎉', el: 'Σωστό! 🎉' },
  quizWrong:            { en: 'Not quite!',  el: 'Όχι ακριβώς!' },
  quizCorrectAnswer:    { en: 'Answer:',     el: 'Απάντηση:' },
  quizStreak:           { en: 'Streak',      el: 'Σερί' },
  quizScore:            { en: 'Score',       el: 'Σκορ' },
  quizQuestion_counter: { en: 'Q',           el: 'Ε' },
  exitButtonLabel:      { en: 'Quit',        el: 'Έξοδος' },

  // --- Exit dialog ---
  exitTitle:   { en: 'Quit the game?',           el: 'Έξοδος από το παιχνίδι;' },
  exitMessage: { en: 'Your progress will be lost.', el: 'Η πρόοδός σου θα χαθεί.' },
  exitCancel:  { en: 'Keep playing',             el: 'Συνέχεια' },
  exitConfirm: { en: 'Quit',                     el: 'Έξοδος' },

  // --- Results screen ---
  resultsTitle:      { en: 'Round complete!',                         el: 'Ο γύρος τελείωσε!' },
  resultsScore:      { en: 'You got',                                 el: 'Πήρες' },
  resultsOutOf:      { en: 'out of',                                  el: 'από' },
  resultsPerfect:    { en: 'Perfect score! Amazing! 🏆',              el: 'Τέλειο σκορ! Απίθανο! 🏆' },
  resultsGreat:      { en: 'Great job! Keep it up! 🌟',               el: 'Μπράβο! Συνέχισε έτσι! 🌟' },
  resultsGood:       { en: 'Good effort! Practice makes perfect! 💪', el: 'Καλή προσπάθεια! Η εξάσκηση φέρνει τελειότητα! 💪' },
  resultsKeepTrying: { en: "Keep trying, you'll get there! 😊",       el: 'Συνέχισε να προσπαθείς, θα τα καταφέρεις! 😊' },
  resultsReview:     { en: 'Review',                                  el: 'Ανασκόπηση' },

  // --- Regions ---
  regionAll:      { en: 'All',      el: 'Όλες' },
  regionEurope:   { en: 'Europe',   el: 'Ευρώπη' },
  regionAsia:     { en: 'Asia',     el: 'Ασία' },
  regionAfrica:   { en: 'Africa',   el: 'Αφρική' },
  regionAmericas: { en: 'Americas', el: 'Αμερική' },
  regionOceania:  { en: 'Oceania',  el: 'Ωκεανία' },

  // --- Player profiles ---
  playerWhoIsPlaying:   { en: "Who's playing?",                el: 'Ποιος παίζει;' },
  playerPickOrAdd:      { en: 'Pick a player or add a new one', el: 'Διάλεξε παίκτη ή πρόσθεσε νέο' },
  playerAdd:            { en: 'Add player',                    el: 'Νέος παίκτης' },
  playerEditTitle:      { en: 'Edit player',                   el: 'Επεξεργασία παίκτη' },
  playerName:           { en: 'Name',                          el: 'Όνομα' },
  playerNamePlaceholder:{ en: 'Enter a name…',                 el: 'Γράψε ένα όνομα…' },
  playerNameRequired:   { en: 'Please enter a name',           el: 'Παρακαλώ γράψε ένα όνομα' },
  playerNameTaken:      { en: 'That name is already taken',    el: 'Αυτό το όνομα χρησιμοποιείται ήδη' },
  playerAvatar:         { en: 'Choose an avatar',              el: 'Διάλεξε avatar' },
  playerAvatarBg:       { en: 'Avatar background',             el: 'Χρώμα avatar' },
  playerAccentColor:    { en: 'Profile colour',                el: 'Χρώμα προφίλ' },
  playerAddConfirm:     { en: "Let's go!",                     el: 'Πάμε!' },
  playerSaveEdit:       { en: 'Save',                          el: 'Αποθήκευση' },
  playerAddCancel:      { en: 'Cancel',                        el: 'Ακύρωση' },
  playerDeleteConfirm:  { en: 'Delete',                        el: 'Διαγραφή' },
  playerDeleteYes:      { en: 'Yes, delete',                   el: 'Ναι, διαγραφή' },
  playerDeleteNo:       { en: 'Keep',                          el: 'Όχι' },
  playerSwitch:         { en: 'Switch player',                 el: 'Αλλαγή παίκτη' },

  // --- Player stats (profile card) ---
  playerStatRounds:   { en: 'rounds',   el: 'γύροι' },
  playerStatAccuracy: { en: 'accuracy', el: 'ακρίβεια' },
  playerStatMastered: { en: 'mastered', el: 'έχεις μάθει' },

  // --- Level / title ---
  levelNew:        { en: 'New',        el: 'Νέος' },
  levelBeginner:   { en: 'Beginner',   el: 'Αρχάριος' },
  levelLearner:    { en: 'Learner',    el: 'Μαθητής' },
  levelPractising: { en: 'Practising', el: 'Εξασκούμενος' },
  levelAdvanced:   { en: 'Advanced',   el: 'Προχωρημένος' },
  levelMaster:     { en: 'Master',     el: 'Μαέστρος' },

  // --- Strength levels ---
  strengthNew:        { en: 'New',        el: 'Νέο' },
  strengthBeginner:   { en: 'Beginner',   el: 'Αρχάριο' },
  strengthLearner:    { en: 'Learner',    el: 'Μαθαίνεται' },
  strengthPractising: { en: 'Practising', el: 'Εξάσκηση' },
  strengthAdvanced:   { en: 'Advanced',   el: 'Προχωρημένο' },
  strengthMaster:     { en: 'Master',     el: 'Μαέστρο' },

  // --- Stats screen ---
  statsTitle:         { en: 'My Stats',                          el: 'Οι Στατιστικές μου' },
  statsRounds:        { en: 'Rounds played',                     el: 'Γύροι' },
  statsAccuracy:      { en: 'Accuracy',                          el: 'Ακρίβεια' },
  statsSeen:          { en: 'Countries seen',                    el: 'Χώρες που είδες' },
  statsMastered:      { en: 'Mastered',                          el: 'Έχεις μάθει' },
  statsModules:       { en: 'By module',                         el: 'Ανά θέμα' },
  statsRegions:       { en: 'Strength by region',                el: 'Δύναμη ανά περιοχή' },
  statsMostMissed:    { en: 'Most missed',                       el: 'Πιο δύσκολες' },
  statsCountries:     { en: 'Country breakdown',                 el: 'Ανά χώρα' },
  statsNoData:        { en: 'No countries match this filter',    el: 'Δεν βρέθηκαν χώρες' },
  statsEmptyTitle:    { en: 'No data yet!',                      el: 'Δεν υπάρχουν δεδομένα ακόμα!' },
  statsEmptySubtitle: { en: 'Play a round to start tracking your progress', el: 'Παίξε έναν γύρο για να ξεκινήσεις' },
  statsPlayNow:       { en: 'Play now',                          el: 'Παίξε τώρα' },
  statsTabOverview:    { en: 'Overview',   el: 'Σύνοψη'  },
  statsTabCountries:   { en: 'Countries',  el: 'Χώρες'   },
  statsTabGameMode:    { en: 'Game Mode',  el: 'Είδος'   },
  statsCountriesCount: { en: 'countries',  el: 'χώρες'   },

  // --- Filter ---
  filterAll: { en: 'All', el: 'Όλα' },

  // --- Family code (Settings modal) ---
  settingsFamilyCode:            { en: 'Family Code',                                     el: 'Κωδικός Οικογένειας' },
  settingsFamilyCodeHint:        { en: 'Share this code with family members so your scores appear on the same leaderboard.', el: 'Μοιράσου αυτόν τον κωδικό με την οικογένειά σου για να εμφανίζεστε στο ίδιο leaderboard.' },
  settingsFamilyCodePlaceholder: { en: 'e.g. LION-42',                                    el: 'π.χ. LION-42' },
  settingsFamilyCodeSave:        { en: 'Save',                                             el: 'Αποθήκευση' },
  settingsFamilyCodeGenerate:    { en: 'Generate a code for me',                           el: 'Δημιούργησε κωδικό' },
  settingsFamilyCodeClear:       { en: 'Leave family',                                     el: 'Αποχώρηση' },
  settingsFamilyCodeActive:      { en: 'Active',                                           el: 'Ενεργός' },
  settingsFamilyCodeCurrent:     { en: 'Your family code',                                 el: 'Κωδικός οικογένειάς σου' },
  settingsFamilyCodeTooShort:    { en: 'Code must be at least 3 characters',               el: 'Ο κωδικός πρέπει να έχει τουλάχιστον 3 χαρακτήρες' },

  // --- Leaderboard screen ---
  leaderboardTitle:       { en: 'Leaderboard',                  el: 'Κατάταξη' },
  leaderboardTabFamily:   { en: 'Family',                       el: 'Οικογένεια' },
  leaderboardTabGlobal:   { en: 'Global',                       el: 'Παγκόσμιο' },
  leaderboardEmpty:       { en: 'No scores yet — play a round!', el: 'Δεν υπάρχουν σκορ ακόμα — παίξε έναν γύρο!' },
  leaderboardNoFamily:    { en: 'Set a family code in Settings to see your family leaderboard.', el: 'Ορίσε κωδικό οικογένειας στις Ρυθμίσεις για να δεις την κατάταξη της οικογένειάς σου.' },
  leaderboardRounds:      { en: 'rounds',                       el: 'γύροι' },
  leaderboardYou:         { en: 'You',                          el: 'Εσύ' },
  leaderboardGoSettings:  { en: 'Go to Settings',               el: 'Άνοιξε Ρυθμίσεις' },
  leaderboardLoading:     { en: 'Loading scores…',              el: 'Φόρτωση σκορ…' },
  leaderboardError:       { en: 'Could not load scores. Check your connection.', el: 'Δεν ήταν δυνατή η φόρτωση. Έλεγξε τη σύνδεσή σου.' },
  leaderboardOffline:     { en: 'You\'re offline — showing last known scores.', el: 'Είσαι εκτός σύνδεσης — εμφανίζονται τα τελευταία γνωστά σκορ.' },

  // --- Home screen leaderboard button ---
  homeLeaderboard:        { en: 'Leaderboard',                  el: 'Κατάταξη' },

  // --- Ranking types ---
  rankMostPlayed:        { en: 'Most Played',        el: 'Περισσότεροι Γύροι' },
  rankMostAccurate:      { en: 'Most Accurate',      el: 'Ακρίβεια' },
  rankMostMastered:      { en: 'Most Mastered',      el: 'Περισσότερες Χώρες' },
  rankBestScore:         { en: 'Best Score',         el: 'Καλύτερο Σκορ' },
  rankCapitalsPlayed:    { en: 'Capitals Played',    el: 'Πρωτεύουσες' },
  rankCapitalsAccuracy:  { en: 'Capitals Accuracy',  el: 'Ακρίβεια Πρωτευουσών' },
  rankMasteredSuffix:    { en: 'mastered',           el: 'χώρες' },
  rankScoreSuffix:       { en: 'pts',                el: 'πόντοι' },
  rankGroupGeneral:      { en: 'General',           el: 'Γενικά'              },
  rankGroupCapitals:     { en: 'Capitals',           el: 'Πρωτεύουσες'         },

  // ── ModuleSelectScreen ─────────────────────────────────────────────────────
  moduleSelectSubtitle:   { en: 'How do you want to play?',       el: 'Πώς θέλεις να παίξεις;' },
  moduleSelectStep1:      { en: 'Choose a direction',             el: 'Διάλεξε κατεύθυνση' },
  moduleSelectStep2:      { en: 'Choose a game type',             el: 'Διάλεξε είδος παιχνιδιού' },
  moduleSelectStep3:      { en: 'Choose a region',   el: 'Διάλεξε περιοχή' },
  moduleSelectComingSoon: { en: 'More game types coming!', el: 'Σύντομα περισσότερα παιχνίδια!' },

  // ── Direction labels — Capitals ────────────────────────────────────────────
  dirFindCapital:         { en: 'Find the Capital',               el: 'Βρες την Πρωτεύουσα' },
  dirFindCapitalDesc:     { en: 'Given a country — name its capital', el: 'Δίνεται χώρα — βρες την πρωτεύουσα' },
  dirFindCountry:         { en: 'Find the Country',              el: 'Βρες τη Χώρα' },
  dirFindCountryDesc:     { en: 'Given a capital — name its country', el: 'Δίνεται πρωτεύουσα — βρες τη χώρα' },

  // ── Direction labels — Flags ───────────────────────────────────────────────
  dirFlagToCountry:       { en: 'Flag → Country',                el: 'Σημαία → Χώρα' },
  dirFlagToCountryDesc:   { en: 'Given a flag — name its country', el: 'Δίνεται σημαία — βρες τη χώρα' },
  dirCountryToFlag:       { en: 'Country → Flag',                el: 'Χώρα → Σημαία' },
  dirCountryToFlagDesc:   { en: 'Given a country — pick its flag', el: 'Δίνεται χώρα — βρες τη σημαία' },

  // ── Mode labels ────────────────────────────────────────────────────────────
  modeMultipleChoice:     { en: 'Multiple Choice',               el: 'Πολλαπλή Επιλογή' },
  modeTypeAnswer:         { en: 'Type Answer',                   el: 'Πληκτρολόγηση' },
  modeFlashcard:          { en: 'Flashcard',                     el: 'Κάρτες' },

  // ── Quiz prompts — new directions ─────────────────────────────────────────
  quizReverseQuestion:      { en: 'Which country has this capital?', el: 'Ποια χώρα έχει αυτή την πρωτεύουσα;' },
  quizFlagQuestion:         { en: 'Which country does this flag belong to?', el: 'Σε ποια χώρα ανήκει αυτή η σημαία;' },
  quizCountryToFlagQuestion:{ en: 'Which is the flag of',         el: 'Ποια είναι η σημαία της' },

  // ── Leaderboard — Flags ranking labels (add to RANKING_TYPES) ─────────────
  // These labelKeys are referenced in useLeaderboard.js RANKING_TYPES entries:
  flagsRankingPlayed:    { en: 'Flags Played',    el: 'Γύροι Σημαιών' },
  flagsRankingAccuracy:  { en: 'Flags Accuracy',  el: 'Ακρίβεια Σημαιών' },

  // ── Type Answer UI ─────────────────────────────────────────────────────────
  typeAnswerPlaceholder: { en: 'Type your answer…',   el: 'Γράψε την απάντησή σου…' },
  typeAnswerSubmit:      { en: 'Submit',               el: 'Υποβολή'                 },
  typeAnswerClose:       { en: 'Almost!',              el: 'Σχεδόν!'                 },

  // ── Hint system ────────────────────────────────────────────────────────────
  typeAnswerHint:        { en: 'Hint',                 el: 'Βοήθεια'                },
  typeAnswerHintLeft:    { en: 'left',                 el: 'απομένουν'              },
  typeAnswerHintMax:     { en: 'No hints left',        el: 'Δεν υπάρχουν άλλες βοήθειες' },

  // ── Results review — Type Answer shows what the player typed ───────────────
  typeAnswerYouTyped:    { en: 'You typed:',           el: 'Έγραψες:'               },

  flashcardTapToReveal:  { en: 'Tap to reveal answer',  el: 'Πάτα για να δεις την απάντηση' },
  flashcardReveal:       { en: 'Reveal Answer',          el: 'Αποκάλυψη Απάντησης'           },
  flashcardAnswer:       { en: 'Answer',                 el: 'Απάντηση'                      },
  flashcardGotIt:        { en: 'Got it!',                el: 'Το ξέρω!'                      },
  flashcardNotYet:       { en: 'Not yet',                el: 'Όχι ακόμα'                     },
  flashcardMarkedGot:    { en: 'Marked as learned',      el: 'Σημειώθηκε ως γνωστό'         },
  flashcardMarkedNotYet: { en: 'Keep practising',        el: 'Συνέχισε την εξάσκηση'         },
  flashcardProgress:     { en: 'Card',                   el: 'Κάρτα'                         },

  // ── Module names ───────────────────────────────────────────────────────────
  modulesSovereignty: { en: 'Sovereignty',    el: 'Κυριαρχία'       },

  // ── Sovereignty directions ─────────────────────────────────────────────────
  dirCountryOrTerritory:     { en: 'Country or Territory?', el: 'Χώρα ή Έδαφος;'      },
  dirCountryOrTerritoryDesc: { en: 'Is this place an independent country or a territory?',
                               el: 'Αυτό το μέρος είναι ανεξάρτητη χώρα ή έδαφος;'    },
  dirFindSovereign:          { en: 'Find the Governing Country', el: 'Βρες τη Μητρόπολη' },
  dirFindSovereignDesc:      { en: 'Which country governs this territory?',
                               el: 'Ποια χώρα διοικεί αυτό το έδαφος;'                 },

  // ── Sovereignty game UI ────────────────────────────────────────────────────
  sovCountry:            { en: 'Country',              el: 'Χώρα'                          },
  sovTerritory:          { en: 'Territory',             el: 'Έδαφος'                        },
  sovCorrectAnswer:      { en: 'Correct answer',        el: 'Σωστή απάντηση'                },
  sovFindSovereignPrompt:{ en: 'Which country governs this territory?',
                           el: 'Ποια χώρα διοικεί αυτό το έδαφος;'                         },

  // ── Family Sync section in SettingsModal ──────────────────────────────────────
  syncTitle:                { en: 'Family Sync',                          el: 'Συγχρονισμός Οικογένειας' },
  syncActive:               { en: 'Active',                               el: 'Ενεργό' },
  syncHint:                 { en: 'Link devices so your whole family shares players and progress.',
                            el: 'Συνδέστε συσκευές για να μοιράζεστε παίκτες και πρόοδο.' },
  syncCreate:               { en: 'Create a family',                      el: 'Δημιουργία οικογένειας' },
  syncCreateHint:           { en: 'Give your family a name for the leaderboard.',
                            el: 'Δώστε ένα όνομα για την κατάταξη.' },
  syncCreateConfirm:        { en: 'Create',                               el: 'Δημιουργία' },
  syncFamilyNamePlaceholder:{ en: 'e.g. The Smiths',                      el: 'π.χ. Οικογένεια Παπαδόπουλου' },
  syncJoin:                 { en: 'Join with a PIN',                      el: 'Σύνδεση με PIN' },
  syncJoinHint:             { en: 'Enter the 6-digit PIN shown on the other device.',
                            el: 'Πληκτρολογήστε το 6ψήφιο PIN που εμφανίζεται στην άλλη συσκευή.' },
  syncJoinConfirm:          { en: 'Join',                                 el: 'Σύνδεση' },
  syncLinkDevice:           { en: 'Link another device',                  el: 'Σύνδεση άλλης συσκευής' },
  syncLeave:                { en: 'Leave family',                         el: 'Αποχώρηση από οικογένεια' },
  syncFamilyActive:         { en: 'Syncing across devices',               el: 'Συγχρονισμός σε όλες τις συσκευές' },
  syncUnnamedFamily:        { en: 'My Family',                            el: 'Η Οικογένειά μου' },

  // ── PIN display ───────────────────────────────────────────────────────────────
  syncPinLabel:             { en: 'Enter this PIN on the other device:',  el: 'Εισάγετε αυτό το PIN στην άλλη συσκευή:' },
  syncPinExpiry:            { en: 'Valid for 10 minutes',                 el: 'Ισχύει για 10 λεπτά' },
  syncPinDismiss:           { en: 'Dismiss',                              el: 'Κλείσιμο' },

  // ── PIN error messages ────────────────────────────────────────────────────────
  syncPinNotFound:          { en: 'PIN not found. Check and try again.',  el: 'Το PIN δεν βρέθηκε. Ελέγξτε και δοκιμάστε ξανά.' },
  syncPinExpired:           { en: 'PIN has expired. Generate a new one.', el: 'Το PIN έληξε. Δημιουργήστε νέο.' },
  syncPinInvalid:           { en: 'Enter a 6-digit PIN.',                 el: 'Εισάγετε 6ψήφιο PIN.' },
  syncPinNetwork:           { en: 'Network error. Try again.',            el: 'Σφάλμα δικτύου. Δοκιμάστε ξανά.' },

  syncPinNoFamily:   { en: 'No family set up yet.',                       el: 'Δεν έχει οριστεί οικογένεια.' },
  syncLeaveTitle:    { en: 'Leave family?',                               el: 'Αποχώρηση από οικογένεια;' },
  syncLeaveWarning:  { en: 'Your data stays on this device, but sync will stop. To rejoin you\'ll need a new PIN.',
                     el: 'Τα δεδομένα σας παραμένουν στη συσκευή, αλλά ο συγχρονισμός θα σταματήσει. Για επανασύνδεση θα χρειαστείτε νέο PIN.' },
  syncLeaveConfirm:  { en: 'Leave',                                       el: 'Αποχώρηση' },

  // --- Settings modal (Phase 9) ---
  settingsTitle:          { en: 'Settings',                          el: 'Ρυθμίσεις' },
  settingsSwitchPlayer:   { en: 'Switch',                            el: 'Αλλαγή' },

  // --- Per-player family sync (Phase 9) ---
  syncFamilyTitle:        { en: 'Family sync',                       el: 'Συγχρονισμός οικογένειας' },
  syncGuestLabel:         { en: 'Guest — local only',                el: 'Επισκέπτης — μόνο τοπικά' },
  syncGeneratePin:        { en: 'Add device',                        el: 'Προσθήκη συσκευής' },
  syncChangeFamily:       { en: 'Change family',                     el: 'Αλλαγή οικογένειας' },
  syncSharePin:           { en: 'Share this PIN (10 min)',            el: 'Μοιράσου αυτό το PIN (10 λεπτά)' },
  syncDismiss:            { en: 'Dismiss',                           el: 'Κλείσιμο' },
  syncDeviceDefaultFamily:{ en: 'Device default family',             el: 'Προεπιλογή οικογένειας συσκευής' },
  syncDeviceDefaultHint:  { en: 'New players automatically join this family.',
                            el: 'Οι νέοι παίκτες εντάσσονται αυτόματα σε αυτήν.' },
  syncPlayerFamilyHint:   { en: 'Each player can have their own family — edit a player profile to change it.',
                            el: 'Κάθε παίκτης μπορεί να έχει δική του οικογένεια — επεξεργάσου το προφίλ.' },
  syncPinGenerateFailed:  { en: 'Could not generate PIN.',           el: 'Αδυναμία δημιουργίας PIN.' },
  syncLeaveWarningDevice: { en: 'This removes the device default family. Players keep their own family settings.',
                            el: 'Αφαιρεί μόνο την προεπιλογή. Οι παίκτες διατηρούν τις ρυθμίσεις τους.' },

  // --- Handle (Phase 9.5) ---
  handleTitle:        { en: 'Public handle',                     el: 'Δημόσιο όνομα χρήστη'          },
  handleHint:         { en: 'Optional — used on leaderboards & for friends',
                        el: 'Προαιρετικό — εμφανίζεται στις κατατάξεις'                               },
  handleSet:          { en: 'Set a handle',                      el: 'Ορισμός ονόματος'               },
  handleChange:       { en: 'Change handle',                     el: 'Αλλαγή ονόματος'                },
  handleClaim:        { en: 'Claim',                             el: 'Αποθήκευση'                     },
  handleTaken:        { en: 'Already taken — try another.',      el: 'Χρησιμοποιείται ήδη — δοκίμασε άλλο.' },
  handleTooShort:     { en: 'At least 2 characters.',            el: 'Τουλάχιστον 2 χαρακτήρες.'      },
  handleInvalidChars: { en: 'Letters, numbers and _ only.',      el: 'Μόνο γράμματα, αριθμοί και _.'  },

  // ── Module labels ─────────────────────────────────────────────────────────────
  modulesCurrencies:  { en: 'Currencies',     el: 'Νομίσματα'       },
  modulesCodes:       { en: 'Country Codes',  el: 'Κωδικοί Χωρών'   },
  modulesRegions:     { en: 'Regions',        el: 'Περιοχές'         },

  // ── Direction labels — Currencies ─────────────────────────────────────────────
  dirFindCurrency:             { en: 'Find the Currency',          el: 'Βρες το Νόμισμα'               },
  dirFindCurrencyDesc:         { en: 'Given a country — name its currency', el: 'Δίνεται χώρα — βρες το νόμισμα' },
  dirFindCountryByCurrencyDesc:{ en: 'Given a currency — name a country that uses it', el: 'Δίνεται νόμισμα — βρες χώρα που το χρησιμοποιεί' },

  // ── Direction labels — Codes ───────────────────────────────────────────────────
  dirFindCode:                 { en: 'Find the Code',              el: 'Βρες τον Κωδικό'               },
  dirFindCodeDesc:             { en: 'Given a country — name its 2-letter code', el: 'Δίνεται χώρα — βρες τον κωδικό' },
  dirFindCountryByCodeDesc:    { en: 'Given a code — name the country',          el: 'Δίνεται κωδικός — βρες τη χώρα' },

  // ── Direction labels — Regions ────────────────────────────────────────────────
  dirFindRegion:               { en: 'Find the Region',            el: 'Βρες την Περιοχή'              },
  dirFindRegionDesc:           { en: 'Given a country — name its region', el: 'Δίνεται χώρα — βρες την περιοχή' },
  dirFindCountryByRegionDesc:  { en: 'Given a region — name a country in it', el: 'Δίνεται περιοχή — βρες χώρα μέσα σε αυτή' },

  // ── Multi-valid feedback note ─────────────────────────────────────────────────
  // {n} is replaced at runtime with the count of other valid countries
  alsoValidAnswers:   { en: 'Also correct: {n} other countries', el: 'Επίσης σωστό: {n} άλλες χώρες' },

  // ── Region display names (used by t(`region${r}`) in CountriesTab) ────────────
  regionAfrica:                  { en: 'Africa',                   el: 'Αφρική'                  },
  regionAmericas:                { en: 'Americas',                 el: 'Αμερική'                 },
  regionAsia:                    { en: 'Asia',                     el: 'Ασία'                    },
  regionEurope:                  { en: 'Europe',                   el: 'Ευρώπη'                  },
  regionOceania:                 { en: 'Oceania',                  el: 'Ωκεανία'                 },

  // ── Module labels ─────────────────────────────────────────────────────────────
  modulesCurrencies:  { en: 'Currencies',     el: 'Νομίσματα'       },
  modulesCodes:       { en: 'Country Codes',  el: 'Κωδικοί Χωρών'   },
  modulesRegions:     { en: 'Regions',        el: 'Περιοχές'         },

  // ── Direction labels — Currencies ─────────────────────────────────────────────
  dirFindCurrency:             { en: 'Find the Currency',          el: 'Βρες το Νόμισμα'               },
  dirFindCurrencyDesc:         { en: 'Given a country — name its currency', el: 'Δίνεται χώρα — βρες το νόμισμα' },
  dirFindCountryByCurrencyDesc:{ en: 'Given a currency — name a country that uses it', el: 'Δίνεται νόμισμα — βρες χώρα που το χρησιμοποιεί' },

  // ── Direction labels — Codes ───────────────────────────────────────────────────
  dirFindCode:                 { en: 'Find the Code',              el: 'Βρες τον Κωδικό'               },
  dirFindCodeDesc:             { en: 'Given a country — name its 2-letter code', el: 'Δίνεται χώρα — βρες τον κωδικό' },
  dirFindCountryByCodeDesc:    { en: 'Given a code — name the country',          el: 'Δίνεται κωδικός — βρες τη χώρα' },

  // ── Direction labels — Regions ────────────────────────────────────────────────
  dirFindRegion:               { en: 'Find the Region',            el: 'Βρες την Περιοχή'              },
  dirFindRegionDesc:           { en: 'Given a country — name its region', el: 'Δίνεται χώρα — βρες την περιοχή' },
  dirFindCountryByRegionDesc:  { en: 'Given a region — name a country in it', el: 'Δίνεται περιοχή — βρες χώρα μέσα σε αυτή' },

  // ── Multi-valid feedback note ─────────────────────────────────────────────────
  // {n} is replaced at runtime with the count of other valid countries
  alsoValidAnswers:   { en: 'Also correct: {n} other countries', el: 'Επίσης σωστό: {n} άλλες χώρες' },

  // ── Region display names (used by t(`region${r}`) in CountriesTab) ────────────
  regionAfrica:                  { en: 'Africa',                   el: 'Αφρική'                  },
  regionAmericas:                { en: 'Americas',                 el: 'Αμερική'                 },
  regionAsia:                    { en: 'Asia',                     el: 'Ασία'                    },
  regionEurope:                  { en: 'Europe',                   el: 'Ευρώπη'                  },
  regionOceania:                 { en: 'Oceania',                  el: 'Ωκεανία'                 },

  // ── Wave 2: Languages + Cities ────────────────────────────────────────────────
  modulesLanguages:             { en: 'Languages',                  el: 'Γλώσσες'                        },
  modulesCities:                { en: 'Major Cities',               el: 'Μεγάλες Πόλεις'                 },

  dirFindLanguage:              { en: 'Find the Language',          el: 'Βρες τη Γλώσσα'                 },
  dirFindLanguageDesc:          { en: 'Given a country — name its official language', el: 'Δίνεται χώρα — βρες την επίσημη γλώσσα' },
  dirFindCountryByLanguageDesc: { en: 'Given a language — name a country that speaks it', el: 'Δίνεται γλώσσα — βρες χώρα που τη μιλά' },

  dirFindCity:                  { en: 'Find a City',                el: 'Βρες Πόλη'                      },
  dirFindCityDesc:              { en: 'Given a country — name a major city', el: 'Δίνεται χώρα — βρες μεγάλη πόλη' },
  dirFindCountryByCityDesc:     { en: 'Given a city — name its country', el: 'Δίνεται πόλη — βρες τη χώρα'  },

}



export default translations
