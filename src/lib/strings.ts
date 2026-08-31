// All user-facing copy, in Swedish. Keep everything here so tone stays consistent.

export const S = {
  appName: 'Oscars Stora Bonanza',
  tagline: 'Kvällens frågesport – spela, satsa, vinn!',

  // Main menu
  menu: {
    play: 'Spela',
    edit: 'Redigera',
    settings: 'Inställningar',
    players: (n: number) => (n === 1 ? '1 spelare' : `${n} spelare`),
    noPlayers: 'Inga spelare än',
    boardLabel: 'Spelplan',
    rounds: 'Runda 1 → Runda 2 (dubbla poäng) → Final',
    startHint: 'Lägg till spelare och frågor i Redigera innan ni kör igång.',
  },

  // Generic buttons
  btn: {
    back: 'Tillbaka',
    close: 'Stäng',
    save: 'Spara',
    cancel: 'Avbryt',
    delete: 'Ta bort',
    add: 'Lägg till',
    done: 'Klar',
    reveal: 'Visa svaret',
    next: 'Nästa',
    confirm: 'Bekräfta',
    play: 'Spela',
    edit: 'Redigera',
  },

  // Board / play
  board: {
    title: 'Spelplan',
    round1: 'Runda 1',
    round2: 'Runda 2 · Dubbla poäng',
    toRound2: 'Till Runda 2',
    round1Done: 'Runda 1 klar – dags för dubbla poäng!',
    toBet: 'Till Budrundan',
    round2Done: 'Runda 2 klar – dags att satsa!',
    finalCta: 'Till Final-Bonanza',
    finalReady: 'Alla frågor klara – dags för finalen!',
    empty: 'Spelplanen är tom. Lägg till kategorier i Redigera.',
  },

  // Clue view
  clue: {
    forLabel: 'för',
    who: 'Vem svarade?',
    correct: 'Rätt!',
    wrong: 'Fel',
    reveal: 'Visa svaret',
    noOne: 'Ingen svarade rätt',
    keyHint:
      'Tangenter: Mellanslag = visa svar · 1–9 = rätt · Skift + 1–9 = fel · Esc = stäng · ⌘Z = ångra',
  },

  // Contestant intros
  intro: {
    title: 'Kvällens deltagare',
    skip: 'Klicka eller tryck på mellanslag för att hoppa över',
    skipBtn: 'Hoppa över',
    start: 'Kör igång!',
  },

  // Category reveal at the start of each board round
  catIntro: {
    counter: (i: number, n: number) => `Kategori ${i} av ${n}`,
    hint: 'Klicka eller tryck mellanslag för nästa · ← tillbaka · Esc hoppar över',
    next: 'Nästa',
    back: 'Tillbaka',
    start: 'Kör igång!',
  },

  // End-of-night awards
  awards: {
    title: 'Kvällens utmärkelser',
    sharpshooter: 'Kvällens kanon',
    mostWrong: 'Mest fel',
    risktaker: 'Störst risktagare',
    surveyKing: 'Enkätkungen',
  },

  // Undo
  undo: {
    label: 'Ångra',
    tooltip: (what: string) => `Ångra ${what} (⌘Z)`,
    none: 'Inget att ångra',
  },

  // Betting ("closest guess") round between Round 2 and the Final
  bet: {
    title: 'Budrundan',
    subtitle: 'Satsa – och gissa närmast!',
    themeLabel: 'Tema',
    betPhase: 'Lägg era bud (max 1000 eller er poäng)',
    betFor: (name: string) => `${name} satsar`,
    max: 'Max',
    showQuestion: 'Visa frågan',
    guessPhase: 'Skriv era gissningar',
    guessFor: (name: string) => `${name} gissar`,
    guessPlaceholder: 'Ditt svar (siffra)…',
    reveal: 'Avslöja svaret',
    answerLabel: 'Rätt svar',
    closest: 'Närmast!',
    noGuesses: 'Ingen gissade – inga bud drogs.',
    won: (amt: number) => `+${amt}`,
    lost: (amt: number) => `−${amt}`,
    toFinal: 'Till Final',
  },

  // Final round (survey / "Family Feud"-style)
  final: {
    title: 'Final-Bonanza',
    subtitle: 'Gissa det populäraste svaret!',
    intro: 'De två bästa spelarna möts i finalen.',
    goesFirst: (name: string) => `${name} börjar (flest poäng)`,
    resetNote: 'Poängen nollställs – finalen avgör allt!',
    start: 'Starta finalen',
    needTwo: 'Det behövs minst två spelare för finalen.',
    needQuestions: 'Finalen saknar frågor. Lägg till dem under Redigera → Final.',
    turnOf: (name: string) => `${name} svarar`,
    questionOf: (i: number, n: number) => `Fråga ${i} av ${n}`,
    answerPlaceholder: 'Skriv spelarens svar…',
    alreadyTaken: 'Redan taget av den andra spelaren – välj ett annat svar.',
    hideNote: 'Spelare 1:s svar är dolda.',
    handoverTitle: 'Byt spelare',
    handoverBody: (name: string) => `Lämna över till ${name}. Spelare 1:s svar är dolda.`,
    handoverGo: 'Jag är redo',
    toReveal: 'Till avslöjandet',
    reveal: 'Avslöja',
    revealTitle: 'Avslöjande',
    revealNext: 'Avslöja nästa',
    nextQuestion: 'Nästa fråga',
    noMatch: 'Inte på tavlan',
    finish: 'Kora vinnaren',
    winner: (name: string) => `${name} vinner Oscars Stora Bonanza!`,
    tie: 'Oavgjort – dela på segern!',
    playAgain: 'Spela igen',
    backToMenu: 'Till menyn',
    points: 'poäng',
  },

  // Editor
  editor: {
    title: 'Redigera',
    tabBoard: 'Spelplan',
    tabPlayers: 'Spelare',
    tabBet: 'Budrunda',
    tabFinal: 'Final',
    tabData: 'Säkerhetskopia',

    betIntro: 'En enda fråga med numeriskt svar. Temat visas, spelarna satsar, sedan visas frågan – närmast vinner.',
    betTheme: 'Tema (visas före frågan)',
    betQuestion: 'Fråga',
    betAnswer: 'Rätt svar (siffra)',

    boardName: 'Namn på spelplanen',
    addCategory: 'Lägg till kategori',
    categoryTitle: 'Kategorinamn',
    cluePrompt: 'Fråga (visas för spelarna)',
    clueAnswer: 'Rätt svar',
    clueValue: 'Värde',
    clueImage: 'Bild (valfritt)',
    removeImage: 'Ta bort bild',
    addClue: 'Lägg till fråga',
    deleteCategory: 'Ta bort kategori',
    emptyClue: '(tom)',

    playerName: 'Namn',
    addPlayer: 'Lägg till spelare',
    uploadPhoto: 'Ladda upp bild',
    changePhoto: 'Byt bild',

    boardRound1: 'Runda 1',
    boardRound2: 'Runda 2 (dubbla poäng)',

    finalIntro: 'Enkätfrågor: spelarna gissar det populäraste svaret. Poäng = svarets %.',
    addFinalQuestion: 'Lägg till finalfråga',
    deleteFinalQuestion: 'Ta bort fråga',
    finalQuestionPrompt: 'Finalfråga',
    finalAnswerText: 'Svar',
    finalAnswerPoints: 'Poäng (%)',
    addFinalAnswer: 'Lägg till svar',

    export: 'Exportera till fil',
    import: 'Importera från fil',
    exportHint: 'Ladda ner allt (spelplan, spelare, final) som en JSON-fil.',
    importHint: 'Läs in en tidigare sparad JSON-fil. Ersätter allt nuvarande innehåll.',
    importDone: 'Import klar!',
    importError: 'Kunde inte läsa filen. Är det rätt JSON?',
  },

  // Settings
  settings: {
    title: 'Inställningar',
    sound: 'Ljudeffekter',
    music: 'Musik',
    musicHint: 'Lägg mp3-filer i mappen public/audio/ (t.ex. background.mp3). Saknas filen spelas ingen musik.',
    soundOn: 'På',
    soundOff: 'Av',
    resetGame: 'Nollställ omgång',
    resetGameHint: 'Nollställer poäng och öppnar alla rutor igen. Behåller frågor och spelare.',
    resetGameConfirm: 'Nollställa poäng och alla rutor?',
    reseed: 'Återställ exempelinnehåll',
    reseedHint: 'Raderar allt och laddar exempel-spelplanen på nytt.',
    reseedConfirm: 'Radera allt och ladda exempelinnehållet?',
  },
};
