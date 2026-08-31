// Swedish sample content, loaded on first run so the app is playable immediately.
import type { Board, BetRound, FinalRound, Player } from '../types';
import { uid, AVATAR_COLORS } from './id';

const VALUES = [100, 200, 300, 400, 500];
const VALUES_2 = [200, 400, 600, 800, 1000];

function cat(
  title: string,
  rows: Array<[string, string]>,
  values: number[] = VALUES,
): Board['categories'][number] {
  return {
    id: uid(),
    title,
    clues: rows.map(([prompt, answer], i) => ({
      id: uid(),
      value: values[i],
      prompt,
      answer,
    })),
  };
}

export function makeSeedBoard(): Board {
  const board: Board = {
    id: uid(),
    name: 'Runda 1 – Bonanza',
    categories: [
      cat('Sverige', [
        ['Denna stad är Sveriges huvudstad.', 'Stockholm'],
        ['Sveriges längsta flod, ofta kallad landets nationalälv.', 'Klarälven'],
        ['Ön i Östersjön där man firar med surströmming och Almedalen.', 'Gotland'],
        ['Antalet landskap i Sverige.', '25'],
        ['Sjön som är Sveriges största till ytan.', 'Vänern'],
      ]),
      cat('Film & TV', [
        ['Regissören bakom "Fanny och Alexander".', 'Ingmar Bergman'],
        ['Grön Star Wars-mästare som talar bakvänt.', 'Yoda'],
        ['Svensk deckarserie med Kurt Wallander i Ystad.', 'Wallander'],
        ['Pixarfilmen om en clownfisk som söker sin son.', 'Hitta Nemo'],
        ['Skådespelaren som spelar Wolverine i X-Men-filmerna.', 'Hugh Jackman'],
      ]),
      cat('Mat & Godis', [
        ['Svensk kladdig chokladkaka utan pinne.', 'Kladdkaka'],
        ['Krispigt bröd som ofta äts till frukost i Sverige.', 'Knäckebröd'],
        ['Fredagens klassiker framför tv:n.', 'Tacos (eller lördagsgodis)'],
        ['Kötträtt med lingon och gräddsås.', 'Köttbullar'],
        ['Fransk maräng-baserad liten färgglad kaka.', 'Macaron'],
      ]),
      cat('Vetenskap', [
        ['Planeten närmast solen.', 'Merkurius'],
        ['Gasen vi andas in och behöver för att leva.', 'Syre'],
        ['H2O är den kemiska formeln för detta.', 'Vatten'],
        ['Kraften som får saker att falla mot marken.', 'Gravitation'],
        ['Den minsta enheten av ett grundämne.', 'Atom'],
      ]),
      cat('Blandat', [
        ['Antalet spelare i ett fotbollslag på planen.', '11'],
        ['Färgen man får när man blandar blått och gult.', 'Grön'],
        ['Huvudstaden i Norge.', 'Oslo'],
        ['Det största landdjuret på jorden.', 'Afrikansk elefant'],
        ['Året då andra världskriget tog slut.', '1945'],
      ]),
    ],
  };

  return board;
}

