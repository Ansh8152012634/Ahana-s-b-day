# Ahana's Birthday Experience 🎂

An interactive birthday web experience — 8 animated chapters, Web Audio sound effects, and no external media files needed.

## Run locally

```bash
pnpm install
PORT=3000 BASE_PATH=/ pnpm dev
# open http://localhost:3000
```

## Deploy to GitHub Pages (automatic)

1. Push this folder to a **new GitHub repository**.
2. Go to **Settings → Pages → Source → GitHub Actions**.
3. Push to `main` — the workflow (`.github/workflows/deploy.yml`) builds and publishes automatically.

> If your Pages URL has a sub-path like `https://you.github.io/repo-name/`, change  
> `BASE_PATH: /` → `BASE_PATH: /repo-name/` in the workflow file.

## Swap a sound

All sounds live in `src/hooks/use-audio.ts` in the `SOUND_CONFIG` object.  
Replace any function body — no imports, no files required.

```ts
export const SOUND_CONFIG = {
  backgroundMelody: (ctx, dest, vol) => { ... },
  match:            (ctx, dest, vol) => { ... },
  mismatch:         (ctx, dest, vol) => { ... },
  victory:          (ctx, dest, vol) => { ... },
  prankReveal:      (ctx, dest, vol) => { ... },
  typingSfx:        (ctx, dest, vol) => { ... },
  clickSfx:         (ctx, dest, vol) => { ... },
  birthdaySfx:      (ctx, dest, vol) => { ... },
};
```

## Tech

React 18 · Vite · Framer Motion · Tailwind CSS · Web Audio API · Lucide React
