# Ahana's Birthday

An interactive, cinematic birthday experience built with React, TypeScript, Vite, Framer Motion, and Tailwind CSS.

This repository is standalone and GitHub-ready. It does not require Replit, a backend, a database, or any Replit-specific package.

## Run locally

```bash
npm install
npm run dev
```

Open the local URL shown by Vite.

To make a production build:

```bash
npm run build
npm run preview
```

## Deploy to GitHub Pages

1. Create a GitHub repository and upload the contents of this folder.
2. In GitHub, open **Settings → Pages**.
3. Set **Source** to **GitHub Actions**.
4. Push to the `main` branch.

The included workflow builds and publishes the site automatically at:

```text
https://YOUR-USERNAME.github.io/YOUR-REPOSITORY/
```

For a manual sub-path build:

```bash
VITE_BASE_PATH=/YOUR-REPOSITORY/ npm run build
```

For a root deployment, such as a custom domain:

```bash
npm run build
```

## Personalise the new ending

The three editable values are together in:

```text
src/components/ending/UnlockExperience.tsx
```

Edit these constants:

```ts
export const UNLOCK_PHRASE = 'REPLACE_WITH_PHRASE';
export const FINAL_NOTE = `REPLACE_WITH_NOTE`;
export const VOICE_NOTE_SRC = 'REPLACE_WITH_AUDIO_FILE';
```

- `UNLOCK_PHRASE` is the phrase required to open the final note.
- `FINAL_NOTE` is the personal note shown after the phrase is accepted.
- `VOICE_NOTE_SRC` is the audio path. Put the file in `public/` and use a path such as `voice-note.mp3`.

The phrase comparison trims accidental leading and trailing spaces. Incorrect entries stay locked and show a subtle feedback animation. Starting the voice note stops the piano immediately so the two audio sources cannot overlap.

No personal password was invented or hardcoded. The current app value is the editable placeholder `REPLACE_WITH_PHRASE`; replace it with your chosen phrase before sharing the site.

## Existing content

### Add your letter

Open `src/components/chapters/Chapter9Epilogue.tsx` and edit `LETTER_PARAGRAPHS`. Each item is a paragraph; an empty string creates a blank line.

### Add photos

Put images in `public/photos/` using the existing names:

```text
photo1.jpg
photo2.jpg
photo3.jpg
photo4.jpg
```

### Customise the earlier chapters

The editable text for the quiz, memories, apology, and other chapters is stored near the top of each file in `src/components/chapters/`.

## Tech stack

| Tool | Version |
|---|---|
| React | 19 |
| Vite | 6 |
| TypeScript | 5 |
| Framer Motion | 12 |
| Tailwind CSS | 4 |
| Web Audio API | native |