export function makeSeedBoard2(): Board {
  const board: Board = {
    id: uid(),
    name: 'Runda 2 – Dubbel-Bonanza',
    categories: [
      cat(
        'Historia',
        [
          ['Årtalet då Sverige gick med i EU.', '1995'],
          ['Denna kung grundade Göteborg 1621.', 'Gustav II Adolf'],
          ['Muren som föll 1989 i denna stad.', 'Berlin'],
          ['Det svenska skeppet som sjönk på sin jungfrufärd 1628.', 'Vasa (Vasaskeppet)'],
          ['Den egyptiska drottning som regerade tillsammans med Caesar och Marcus Antonius.', 'Kleopatra'],
        ],
        VALUES_2,
      ),
      cat(
        'Musik',
        [
          ['Svenska popgruppen som vann Eurovision 1974 med "Waterloo".', 'ABBA'],
          ['Antalet strängar på en vanlig gitarr.', '6'],
          ['DJ och producent bakom "Wake Me Up", tragiskt bortgången 2018.', 'Avicii'],
          ['Instrumentet som Ludwig van Beethoven är mest känd för.', 'Piano'],
          ['Artisten bakom albumet "Thriller" (1982).', 'Michael Jackson'],
        ],
        VALUES_2,
      ),
      cat(
        'Djur',
        [
          ['Världens största nu levande djur.', 'Blåval'],
          ['Antalet ben en spindel har.', '8'],
          ['Det snabbaste landdjuret.', 'Gepard'],
          ['Detta djur kallas ibland "skogens konung" i Sverige.', 'Älg'],
          ['Fågeln som är känd för att inte kunna flyga men springa mycket snabbt.', 'Struts'],
        ],
        VALUES_2,
      ),
      cat(
        'Sport',
        [
          ['Antalet spelare i ett innebandylag på planen.', '6'],
          ['Sporten där man gör "hole in one".', 'Golf'],
          ['Svensk tennisspelare med 11 Grand Slam-titlar.', 'Björn Borg'],
          ['Landet som vunnit flest VM-guld i fotboll (herrar).', 'Brasilien'],
          ['Vart fjärde år hålls detta stora idrottsevenemang på sommaren.', 'Olympiska spelen (OS)'],
        ],
        VALUES_2,
      ),
      cat(
        'Teknik',
        [
          ['Företaget bakom iPhone.', 'Apple'],
          ['Vad står "www" för? (tre ord)', 'World Wide Web'],
          ['Svenskt företag känt för möbler man monterar själv.', 'IKEA'],
          ['Programmeringsspråket som delar namn med en orm.', 'Python'],
          ['Personen som grundade Microsoft tillsammans med Paul Allen.', 'Bill Gates'],
        ],
        VALUES_2,
      ),
    ],
  };

  return board;
}

export function makeSeedPlayers(): Player[] {
  return [
    { id: uid(), name: 'Spelare 1', color: AVATAR_COLORS[0], score: 0 },
    { id: uid(), name: 'Spelare 2', color: AVATAR_COLORS[2], score: 0 },
    { id: uid(), name: 'Spelare 3', color: AVATAR_COLORS[3], score: 0 },
  ];
}

export function makeSeedBet(): BetRound {
  return {
    theme: 'Sveriges befolkning',
    question: 'Hur många människor bor i Sverige (ungefär)?',
    answer: 10550000,
  };
}

function surveyQ(prompt: string, rows: Array<[string, number]>) {
  return {
    id: uid(),
    prompt,
    answers: rows.map(([text, points]) => ({ id: uid(), text, points })),
  };
}

export function makeSeedFinal(): FinalRound {
  return {
    questions: [
      surveyQ('Nämn en populär pizzatopping.', [
        ['Ost', 35],
        ['Skinka', 25],
        ['Champinjoner', 15],
        ['Räkor', 12],
        ['Ananas', 8],
      ]),
      surveyQ('Nämn ett vanligt svenskt husdjur.', [
        ['Hund', 40],
        ['Katt', 38],
        ['Kanin', 10],
        ['Marsvin', 7],
        ['Fisk', 5],
      ]),
      surveyQ('Nämn något man tar med på en picknick.', [
        ['Filt', 30],
        ['Smörgåsar', 26],
        ['Frukt', 18],
        ['Läsk', 14],
        ['Godis', 9],
      ]),
      surveyQ('Nämn en färg i regnbågen.', [
        ['Röd', 28],
        ['Blå', 24],
        ['Grön', 20],
        ['Gul', 16],
        ['Lila', 8],
      ]),
      surveyQ('Nämn en sak man hittar i köket.', [
        ['Kylskåp', 30],
        ['Spis', 24],
        ['Kniv', 18],
        ['Micro', 15],
        ['Diskho', 10],
      ]),
    ],
  };
}
