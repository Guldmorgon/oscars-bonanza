# 🎰 Oscars Stora Bonanza

En Jeopardy-liknande frågesport för spelkvällar hemma. Kör lokalt på din dator,
spegla webbläsaren till TV:n och kör igång. Allt sparas lokalt i webbläsaren
(inget internet krävs).

## Kör igång

```bash
npm install
npm run dev
```

Öppna adressen som skrivs ut (t.ex. http://localhost:5173) i webbläsaren och kör
den gärna i helskärm på TV:n.

Bygg en statisk version med `npm run build` och förhandsgranska med `npm run preview`.

## Så funkar det

Spelet går i fyra steg: **Runda 1 → Runda 2 (dubbla poäng) → Budrundan → Final-Bonanza**.

- **Spela** – klicka på en ruta för att visa frågan, tryck *Visa svaret*, och ge
  poäng (+/−) till den som svarade. När alla rutor är öppnade går ni vidare till Runda 2
  (samma upplägg, dubbla värden).
- **Budrundan** – ett tema visas, och varje spelare satsar upp till **max(1000 kr, sin
  poäng)** (man får satsa 1000 även utan täckning). Sedan visas en fråga med numeriskt
  svar; alla gissar hemligt. Den som gissar närmast **vinner sitt bud**, alla andra
  **förlorar sitt** (poäng kan bli negativ). Det kan kasta om vilka två som går till final.
- **Final-Bonanza (enkätfinal)** – de två spelarna med flest poäng möts, och deras poäng
  **nollställs** – finalen avgör allt. Båda får samma frågor och ska gissa det
  *populäraste* svaret (t.ex. "25 % svarade pannkakor" → 25 poäng). Du skriver in vad
  varje spelare svarar; spelare 1:s svar är dolda för spelare 2, och spelare 2 får inte
  säga samma sak. Svaren avslöjas ett i taget (först spelare 1:s, sedan spelare 2:s per
  fråga) för spänningens skull. Högst totalpoäng vinner.
- **Redigera** – växla mellan **Runda 1/Runda 2** och redigera kategorier, frågor,
  värden (kr), bonusrutor och bilder. Under **Final** skriver du enkätfrågorna med varje
  svars poäng (%). **Spelare**-fliken hanterar namn + profilbilder. **Säkerhetskopia**
  exporterar/importerar allt som en JSON-fil.
- **Inställningar** – ljud på/av, **musik på/av**, nollställ omgången, eller ladda om
  exempelinnehållet.

## Musik

Lägg egna `.mp3`-filer i `public/audio/` (t.ex. `background.mp3`, `final.mp3`,
`winner.mp3`). Bakgrundsmusiken loopar hela kvällen och sänks automatiskt när en
tillfällig låt spelas. Saknas en fil spelas ingen musik. Se
[public/audio/README.md](public/audio/README.md) för alla filnamn.

## Teknik

Vite + React + TypeScript, Zustand (sparas i IndexedDB via localforage),
Framer Motion (animationer), canvas-confetti (partiklar), Web Audio-genererade
ljudeffekter och valfri MP3-musik. Helt klientsida – ingen server, ingen inloggning,
inget internet.
